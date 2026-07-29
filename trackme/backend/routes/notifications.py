from fastapi import APIRouter, Depends, HTTPException
from dependencies import get_current_user
from services.supabase_service import supabase
from models import (
    UpdateProfileRequest, MentorRequestModel,
    RespondMentorRequest, ChangePasswordRequest, AccessRequestModel
)
from services.supabase_service import create_notification
from services.brevo_service import send_email
from config import settings
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["misc"])

PREMIUM_EMAIL = "adetumosgad@gmail.com"
MAX_USERS = 5


# ============================================================
# NOTIFICATIONS
# ============================================================

@router.get("/notifications")
async def get_notifications(user=Depends(get_current_user)):
    result = supabase.table("notifications") \
        .select("*") \
        .eq("user_id", str(user.id)) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
    return {"notifications": result.data or []}


@router.put("/notifications/{notif_id}/read")
async def mark_read(notif_id: str, user=Depends(get_current_user)):
    supabase.table("notifications") \
        .update({"read": True}) \
        .eq("id", notif_id) \
        .eq("user_id", str(user.id)) \
        .execute()
    return {"success": True}


@router.put("/notifications/read-all")
async def mark_all_read(user=Depends(get_current_user)):
    supabase.table("notifications") \
        .update({"read": True}) \
        .eq("user_id", str(user.id)) \
        .execute()
    return {"success": True}

@router.post("/schedule")
async def schedule_reminder(request: Request, user=Depends(get_current_user)):
    body = await request.json()
    reminder_time = body.get("time", "09:00")  # HH:MM
    slot = body.get("slot", "morning")          # morning | evening | mentor

    # Store preference in Supabase
    supabase.table("profiles").update({
        "reminder_time": reminder_time,
        "reminder_slot": slot,
    }).eq("id", str(user.id)).execute()

    return {"success": True, "scheduled": reminder_time, "slot": slot}


# ============================================================
# PROFILE
# ============================================================

@router.get("/profile")
async def get_profile(user=Depends(get_current_user)):
    result = supabase.table("profiles") \
        .select("*") \
        .eq("id", str(user.id)) \
        .execute()

    streak = supabase.table("streaks") \
        .select("*") \
        .eq("user_id", str(user.id)) \
        .execute()

    return {
        "profile": result.data[0] if result.data else {},
        "streak": streak.data[0] if streak.data else {
            "current_streak": 0, "longest_streak": 0
        }
    }


@router.put("/profile")
async def update_profile(body: UpdateProfileRequest, user=Depends(get_current_user)):
    updates = {k: v for k, v in body.dict().items() if v is not None}
    if not updates:
        return {"success": True}
    supabase.table("profiles") \
        .update(updates) \
        .eq("id", str(user.id)) \
        .execute()
    return {"success": True}


@router.post("/profile/change-password")
async def change_password(body: ChangePasswordRequest, user=Depends(get_current_user)):
    """Change the current user's password via Supabase admin."""
    try:
        supabase.auth.admin.update_user_by_id(
            str(user.id),
            {"password": body.new_password}
        )
        return {"success": True}
    except Exception as e:
        raise HTTPException(400, f"Failed to change password: {str(e)}")


# ============================================================
# ACCESS REQUEST (pre-signup when user limit reached)
# ============================================================

@router.post("/access-request")
@limiter.limit("3/hour")
async def request_access(request: Request, body: AccessRequestModel):
    """
    Called when signup is blocked due to user limit.
    Saves the request and emails admin (adetumosgad@gmail.com).
    No auth required.
    """
    # Save to DB
    supabase.table("access_requests").insert({
        "full_name": body.full_name,
        "email": body.email,
        "reason": body.reason,
    }).execute()

    # Email admin
    html = f"""
<!DOCTYPE html>
<html>
<body style="font-family:Urbanist,Arial,sans-serif;background:#F5F4FF;padding:40px 20px;">
  <div style="max-width:500px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
    <div style="background:#0A0A0F;padding:24px 32px;">
      <div style="font-size:20px;font-weight:800;color:#fff;">Dôti</div>
    </div>
    <div style="padding:32px;">
      <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:8px;">
        New Access Request
      </div>
      <h2 style="font-size:18px;font-weight:700;color:#0D0D0D;margin:0 0 20px;">
        Someone wants to join Dôti
      </h2>
      <div style="background:#F8F6FF;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
        <div style="font-size:12px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Name</div>
        <div style="font-size:15px;font-weight:600;color:#0D0D0D;">{body.full_name}</div>
      </div>
      <div style="background:#F8F6FF;border-radius:10px;padding:16px 20px;margin-bottom:16px;">
        <div style="font-size:12px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Email</div>
        <div style="font-size:15px;font-weight:600;color:#0D0D0D;">{body.email}</div>
      </div>
      {f'<div style="background:#F8F6FF;border-radius:10px;padding:16px 20px;margin-bottom:16px;"><div style="font-size:12px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">Reason</div><div style="font-size:14px;color:#444;line-height:1.6;">{body.reason}</div></div>' if body.reason else ''}
      <p style="color:#aaa;font-size:12px;margin:0;text-align:center;">
        Dôti · S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    try:
        send_email(
            to=PREMIUM_EMAIL,
            subject=f"🔔 Dôti Access Request — {body.full_name}",
            html=html
        )
    except Exception:
        pass  # Don't fail if email errors, DB record is saved

    return {"success": True}


@router.get("/user-count")
@limiter.limit("30/minute")
async def get_user_count(request: Request):
    """
    Public endpoint — frontend checks this before showing signup form.
    Returns whether signup is open or closed.
    """
    try:
        users = supabase.auth.admin.list_users()
        count = len(users) if users else 0
        return {
            "count": count,
            "limit": MAX_USERS,
            "open": count < MAX_USERS
        }
    except Exception:
        return {"count": 0, "limit": MAX_USERS, "open": True}


# ============================================================
# MENTOR RELATIONSHIPS
# ============================================================

@router.post("/mentor/request")
@limiter.limit("5/minute")
async def request_mentor(request: Request, body: MentorRequestModel, user=Depends(get_current_user)):
    """
    Mentee requests a mentor by email.
    Looks up mentor by email stored in profiles table.
    """
    mentee_id = str(user.id)

    # Look up mentor by email in profiles (reliable, no auth.users needed)
    mentor_profile = supabase.table("profiles") \
        .select("id, full_name, email") \
        .eq("email", body.mentor_email) \
        .execute()

    if not mentor_profile.data:
        return {
            "success": False,
            "message": f"No Dôti account found for {body.mentor_email}. Make sure they've signed up first."
        }

    mentor_id = mentor_profile.data[0]["id"]
    mentor_name = mentor_profile.data[0].get("full_name") or body.mentor_email

    if mentor_id == mentee_id:
        return {"success": False, "message": "You cannot add yourself as a mentor."}

    # Check existing relationship
    existing = supabase.table("mentor_relationships") \
        .select("id, status") \
        .eq("mentor_id", mentor_id) \
        .eq("mentee_id", mentee_id) \
        .execute()

    if existing.data:
        status = existing.data[0]["status"]
        if status == "active":
            return {"success": False, "message": f"You're already connected with {mentor_name}."}
        if status == "pending":
            return {"success": False, "message": f"You already have a pending request to {mentor_name}."}

    # Create relationship
    result = supabase.table("mentor_relationships").insert({
        "mentor_id": mentor_id,
        "mentee_id": mentee_id,
        "status": "pending"
    }).execute()

    if not result.data:
        raise HTTPException(500, "Failed to create mentor request")

    relationship_id = result.data[0]["id"]

    # Get mentee name
    mentee_profile = supabase.table("profiles") \
        .select("full_name") \
        .eq("id", mentee_id) \
        .execute()
    mentee_name = mentee_profile.data[0]["full_name"] if mentee_profile.data else "Someone"

    # Notify mentor
    await create_notification(
        mentor_id,
        "mentor_request",
        "👋 New Mentee Request",
        f"{mentee_name} wants you to be their mentor. Accept or decline below.",
        {
            "relationship_id": relationship_id,
            "mentee_id": mentee_id,
            "mentee_name": mentee_name,
            "action_required": True
        }
    )

    return {
        "success": True,
        "message": f"Request sent to {mentor_name}! They'll be notified to accept."
    }


@router.post("/mentor/respond")
async def respond_mentor(body: RespondMentorRequest, user=Depends(get_current_user)):
    """Mentor accepts or declines a mentee request."""
    new_status = "active" if body.action == "accept" else "ended"

    result = supabase.table("mentor_relationships") \
        .update({"status": new_status}) \
        .eq("id", body.relationship_id) \
        .eq("mentor_id", str(user.id)) \
        .execute()

    if not result.data:
        raise HTTPException(404, "Relationship not found or not yours to respond to")

    # Get mentee id to notify them
    rel = supabase.table("mentor_relationships") \
        .select("mentee_id") \
        .eq("id", body.relationship_id) \
        .execute()

    if rel.data:
        mentee_id = rel.data[0]["mentee_id"]
        mentor_profile = supabase.table("profiles") \
            .select("full_name") \
            .eq("id", str(user.id)) \
            .execute()
        mentor_name = mentor_profile.data[0]["full_name"] if mentor_profile.data else "Your mentor"

        if body.action == "accept":
            await create_notification(
                mentee_id,
                "mentor_request",
                "✅ Mentor Request Accepted!",
                f"{mentor_name} accepted your mentor request. You're now connected!",
            )
        else:
            await create_notification(
                mentee_id,
                "mentor_request",
                "❌ Mentor Request Declined",
                f"{mentor_name} declined your mentor request.",
            )

    return {"success": True, "status": new_status}


@router.get("/mentor/my-mentor")
async def get_my_mentor(user=Depends(get_current_user)):
    """Get the active mentor for the current mentee."""
    result = supabase.table("mentor_relationships") \
        .select("*, profiles!mentor_relationships_mentor_id_fkey(full_name, username, field_of_study, email)") \
        .eq("mentee_id", str(user.id)) \
        .eq("status", "active") \
        .execute()
    return {"mentor": result.data[0] if result.data else None}


@router.get("/mentor/my-mentees")
async def get_my_mentees(user=Depends(get_current_user)):
    """
    Get all active mentees with full profile, streak and log stats.
    """
    relationships = supabase.table("mentor_relationships") \
        .select("*, profiles!mentor_relationships_mentee_id_fkey(id, full_name, username, field_of_study, bio, role, email)") \
        .eq("mentor_id", str(user.id)) \
        .eq("status", "active") \
        .execute()

    mentees = []
    for rel in (relationships.data or []):
        mentee_profile = rel.get("profiles", {})
        mentee_id = mentee_profile.get("id")
        if not mentee_id:
            continue

        streak = supabase.table("streaks") \
            .select("current_streak, longest_streak, last_log_date") \
            .eq("user_id", mentee_id) \
            .execute()

        streak_data = streak.data[0] if streak.data else {
            "current_streak": 0, "longest_streak": 0, "last_log_date": None
        }

        logs = supabase.table("daily_logs") \
            .select("id, signed, sent_to_mentor, log_date, created_at") \
            .eq("user_id", mentee_id) \
            .order("created_at", desc=True) \
            .execute()

        log_list = logs.data or []
        total_logs = len(log_list)
        signed_logs = sum(1 for l in log_list if l.get("signed"))
        last_log_date = log_list[0]["log_date"] if log_list else None

        mentees.append({
            "relationship_id": rel["id"],
            "mentee_id": mentee_id,
            "profile": mentee_profile,
            "streak": streak_data,
            "stats": {
                "total_logs": total_logs,
                "signed_logs": signed_logs,
                "last_log_date": last_log_date,
                "sign_rate": round((signed_logs / total_logs * 100) if total_logs > 0 else 0),
            }
        })

    return {"mentees": mentees}