from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from models import CreateProjectRequest
from dependencies import get_current_user
from services.supabase_service import supabase, create_notification
from services.groq_service import generate_weekly_tasks, generate_weekly_review
from services.resend_service import send_email
from config import settings
from services.groq_service import (
    generate_weekly_tasks, generate_weekly_review,
    restructure_project_description, estimate_project_completion
)

router = APIRouter(prefix="/projects", tags=["projects"])


# ============================================================
# EXISTING PROJECT ROUTES
# ============================================================

@router.post("/create")
async def create_project(body: CreateProjectRequest, user=Depends(get_current_user)):
    creator_id = str(user.id)

    # AI restructures description for better log comparison
    structured_description = body.description or ""
    if body.description and len(body.description.strip()) > 10:
        try:
            structured_description = await restructure_project_description(
                body.title, body.description
            )
        except Exception:
            structured_description = body.description

    project_data = {
        "creator_id": creator_id,
        "title": body.title,
        "description": structured_description,
        "deadline": str(body.deadline) if body.deadline else None,
    }

    result = supabase.table("projects").insert(project_data).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create project")

    project = result.data[0]
    project_id = project["id"]

    if body.mentee_ids:
        assignments = [
            {"project_id": project_id, "mentee_id": mid, "assigned_by": creator_id}
            for mid in body.mentee_ids
        ]
        supabase.table("project_assignments").insert(assignments).execute()

        for mentee_id in body.mentee_ids:
            await create_notification(
                mentee_id, "project_assigned",
                "📋 New Project Assigned",
                f"You've been assigned to: \"{body.title}\"",
                {"project_id": project_id}
            )

    return {"success": True, "project": project}


@router.get("/my-projects")
async def get_my_projects(user=Depends(get_current_user)):
    user_id = str(user.id)

    created = supabase.table("projects") \
        .select("*, project_assignments(mentee_id)") \
        .eq("creator_id", user_id).execute()

    assigned_rows = supabase.table("project_assignments") \
        .select("project_id").eq("mentee_id", user_id).execute()

    assigned_ids = [r["project_id"] for r in (assigned_rows.data or [])]
    assigned = []
    if assigned_ids:
        assigned_result = supabase.table("projects") \
            .select("*").in_("id", assigned_ids).execute()
        assigned = assigned_result.data or []

    return {"created": created.data or [], "assigned": assigned}


@router.get("/mentees")
async def get_my_mentees(user=Depends(get_current_user)):
    relationships = supabase.table("mentor_relationships") \
        .select("*, profiles!mentor_relationships_mentee_id_fkey(id, full_name, username, field_of_study)") \
        .eq("mentor_id", str(user.id)).eq("status", "active").execute()
    return {"mentees": relationships.data or []}

@router.get("/{project_id}/completion")
async def get_project_completion(
    project_id: str,
    user=Depends(get_current_user)
):
    """
    AI estimates project completion rate by comparing
    project description against logs tagged to this project.
    """
    # Get project
    project = supabase.table("projects") \
        .select("*") \
        .eq("id", project_id) \
        .execute()

    if not project.data:
        raise HTTPException(404, "Project not found")

    p = project.data[0]

    # Verify access — creator or assigned mentee
    is_creator = p["creator_id"] == str(user.id)
    is_member = supabase.table("project_assignments") \
        .select("id") \
        .eq("project_id", project_id) \
        .eq("mentee_id", str(user.id)) \
        .execute()

    if not is_creator and not is_member.data:
        raise HTTPException(403, "Not authorised")

    # Get logs tagged to this project
    logs = supabase.table("daily_logs") \
        .select("structured_title, structured_topics, structured_content, log_date") \
        .eq("project_id", project_id) \
        .order("log_date", desc=False) \
        .execute()

    result = await estimate_project_completion(
        project_title=p["title"],
        project_description=p["description"] or p["title"],
        logs=logs.data or []
    )

    return {
        "project_id": project_id,
        "project_title": p["title"],
        "log_count": len(logs.data or []),
        **result
    }

# ============================================================
# WEEKLY FOCUS ROUTES
# ============================================================

class CreateWeeklyFocusRequest(BaseModel):
    mentee_id: str
    raw_input: str
    week_start: Optional[str] = None  # defaults to this Monday


class UpdateTaskRequest(BaseModel):
    completed: bool


@router.post("/weekly-focus/create")
async def create_weekly_focus(
    body: CreateWeeklyFocusRequest,
    user=Depends(get_current_user)
):
    """
    Mentor submits a weekly focus for a mentee.
    AI generates tasks, cross-referencing mentee's logs and last week's incomplete tasks.
    """
    mentor_id = str(user.id)

    # Verify mentor relationship
    rel = supabase.table("mentor_relationships") \
        .select("id").eq("mentor_id", mentor_id) \
        .eq("mentee_id", body.mentee_id).eq("status", "active").execute()

    if not rel.data:
        raise HTTPException(403, "You are not this mentee's mentor")

    # Calculate week bounds
    today = date.today()
    if body.week_start:
        week_start = date.fromisoformat(body.week_start)
    else:
        # Default to this Monday
        week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    # Get mentee name
    profile = supabase.table("profiles") \
        .select("full_name").eq("id", body.mentee_id).execute()
    mentee_name = profile.data[0]["full_name"] if profile.data else "Mentee"

    # Get mentee's recent logs for context
    logs = supabase.table("daily_logs") \
        .select("structured_title, structured_topics, log_date") \
        .eq("user_id", body.mentee_id) \
        .order("log_date", desc=True).limit(7).execute()

    # Get last week's incomplete tasks for carry-over
    last_week_start = week_start - timedelta(days=7)
    prev_focus = supabase.table("weekly_focus") \
        .select("id").eq("mentor_id", mentor_id) \
        .eq("mentee_id", body.mentee_id) \
        .eq("week_start", str(last_week_start)).execute()

    previous_incomplete = []
    if prev_focus.data:
        prev_tasks = supabase.table("weekly_tasks") \
            .select("title, category") \
            .eq("focus_id", prev_focus.data[0]["id"]) \
            .eq("completed", False).execute()
        previous_incomplete = prev_tasks.data or []

    # Generate tasks with AI
    ai_result = await generate_weekly_tasks(
        raw_input=body.raw_input,
        mentee_name=mentee_name,
        mentee_logs=logs.data or [],
        previous_incomplete=previous_incomplete
    )

    # Save weekly focus
    focus_result = supabase.table("weekly_focus").insert({
        "mentor_id": mentor_id,
        "mentee_id": body.mentee_id,
        "week_start": str(week_start),
        "week_end": str(week_end),
        "raw_input": body.raw_input,
        "summary": ai_result.get("summary", ""),
    }).execute()

    if not focus_result.data:
        raise HTTPException(500, "Failed to save weekly focus")

    focus_id = focus_result.data[0]["id"]

    # Save tasks
    tasks_to_insert = []
    for task in ai_result.get("tasks", []):
        tasks_to_insert.append({
            "focus_id": focus_id,
            "mentee_id": body.mentee_id,
            "title": task.get("title", ""),
            "description": task.get("description", ""),
            "category": task.get("category", "General"),
            "suggested_time": task.get("suggested_time", ""),
            "priority": task.get("priority", 3),
            "carried_over": task.get("carried_over", False),
            "completed": False,
        })

    if tasks_to_insert:
        supabase.table("weekly_tasks").insert(tasks_to_insert).execute()

    # Notify mentee
    await create_notification(
        body.mentee_id,
        "project_assigned",
        "📅 New Weekly Focus Set",
        f"Your mentor set your focus for the week of {week_start.strftime('%b %d')}: {ai_result.get('summary', '')}",
    )

    return {
        "success": True,
        "focus_id": focus_id,
        "summary": ai_result.get("summary"),
        "week_start": str(week_start),
        "week_end": str(week_end),
        "task_count": len(tasks_to_insert),
        "carried_over_count": sum(1 for t in tasks_to_insert if t["carried_over"]),
    }


@router.get("/weekly-focus/mentee/{mentee_id}")
async def get_mentee_weekly_focus(
    mentee_id: str,
    user=Depends(get_current_user)
):
    """Get current week's focus and tasks for a mentee (mentor view)."""
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    focus = supabase.table("weekly_focus") \
        .select("*") \
        .eq("mentor_id", str(user.id)) \
        .eq("mentee_id", mentee_id) \
        .eq("week_start", str(week_start)) \
        .execute()

    if not focus.data:
        return {"focus": None, "tasks": []}

    focus_data = focus.data[0]
    tasks = supabase.table("weekly_tasks") \
        .select("*") \
        .eq("focus_id", focus_data["id"]) \
        .order("priority").execute()

    return {"focus": focus_data, "tasks": tasks.data or []}


@router.get("/weekly-focus/my-tasks")
async def get_my_weekly_tasks(user=Depends(get_current_user)):
    """
    Mentee gets their current week's tasks.
    Sorted by: carried_over first, then priority.
    """
    today = date.today()
    week_start = today - timedelta(days=today.weekday())

    focus = supabase.table("weekly_focus") \
        .select("*") \
        .eq("mentee_id", str(user.id)) \
        .eq("week_start", str(week_start)) \
        .execute()

    if not focus.data:
        return {"focus": None, "tasks": [], "stats": None}

    focus_data = focus.data[0]
    tasks = supabase.table("weekly_tasks") \
        .select("*") \
        .eq("focus_id", focus_data["id"]) \
        .order("carried_over", desc=True) \
        .order("priority") \
        .execute()

    task_list = tasks.data or []
    total = len(task_list)
    completed = sum(1 for t in task_list if t.get("completed"))

    return {
        "focus": focus_data,
        "tasks": task_list,
        "stats": {
            "total": total,
            "completed": completed,
            "remaining": total - completed,
            "completion_rate": round((completed / total * 100) if total > 0 else 0),
        }
    }


@router.patch("/weekly-tasks/{task_id}")
async def update_task(
    task_id: str,
    body: UpdateTaskRequest,
    user=Depends(get_current_user)
):
    """Mentee toggles a task as complete or incomplete."""
    from datetime import datetime

    update_data = {"completed": body.completed}
    if body.completed:
        update_data["completed_at"] = datetime.utcnow().isoformat()
    else:
        update_data["completed_at"] = None

    result = supabase.table("weekly_tasks") \
        .update(update_data) \
        .eq("id", task_id) \
        .eq("mentee_id", str(user.id)) \
        .execute()

    if not result.data:
        raise HTTPException(404, "Task not found or not yours")

    return {"success": True, "completed": body.completed}


@router.get("/weekly-focus/history")
async def get_focus_history(user=Depends(get_current_user)):
    """Get all past weekly focus plans for the current user (as mentee)."""
    focus_list = supabase.table("weekly_focus") \
        .select("*") \
        .eq("mentee_id", str(user.id)) \
        .order("week_start", desc=True) \
        .execute()

    result = []
    for focus in (focus_list.data or []):
        tasks = supabase.table("weekly_tasks") \
            .select("id, title, completed, carried_over, category, priority") \
            .eq("focus_id", focus["id"]) \
            .execute()

        task_list = tasks.data or []
        total = len(task_list)
        completed = sum(1 for t in task_list if t.get("completed"))

        result.append({
            **focus,
            "task_count": total,
            "completed_count": completed,
            "completion_rate": round((completed / total * 100) if total > 0 else 0),
        })

    return {"history": result}


@router.post("/weekly-focus/{focus_id}/send-review")
async def send_weekly_review(
    focus_id: str,
    user=Depends(get_current_user)
):
    """
    Manually trigger the weekly review email.
    Sends to both mentor and mentee.
    In production this would be triggered by pg_cron every Sunday.
    """
    focus = supabase.table("weekly_focus") \
        .select("*").eq("id", focus_id).execute()

    if not focus.data:
        raise HTTPException(404, "Focus not found")

    focus_data = focus.data[0]

    # Verify requester is mentor or mentee
    if str(user.id) not in [focus_data["mentor_id"], focus_data["mentee_id"]]:
        raise HTTPException(403, "Not authorised")

    tasks = supabase.table("weekly_tasks") \
        .select("*").eq("focus_id", focus_id).execute()
    task_list = tasks.data or []

    # Get mentee name
    mentee_profile = supabase.table("profiles") \
        .select("full_name").eq("id", focus_data["mentee_id"]).execute()
    mentee_name = mentee_profile.data[0]["full_name"] if mentee_profile.data else "Mentee"

    # Get mentor name
    mentor_profile = supabase.table("profiles") \
        .select("full_name").eq("id", focus_data["mentor_id"]).execute()
    mentor_name = mentor_profile.data[0]["full_name"] if mentor_profile.data else "Mentor"

    # AI review paragraph
    review_text = await generate_weekly_review(
        mentee_name=mentee_name,
        tasks=task_list,
        week_start=focus_data["week_start"],
        week_end=focus_data["week_end"],
    )

    total = len(task_list)
    completed = sum(1 for t in task_list if t.get("completed"))
    completion_rate = round((completed / total * 100) if total > 0 else 0)
    incomplete = [t for t in task_list if not t.get("completed")]

    # Build email HTML
    completed_html = "".join([
        f'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F0EEF8;">'
        f'<span style="color:#059669;font-size:16px;">✅</span>'
        f'<span style="font-size:14px;color:#444;">{t["title"]}</span>'
        f'<span style="margin-left:auto;font-size:11px;background:#EDE9FE;color:#7C3AED;padding:2px 8px;border-radius:20px;">{t.get("category","")}</span>'
        f'</div>'
        for t in task_list if t.get("completed")
    ]) or '<p style="color:#aaa;font-size:13px;">None completed</p>'

    incomplete_html = "".join([
        f'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F0EEF8;">'
        f'<span style="color:#DC2626;font-size:16px;">⬜</span>'
        f'<span style="font-size:14px;color:#444;">{t["title"]}</span>'
        f'<span style="margin-left:auto;font-size:11px;background:#EDE9FE;color:#7C3AED;padding:2px 8px;border-radius:20px;">{t.get("category","")}</span>'
        f'</div>'
        for t in incomplete
    ]) or '<p style="color:#aaa;font-size:13px;">All tasks completed! 🎉</p>'

    # Progress bar
    bar_color = "#059669" if completion_rate >= 80 else "#D97706" if completion_rate >= 50 else "#DC2626"

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">

    <div style="background:#0A0A0F;padding:28px 36px;">
      <div style="font-size:22px;font-weight:800;color:#fff;">Trackm<span style="color:#7C3AED;">e</span></div>
      <div style="color:#555;font-size:11px;margin-top:4px;letter-spacing:4px;">S / Y A N</div>
    </div>

    <div style="padding:36px 40px;">
      <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:8px;">
        Weekly Review
      </div>
      <h1 style="font-size:20px;font-weight:800;color:#0D0D0D;margin:0 0 4px;letter-spacing:-0.3px;">
        {mentee_name}'s Week
      </h1>
      <p style="color:#aaa;font-size:13px;margin:0 0 28px;">
        {focus_data['week_start']} → {focus_data['week_end']}
      </p>

      <!-- Progress -->
      <div style="background:#F8F6FF;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-weight:700;font-size:15px;color:#0D0D0D;">{completed}/{total} tasks completed</span>
          <span style="font-size:22px;font-weight:900;color:{bar_color};">{completion_rate}%</span>
        </div>
        <div style="height:8px;background:#E8E5FF;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:{completion_rate}%;background:{bar_color};border-radius:4px;transition:width 0.3s;"></div>
        </div>
      </div>

      <!-- AI Review -->
      <div style="background:#F8F6FF;border-left:3px solid #7C3AED;padding:16px 20px;border-radius:0 10px 10px 0;margin-bottom:28px;">
        <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:8px;">
          Mentor's AI Assessment
        </div>
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0;">{review_text}</p>
      </div>

      <!-- Completed tasks -->
      <div style="margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
          ✅ Completed
        </div>
        {completed_html}
      </div>

      <!-- Incomplete tasks -->
      <div style="margin-bottom:28px;">
        <div style="font-size:12px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">
          ⬜ Carrying Over
        </div>
        {incomplete_html}
      </div>

      <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 18px;">
      <p style="color:#ccc;font-size:11px;text-align:center;margin:0;">
        Powered by Trackme · S / Y A N
      </p>
    </div>
  </div>
</body>
</html>"""

    # Get emails
    try:
        all_users = supabase.auth.admin.list_users()
        mentee_email = None
        mentor_email = None
        for u in all_users:
            if str(u.id) == focus_data["mentee_id"]:
                mentee_email = u.email
            if str(u.id) == focus_data["mentor_id"]:
                mentor_email = u.email

        subject = f"📊 Weekly Review: {mentee_name} completed {completion_rate}% this week"

        if mentee_email:
            send_email(mentee_email, subject, html)
        if mentor_email and mentor_email != mentee_email:
            send_email(mentor_email, subject, html)

    except Exception as e:
        raise HTTPException(500, f"Failed to send review emails: {str(e)}")

    return {"success": True, "completion_rate": completion_rate}