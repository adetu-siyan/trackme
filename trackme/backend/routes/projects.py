import json
from datetime import date, timedelta, datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from models import CreateProjectRequest

from dependencies import get_current_user
from services.supabase_service import supabase, create_notification
from services.brevo_service import (
    send_signed_notification_to_mentee,
    send_weekly_focus_set_email,
    send_project_assigned_email,
)
from services.groq_service import (
    generate_weekly_tasks,
    generate_weekly_review,
    generate_review_preview,
    restructure_project_description,
    estimate_project_completion,
    analyze_roadmap_delay,
    validate_roadmap_structure,
    generate_roadmap_tasks_for_unit,
    generate_unit_test,
)

router = APIRouter(prefix="/projects", tags=["projects"])


# ============================================================
# HELPERS
# ============================================================

def get_user_email(user_id: str) -> Optional[str]:
    try:
        res = supabase.auth.admin.get_user_by_id(user_id)
        return res.user.email if res and res.user else None
    except Exception as e:
        print(f"[GET_USER_EMAIL] Failed for {user_id}: {e}")
        return None


def get_profile_name(user_id: str, fallback: str = "User") -> str:
    try:
        res = supabase.table("profiles") \
            .select("full_name").eq("id", user_id).execute()
        return res.data[0]["full_name"] if res.data else fallback
    except Exception as e:
        print(f"[GET_PROFILE_NAME] Failed for {user_id}: {e}")
        return fallback


def parse_json_list(raw: Optional[str]) -> list:
    if not raw:
        return []
    try:
        return json.loads(raw)
    except Exception:
        return []


# ============================================================
# PYDANTIC MODELS
# ============================================================

class CreateWeeklyFocusRequest(BaseModel):
    mentee_id: str
    raw_input: str
    week_start: Optional[str] = None


class UpdateTaskRequest(BaseModel):
    completed: bool


class UpdateTaskContentRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    mentor_note: Optional[str] = None


class SendReviewRequest(BaseModel):
    summary: Optional[str] = None
    progress: Optional[str] = None
    recommendations: Optional[str] = None
    next_week_focus: Optional[str] = None
    week_label: Optional[str] = None


class UpdateFocusSummaryRequest(BaseModel):
    summary: str


class RoadmapUnit(BaseModel):
    unit_number: int
    title: str
    goal: str = ""
    tasks: list = []
    resources: str = ""
    links: str = ""


class SaveRoadmapRequest(BaseModel):
    title: str
    duration_type: str
    total_units: int
    units: List[RoadmapUnit]
    
class ValidateRoadmapRequest(BaseModel):
    headers: list
    sample_rows: list

class SubmitTestRequest(BaseModel):
    answers: dict


# ============================================================
# PROJECT ROUTES
# ============================================================

@router.post("/create")
async def create_project(
    title: str = Form(...),
    description: str = Form(None),
    deadline: str = Form(None),
    project_type: str = Form("tech"),
    objectives: str = Form(None),
    deliverables: str = Form(None),
    requirements: str = Form(None),
    tech_stack: str = Form(None),
    resources: str = Form(None),
    submission_channel: str = Form(None),
    submission_notes: str = Form(None),
    mentee_ids: str = Form(None),
    files: List[UploadFile] = File(None),
    user=Depends(get_current_user)
):
    creator_id = str(user.id)
    mentor_name = get_profile_name(creator_id, fallback="Mentor")

    mentee_list = parse_json_list(mentee_ids)
    objectives_list = parse_json_list(objectives)
    deliverables_list = parse_json_list(deliverables)
    requirements_list = parse_json_list(requirements)
    tech_stack_list = parse_json_list(tech_stack)
    resources_list = parse_json_list(resources)

    for mentee_id in mentee_list:
        rel = supabase.table("mentor_relationships") \
            .select("id").eq("mentor_id", creator_id) \
            .eq("mentee_id", mentee_id).eq("status", "active").execute()
        if not rel.data:
            raise HTTPException(403, f"Mentee {mentee_id} is not your active mentee")

    structured_description = description or ""
    if description and len(description.strip()) > 10:
        try:
            structured_description = await restructure_project_description(title, description)
        except Exception as e:
            print(f"[AI RESTRUCTURE] Failed: {e}")
            structured_description = description

    uploaded_files = []
    if files:
        for file in files:
            try:
                content = await file.read()
                file_path = f"project-files/{creator_id}/{datetime.utcnow().timestamp()}_{file.filename}"
                supabase.storage \
                    .from_("project-assets") \
                    .upload(file_path, content, {
                        "content-type": file.content_type or "application/octet-stream"
                    })
                file_url = supabase.storage \
                    .from_("project-assets") \
                    .get_public_url(file_path)
                uploaded_files.append({
                    "name": file.filename,
                    "url": file_url,
                    "type": file.content_type,
                    "size": len(content)
                })
            except Exception as e:
                print(f"[FILE UPLOAD ERROR] {file.filename}: {e}")

    project_data = {
        "creator_id": creator_id,
        "title": title,
        "description": structured_description,
        "deadline": deadline,
        "project_type": project_type or "tech",
        "objectives": objectives_list,
        "deliverables": deliverables_list,
        "requirements": requirements_list,
        "tech_stack": tech_stack_list,
        "resources": resources_list,
        "submission_channel": submission_channel,
        "submission_notes": submission_notes,
        "files": uploaded_files if uploaded_files else None,
    }

    result = supabase.table("projects").insert(project_data).execute()
    if not result.data:
        raise HTTPException(500, "Failed to create project")

    project = result.data[0]
    project_id = project["id"]

    if mentee_list:
        assignments = [
            {"project_id": project_id, "mentee_id": mid, "assigned_by": creator_id}
            for mid in mentee_list
        ]
        supabase.table("project_assignments").insert(assignments).execute()

        for mentee_id in mentee_list:
            try:
                await create_notification(
                    mentee_id, "project_assigned",
                    "📋 New Project Assigned",
                    f"You've been assigned to: \"{title}\"",
                    {"project_id": project_id}
                )
                mentee_email = get_user_email(mentee_id)
                if mentee_email:
                    mentee_name = get_profile_name(mentee_id, fallback="there")
                    await send_project_assigned_email(
                        mentee_email=mentee_email,
                        mentee_name=mentee_name,
                        mentor_name=mentor_name,
                        project_title=title,
                        project_id=project_id,
                    )
            except Exception as e:
                print(f"[PROJECT NOTIFICATIONS] Failed for {mentee_id}: {e}")

    return {
        "success": True,
        "project": project,
        "assigned_mentees": len(mentee_list),
        "files_uploaded": len(uploaded_files)
    }


@router.get("/available-mentees")
async def get_available_mentees(user=Depends(get_current_user)):
    mentor_id = str(user.id)
    relationships = supabase.table("mentor_relationships") \
        .select("mentee_id, profiles!mentor_relationships_mentee_id_fkey(id, full_name, username, field_of_study, avatar_url)") \
        .eq("mentor_id", mentor_id).eq("status", "active").execute()

    mentees = []
    for rel in (relationships.data or []):
        profile = rel.get("profiles", {})
        if profile:
            mentees.append({
                "id": profile.get("id"),
                "full_name": profile.get("full_name"),
                "username": profile.get("username"),
                "field_of_study": profile.get("field_of_study"),
                "avatar_url": profile.get("avatar_url"),
            })
    return {"mentees": mentees}


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


@router.patch("/end/{project_id}")
async def end_project(project_id: str, user=Depends(get_current_user)):
    project_res = supabase.table("projects") \
        .select("id, creator_id").eq("id", project_id).execute()
    if not project_res.data:
        raise HTTPException(404, "Project not found")
    if project_res.data[0]["creator_id"] != str(user.id):
        raise HTTPException(403, "Only the project creator can end this project")
    result = supabase.table("projects") \
        .update({"status": "completed"}).eq("id", project_id).execute()
    return {"success": True, "project": result.data[0] if result.data else {}}


@router.get("/{project_id}/completion")
async def get_project_completion(project_id: str, user=Depends(get_current_user)):
    project = supabase.table("projects").select("*").eq("id", project_id).execute()
    if not project.data:
        raise HTTPException(404, "Project not found")

    p = project.data[0]
    is_creator = p["creator_id"] == str(user.id)
    is_member = supabase.table("project_assignments") \
        .select("id").eq("project_id", project_id) \
        .eq("mentee_id", str(user.id)).execute()
    if not is_creator and not is_member.data:
        raise HTTPException(403, "Not authorised")

    logs = supabase.table("daily_logs") \
        .select("structured_title, structured_topics, structured_content, log_date") \
        .eq("project_id", project_id).order("log_date", desc=False).execute()

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
# WEEKLY FOCUS
# ============================================================

@router.post("/weekly-focus/create")
async def create_weekly_focus(
    body: CreateWeeklyFocusRequest,
    user=Depends(get_current_user)
):
    mentor_id = str(user.id)
    mentor_name = get_profile_name(mentor_id, fallback="Your Mentor")

    rel = supabase.table("mentor_relationships") \
        .select("id").eq("mentor_id", mentor_id) \
        .eq("mentee_id", body.mentee_id).eq("status", "active").execute()
    if not rel.data:
        raise HTTPException(403, "You are not this mentee's mentor")

    today = date.today()
    if body.week_start:
        week_start = date.fromisoformat(body.week_start)
        week_start = week_start - timedelta(days=week_start.weekday())
    else:
        week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    mentee_name = get_profile_name(body.mentee_id, fallback="Mentee")

    logs = supabase.table("daily_logs") \
        .select("structured_title, structured_topics, log_date") \
        .eq("user_id", body.mentee_id) \
        .order("log_date", desc=True).limit(7).execute()

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

    ai_result = await generate_weekly_tasks(
        raw_input=body.raw_input,
        mentee_name=mentee_name,
        mentee_logs=logs.data or [],
        previous_incomplete=previous_incomplete
    )

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

    tasks_to_insert = [
        {
            "focus_id": focus_id,
            "mentee_id": body.mentee_id,
            "title": task.get("title", ""),
            "description": task.get("description", ""),
            "category": task.get("category", "General"),
            "suggested_time": task.get("suggested_time", ""),
            "priority": task.get("priority", 3),
            "carried_over": task.get("carried_over", False),
            "completed": False,
        }
        for task in ai_result.get("tasks", [])
    ]

    if tasks_to_insert:
        supabase.table("weekly_tasks").insert(tasks_to_insert).execute()

    await create_notification(
        body.mentee_id,
        "project_assigned",
        "📅 New Weekly Focus Set",
        f"Your mentor set your focus for the week of {week_start.strftime('%b %d')}: {ai_result.get('summary', '')}",
        {"focus_id": focus_id}
    )

    try:
        mentee_email = get_user_email(body.mentee_id)
        if mentee_email:
            await send_weekly_focus_set_email(
                mentee_email=mentee_email,
                mentee_name=mentee_name,
                mentor_name=mentor_name,
                summary=ai_result.get("summary", ""),
                task_count=len(tasks_to_insert),
                week_start=week_start.strftime("%b %d, %Y"),
                week_end=week_end.strftime("%b %d, %Y"),
                carried_over_count=sum(1 for t in tasks_to_insert if t.get("carried_over")),
            )
    except Exception as e:
        print(f"[WEEKLY FOCUS EMAIL] Failed: {e}")

    return {
        "success": True,
        "focus_id": focus_id,
        "summary": ai_result.get("summary"),
        "week_start": str(week_start),
        "week_end": str(week_end),
        "task_count": len(tasks_to_insert),
        "carried_over_count": sum(1 for t in tasks_to_insert if t.get("carried_over")),
    }


@router.get("/weekly-focus/history")
async def get_focus_history(user=Depends(get_current_user)):
    focus_list = supabase.table("weekly_focus") \
        .select("*").eq("mentee_id", str(user.id)) \
        .order("week_start", desc=True).execute()

    result = []
    for focus in (focus_list.data or []):
        tasks = supabase.table("weekly_tasks") \
            .select("id, title, completed, carried_over, category, priority") \
            .eq("focus_id", focus["id"]).execute()
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


@router.get("/weekly-focus/my-tasks")
async def get_my_weekly_tasks(user=Depends(get_current_user)):
    today = date.today()
    today_str = str(today)

    focus = supabase.table("weekly_focus") \
        .select("*").eq("mentee_id", str(user.id)) \
        .lte("week_start", today_str) \
        .gte("week_end", today_str) \
        .order("week_start", desc=True).limit(1).execute()

    if not focus.data:
        return {"focus": None, "tasks": [], "stats": None}

    focus_data = focus.data[0]
    tasks = supabase.table("weekly_tasks") \
        .select("*").eq("focus_id", focus_data["id"]) \
        .order("carried_over", desc=True).order("priority").execute()

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


@router.get("/weekly-focus/mentee/{mentee_id}")
async def get_mentee_weekly_focus(mentee_id: str, user=Depends(get_current_user)):
    today_str = str(date.today())
    focus = supabase.table("weekly_focus") \
        .select("*").eq("mentor_id", str(user.id)) \
        .eq("mentee_id", mentee_id) \
        .lte("week_start", today_str) \
        .gte("week_end", today_str) \
        .order("week_start", desc=True).limit(1).execute()

    if not focus.data:
        return {"focus": None, "tasks": []}

    focus_data = focus.data[0]
    tasks = supabase.table("weekly_tasks") \
        .select("*").eq("focus_id", focus_data["id"]) \
        .order("priority").execute()
    return {"focus": focus_data, "tasks": tasks.data or []}


@router.patch("/weekly-tasks/{task_id}")
async def update_task(
    task_id: str,
    body: UpdateTaskRequest,
    user=Depends(get_current_user)
):
    update_data = {
        "completed": body.completed,
        "completed_at": datetime.utcnow().isoformat() if body.completed else None,
    }
    result = supabase.table("weekly_tasks") \
        .update(update_data).eq("id", task_id) \
        .eq("mentee_id", str(user.id)).execute()
    if not result.data:
        raise HTTPException(404, "Task not found or not yours")
    return {"success": True, "completed": body.completed}


@router.patch("/weekly-tasks/{task_id}/content")
async def update_task_content(
    task_id: str,
    body: UpdateTaskContentRequest,
    user=Depends(get_current_user)
):
    task_res = supabase.table("weekly_tasks") \
        .select("id, focus_id").eq("id", task_id).execute()
    if not task_res.data:
        raise HTTPException(404, "Task not found")

    focus_id = task_res.data[0]["focus_id"]
    focus_res = supabase.table("weekly_focus") \
        .select("id, mentor_id").eq("id", focus_id).execute()
    if not focus_res.data:
        raise HTTPException(404, "Focus week not found")
    if focus_res.data[0]["mentor_id"] != str(user.id):
        raise HTTPException(403, "Only the assigned mentor can edit this task")

    update_data = {}
    if body.title is not None:
        update_data["title"] = body.title
    if body.description is not None:
        update_data["description"] = body.description
    if body.category is not None:
        update_data["category"] = body.category
    if body.mentor_note is not None:
        update_data["mentor_note"] = body.mentor_note

    if not update_data:
        raise HTTPException(400, "No valid fields to update")

    result = supabase.table("weekly_tasks") \
        .update(update_data).eq("id", task_id).execute()
    return {"success": True, "task": result.data[0] if result.data else {}}


@router.get("/weekly-focus/{focus_id}/review-preview")
async def get_review_preview(focus_id: str, user=Depends(get_current_user)):
    focus_res = supabase.table("weekly_focus") \
        .select("*").eq("id", focus_id).execute()
    if not focus_res.data:
        raise HTTPException(404, "Focus week not found")

    focus = focus_res.data[0]
    if focus["mentor_id"] != str(user.id):
        raise HTTPException(403, "Only the mentor can preview this review")

    tasks_res = supabase.table("weekly_tasks") \
        .select("*").eq("focus_id", focus_id).execute()
    logs_res = supabase.table("daily_logs") \
        .select("structured_title, structured_topics, structured_content, log_date") \
        .eq("user_id", focus["mentee_id"]) \
        .gte("log_date", focus["week_start"]) \
        .lte("log_date", focus["week_end"]).execute()

    result = await generate_review_preview(
        focus=focus,
        tasks=tasks_res.data or [],
        logs=logs_res.data or []
    )
    return result


@router.post("/weekly-focus/{focus_id}/send-review")
async def send_weekly_review(focus_id: str, user=Depends(get_current_user)):
    focus = supabase.table("weekly_focus") \
        .select("*").eq("id", focus_id).execute()
    if not focus.data:
        raise HTTPException(404, "Focus not found")

    focus_data = focus.data[0]
    if str(user.id) not in [focus_data["mentor_id"], focus_data["mentee_id"]]:
        raise HTTPException(403, "Not authorised")

    tasks = supabase.table("weekly_tasks") \
        .select("*").eq("focus_id", focus_id).execute()
    task_list = tasks.data or []

    mentee_name = get_profile_name(focus_data["mentee_id"], fallback="Mentee")
    mentor_name = get_profile_name(focus_data["mentor_id"], fallback="Mentor")

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

    bar_color = (
        "#059669" if completion_rate >= 80
        else "#D97706" if completion_rate >= 50
        else "#DC2626"
    )

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
      <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:8px;">Weekly Review</div>
      <h1 style="font-size:20px;font-weight:800;color:#0D0D0D;margin:0 0 4px;letter-spacing:-0.3px;">{mentee_name}'s Week</h1>
      <p style="color:#aaa;font-size:13px;margin:0 0 28px;">{focus_data['week_start']} → {focus_data['week_end']}</p>
      <div style="background:#F8F6FF;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <span style="font-weight:700;font-size:15px;color:#0D0D0D;">{completed}/{total} tasks completed</span>
          <span style="font-size:22px;font-weight:900;color:{bar_color};">{completion_rate}%</span>
        </div>
        <div style="height:8px;background:#E8E5FF;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:{completion_rate}%;background:{bar_color};border-radius:4px;"></div>
        </div>
      </div>
      <div style="background:#F8F6FF;border-left:3px solid #7C3AED;padding:16px 20px;border-radius:0 10px 10px 0;margin-bottom:28px;">
        <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:8px;">Mentor's AI Assessment</div>
        <p style="font-size:14px;color:#444;line-height:1.7;margin:0;">{review_text}</p>
      </div>
      <div style="margin-bottom:24px;">
        <div style="font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">✅ Completed</div>
        {completed_html}
      </div>
      <div style="margin-bottom:28px;">
        <div style="font-size:12px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">⬜ Carrying Over</div>
        {incomplete_html}
      </div>
      <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 18px;">
      <p style="color:#ccc;font-size:11px;text-align:center;margin:0;">Powered by Dôti · S / Y A N</p>
    </div>
  </div>
</body>
</html>"""

    try:
        from services.brevo_service import send_email
        mentee_email = get_user_email(focus_data["mentee_id"])
        mentor_email = get_user_email(focus_data["mentor_id"])
        subject = f"📊 Weekly Review: {mentee_name} completed {completion_rate}% this week"
        if mentee_email:
            await send_email(mentee_email, subject, html)
        if mentor_email and mentor_email != mentee_email:
            await send_email(mentor_email, subject, html)
    except Exception as e:
        raise HTTPException(500, f"Failed to send review emails: {str(e)}")

    return {"success": True, "completion_rate": completion_rate}


@router.patch("/weekly-focus/{focus_id}/summary")
async def update_focus_summary(
    focus_id: str,
    body: UpdateFocusSummaryRequest,
    user=Depends(get_current_user)
):
    focus_res = supabase.table("weekly_focus") \
        .select("id, mentor_id").eq("id", focus_id).execute()
    if not focus_res.data:
        raise HTTPException(404, "Focus not found")
    if focus_res.data[0]["mentor_id"] != str(user.id):
        raise HTTPException(403, "Only the mentor can edit this focus")

    result = supabase.table("weekly_focus") \
        .update({"edited_summary": body.summary}).eq("id", focus_id).execute()
    return {"success": True, "focus": result.data[0] if result.data else {}}

@router.post("/roadmap/unit/{unit_id}/generate-tasks")
async def generate_unit_tasks(unit_id: str, user=Depends(get_current_user)):
    unit_res = supabase.table("roadmap_units") \
        .select("*").eq("id", unit_id).execute()
    if not unit_res.data:
        raise HTTPException(404, "Unit not found")

    unit = unit_res.data[0]

    generated = await generate_roadmap_tasks_for_unit(
        unit["title"], unit.get("goal", "")
    )

    if generated:
        supabase.table("roadmap_tasks").insert([
            {
                "unit_id": unit_id,
                "roadmap_id": unit["roadmap_id"],
                "title": t,
                "completed": False,
            }
            for t in generated if t.strip()
        ]).execute()

    updated = supabase.table("roadmap_units") \
        .select("*, roadmap_tasks(*)") \
        .eq("id", unit_id).execute()

    return {"tasks": updated.data[0].get("roadmap_tasks", []) if updated.data else []}
# ============================================================
# ROADMAP
# ============================================================
# ── VALIDATE ──────────────────────────────────────────────────
@router.post("/roadmap/validate")
async def validate_roadmap(
    body: ValidateRoadmapRequest,
    user=Depends(get_current_user)
):
    result = await validate_roadmap_structure(body.headers, body.sample_rows)
    return result


# ── MY GUIDE (mentee view) ────────────────────────────────────
@router.get("/roadmap/my-guide")
async def get_my_roadmap(user=Depends(get_current_user)):
    mentee_id = str(user.id)
    roadmap = supabase.table("roadmaps") \
        .select("*").eq("mentee_id", mentee_id) \
        .eq("status", "active").execute()

    if not roadmap.data:
        return {"roadmap": None, "units": []}

    roadmap_data = roadmap.data[0]
    units = supabase.table("roadmap_units") \
        .select("*, roadmap_tasks(*)") \
        .eq("roadmap_id", roadmap_data["id"]) \
        .order("unit_number").execute()

    return {"roadmap": roadmap_data, "units": units.data or []}


# ── CHECK DELAYS ──────────────────────────────────────────────
@router.post("/roadmap/check-delays")
async def check_roadmap_delays(user=Depends(get_current_user)):
    mentor_id = str(user.id)
    today = date.today()

    roadmaps = supabase.table("roadmaps") \
        .select("*").eq("mentor_id", mentor_id).eq("status", "active").execute()

    alerts_fired = 0
    for roadmap in (roadmaps.data or []):
        start = date.fromisoformat(roadmap["start_date"])
        duration_type = roadmap["duration_type"]
        days_elapsed = (today - start).days

        expected_unit = min(
            (days_elapsed + 1) if duration_type == "daily" else (days_elapsed // 7 + 1),
            roadmap["total_units"]
        )

        units = supabase.table("roadmap_units") \
            .select("*, roadmap_tasks(title, completed)") \
            .eq("roadmap_id", roadmap["id"]) \
            .eq("unlocked", True).eq("completed", False) \
            .order("unit_number").limit(1).execute()

        if not units.data:
            continue

        current_unit = units.data[0]
        if current_unit["unit_number"] < expected_unit:
            days_behind = expected_unit - current_unit["unit_number"]
            incomplete_tasks = [
                t["title"] for t in current_unit.get("roadmap_tasks", [])
                if not t["completed"]
            ]
            mentee_name = get_profile_name(roadmap["mentee_id"], fallback="Your mentee")
            alert_msg = await analyze_roadmap_delay(
                mentee_name=mentee_name,
                unit_title=current_unit["title"],
                unit_number=current_unit["unit_number"],
                days_behind=days_behind,
                tasks_incomplete=incomplete_tasks
            )
            await create_notification(
                mentor_id,
                "roadmap_delay",
                f"⚠️ Delay — {mentee_name}",
                alert_msg,
                {
                    "roadmap_id": roadmap["id"],
                    "mentee_id": roadmap["mentee_id"],
                    "days_behind": days_behind
                }
            )
            alerts_fired += 1

    return {"success": True, "alerts_fired": alerts_fired}


# ── GENERATE TASKS ────────────────────────────────────────────
@router.post("/roadmap/generate-tasks")
async def generate_roadmap_tasks(
    body: dict,
    user=Depends(get_current_user)
):
    units = body.get("units", [])
    if not units:
        raise HTTPException(400, "No units provided")

    prompt = """You are a learning roadmap assistant. For each topic below, generate 2-4 concise, actionable learning tasks.

Respond ONLY with valid JSON — an array of objects with keys:
- "unit_number": (integer, 1-indexed)
- "tasks": (array of short action strings)

No markdown, no explanation, just the JSON array.

Topics:
"""
    for i, u in enumerate(units):
        goal_part = f" — Goal: {u['goal']}" if u.get('goal') else ""
        prompt += f"{i + 1}. {u['title']}{goal_part}\n"

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.4,
        max_tokens=1500,
    )

    raw = response.choices[0].message.content.strip()
    raw = re.sub(r"```json|```", "", raw).strip()

    try:
        result = json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(500, "AI returned invalid JSON for task generation")

    return result


# ── TASK INSTRUCTIONS ─────────────────────────────────────────
@router.post("/roadmap/task-instructions")
async def task_instructions(
    body: TaskInstructionsRequest,
    user=Depends(get_current_user)
):
    instructions = await generate_task_instructions(
        body.task_title,
        body.unit_goal
    )
    return {"instructions": instructions}


# ── SAVE ROADMAP ──────────────────────────────────────────────
@router.post("/roadmap/save/{mentee_id}")
async def save_roadmap(
    mentee_id: str,
    body: SaveRoadmapRequest,
    user=Depends(get_current_user)
):
    mentor_id = str(user.id)

    rel = supabase.table("mentor_relationships") \
        .select("id").eq("mentor_id", mentor_id) \
        .eq("mentee_id", mentee_id).eq("status", "active").execute()
    if not rel.data:
        raise HTTPException(403, "You are not this mentee's mentor")

    existing = supabase.table("roadmaps") \
        .select("id").eq("mentor_id", mentor_id) \
        .eq("mentee_id", mentee_id).execute()
    if existing.data:
        raise HTTPException(400, "A roadmap already exists. Delete it first.")

    roadmap_res = supabase.table("roadmaps").insert({
        "mentor_id": mentor_id,
        "mentee_id": mentee_id,
        "title": body.title,
        "duration_type": body.duration_type,
        "total_units": body.total_units,
        "start_date": str(date.today()),
        "status": "active",
    }).execute()

    if not roadmap_res.data:
        raise HTTPException(500, "Failed to save roadmap")

    roadmap_id = roadmap_res.data[0]["id"]

    for unit in body.units:
        unit_res = supabase.table("roadmap_units").insert({
            "roadmap_id": roadmap_id,
            "unit_number": unit.unit_number,
            "title": unit.title,
            "goal": unit.goal,
            "resources": unit.resources,
            "links": unit.links,
            "unlocked": unit.unit_number == 1,
            "completed": False,
        }).execute()

        if unit_res.data and unit.tasks:
            unit_id = unit_res.data[0]["id"]
            supabase.table("roadmap_tasks").insert([
                {
                    "unit_id": unit_id,
                    "roadmap_id": roadmap_id,
                    "title": str(t),
                    "completed": False,
                }
                for t in unit.tasks if str(t).strip()
            ]).execute()

    await create_notification(
        mentee_id,
        "roadmap_uploaded",
        "🗺️ Your Learning Roadmap is Ready",
        f"Your mentor uploaded your roadmap: \"{body.title}\". Check your Guide tab.",
        {"roadmap_id": roadmap_id}
    )

    return {
        "success": True,
        "roadmap_id": roadmap_id,
        "title": body.title,
        "total_units": body.total_units,
    }


# ── TEST SUBMIT ───────────────────────────────────────────────
@router.post("/roadmap/test/{test_id}/submit")
async def submit_roadmap_test(
    test_id: str,
    body: SubmitTestRequest,
    user=Depends(get_current_user)
):
    mentee_id = str(user.id)
    test_res = supabase.table("roadmap_task_tests") \
        .select("*").eq("id", test_id).eq("mentee_id", mentee_id).execute()
    if not test_res.data:
        raise HTTPException(404, "Test not found")

    test = test_res.data[0]
    questions = test["questions"]

    correct = 0
    for i, q in enumerate(questions):
        submitted = body.answers.get(str(i), "")
        if submitted.upper() == q.get("answer", "").upper():
            correct += 1

    score = round((correct / len(questions)) * 100) if questions else 0
    passed = score >= 60

    supabase.table("roadmap_task_tests").update({
        "answers": body.answers,
        "score": score,
        "passed": passed,
        "submitted_at": datetime.utcnow().isoformat(),
    }).eq("id", test_id).execute()

    unit_res = supabase.table("roadmap_units") \
        .select("title, roadmap_id").eq("id", test["unit_id"]).execute()

    if unit_res.data:
        unit = unit_res.data[0]
        roadmap_res = supabase.table("roadmaps") \
            .select("mentor_id, mentee_id").eq("id", unit["roadmap_id"]).execute()
        if roadmap_res.data:
            mentor_id = roadmap_res.data[0]["mentor_id"]
            mentee_name = get_profile_name(mentee_id, fallback="Your mentee")
            await create_notification(
                mentor_id,
                "test_submitted",
                f"📝 Test Result — {mentee_name}",
                f"{mentee_name} scored {score}% on \"{unit['title']}\" ({'Passed' if passed else 'Failed'})",
                {"test_id": test_id, "score": score, "passed": passed}
            )

    return {
        "success": True,
        "score": score,
        "correct": correct,
        "total": len(questions),
        "passed": passed,
    }

# ── TEST RESULTS ──────────────────────────────────────────────
@router.get("/roadmap/test/{test_id}/results")
async def get_test_results(test_id: str, user=Depends(get_current_user)):
    test = supabase.table("roadmap_task_tests") \
        .select("*").eq("id", test_id).execute()
    if not test.data:
        raise HTTPException(404, "Test not found")
    return test.data[0]


# ── COMPLETE TASK ─────────────────────────────────────────────
@router.post("/roadmap/task/{task_id}/complete")
async def complete_roadmap_task(task_id: str, user=Depends(get_current_user)):
    mentee_id = str(user.id)

    task_res = supabase.table("roadmap_tasks") \
        .select("*, roadmap_units(title, goal, unit_number, roadmap_id, id)") \
        .eq("id", task_id).execute()
    if not task_res.data:
        raise HTTPException(404, "Task not found")

    task = task_res.data[0]
    unit = task.get("roadmap_units", {})

    roadmap_res = supabase.table("roadmaps") \
        .select("id, mentee_id, mentor_id").eq("id", unit.get("roadmap_id")).execute()
    if not roadmap_res.data or roadmap_res.data[0]["mentee_id"] != mentee_id:
        raise HTTPException(403, "Not your task")

    # Mark this task done
    supabase.table("roadmap_tasks").update({
        "completed": True,
        "completed_at": datetime.utcnow().isoformat()
    }).eq("id", task_id).execute()

    # Check if ALL tasks in this unit are now done
    all_tasks = supabase.table("roadmap_tasks") \
        .select("completed, title").eq("unit_id", unit.get("id")).execute()
    all_done = all(t["completed"] for t in (all_tasks.data or []))

    test_id = None
    questions = []

    if all_done:
        # Generate ONE unit test from ALL task titles combined
        all_task_titles = [t["title"] for t in (all_tasks.data or [])]
        questions = await generate_unit_test(
            unit_title=unit.get("title", ""),
            unit_goal=unit.get("goal", ""),
            task_titles=all_task_titles,
        )

        test_res = supabase.table("roadmap_task_tests").insert({
            "unit_id": unit.get("id"),
            "mentee_id": mentee_id,
            "questions": questions,
        }).execute()

        test_id = test_res.data[0]["id"] if test_res.data else None

        # Mark unit complete and unlock next
        supabase.table("roadmap_units").update({"completed": True}) \
            .eq("id", unit.get("id")).execute()
        next_unit_number = unit.get("unit_number", 0) + 1
        supabase.table("roadmap_units").update({"unlocked": True}) \
            .eq("roadmap_id", unit.get("roadmap_id")) \
            .eq("unit_number", next_unit_number).execute()

    return {
        "success": True,
        "all_tasks_done": all_done,
        "test_id": test_id,
        "questions": questions,
    }
    
# ── GET MENTEE ROADMAP (mentor view) ──────────────────────────
@router.get("/roadmap/mentee/{mentee_id}")
async def get_roadmap_for_mentor(mentee_id: str, user=Depends(get_current_user)):
    mentor_id = str(user.id)
    roadmap = supabase.table("roadmaps") \
        .select("*").eq("mentor_id", mentor_id) \
        .eq("mentee_id", mentee_id).execute()

    if not roadmap.data:
        return {"roadmap": None, "units": []}

    roadmap_data = roadmap.data[0]
    units = supabase.table("roadmap_units") \
        .select("*, roadmap_tasks(*)") \
        .eq("roadmap_id", roadmap_data["id"]) \
        .order("unit_number").execute()

    return {"roadmap": roadmap_data, "units": units.data or []}


# ── DELETE ROADMAP ────────────────────────────────────────────
@router.delete("/roadmap/{mentee_id}")
async def delete_roadmap(mentee_id: str, user=Depends(get_current_user)):
    mentor_id = str(user.id)
    existing = supabase.table("roadmaps") \
        .select("id").eq("mentor_id", mentor_id) \
        .eq("mentee_id", mentee_id).execute()
    if not existing.data:
        raise HTTPException(404, "No roadmap found for this mentee")

    roadmap_id = existing.data[0]["id"]
    supabase.table("roadmaps").delete().eq("id", roadmap_id).execute()
    return {"success": True, "deleted_roadmap_id": roadmap_id}

# from datetime import date, timedelta, datetime
# from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
# from pydantic import BaseModel
# from typing import Optional, List
# from models import CreateProjectRequest

# import io
# from services.groq_service import (
#     parse_roadmap_excel,
#     generate_task_test,
#     analyze_roadmap_delay,
# )
# from dependencies import get_current_user
# from services.supabase_service import supabase, create_notification
# from services.brevo_service import (
#     send_signed_notification_to_mentee,
#     send_weekly_focus_set_email,
#     send_project_assigned_email,
# )
# from services.groq_service import (
#     generate_weekly_tasks,
#     generate_weekly_review,
#     generate_review_preview,
#     restructure_project_description,
#     estimate_project_completion,
# )

# router = APIRouter(prefix="/projects", tags=["projects"])


# # ============================================================
# # HELPERS
# # ============================================================

# def get_user_email(user_id: str) -> Optional[str]:
#     """Fetch a single user's email via sync admin client."""
#     try:
#         res = supabase.auth.admin.get_user_by_id(user_id)
#         return res.user.email if res and res.user else None
#     except Exception as e:
#         print(f"[GET_USER_EMAIL] Failed for {user_id}: {e}")
#         return None


# def get_profile_name(user_id: str, fallback: str = "User") -> str:
#     """Fetch full_name from profiles table for a given user_id."""
#     try:
#         res = supabase.table("profiles") \
#             .select("full_name").eq("id", user_id).execute()
#         return res.data[0]["full_name"] if res.data else fallback
#     except Exception as e:
#         print(f"[GET_PROFILE_NAME] Failed for {user_id}: {e}")
#         return fallback


# def parse_json_list(raw: Optional[str]) -> list:
#     if not raw:
#         return []
#     try:
#         return json.loads(raw)
#     except Exception:
#         return []


# # ============================================================
# # PYDANTIC MODELS
# # ============================================================

# class CreateWeeklyFocusRequest(BaseModel):
#     mentee_id: str
#     raw_input: str
#     week_start: Optional[str] = None


# class UpdateTaskRequest(BaseModel):
#     completed: bool


# class UpdateTaskContentRequest(BaseModel):
#     title: Optional[str] = None
#     description: Optional[str] = None
#     category: Optional[str] = None
#     mentor_note: Optional[str] = None


# class SendReviewRequest(BaseModel):
#     summary: Optional[str] = None
#     progress: Optional[str] = None
#     recommendations: Optional[str] = None
#     next_week_focus: Optional[str] = None
#     week_label: Optional[str] = None


# # ============================================================
# # PROJECT ROUTES
# # ============================================================

# @router.post("/create")
# async def create_project(
#     title: str = Form(...),
#     description: str = Form(None),
#     deadline: str = Form(None),
#     project_type: str = Form("tech"),
#     objectives: str = Form(None),
#     deliverables: str = Form(None),
#     requirements: str = Form(None),
#     tech_stack: str = Form(None),
#     resources: str = Form(None),
#     submission_channel: str = Form(None),
#     submission_notes: str = Form(None),
#     mentee_ids: str = Form(None),
#     files: List[UploadFile] = File(None),
#     user=Depends(get_current_user)
# ):
#     creator_id = str(user.id)
#     mentor_name = get_profile_name(creator_id, fallback="Mentor")

#     mentee_list = parse_json_list(mentee_ids)
#     objectives_list = parse_json_list(objectives)
#     deliverables_list = parse_json_list(deliverables)
#     requirements_list = parse_json_list(requirements)
#     tech_stack_list = parse_json_list(tech_stack)
#     resources_list = parse_json_list(resources)

#     # Verify all mentees belong to this mentor
#     for mentee_id in mentee_list:
#         rel = supabase.table("mentor_relationships") \
#             .select("id").eq("mentor_id", creator_id) \
#             .eq("mentee_id", mentee_id).eq("status", "active").execute()
#         if not rel.data:
#             raise HTTPException(403, f"Mentee {mentee_id} is not your active mentee")

#     # Restructure description with AI if provided
#     structured_description = description or ""
#     if description and len(description.strip()) > 10:
#         try:
#             structured_description = await restructure_project_description(
#                 title, description
#             )
#         except Exception as e:
#             print(f"[AI RESTRUCTURE] Failed: {e}")
#             structured_description = description

#     # Handle file uploads
#     uploaded_files = []
#     if files:
#         for file in files:
#             try:
#                 content = await file.read()
#                 file_path = f"project-files/{creator_id}/{datetime.utcnow().timestamp()}_{file.filename}"

#                 supabase.storage \
#                     .from_("project-assets") \
#                     .upload(file_path, content, {
#                         "content-type": file.content_type or "application/octet-stream"
#                     })

#                 file_url = supabase.storage \
#                     .from_("project-assets") \
#                     .get_public_url(file_path)

#                 uploaded_files.append({
#                     "name": file.filename,
#                     "url": file_url,
#                     "type": file.content_type,
#                     "size": len(content)
#                 })
#             except Exception as e:
#                 print(f"[FILE UPLOAD ERROR] {file.filename}: {e}")

#     project_data = {
#         "creator_id": creator_id,
#         "title": title,
#         "description": structured_description,
#         "deadline": deadline,
#         "project_type": project_type or "tech",
#         "objectives": objectives_list,
#         "deliverables": deliverables_list,
#         "requirements": requirements_list,
#         "tech_stack": tech_stack_list,
#         "resources": resources_list,
#         "submission_channel": submission_channel,
#         "submission_notes": submission_notes,
#         "files": uploaded_files if uploaded_files else None,
#     }

#     result = supabase.table("projects").insert(project_data).execute()
#     if not result.data:
#         raise HTTPException(500, "Failed to create project")

#     project = result.data[0]
#     project_id = project["id"]

#     # Assign mentees + send notifications
#     if mentee_list:
#         assignments = [
#             {"project_id": project_id, "mentee_id": mid, "assigned_by": creator_id}
#             for mid in mentee_list
#         ]
#         supabase.table("project_assignments").insert(assignments).execute()

#         for mentee_id in mentee_list:
#             try:
#                 await create_notification(
#                     mentee_id, "project_assigned",
#                     "📋 New Project Assigned",
#                     f"You've been assigned to: \"{title}\"",
#                     {"project_id": project_id}
#                 )

#                 mentee_email = get_user_email(mentee_id)
#                 print(f"[PROJECT CREATE] mentee_id={mentee_id} email={mentee_email}")

#                 if mentee_email:
#                     mentee_name = get_profile_name(mentee_id, fallback="there")
#                     await send_project_assigned_email(
#                         mentee_email=mentee_email,
#                         mentee_name=mentee_name,
#                         mentor_name=mentor_name,
#                         project_title=title,
#                         project_id=project_id,
#                     )
#                     print(f"[PROJECT CREATE] ✅ Email sent to {mentee_email}")

#             except Exception as e:
#                 print(f"[PROJECT NOTIFICATIONS] Failed for {mentee_id}: {e}")

#     return {
#         "success": True,
#         "project": project,
#         "assigned_mentees": len(mentee_list),
#         "files_uploaded": len(uploaded_files)
#     }


# @router.get("/available-mentees")
# async def get_available_mentees(user=Depends(get_current_user)):
#     mentor_id = str(user.id)

#     relationships = supabase.table("mentor_relationships") \
#         .select("mentee_id, profiles!mentor_relationships_mentee_id_fkey(id, full_name, username, field_of_study, avatar_url)") \
#         .eq("mentor_id", mentor_id) \
#         .eq("status", "active") \
#         .execute()

#     mentees = []
#     for rel in (relationships.data or []):
#         profile = rel.get("profiles", {})
#         if profile:
#             mentees.append({
#                 "id": profile.get("id"),
#                 "full_name": profile.get("full_name"),
#                 "username": profile.get("username"),
#                 "field_of_study": profile.get("field_of_study"),
#                 "avatar_url": profile.get("avatar_url"),
#             })

#     return {"mentees": mentees}


# @router.get("/my-projects")
# async def get_my_projects(user=Depends(get_current_user)):
#     user_id = str(user.id)

#     created = supabase.table("projects") \
#         .select("*, project_assignments(mentee_id)") \
#         .eq("creator_id", user_id).execute()

#     assigned_rows = supabase.table("project_assignments") \
#         .select("project_id").eq("mentee_id", user_id).execute()

#     assigned_ids = [r["project_id"] for r in (assigned_rows.data or [])]
#     assigned = []
#     if assigned_ids:
#         assigned_result = supabase.table("projects") \
#             .select("*").in_("id", assigned_ids).execute()
#         assigned = assigned_result.data or []

#     return {"created": created.data or [], "assigned": assigned}


# @router.get("/mentees")
# async def get_my_mentees(user=Depends(get_current_user)):
#     relationships = supabase.table("mentor_relationships") \
#         .select("*, profiles!mentor_relationships_mentee_id_fkey(id, full_name, username, field_of_study)") \
#         .eq("mentor_id", str(user.id)).eq("status", "active").execute()
#     return {"mentees": relationships.data or []}


# @router.patch("/end/{project_id}")
# async def end_project(project_id: str, user=Depends(get_current_user)):
#     project_res = supabase.table("projects") \
#         .select("id, creator_id").eq("id", project_id).execute()

#     if not project_res.data:
#         raise HTTPException(404, "Project not found")

#     if project_res.data[0]["creator_id"] != str(user.id):
#         raise HTTPException(403, "Only the project creator can end this project")

#     result = supabase.table("projects") \
#         .update({"status": "completed"}).eq("id", project_id).execute()

#     return {"success": True, "project": result.data[0] if result.data else {}}


# @router.get("/{project_id}/completion")
# async def get_project_completion(project_id: str, user=Depends(get_current_user)):
#     project = supabase.table("projects").select("*").eq("id", project_id).execute()

#     if not project.data:
#         raise HTTPException(404, "Project not found")

#     p = project.data[0]
#     is_creator = p["creator_id"] == str(user.id)
#     is_member = supabase.table("project_assignments") \
#         .select("id").eq("project_id", project_id) \
#         .eq("mentee_id", str(user.id)).execute()

#     if not is_creator and not is_member.data:
#         raise HTTPException(403, "Not authorised")

#     logs = supabase.table("daily_logs") \
#         .select("structured_title, structured_topics, structured_content, log_date") \
#         .eq("project_id", project_id) \
#         .order("log_date", desc=False).execute()

#     result = await estimate_project_completion(
#         project_title=p["title"],
#         project_description=p["description"] or p["title"],
#         logs=logs.data or []
#     )

#     return {
#         "project_id": project_id,
#         "project_title": p["title"],
#         "log_count": len(logs.data or []),
#         **result
#     }


# # ============================================================
# # WEEKLY FOCUS
# # ============================================================

# @router.post("/weekly-focus/create")
# async def create_weekly_focus(
#     body: CreateWeeklyFocusRequest,
#     user=Depends(get_current_user)
# ):
#     mentor_id = str(user.id)
#     mentor_name = get_profile_name(mentor_id, fallback="Your Mentor")

#     rel = supabase.table("mentor_relationships") \
#         .select("id").eq("mentor_id", mentor_id) \
#         .eq("mentee_id", body.mentee_id).eq("status", "active").execute()

#     if not rel.data:
#         raise HTTPException(403, "You are not this mentee's mentor")

#     today = date.today()
#     if body.week_start:
#         week_start = date.fromisoformat(body.week_start)
#         week_start = week_start - timedelta(days=week_start.weekday())  # snap to Monday
#     else:
#         week_start = today - timedelta(days=today.weekday())
#     week_end = week_start + timedelta(days=6)

#     mentee_name = get_profile_name(body.mentee_id, fallback="Mentee")

#     logs = supabase.table("daily_logs") \
#         .select("structured_title, structured_topics, log_date") \
#         .eq("user_id", body.mentee_id) \
#         .order("log_date", desc=True).limit(7).execute()

#     last_week_start = week_start - timedelta(days=7)
#     prev_focus = supabase.table("weekly_focus") \
#         .select("id").eq("mentor_id", mentor_id) \
#         .eq("mentee_id", body.mentee_id) \
#         .eq("week_start", str(last_week_start)).execute()

#     previous_incomplete = []
#     if prev_focus.data:
#         prev_tasks = supabase.table("weekly_tasks") \
#             .select("title, category") \
#             .eq("focus_id", prev_focus.data[0]["id"]) \
#             .eq("completed", False).execute()
#         previous_incomplete = prev_tasks.data or []

#     ai_result = await generate_weekly_tasks(
#         raw_input=body.raw_input,
#         mentee_name=mentee_name,
#         mentee_logs=logs.data or [],
#         previous_incomplete=previous_incomplete
#     )

#     focus_result = supabase.table("weekly_focus").insert({
#         "mentor_id": mentor_id,
#         "mentee_id": body.mentee_id,
#         "week_start": str(week_start),
#         "week_end": str(week_end),
#         "raw_input": body.raw_input,
#         "summary": ai_result.get("summary", ""),
#     }).execute()

#     if not focus_result.data:
#         raise HTTPException(500, "Failed to save weekly focus")

#     focus_id = focus_result.data[0]["id"]

#     tasks_to_insert = [
#         {
#             "focus_id": focus_id,
#             "mentee_id": body.mentee_id,
#             "title": task.get("title", ""),
#             "description": task.get("description", ""),
#             "category": task.get("category", "General"),
#             "suggested_time": task.get("suggested_time", ""),
#             "priority": task.get("priority", 3),
#             "carried_over": task.get("carried_over", False),
#             "completed": False,
#         }
#         for task in ai_result.get("tasks", [])
#     ]

#     if tasks_to_insert:
#         supabase.table("weekly_tasks").insert(tasks_to_insert).execute()

#     await create_notification(
#         body.mentee_id,
#         "project_assigned",
#         "📅 New Weekly Focus Set",
#         f"Your mentor set your focus for the week of {week_start.strftime('%b %d')}: {ai_result.get('summary', '')}",
#         {"focus_id": focus_id}
#     )

#     try:
#         mentee_email = get_user_email(body.mentee_id)
#         print(f"[WEEKLY FOCUS] mentee_id={body.mentee_id} email={mentee_email}")

#         if mentee_email:
#             await send_weekly_focus_set_email(
#                 mentee_email=mentee_email,
#                 mentee_name=mentee_name,
#                 mentor_name=mentor_name,
#                 summary=ai_result.get("summary", ""),
#                 task_count=len(tasks_to_insert),
#                 week_start=week_start.strftime("%b %d, %Y"),
#                 week_end=week_end.strftime("%b %d, %Y"),
#                 carried_over_count=sum(1 for t in tasks_to_insert if t.get("carried_over")),
#             )
#             print(f"[WEEKLY FOCUS] ✅ Email sent to {mentee_email}")

#     except Exception as e:
#         print(f"[WEEKLY FOCUS EMAIL] Failed: {e}")

#     return {
#         "success": True,
#         "focus_id": focus_id,
#         "summary": ai_result.get("summary"),
#         "week_start": str(week_start),
#         "week_end": str(week_end),
#         "task_count": len(tasks_to_insert),
#         "carried_over_count": sum(1 for t in tasks_to_insert if t.get("carried_over")),
#     }


# @router.get("/weekly-focus/history")
# async def get_focus_history(user=Depends(get_current_user)):
#     focus_list = supabase.table("weekly_focus") \
#         .select("*").eq("mentee_id", str(user.id)) \
#         .order("week_start", desc=True).execute()

#     result = []
#     for focus in (focus_list.data or []):
#         tasks = supabase.table("weekly_tasks") \
#             .select("id, title, completed, carried_over, category, priority") \
#             .eq("focus_id", focus["id"]).execute()

#         task_list = tasks.data or []
#         total = len(task_list)
#         completed = sum(1 for t in task_list if t.get("completed"))

#         result.append({
#             **focus,
#             "task_count": total,
#             "completed_count": completed,
#             "completion_rate": round((completed / total * 100) if total > 0 else 0),
#         })

#     return {"history": result}


# @router.get("/weekly-focus/my-tasks")
# async def get_my_weekly_tasks(user=Depends(get_current_user)):
#     today = date.today()
#     today_str = str(today)

#     focus = supabase.table("weekly_focus") \
#         .select("*").eq("mentee_id", str(user.id)) \
#         .lte("week_start", today_str) \
#         .gte("week_end", today_str) \
#         .order("week_start", desc=True) \
#         .limit(1).execute()

#     if not focus.data:
#         return {"focus": None, "tasks": [], "stats": None}

#     focus_data = focus.data[0]
#     tasks = supabase.table("weekly_tasks") \
#         .select("*").eq("focus_id", focus_data["id"]) \
#         .order("carried_over", desc=True) \
#         .order("priority").execute()

#     task_list = tasks.data or []
#     total = len(task_list)
#     completed = sum(1 for t in task_list if t.get("completed"))

#     return {
#         "focus": focus_data,
#         "tasks": task_list,
#         "stats": {
#             "total": total,
#             "completed": completed,
#             "remaining": total - completed,
#             "completion_rate": round((completed / total * 100) if total > 0 else 0),
#         }
#     }


# @router.get("/weekly-focus/mentee/{mentee_id}")
# async def get_mentee_weekly_focus(mentee_id: str, user=Depends(get_current_user)):
#     today = date.today()
#     today_str = str(today)

#     focus = supabase.table("weekly_focus") \
#         .select("*").eq("mentor_id", str(user.id)) \
#         .eq("mentee_id", mentee_id) \
#         .lte("week_start", today_str) \
#         .gte("week_end", today_str) \
#         .order("week_start", desc=True) \
#         .limit(1).execute()

#     if not focus.data:
#         return {"focus": None, "tasks": []}

#     focus_data = focus.data[0]
#     tasks = supabase.table("weekly_tasks") \
#         .select("*").eq("focus_id", focus_data["id"]) \
#         .order("priority").execute()

#     return {"focus": focus_data, "tasks": tasks.data or []}

# @router.patch("/weekly-tasks/{task_id}")
# async def update_task(
#     task_id: str,
#     body: UpdateTaskRequest,
#     user=Depends(get_current_user)
# ):
#     update_data = {
#         "completed": body.completed,
#         "completed_at": datetime.utcnow().isoformat() if body.completed else None,
#     }

#     result = supabase.table("weekly_tasks") \
#         .update(update_data).eq("id", task_id) \
#         .eq("mentee_id", str(user.id)).execute()

#     if not result.data:
#         raise HTTPException(404, "Task not found or not yours")

#     return {"success": True, "completed": body.completed}


# @router.patch("/weekly-tasks/{task_id}/content")
# async def update_task_content(
#     task_id: str,
#     body: UpdateTaskContentRequest,
#     user=Depends(get_current_user)
    
# ):
#     task_res = supabase.table("weekly_tasks") \
#         .select("id, focus_id").eq("id", task_id).execute()

#     if not task_res.data:
#         raise HTTPException(404, "Task not found")

#     focus_id = task_res.data[0]["focus_id"]

#     focus_res = supabase.table("weekly_focus") \
#         .select("id, mentor_id").eq("id", focus_id).execute()

#     if not focus_res.data:
#         raise HTTPException(404, "Focus week not found")

#     if focus_res.data[0]["mentor_id"] != str(user.id):
#         raise HTTPException(403, "Only the assigned mentor can edit this task")

#     update_data = {}
#     if body.title is not None:
#         update_data["title"] = body.title
#     if body.description is not None:
#         update_data["description"] = body.description
#     if body.category is not None:
#         update_data["category"] = body.category
#     if body.mentor_note is not None:
#         update_data["mentor_note"] = body.mentor_note

#     if not update_data:
#         raise HTTPException(400, "No valid fields to update")

#     result = supabase.table("weekly_tasks") \
#         .update(update_data).eq("id", task_id).execute()

#     return {"success": True, "task": result.data[0] if result.data else {}}


# @router.get("/weekly-focus/{focus_id}/review-preview")
# async def get_review_preview(focus_id: str, user=Depends(get_current_user)):
#     focus_res = supabase.table("weekly_focus") \
#         .select("*").eq("id", focus_id).execute()

#     if not focus_res.data:
#         raise HTTPException(404, "Focus week not found")

#     focus = focus_res.data[0]

#     if focus["mentor_id"] != str(user.id):
#         raise HTTPException(403, "Only the mentor can preview this review")

#     tasks_res = supabase.table("weekly_tasks") \
#         .select("*").eq("focus_id", focus_id).execute()

#     logs_res = supabase.table("daily_logs") \
#         .select("structured_title, structured_topics, structured_content, log_date") \
#         .eq("user_id", focus["mentee_id"]) \
#         .gte("log_date", focus["week_start"]) \
#         .lte("log_date", focus["week_end"]).execute()

#     result = await generate_review_preview(
#         focus=focus,
#         tasks=tasks_res.data or [],
#         logs=logs_res.data or []
#     )
#     return result


# @router.post("/weekly-focus/{focus_id}/send-review")
# async def send_weekly_review(focus_id: str, user=Depends(get_current_user)):
#     focus = supabase.table("weekly_focus") \
#         .select("*").eq("id", focus_id).execute()

#     if not focus.data:
#         raise HTTPException(404, "Focus not found")

#     focus_data = focus.data[0]

#     if str(user.id) not in [focus_data["mentor_id"], focus_data["mentee_id"]]:
#         raise HTTPException(403, "Not authorised")

#     tasks = supabase.table("weekly_tasks") \
#         .select("*").eq("focus_id", focus_id).execute()
#     task_list = tasks.data or []

#     mentee_name = get_profile_name(focus_data["mentee_id"], fallback="Mentee")
#     mentor_name = get_profile_name(focus_data["mentor_id"], fallback="Mentor")

#     review_text = await generate_weekly_review(
#         mentee_name=mentee_name,
#         tasks=task_list,
#         week_start=focus_data["week_start"],
#         week_end=focus_data["week_end"],
#     )

#     total = len(task_list)
#     completed = sum(1 for t in task_list if t.get("completed"))
#     completion_rate = round((completed / total * 100) if total > 0 else 0)
#     incomplete = [t for t in task_list if not t.get("completed")]

#     bar_color = (
#         "#059669" if completion_rate >= 80
#         else "#D97706" if completion_rate >= 50
#         else "#DC2626"
#     )

#     completed_html = "".join([
#         f'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F0EEF8;">'
#         f'<span style="color:#059669;font-size:16px;">✅</span>'
#         f'<span style="font-size:14px;color:#444;">{t["title"]}</span>'
#         f'<span style="margin-left:auto;font-size:11px;background:#EDE9FE;color:#7C3AED;padding:2px 8px;border-radius:20px;">{t.get("category","")}</span>'
#         f'</div>'
#         for t in task_list if t.get("completed")
#     ]) or '<p style="color:#aaa;font-size:13px;">None completed</p>'

#     incomplete_html = "".join([
#         f'<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #F0EEF8;">'
#         f'<span style="color:#DC2626;font-size:16px;">⬜</span>'
#         f'<span style="font-size:14px;color:#444;">{t["title"]}</span>'
#         f'<span style="margin-left:auto;font-size:11px;background:#EDE9FE;color:#7C3AED;padding:2px 8px;border-radius:20px;">{t.get("category","")}</span>'
#         f'</div>'
#         for t in incomplete
#     ]) or '<p style="color:#aaa;font-size:13px;">All tasks completed! 🎉</p>'

#     html = f"""<!DOCTYPE html>
# <html>
# <head>
# <meta charset="utf-8">
# <link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&display=swap" rel="stylesheet">
# </head>
# <body style="margin:0;padding:0;background:#F5F4FF;font-family:Urbanist,Arial,sans-serif;">
#   <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(124,58,237,0.08);">
#     <div style="background:#0A0A0F;padding:28px 36px;">
#       <div style="font-size:22px;font-weight:800;color:#fff;">Trackm<span style="color:#7C3AED;">e</span></div>
#       <div style="color:#555;font-size:11px;margin-top:4px;letter-spacing:4px;">S / Y A N</div>
#     </div>
#     <div style="padding:36px 40px;">
#       <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:8px;">Weekly Review</div>
#       <h1 style="font-size:20px;font-weight:800;color:#0D0D0D;margin:0 0 4px;letter-spacing:-0.3px;">{mentee_name}'s Week</h1>
#       <p style="color:#aaa;font-size:13px;margin:0 0 28px;">{focus_data['week_start']} → {focus_data['week_end']}</p>
#       <div style="background:#F8F6FF;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
#         <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
#           <span style="font-weight:700;font-size:15px;color:#0D0D0D;">{completed}/{total} tasks completed</span>
#           <span style="font-size:22px;font-weight:900;color:{bar_color};">{completion_rate}%</span>
#         </div>
#         <div style="height:8px;background:#E8E5FF;border-radius:4px;overflow:hidden;">
#           <div style="height:100%;width:{completion_rate}%;background:{bar_color};border-radius:4px;"></div>
#         </div>
#       </div>
#       <div style="background:#F8F6FF;border-left:3px solid #7C3AED;padding:16px 20px;border-radius:0 10px 10px 0;margin-bottom:28px;">
#         <div style="font-size:11px;letter-spacing:2px;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:8px;">Mentor's AI Assessment</div>
#         <p style="font-size:14px;color:#444;line-height:1.7;margin:0;">{review_text}</p>
#       </div>
#       <div style="margin-bottom:24px;">
#         <div style="font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">✅ Completed</div>
#         {completed_html}
#       </div>
#       <div style="margin-bottom:28px;">
#         <div style="font-size:12px;font-weight:700;color:#DC2626;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">⬜ Carrying Over</div>
#         {incomplete_html}
#       </div>
#       <hr style="border:none;border-top:1px solid #F0EEF8;margin:0 0 18px;">
#       <p style="color:#ccc;font-size:11px;text-align:center;margin:0;">Powered by Dôti · S / Y A N</p>
#     </div>
#   </div>
# </body>
# </html>"""

#     try:
#         from services.brevo_service import send_email

#         mentee_email = get_user_email(focus_data["mentee_id"])
#         mentor_email = get_user_email(focus_data["mentor_id"])

#         print(f"[SEND REVIEW] mentee_email={mentee_email} mentor_email={mentor_email}")

#         subject = f"📊 Weekly Review: {mentee_name} completed {completion_rate}% this week"

#         if mentee_email:
#             await send_email(mentee_email, subject, html)
#             print(f"[SEND REVIEW] ✅ Sent to mentee {mentee_email}")
#         if mentor_email and mentor_email != mentee_email:
#             await send_email(mentor_email, subject, html)
#             print(f"[SEND REVIEW] ✅ Sent to mentor {mentor_email}")

#     except Exception as e:
#         raise HTTPException(500, f"Failed to send review emails: {str(e)}")

#     return {"success": True, "completion_rate": completion_rate}

# class UpdateFocusSummaryRequest(BaseModel):
#     summary: str

# @router.patch("/weekly-focus/{focus_id}/summary")
# async def update_focus_summary(
#     focus_id: str,
#     body: UpdateFocusSummaryRequest,
#     user=Depends(get_current_user)
# ):
#     focus_res = supabase.table("weekly_focus") \
#         .select("id, mentor_id").eq("id", focus_id).execute()

#     if not focus_res.data:
#         raise HTTPException(404, "Focus not found")

#     if focus_res.data[0]["mentor_id"] != str(user.id):
#         raise HTTPException(403, "Only the mentor can edit this focus")

#     result = supabase.table("weekly_focus") \
#         .update({"edited_summary": body.summary}) \
#         .eq("id", focus_id).execute()

#     return {"success": True, "focus": result.data[0] if result.data else {}}

# class RoadmapUnit(BaseModel):
#     unit_number: int
#     title: str
#     goal: str = ""
#     tasks: list = []
#     resources: str = ""
#     links: str = ""

# class SaveRoadmapRequest(BaseModel):
#     title: str
#     duration_type: str  # 'daily' | 'weekly'
#     total_units: int
#     units: list[RoadmapUnit]

# @router.post("/roadmap/save/{mentee_id}")
# async def save_roadmap(
#     mentee_id: str,
#     body: SaveRoadmapRequest,
#     user=Depends(get_current_user)
# ):
#     mentor_id = str(user.id)

#     rel = supabase.table("mentor_relationships") \
#         .select("id").eq("mentor_id", mentor_id) \
#         .eq("mentee_id", mentee_id).eq("status", "active").execute()
#     if not rel.data:
#         raise HTTPException(403, "You are not this mentee's mentor")

#     existing = supabase.table("roadmaps") \
#         .select("id").eq("mentor_id", mentor_id) \
#         .eq("mentee_id", mentee_id).execute()
#     if existing.data:
#         raise HTTPException(400, "A roadmap already exists. Delete it first.")

#     roadmap_res = supabase.table("roadmaps").insert({
#         "mentor_id": mentor_id,
#         "mentee_id": mentee_id,
#         "title": body.title,
#         "duration_type": body.duration_type,
#         "total_units": body.total_units,
#         "start_date": str(date.today()),
#         "status": "active",
#     }).execute()

#     if not roadmap_res.data:
#         raise HTTPException(500, "Failed to save roadmap")

#     roadmap_id = roadmap_res.data[0]["id"]

#     for unit in body.units:
#         unit_res = supabase.table("roadmap_units").insert({
#             "roadmap_id": roadmap_id,
#             "unit_number": unit.unit_number,
#             "title": unit.title,
#             "goal": unit.goal,
#             "resources": unit.resources,
#             "links": unit.links,
#             "unlocked": unit.unit_number == 1,
#             "completed": False,
#         }).execute()

#         if unit_res.data and unit.tasks:
#             unit_id = unit_res.data[0]["id"]
#             supabase.table("roadmap_tasks").insert([
#                 {
#                     "unit_id": unit_id,
#                     "roadmap_id": roadmap_id,
#                     "title": t,
#                     "completed": False,
#                 }
#                 for t in unit.tasks if str(t).strip()
#             ]).execute()

#     await create_notification(
#         mentee_id,
#         "roadmap_uploaded",
#         "🗺️ Your Learning Roadmap is Ready",
#         f"Your mentor uploaded your roadmap: \"{body.title}\". Check your Guide tab.",
#         {"roadmap_id": roadmap_id}
#     )

#     return {
#         "success": True,
#         "roadmap_id": roadmap_id,
#         "title": body.title,
#         "total_units": body.total_units,
#     }

