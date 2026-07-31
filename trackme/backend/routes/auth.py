# from fastapi import APIRouter
# from pydantic import BaseModel
# from services.brevo_service import send_welcome_email

# router = APIRouter(prefix="/auth", tags=["auth"])

# class WelcomeRequest(BaseModel):
#     email: str
#     full_name: str
#     role: str

# @router.post("/welcome")
# async def welcome(body: WelcomeRequest):
#     await send_welcome_email(
#         user_email=body.email,
#         full_name=body.full_name,
#         role=body.role,
#     )
#     return {"success": True}

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.brevo_service import send_welcome_email
from services.supabase_service import supabase

router = APIRouter(prefix="/auth", tags=["auth"])


class WelcomeRequest(BaseModel):
    email: str
    full_name: str
    role: str


class AccessRequestBody(BaseModel):
    full_name: str
    email: str
    reason: str = ""


@router.post("/welcome")
async def welcome(body: WelcomeRequest):
    """
    Called after the user confirms their email and logs in for the first time.
    Checks user_metadata for welcome_sent flag so it only fires once ever.
    """
    try:
        # Pull the user record from Supabase Auth by email
        users = supabase.auth.admin.list_users()
        target_user = None
        for u in users:
            if u.email == body.email:
                target_user = u
                break

        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

        # Guard: if welcome already sent, do nothing — idempotent
        meta = target_user.user_metadata or {}
        if meta.get("welcome_sent"):
            return {"success": True, "skipped": True, "reason": "already_sent"}

        # Send the welcome email
        await send_welcome_email(
            user_email=body.email,
            full_name=body.full_name,
            role=body.role,
        )

        # Mark welcome_sent = True so it never fires again
        supabase.auth.admin.update_user_by_id(
            str(target_user.id),
            {"user_metadata": {**meta, "welcome_sent": True}},
        )

        return {"success": True, "skipped": False}

    except HTTPException:
        raise
    except Exception as e:
        print(f"[AUTH /welcome] ❌ {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Failed to send welcome email")


@router.get("/user-count")
async def user_count():
    """
    Returns whether signup is currently open.
    Reads from a simple config row in Supabase, falls back to open=True on error.
    """
    try:
        result = supabase.table("app_config") \
            .select("value") \
            .eq("key", "signup_open") \
            .single() \
            .execute()

        if result.data:
            open_val = result.data.get("value", "true")
            is_open = str(open_val).lower() in ("true", "1", "yes", "open")
        else:
            is_open = True

        return {"open": is_open}

    except Exception as e:
        print(f"[AUTH /user-count] ❌ {type(e).__name__}: {e}")
        return {"open": True}  # Fail open — don't block signups on DB errors


@router.post("/access-request")
async def access_request(body: AccessRequestBody):
    """
    Saves a beta access request from the AuthPage form.
    Stores in access_requests table. Non-fatal if it fails.
    """
    try:
        supabase.table("access_requests").insert({
            "full_name": body.full_name,
            "email": body.email,
            "reason": body.reason,
        }).execute()
        return {"success": True}
    except Exception as e:
        print(f"[AUTH /access-request] ❌ {type(e).__name__}: {e}")
        # Return success anyway — frontend already shows success optimistically
        return {"success": True}