from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import HTMLResponse, JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import asyncio
import logging
import time
import os

from config import settings
from services.supabase_service import supabase
from services.groq_service import generate_reminder_message
from services.brevo_service import send_reminder_email

from routes.logs import router as logs_router
from routes.sign import router as sign_router
from routes.projects import router as projects_router
from routes.notifications import router as notifications_router
from routes.myflow import router as myflow_router
from routes.health import router as health_router
from routes.auth import router as auth_router
from routes.groups import router as groups_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Dôti")

app = FastAPI(
    title="Dôti API",
    description="AI-powered mentorship accountability platform",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# ─────────────────────────────────────────────────────────────────────────────
# RATE LIMITER
# ─────────────────────────────────────────────────────────────────────────────

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute", "1000/hour"]
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ─────────────────────────────────────────────────────────────────────────────
# MIDDLEWARE
# Order matters: add_middleware() runs in reverse registration order.
# CORS must be registered LAST so it executes FIRST — before any middleware
# that might return early (size check, trusted host) without CORS headers.
# ─────────────────────────────────────────────────────────────────────────────

if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.allowed_hosts_list,
    )


@app.middleware("http")
async def security_headers(request: Request, call_next):
    start = time.time()
    response = await call_next(request)

    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    if "server" in response.headers:
        del response.headers["server"]

    duration = time.time() - start
    if duration > 5:
        logger.warning(
            f"Slow request: {request.method} {request.url.path} ({duration:.2f}s)"
        )

    return response


@app.middleware("http")
async def request_size_limit(request: Request, call_next):
    """
    Allow up to 50MB for POST/PUT/PATCH to support file uploads.
    Previously 1MB — was causing CORS-looking errors on multipart requests
    because the 413 response was returned before CORS headers were attached.
    """
    if request.method in ("POST", "PUT", "PATCH"):
        size = request.headers.get("content-length")
        if size and int(size) > 50 * 1024 * 1024:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request too large. Maximum size is 50MB."}
            )
    return await call_next(request)


# CORS registered last = executes first
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"https://doti-.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# ROUTERS
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(health_router, prefix="/api")
app.include_router(logs_router, prefix="/api")
app.include_router(sign_router, prefix="/api")
app.include_router(projects_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(myflow_router)
app.include_router(auth_router, prefix="/api")
app.include_router(groups_router, prefix="/api")

# ─────────────────────────────────────────────────────────────────────────────
# REMINDER SCHEDULER
# ─────────────────────────────────────────────────────────────────────────────

async def run_reminder_scheduler():
    logger.info("[SCHEDULER] Reminder scheduler started")
    while True:
        await asyncio.sleep(60)
        try:
            from datetime import datetime
            now = datetime.now()
            current_time = now.strftime("%H:%M")
            day_of_week = now.strftime("%A")

            result = supabase.table("profiles") \
                .select("id, full_name, email, role, reminder_time, reminder_slot") \
                .eq("reminder_time", current_time) \
                .execute()

            profiles = result.data or []
            if profiles:
                logger.info(f"[SCHEDULER] {current_time} — {len(profiles)} reminder(s) to send")

            for profile in profiles:
                name = (profile.get("full_name") or "").split(" ")[0] or "there"
                email = profile.get("email")
                role = profile.get("role", "mentee")
                slot = profile.get("reminder_slot") or (
                    "mentor" if role == "mentor" else "morning"
                )

                if not email:
                    continue

                try:
                    msg = await generate_reminder_message(
                        name=name,
                        slot=slot,
                        day_of_week=day_of_week,
                    )
                    await send_reminder_email(
                        mentee_email=email,
                        mentee_name=name,
                        slot=slot,
                        day_of_week=day_of_week,
                        subject_override=msg.get("subject"),
                        body_override=msg.get("body"),
                    )
                    logger.info(f"[SCHEDULER] ✅ Sent {slot} reminder → {email}")
                except Exception as e:
                    logger.error(f"[SCHEDULER] ❌ Failed for {email}: {e}")

        except Exception as e:
            logger.error(f"[SCHEDULER] Loop error: {e}")


# ─────────────────────────────────────────────────────────────────────────────
# STARTUP
# ─────────────────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup():
    logger.info("[STARTUP] Dôti API is starting up...")
    asyncio.create_task(run_reminder_scheduler())
    logger.info("[STARTUP] Reminder scheduler initialized")


# ─────────────────────────────────────────────────────────────────────────────
# CORE ROUTES
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health-dashboard")
async def health_dashboard():
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "health.html")
    if not os.path.exists(path):
        return JSONResponse(
            status_code=500,
            content={"detail": f"health.html not found at {path}"}
        )
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    return HTMLResponse(content=content)


@app.get("/")
async def root():
    return {"status": "ok", "app": "Dôti"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# ─────────────────────────────────────────────────────────────────────────────
# ERROR HANDLERS
# ─────────────────────────────────────────────────────────────────────────────

@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse(status_code=404, content={"detail": "Not found"})


@app.exception_handler(500)
async def internal_error(request: Request, exc):
    logger.exception(exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


print("\n========== REGISTERED ROUTES ==========")
for route in app.routes:
    print(f"{route.path} {route.methods}")
print("=======================================\n")

# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.middleware.trustedhost import TrustedHostMiddleware
# from fastapi.responses import HTMLResponse, JSONResponse
# from slowapi import Limiter, _rate_limit_exceeded_handler
# from slowapi.util import get_remote_address
# from slowapi.errors import RateLimitExceeded

# import asyncio
# import logging
# import time
# import os

# from config import settings
# from services.supabase_service import supabase
# from services.groq_service import generate_reminder_message
# from services.brevo_service import send_reminder_email, send_welcome_email

# from routes.logs import router as logs_router
# from routes.sign import router as sign_router
# from routes.projects import router as projects_router
# from routes.notifications import router as notifications_router
# from routes.myflow import router as myflow_router
# from routes.health import router as health_router
# from routes.auth import router as auth_router

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger("Dôti")

# app = FastAPI(
#     title="Dôti API",
#     description="AI-powered mentorship accountability platform",
#     version="1.0.0",
#     docs_url="/docs" if settings.debug else None,
#     redoc_url="/redoc" if settings.debug else None,
# )

# limiter = Limiter(
#     key_func=get_remote_address,
#     default_limits=["200/minute", "1000/hour"]
# )
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# # ─────────────────────────────────────────────────────────────────────────────
# # MIDDLEWARE
# # ─────────────────────────────────────────────────────────────────────────────

# @app.middleware("http")
# async def security_headers(request: Request, call_next):
#     start = time.time()
#     response = await call_next(request)

#     response.headers["X-Content-Type-Options"] = "nosniff"
#     response.headers["X-Frame-Options"] = "DENY"
#     response.headers["X-XSS-Protection"] = "1; mode=block"
#     response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

#     if "server" in response.headers:
#         del response.headers["server"]

#     duration = time.time() - start
#     if duration > 5:
#         logger.warning(
#             f"Slow request: {request.method} {request.url.path} ({duration:.2f}s)"
#         )

#     return response


# @app.middleware("http")
# async def request_size_limit(request: Request, call_next):
#     if request.method in ("POST", "PUT", "PATCH"):
#         size = request.headers.get("content-length")
#         if size and int(size) > 1_000_000:
#             return JSONResponse(
#                 status_code=413,
#                 content={"detail": "Request too large"}
#             )
#     return await call_next(request)


# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_origins_list,
#     allow_origin_regex=r"https://doti-.*\.vercel\.app",
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# if not settings.debug:
#     app.add_middleware(
#         TrustedHostMiddleware,
#         allowed_hosts=settings.allowed_hosts_list,
#     )


# # ─────────────────────────────────────────────────────────────────────────────
# # ROUTERS
# # ─────────────────────────────────────────────────────────────────────────────

# app.include_router(health_router, prefix="/api")
# app.include_router(logs_router, prefix="/api")
# app.include_router(sign_router, prefix="/api")
# app.include_router(projects_router, prefix="/api")
# app.include_router(notifications_router, prefix="/api")
# app.include_router(myflow_router)
# app.include_router(auth_router, prefix="/api")


# # ─────────────────────────────────────────────────────────────────────────────
# # REMINDER SCHEDULER
# # ─────────────────────────────────────────────────────────────────────────────

# async def run_reminder_scheduler():
#     logger.info("[SCHEDULER] Reminder scheduler started")
#     while True:
#         await asyncio.sleep(60)
#         try:
#             from datetime import datetime
#             now = datetime.now()
#             current_time = now.strftime("%H:%M")
#             day_of_week = now.strftime("%A")

#             result = supabase.table("profiles") \
#                 .select("id, full_name, email, role, reminder_time, reminder_slot") \
#                 .eq("reminder_time", current_time) \
#                 .execute()

#             profiles = result.data or []
#             if profiles:
#                 logger.info(f"[SCHEDULER] {current_time} — {len(profiles)} reminder(s) to send")

#             for profile in profiles:
#                 name = (profile.get("full_name") or "").split(" ")[0] or "there"
#                 email = profile.get("email")
#                 role = profile.get("role", "mentee")
#                 slot = profile.get("reminder_slot") or (
#                     "mentor" if role == "mentor" else "morning"
#                 )

#                 if not email:
#                     continue

#                 try:
#                     msg = await generate_reminder_message(
#                         name=name,
#                         slot=slot,
#                         day_of_week=day_of_week,
#                     )
#                     await send_reminder_email(
#                         mentee_email=email,
#                         mentee_name=name,
#                         slot=slot,
#                         day_of_week=day_of_week,
#                         subject_override=msg.get("subject"),
#                         body_override=msg.get("body"),
#                     )
#                     logger.info(f"[SCHEDULER] ✅ Sent {slot} reminder → {email}")
#                 except Exception as e:
#                     logger.error(f"[SCHEDULER] ❌ Failed for {email}: {e}")

#         except Exception as e:
#             logger.error(f"[SCHEDULER] Loop error: {e}")


# # ─────────────────────────────────────────────────────────────────────────────
# # STARTUP
# # ─────────────────────────────────────────────────────────────────────────────

# @app.on_event("startup")
# async def startup():
#     logger.info("[STARTUP] Dôti API is starting up...")
#     asyncio.create_task(run_reminder_scheduler())
#     logger.info("[STARTUP] Reminder scheduler initialized")


# # ─────────────────────────────────────────────────────────────────────────────
# # CORE ROUTES
# # ─────────────────────────────────────────────────────────────────────────────

# @app.get("/health-dashboard")
# async def health_dashboard():
#     path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "health.html")
#     if not os.path.exists(path):
#         return JSONResponse(
#             status_code=500,
#             content={"detail": f"health.html not found at {path}"}
#         )
#     with open(path, "r", encoding="utf-8") as f:
#         content = f.read()
#     return HTMLResponse(content=content)


# @app.get("/")
# async def root():
#     return {"status": "ok", "app": "Dôti"}


# @app.get("/health")
# async def health():
#     return {"status": "healthy"}


# # ─────────────────────────────────────────────────────────────────────────────
# # ERROR HANDLERS
# # ─────────────────────────────────────────────────────────────────────────────

# @app.exception_handler(404)
# async def not_found(request: Request, exc):
#     return JSONResponse(status_code=404, content={"detail": "Not found"})


# @app.exception_handler(500)
# async def internal_error(request: Request, exc):
#     logger.exception(exc)
#     return JSONResponse(status_code=500, content={"detail": "Internal server error"})


# print("\n========== REGISTERED ROUTES ==========")
# for route in app.routes:
#     print(f"{route.path} {route.methods}")
# print("=======================================\n")