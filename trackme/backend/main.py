from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

import logging
import time

from config import settings

from routes.logs import router as logs_router
from routes.sign import router as sign_router
from routes.projects import router as projects_router
from routes.notifications import router as notifications_router
from routes.myflow import router as myflow_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("trackme")

app = FastAPI(
    title="Trackme API",
    description="AI-powered mentorship accountability platform",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Rate limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200/minute", "1000/hour"]
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security middleware
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
    size = request.headers.get("content-length")

    if size and int(size) > 1_000_000:
        return JSONResponse(
            status_code=413,
            content={"detail": "Request too large"}
        )

    return await call_next(request)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Trusted hosts
if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.allowed_hosts_list,
    )

# Register routers
app.include_router(logs_router, prefix="/api")
app.include_router(sign_router)
app.include_router(projects_router, prefix="/api")
app.include_router(notifications_router, prefix="/api")
app.include_router(myflow_router)

@app.get("/")
async def root():
    return {
        "status": "ok",
        "app": "Trackme"
    }

@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }

@app.exception_handler(404)
async def not_found(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Not found"}
    )

@app.exception_handler(500)
async def internal_error(request: Request, exc):
    logger.exception(exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

print("\n========== REGISTERED ROUTES ==========")
for route in app.routes:
    print(f"{route.path} {route.methods}")
print("=======================================\n")