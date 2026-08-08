from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from dependencies import get_current_user
from services.supabase_service import supabase, create_notification
from services.groq_service import summarise_mentee_logs, generate_weekly_tasks
from services.brevo_service import send_weekly_focus_email
from datetime import date, timedelta

router = APIRouter(prefix="/groups", tags=["groups"])


# ─────────────────────────────────────────────────────────────────────────────
# MODELS
# ─────────────────────────────────────────────────────────────────────────────

class CreateGroupRequest(BaseModel):
    name: str
    description: Optional[str] = None

class AddMemberRequest(BaseModel):
    mentee_email: str

class GroupWeeklyFocusRequest(BaseModel):
    raw_input: str
    week_start: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# CREATE GROUP
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/create")
async def create_group(body: CreateGroupRequest, user=Depends(get_current_user)):
    mentor_id = str(user.id)

    result = supabase.table("groups").insert({
        "name": body.name,
        "description": body.description,
        "mentor_id": mentor_id,
    }).execute()

    if not result.data:
        raise HTTPException(500, "Failed to create group")

    return {"success": True, "group": result.data[0]}


# ─────────────────────────────────────────────────────────────────────────────
# ADD MEMBER TO GROUP
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{group_id}/add-member")
async def add_member(
    group_id: str,
    body: AddMemberRequest,
    user=Depends(get_current_user)
):
    mentor_id = str(user.id)

    # Verify this mentor owns the group
    group = supabase.table("groups") \
        .select("*").eq("id", group_id) \
        .eq("mentor_id", mentor_id).execute()

    if not group.data:
        raise HTTPException(403, "Group not found or not yours")

    # Look up mentee by email
    mentee_profile = supabase.table("profiles") \
        .select("id, full_name, email") \
        .eq("email", body.mentee_email.lower()) \
        .execute()

    if not mentee_profile.data:
        raise HTTPException(404, f"No Dôti account found for {body.mentee_email}")

    mentee = mentee_profile.data[0]
    mentee_id = mentee["id"]

    # Check active mentor relationship
    rel = supabase.table("mentor_relationships") \
        .select("id") \
        .eq("mentor_id", mentor_id) \
        .eq("mentee_id", mentee_id) \
        .eq("status", "active") \
        .execute()

    if not rel.data:
        raise HTTPException(400, f"{mentee['full_name']} is not your active mentee")

    # Check not already in group
    existing = supabase.table("group_members") \
        .select("id") \
        .eq("group_id", group_id) \
        .eq("mentee_id", mentee_id) \
        .execute()

    if existing.data:
        raise HTTPException(400, f"{mentee['full_name']} is already in this group")

    # Add to group
    supabase.table("group_members").insert({
        "group_id": group_id,
        "mentee_id": mentee_id,
    }).execute()

    # Notify mentee
    await create_notification(
        mentee_id,
        "project_assigned",
        "👥 Added to a Group",
        f"You've been added to the group: \"{group.data[0]['name']}\"",
    )

    return {"success": True, "mentee": mentee}


# ─────────────────────────────────────────────────────────────────────────────
# REMOVE MEMBER
# ─────────────────────────────────────────────────────────────────────────────

@router.delete("/{group_id}/remove-member/{mentee_id}")
async def remove_member(
    group_id: str,
    mentee_id: str,
    user=Depends(get_current_user)
):
    group = supabase.table("groups") \
        .select("id").eq("id", group_id) \
        .eq("mentor_id", str(user.id)).execute()

    if not group.data:
        raise HTTPException(403, "Group not found or not yours")

    supabase.table("group_members") \
        .delete() \
        .eq("group_id", group_id) \
        .eq("mentee_id", mentee_id) \
        .execute()

    return {"success": True}


# ─────────────────────────────────────────────────────────────────────────────
# GET MY GROUPS (mentor)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/my-groups")
async def get_my_groups(user=Depends(get_current_user)):
    mentor_id = str(user.id)

    groups = supabase.table("groups") \
        .select("*") \
        .eq("mentor_id", mentor_id) \
        .order("created_at", desc=True) \
        .execute()

    result = []
    for group in (groups.data or []):
        members = supabase.table("group_members") \
            .select("mentee_id") \
            .eq("group_id", group["id"]) \
            .execute()
        result.append({
            **group,
            "member_count": len(members.data or [])
        })

    return {"groups": result}


# ─────────────────────────────────────────────────────────────────────────────
# GET GROUP DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{group_id}/dashboard")
async def get_group_dashboard(
    group_id: str,
    user=Depends(get_current_user)
):
    mentor_id = str(user.id)

    group = supabase.table("groups") \
        .select("*").eq("id", group_id) \
        .eq("mentor_id", mentor_id).execute()

    if not group.data:
        raise HTTPException(403, "Group not found or not yours")

    group_data = group.data[0]

    # Get all members
    members = supabase.table("group_members") \
        .select("mentee_id") \
        .eq("group_id", group_id) \
        .execute()

    mentee_ids = [m["mentee_id"] for m in (members.data or [])]

    if not mentee_ids:
        return {
            "group": group_data,
            "stats": {
                "total_members": 0,
                "logged_today": 0,
                "signed_today": 0,
                "active_streaks": 0,
            },
            "mentees": []
        }

    today = str(date.today())

    # Build mentee details
    mentees_detail = []
    logged_today = 0
    signed_today = 0
    active_streaks = 0

    for mentee_id in mentee_ids:
        profile = supabase.table("profiles") \
            .select("id, full_name, email, field_of_study") \
            .eq("id", mentee_id).execute()

        if not profile.data:
            continue

        p = profile.data[0]

        # Today's log
        today_log = supabase.table("daily_logs") \
            .select("id, signed, sent_to_mentor") \
            .eq("user_id", mentee_id) \
            .eq("log_date", today) \
            .execute()

        has_logged = bool(today_log.data)
        has_signed = bool(today_log.data and today_log.data[0].get("signed"))

        if has_logged:
            logged_today += 1
        if has_signed:
            signed_today += 1

        # Streak
        streak = supabase.table("streaks") \
            .select("current_streak, longest_streak, last_log_date") \
            .eq("user_id", mentee_id).execute()

        streak_data = streak.data[0] if streak.data else {
            "current_streak": 0, "longest_streak": 0, "last_log_date": None
        }

        if streak_data.get("current_streak", 0) > 0:
            active_streaks += 1

        # Recent logs (last 5)
        logs = supabase.table("daily_logs") \
            .select("id, structured_title, structured_topics, structured_content, log_date, signed, sent_to_mentor, test_passed, difficulty_level") \
            .eq("user_id", mentee_id) \
            .order("created_at", desc=True) \
            .limit(5) \
            .execute()

        mentees_detail.append({
            "mentee_id": mentee_id,
            "profile": p,
            "streak": streak_data,
            "has_logged_today": has_logged,
            "has_signed_today": has_signed,
            "recent_logs": logs.data or [],
        })

    return {
        "group": group_data,
        "stats": {
            "total_members": len(mentee_ids),
            "logged_today": logged_today,
            "signed_today": signed_today,
            "active_streaks": active_streaks,
            "log_rate_today": round((logged_today / len(mentee_ids) * 100) if mentee_ids else 0),
        },
        "mentees": mentees_detail,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET GROUP ANALYTICS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{group_id}/analytics")
async def get_group_analytics(
    group_id: str,
    user=Depends(get_current_user)
):
    mentor_id = str(user.id)

    group = supabase.table("groups") \
        .select("*").eq("id", group_id) \
        .eq("mentor_id", mentor_id).execute()

    if not group.data:
        raise HTTPException(403, "Group not found or not yours")

    members = supabase.table("group_members") \
        .select("mentee_id").eq("group_id", group_id).execute()

    mentee_ids = [m["mentee_id"] for m in (members.data or [])]

    if not mentee_ids:
        return {"analytics": None, "mentees": []}

    mentee_analytics = []

    for mentee_id in mentee_ids:
        profile = supabase.table("profiles") \
            .select("id, full_name, field_of_study") \
            .eq("id", mentee_id).execute()

        if not profile.data:
            continue

        p = profile.data[0]

        logs = supabase.table("daily_logs") \
            .select("*") \
            .eq("user_id", mentee_id) \
            .order("created_at", desc=True) \
            .limit(20) \
            .execute()

        log_list = logs.data or []

        streak = supabase.table("streaks") \
            .select("current_streak, longest_streak") \
            .eq("user_id", mentee_id).execute()

        streak_data = streak.data[0] if streak.data else {
            "current_streak": 0, "longest_streak": 0
        }

        total = len(log_list)
        signed = sum(1 for l in log_list if l.get("signed"))
        passed = sum(1 for l in log_list if l.get("test_passed"))

        # Get AI overview (use existing summarise function)
        ai_summary = await summarise_mentee_logs(log_list, p["full_name"])

        mentee_analytics.append({
            "mentee_id": mentee_id,
            "profile": p,
            "streak": streak_data,
            "stats": {
                "total_logs": total,
                "signed_logs": signed,
                "tests_passed": passed,
                "sign_rate": round((signed / total * 100) if total > 0 else 0),
                "pass_rate": round((passed / total * 100) if total > 0 else 0),
            },
            "ai_summary": {
                "consistency_signal": ai_summary.get("consistency_signal", "Unknown"),
                "learning_depth_pattern": ai_summary.get("learning_depth_pattern", "Unknown"),
                "risk_flags": ai_summary.get("risk_flags", []),
                "strength_signals": ai_summary.get("strength_signals", []),
                "overview": ai_summary.get("overview", ""),
                "recommendations": ai_summary.get("recommendations", ""),
            }
        })

    # Sort: struggling first (needs attention)
    mentee_analytics.sort(
        key=lambda x: (
            x["stats"]["sign_rate"],
            x["streak"]["current_streak"]
        )
    )

    # Group-level summary
    total_members = len(mentee_analytics)
    avg_sign_rate = round(sum(m["stats"]["sign_rate"] for m in mentee_analytics) / total_members) if total_members else 0
    avg_streak = round(sum(m["streak"]["current_streak"] for m in mentee_analytics) / total_members) if total_members else 0
    at_risk = [m for m in mentee_analytics if m["ai_summary"]["consistency_signal"] in ["At Risk", "Inconsistent"]]
    doing_well = [m for m in mentee_analytics if m["ai_summary"]["consistency_signal"] == "Strong"]

    return {
        "group_summary": {
            "total_members": total_members,
            "avg_sign_rate": avg_sign_rate,
            "avg_streak": avg_streak,
            "at_risk_count": len(at_risk),
            "doing_well_count": len(doing_well),
        },
        "mentees": mentee_analytics,
    }


# ─────────────────────────────────────────────────────────────────────────────
# SET GROUP WEEKLY FOCUS
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/{group_id}/weekly-focus")
async def set_group_weekly_focus(
    group_id: str,
    body: GroupWeeklyFocusRequest,
    user=Depends(get_current_user)
):
    mentor_id = str(user.id)

    group = supabase.table("groups") \
        .select("*").eq("id", group_id) \
        .eq("mentor_id", mentor_id).execute()

    if not group.data:
        raise HTTPException(403, "Group not found or not yours")

    group_data = group.data[0]

    members = supabase.table("group_members") \
        .select("mentee_id").eq("group_id", group_id).execute()

    mentee_ids = [m["mentee_id"] for m in (members.data or [])]

    if not mentee_ids:
        raise HTTPException(400, "No members in this group")

    today = date.today()
    if body.week_start:
        week_start = date.fromisoformat(body.week_start)
    else:
        week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    mentor_profile = supabase.table("profiles") \
        .select("full_name").eq("id", mentor_id).execute()
    mentor_name = mentor_profile.data[0]["full_name"] if mentor_profile.data else "Your mentor"

    results = []

    for mentee_id in mentee_ids:
        mentee_profile = supabase.table("profiles") \
            .select("full_name, email").eq("id", mentee_id).execute()

        if not mentee_profile.data:
            continue

        mentee_name = mentee_profile.data[0]["full_name"]
        mentee_email = mentee_profile.data[0].get("email")

        # Get recent logs for context
        logs = supabase.table("daily_logs") \
            .select("structured_title, structured_topics, log_date") \
            .eq("user_id", mentee_id) \
            .order("log_date", desc=True).limit(7).execute()

        # Get incomplete tasks from last week
        last_week_start = week_start - timedelta(days=7)
        prev_focus = supabase.table("weekly_focus") \
            .select("id").eq("mentor_id", mentor_id) \
            .eq("mentee_id", mentee_id) \
            .eq("week_start", str(last_week_start)).execute()

        previous_incomplete = []
        if prev_focus.data:
            prev_tasks = supabase.table("weekly_tasks") \
                .select("title, category") \
                .eq("focus_id", prev_focus.data[0]["id"]) \
                .eq("completed", False).execute()
            previous_incomplete = prev_tasks.data or []

        # Generate tasks via Groq
        ai_result = await generate_weekly_tasks(
            raw_input=body.raw_input,
            mentee_name=mentee_name,
            mentee_logs=logs.data or [],
            previous_incomplete=previous_incomplete,
        )

        # Save focus
        focus_result = supabase.table("weekly_focus").insert({
            "mentor_id": mentor_id,
            "mentee_id": mentee_id,
            "week_start": str(week_start),
            "week_end": str(week_end),
            "raw_input": body.raw_input,
            "summary": ai_result.get("summary", ""),
        }).execute()

        if not focus_result.data:
            continue

        focus_id = focus_result.data[0]["id"]

        # Save tasks
        tasks_to_insert = [
            {
                "focus_id": focus_id,
                "mentee_id": mentee_id,
                "title": t.get("title", ""),
                "description": t.get("description", ""),
                "category": t.get("category", "General"),
                "suggested_time": t.get("suggested_time", ""),
                "priority": t.get("priority", 3),
                "carried_over": t.get("carried_over", False),
                "completed": False,
            }
            for t in ai_result.get("tasks", [])
        ]

        if tasks_to_insert:
            supabase.table("weekly_tasks").insert(tasks_to_insert).execute()

        # Notify mentee
        await create_notification(
            mentee_id,
            "project_assigned",
            "📅 New Weekly Focus Set",
            f"Your mentor set your group focus for the week of {week_start.strftime('%b %d')}: {ai_result.get('summary', '')}",
        )

        # Email mentee
        if mentee_email:
            try:
                await send_weekly_focus_email(
                    mentee_email=mentee_email,
                    mentee_name=mentee_name,
                    mentor_name=mentor_name,
                    summary=ai_result.get("summary", ""),
                    task_count=len(tasks_to_insert),
                    week_start=str(week_start),
                    week_end=str(week_end),
                )
            except Exception as e:
                print(f"[EMAIL] Failed for {mentee_email}: {e}")

        results.append({
            "mentee_id": mentee_id,
            "mentee_name": mentee_name,
            "task_count": len(tasks_to_insert),
        })

    return {
        "success": True,
        "group_name": group_data["name"],
        "week_start": str(week_start),
        "week_end": str(week_end),
        "members_updated": len(results),
        "results": results,
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET MENTEE AI REVIEW (inside group)
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/{group_id}/mentee/{mentee_id}/review")
async def get_mentee_review(
    group_id: str,
    mentee_id: str,
    user=Depends(get_current_user)
):
    mentor_id = str(user.id)

    group = supabase.table("groups") \
        .select("id").eq("id", group_id) \
        .eq("mentor_id", mentor_id).execute()

    if not group.data:
        raise HTTPException(403, "Not authorised")

    profile = supabase.table("profiles") \
        .select("full_name, field_of_study") \
        .eq("id", mentee_id).execute()

    if not profile.data:
        raise HTTPException(404, "Mentee not found")

    p = profile.data[0]

    logs = supabase.table("daily_logs") \
        .select("*") \
        .eq("user_id", mentee_id) \
        .order("created_at", desc=True) \
        .limit(20) \
        .execute()

    log_list = logs.data or []
    ai_summary = await summarise_mentee_logs(log_list, p["full_name"])

    return {
        "profile": p,
        "ai_overview": ai_summary,
        "recent_logs": log_list[:10],
    }


# ─────────────────────────────────────────────────────────────────────────────
# DELETE GROUP
# ─────────────────────────────────────────────────────────────────────────────

@router.delete("/{group_id}")
async def delete_group(group_id: str, user=Depends(get_current_user)):
    group = supabase.table("groups") \
        .select("id").eq("id", group_id) \
        .eq("mentor_id", str(user.id)).execute()

    if not group.data:
        raise HTTPException(403, "Group not found or not yours")

    supabase.table("groups").delete().eq("id", group_id).execute()
    return {"success": True}