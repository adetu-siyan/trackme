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
)

router = APIRouter(prefix="/projects", tags=["projects"])


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


# ============================================================
# PROJECT ROUTES
# ============================================================

@router.post("/create")
async def create_project(
    title: str = Form(...),
    description: str = Form(None),
    deadline: str = Form(None),
    project_type: str = Form("tech"),
    objectives: str = Form(None),  # JSON string
    deliverables: str = Form(None),  # JSON string
    requirements: str = Form(None),  # JSON string
    tech_stack: str = Form(None),  # JSON string
    resources: str = Form(None),  # JSON string
    submission_channel: str = Form(None),
    submission_notes: str = Form(None),
    mentee_ids: str = Form(None),  # JSON array of mentee IDs
    files: List[UploadFile] = File(None),
    user=Depends(get_current_user)
):
    creator_id = str(user.id)
    mentor_name = user.full_name or "Mentor"

    # Parse JSON strings back to lists
    import json as json_module
    
    mentee_list = []
    if mentee_ids:
        try:
            mentee_list = json_module.loads(mentee_ids)
        except:
            pass
    
    objectives_list = []
    if objectives:
        try:
            objectives_list = json_module.loads(objectives)
        except:
            pass
    
    deliverables_list = []
    if deliverables:
        try:
            deliverables_list = json_module.loads(deliverables)
        except:
            pass
    
    requirements_list = []
    if requirements:
        try:
            requirements_list = json_module.loads(requirements)
        except:
            pass
    
    tech_stack_list = []
    if tech_stack:
        try:
            tech_stack_list = json_module.loads(tech_stack)
        except:
            pass
    
    resources_list = []
    if resources:
        try:
            resources_list = json_module.loads(resources)
        except:
            pass

    # Verify all mentees belong to this mentor
    if mentee_list:
        for mentee_id in mentee_list:
            rel = supabase.table("mentor_relationships") \
                .select("id").eq("mentor_id", creator_id) \
                .eq("mentee_id", mentee_id).eq("status", "active").execute()
            if not rel.data:
                raise HTTPException(403, f"Mentee {mentee_id} is not your active mentee")

    # Restructure description with AI if provided
    structured_description = description or ""
    if description and len(description.strip()) > 10:
        try:
            structured_description = await restructure_project_description(
                title, description
            )
        except Exception as e:
            print(f"[AI RESTRUCTURE] Failed: {e}")
            structured_description = description

    # Handle file uploads
    uploaded_files = []
    if files:
        for file in files:
            try:
                content = await file.read()
                file_path = f"project-files/{creator_id}/{datetime.utcnow().timestamp()}_{file.filename}"
                
                # Upload to Supabase Storage
                storage_result = supabase.storage \
                    .from_("project-assets") \
                    .upload(file_path, content, {
                        "content-type": file.content_type or "application/octet-stream"
                    })
                
                # Get public URL
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
                # Continue with other files even if one fails

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

    # Assign mentees and send notifications
    if mentee_list:
        assignments = [
            {"project_id": project_id, "mentee_id": mid, "assigned_by": creator_id}
            for mid in mentee_list
        ]
        supabase.table("project_assignments").insert(assignments).execute()

        # Get mentee emails and send notifications
        try:
            all_users = supabase.auth.admin.list_users()
            
            for mentee_id in mentee_list:
                # Create in-app notification
                await create_notification(
                    mentee_id, "project_assigned",
                    "📋 New Project Assigned",
                    f"You've been assigned to: \"{title}\"",
                    {"project_id": project_id}
                )
                
                # Send email notification
                mentee_email = None
                for u in all_users:
                    if str(u.id) == mentee_id:
                        mentee_email = u.email
                        break
                
                if mentee_email:
                    # Get mentee name
                    mentee_profile = supabase.table("profiles") \
                        .select("full_name").eq("id", mentee_id).execute()
                    mentee_name = mentee_profile.data[0]["full_name"] if mentee_profile.data else "there"
                    
                    await send_project_assigned_email(
                        mentee_email=mentee_email,
                        mentee_name=mentee_name,
                        mentor_name=mentor_name,
                        project_title=title,
                        project_id=project_id,
                    )
        except Exception as e:
            print(f"[PROJECT NOTIFICATIONS] Error: {e}")
            # Don't fail the whole request if notifications fail

    return {
        "success": True,
        "project": project,
        "assigned_mentees": len(mentee_list),
        "files_uploaded": len(uploaded_files)
    }


@router.get("/available-mentees")
async def get_available_mentees(user=Depends(get_current_user)):
    """Get list of active mentees that can be assigned to projects"""
    mentor_id = str(user.id)
    
    relationships = supabase.table("mentor_relationships") \
        .select("mentee_id, profiles!mentor_relationships_mentee_id_fkey(id, full_name, username, field_of_study, avatar_url)") \
        .eq("mentor_id", mentor_id) \
        .eq("status", "active") \
        .execute()
    
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


# NOTE: /end/{project_id} is intentionally structured this way to avoid
# collision with /{project_id}/completion — FastAPI matches top to bottom
@router.patch("/end/{project_id}")
async def end_project(
    project_id: str,
    user=Depends(get_current_user)
):
    project_res = supabase.table("projects") \
        .select("id, creator_id") \
        .eq("id", project_id) \
        .execute()

    if not project_res.data:
        raise HTTPException(status_code=404, detail="Project not found")

    if project_res.data[0]["creator_id"] != str(user.id):
        raise HTTPException(status_code=403, detail="Only the project creator can end this project")

    result = supabase.table("projects") \
        .update({"status": "completed"}) \
        .eq("id", project_id) \
        .execute()

    return {"success": True, "project": result.data[0] if result.data else {}}


@router.get("/{project_id}/completion")
async def get_project_completion(
    project_id: str,
    user=Depends(get_current_user)
):
    project = supabase.table("projects") \
        .select("*") \
        .eq("id", project_id) \
        .execute()

    if not project.data:
        raise HTTPException(404, "Project not found")

    p = project.data[0]

    is_creator = p["creator_id"] == str(user.id)
    is_member = supabase.table("project_assignments") \
        .select("id") \
        .eq("project_id", project_id) \
        .eq("mentee_id", str(user.id)) \
        .execute()

    if not is_creator and not is_member.data:
        raise HTTPException(403, "Not authorised")

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
# WEEKLY FOCUS — all specific paths before /{focus_id}/...
# ============================================================

@router.post("/weekly-focus/create")
async def create_weekly_focus(
    body: CreateWeeklyFocusRequest,
    user=Depends(get_current_user)
):
    mentor_id = str(user.id)
    mentor_name = user.full_name or "Your Mentor"

    rel = supabase.table("mentor_relationships") \
        .select("id").eq("mentor_id", mentor_id) \
        .eq("mentee_id", body.mentee_id).eq("status", "active").execute()

    if not rel.data:
        raise HTTPException(403, "You are not this mentee's mentor")

    today = date.today()
    if body.week_start:
        week_start = date.fromisoformat(body.week_start)
    else:
        week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)

    profile = supabase.table("profiles") \
        .select("full_name").eq("id", body.mentee_id).execute()
    mentee_name = profile.data[0]["full_name"] if profile.data else "Mentee"

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

    # Create in-app notification
    await create_notification(
        body.mentee_id,
        "project_assigned",
        "📅 New Weekly Focus Set",
        f"Your mentor set your focus for the week of {week_start.strftime('%b %d')}: {ai_result.get('summary', '')}",
        {"focus_id": focus_id}
    )

    # Send email notification to mentee
    try:
        all_users = supabase.auth.admin.list_users()
        mentee_email = None
        
        for u in all_users:
            if str(u.id) == body.mentee_id:
                mentee_email = u.email
                break
        
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
        print(f"[WEEKLY FOCUS EMAIL] Failed to send: {e}")

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


@router.get("/weekly-focus/my-tasks")
async def get_my_weekly_tasks(user=Depends(get_current_user)):
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


@router.get("/weekly-focus/mentee/{mentee_id}")
async def get_mentee_weekly_focus(
    mentee_id: str,
    user=Depends(get_current_user)
):
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


@router.patch("/weekly-tasks/{task_id}")
async def update_task(
    task_id: str,
    body: UpdateTaskRequest,
    user=Depends(get_current_user)
):
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


@router.patch("/weekly-tasks/{task_id}/content")
async def update_task_content(
    task_id: str,
    body: UpdateTaskContentRequest,
    user=Depends(get_current_user)
):
    # Step 1: get the task and its focus_id
    task_res = supabase.table("weekly_tasks") \
        .select("id, focus_id") \
        .eq("id", task_id) \
        .execute()

    if not task_res.data:
        raise HTTPException(status_code=404, detail="Task not found")

    focus_id = task_res.data[0]["focus_id"]

    # Step 2: get the focus and verify this user is the mentor
    focus_res = supabase.table("weekly_focus") \
        .select("id, mentor_id") \
        .eq("id", focus_id) \
        .execute()

    if not focus_res.data:
        raise HTTPException(status_code=404, detail="Focus week not found")

    if focus_res.data[0]["mentor_id"] != str(user.id):
        raise HTTPException(status_code=403, detail="Only the assigned mentor can edit this task")

    update_data = {}
    if body.title is not None:
        update_data["title"] = body.title
    if body.description is not None:
        update_data["description"] = body.description
    if body.category is not None:
        update_data["category"] = body.category

    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")

    result = supabase.table("weekly_tasks") \
        .update(update_data) \
        .eq("id", task_id) \
        .execute()

    return {"success": True, "task": result.data[0] if result.data else {}}


@router.get("/weekly-focus/{focus_id}/review-preview")
async def get_review_preview(
    focus_id: str,
    user=Depends(get_current_user)
):
    focus_res = supabase.table("weekly_focus") \
        .select("*") \
        .eq("id", focus_id) \
        .execute()

    if not focus_res.data:
        raise HTTPException(status_code=404, detail="Focus week not found")

    focus = focus_res.data[0]

    if focus["mentor_id"] != str(user.id):
        raise HTTPException(status_code=403, detail="Only the mentor can preview this review")

    tasks_res = supabase.table("weekly_tasks") \
        .select("*") \
        .eq("focus_id", focus_id) \
        .execute()
    tasks = tasks_res.data or []

    logs_res = supabase.table("daily_logs") \
        .select("structured_title, structured_topics, structured_content, log_date") \
        .eq("user_id", focus["mentee_id"]) \
        .gte("log_date", focus["week_start"]) \
        .lte("log_date", focus["week_end"]) \
        .execute()
    logs = logs_res.data or []

    result = await generate_review_preview(focus=focus, tasks=tasks, logs=logs)
    return result


class SendReviewRequest(BaseModel):
    summary: Optional[str] = None
    progress: Optional[str] = None
    recommendations: Optional[str] = None
    next_week_focus: Optional[str] = None
    week_label: Optional[str] = None
    

@router.post("/weekly-focus/{focus_id}/send-review")
async def send_weekly_review(
    focus_id: str,
    user=Depends(get_current_user)
):
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

    mentee_profile = supabase.table("profiles") \
        .select("full_name").eq("id", focus_data["mentee_id"]).execute()
    mentee_name = mentee_profile.data[0]["full_name"] if mentee_profile.data else "Mentee"

    mentor_profile = supabase.table("profiles") \
        .select("full_name").eq("id", focus_data["mentor_id"]).execute()
    mentor_name = mentor_profile.data[0]["full_name"] if mentor_profile.data else "Mentor"

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

    bar_color = "#059669" if completion_rate >= 80 else "#D97706" if completion_rate >= 50 else "#DC2626"

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

    # Send the review email
    try:
        from services.brevo_service import send_email
        
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
            await send_email(mentee_email, subject, html)
        if mentor_email and mentor_email != mentee_email:
            await send_email(mentor_email, subject, html)

    except Exception as e:
        raise HTTPException(500, f"Failed to send review emails: {str(e)}")

    return {"success": True, "completion_rate": completion_rate}


# import json
# from datetime import date, timedelta, datetime
# from fastapi import APIRouter, Depends, HTTPException
# from pydantic import BaseModel
# from typing import Optional
# from models import CreateProjectRequest
# from dependencies import get_current_user
# from services.supabase_service import supabase, create_notification
# from services.brevo_service import send_signed_notification_to_mentee
# from services.groq_service import (
#     generate_weekly_tasks,
#     generate_weekly_review,
#     generate_review_preview,
#     restructure_project_description,
#     estimate_project_completion,
# )

# router = APIRouter(prefix="/projects", tags=["projects"])


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


# # ============================================================
# # PROJECT ROUTES
# # ============================================================

# @router.post("/create")
# async def create_project(body: CreateProjectRequest, user=Depends(get_current_user)):
#     creator_id = str(user.id)

#     structured_description = body.description or ""
#     if body.description and len(body.description.strip()) > 10:
#         try:
#             structured_description = await restructure_project_description(
#                 body.title, body.description
#             )
#         except Exception:
#             structured_description = body.description

#     project_data = {
#     "creator_id": creator_id,
#     "title": body.title,
#     "description": structured_description,
#     "deadline": str(body.deadline) if body.deadline else None,
#     "project_type": body.project_type or "tech",
#     "objectives": body.objectives,
#     "deliverables": body.deliverables,
#     "requirements": body.requirements,
#     "tech_stack": body.tech_stack,
#     "resources": body.resources,
#     "submission_channel": body.submission_channel,
#     "submission_notes": body.submission_notes,
# }

#     result = supabase.table("projects").insert(project_data).execute()
#     if not result.data:
#         raise HTTPException(500, "Failed to create project")

#     project = result.data[0]
#     project_id = project["id"]

#     if body.mentee_ids:
#         assignments = [
#             {"project_id": project_id, "mentee_id": mid, "assigned_by": creator_id}
#             for mid in body.mentee_ids
#         ]
#         supabase.table("project_assignments").insert(assignments).execute()

#         for mentee_id in body.mentee_ids:
#             await create_notification(
#                 mentee_id, "project_assigned",
#                 "📋 New Project Assigned",
#                 f"You've been assigned to: \"{body.title}\"",
#                 {"project_id": project_id}
#             )

#     return {"success": True, "project": project}


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


# # NOTE: /end/{project_id} is intentionally structured this way to avoid
# # collision with /{project_id}/completion — FastAPI matches top to bottom
# @router.patch("/end/{project_id}")
# async def end_project(
#     project_id: str,
#     user=Depends(get_current_user)
# ):
#     project_res = supabase.table("projects") \
#         .select("id, creator_id") \
#         .eq("id", project_id) \
#         .execute()

#     if not project_res.data:
#         raise HTTPException(status_code=404, detail="Project not found")

#     if project_res.data[0]["creator_id"] != str(user.id):
#         raise HTTPException(status_code=403, detail="Only the project creator can end this project")

#     result = supabase.table("projects") \
#         .update({"status": "completed"}) \
#         .eq("id", project_id) \
#         .execute()

#     return {"success": True, "project": result.data[0] if result.data else {}}


# @router.get("/{project_id}/completion")
# async def get_project_completion(
#     project_id: str,
#     user=Depends(get_current_user)
# ):
#     project = supabase.table("projects") \
#         .select("*") \
#         .eq("id", project_id) \
#         .execute()

#     if not project.data:
#         raise HTTPException(404, "Project not found")

#     p = project.data[0]

#     is_creator = p["creator_id"] == str(user.id)
#     is_member = supabase.table("project_assignments") \
#         .select("id") \
#         .eq("project_id", project_id) \
#         .eq("mentee_id", str(user.id)) \
#         .execute()

#     if not is_creator and not is_member.data:
#         raise HTTPException(403, "Not authorised")

#     logs = supabase.table("daily_logs") \
#         .select("structured_title, structured_topics, structured_content, log_date") \
#         .eq("project_id", project_id) \
#         .order("log_date", desc=False) \
#         .execute()

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
# # WEEKLY FOCUS — all specific paths before /{focus_id}/...
# # ============================================================

# @router.post("/weekly-focus/create")
# async def create_weekly_focus(
#     body: CreateWeeklyFocusRequest,
#     user=Depends(get_current_user)
# ):
#     mentor_id = str(user.id)

#     rel = supabase.table("mentor_relationships") \
#         .select("id").eq("mentor_id", mentor_id) \
#         .eq("mentee_id", body.mentee_id).eq("status", "active").execute()

#     if not rel.data:
#         raise HTTPException(403, "You are not this mentee's mentor")

#     today = date.today()
#     if body.week_start:
#         week_start = date.fromisoformat(body.week_start)
#     else:
#         week_start = today - timedelta(days=today.weekday())
#     week_end = week_start + timedelta(days=6)

#     profile = supabase.table("profiles") \
#         .select("full_name").eq("id", body.mentee_id).execute()
#     mentee_name = profile.data[0]["full_name"] if profile.data else "Mentee"

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

#     tasks_to_insert = []
#     for task in ai_result.get("tasks", []):
#         tasks_to_insert.append({
#             "focus_id": focus_id,
#             "mentee_id": body.mentee_id,
#             "title": task.get("title", ""),
#             "description": task.get("description", ""),
#             "category": task.get("category", "General"),
#             "suggested_time": task.get("suggested_time", ""),
#             "priority": task.get("priority", 3),
#             "carried_over": task.get("carried_over", False),
#             "completed": False,
#         })

#     if tasks_to_insert:
#         supabase.table("weekly_tasks").insert(tasks_to_insert).execute()

#     await create_notification(
#         body.mentee_id,
#         "project_assigned",
#         "📅 New Weekly Focus Set",
#         f"Your mentor set your focus for the week of {week_start.strftime('%b %d')}: {ai_result.get('summary', '')}",
#     )

#     return {
#         "success": True,
#         "focus_id": focus_id,
#         "summary": ai_result.get("summary"),
#         "week_start": str(week_start),
#         "week_end": str(week_end),
#         "task_count": len(tasks_to_insert),
#         "carried_over_count": sum(1 for t in tasks_to_insert if t["carried_over"]),
#     }
    
    


# @router.get("/weekly-focus/history")
# async def get_focus_history(user=Depends(get_current_user)):
#     focus_list = supabase.table("weekly_focus") \
#         .select("*") \
#         .eq("mentee_id", str(user.id)) \
#         .order("week_start", desc=True) \
#         .execute()

#     result = []
#     for focus in (focus_list.data or []):
#         tasks = supabase.table("weekly_tasks") \
#             .select("id, title, completed, carried_over, category, priority") \
#             .eq("focus_id", focus["id"]) \
#             .execute()

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
#     week_start = today - timedelta(days=today.weekday())

#     focus = supabase.table("weekly_focus") \
#         .select("*") \
#         .eq("mentee_id", str(user.id)) \
#         .eq("week_start", str(week_start)) \
#         .execute()

#     if not focus.data:
#         return {"focus": None, "tasks": [], "stats": None}

#     focus_data = focus.data[0]
#     tasks = supabase.table("weekly_tasks") \
#         .select("*") \
#         .eq("focus_id", focus_data["id"]) \
#         .order("carried_over", desc=True) \
#         .order("priority") \
#         .execute()

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
# async def get_mentee_weekly_focus(
#     mentee_id: str,
#     user=Depends(get_current_user)
# ):
#     today = date.today()
#     week_start = today - timedelta(days=today.weekday())

#     focus = supabase.table("weekly_focus") \
#         .select("*") \
#         .eq("mentor_id", str(user.id)) \
#         .eq("mentee_id", mentee_id) \
#         .eq("week_start", str(week_start)) \
#         .execute()

#     if not focus.data:
#         return {"focus": None, "tasks": []}

#     focus_data = focus.data[0]
#     tasks = supabase.table("weekly_tasks") \
#         .select("*") \
#         .eq("focus_id", focus_data["id"]) \
#         .order("priority").execute()

#     return {"focus": focus_data, "tasks": tasks.data or []}


# @router.patch("/weekly-tasks/{task_id}")
# async def update_task(
#     task_id: str,
#     body: UpdateTaskRequest,
#     user=Depends(get_current_user)
# ):
#     update_data = {"completed": body.completed}
#     if body.completed:
#         update_data["completed_at"] = datetime.utcnow().isoformat()
#     else:
#         update_data["completed_at"] = None

#     result = supabase.table("weekly_tasks") \
#         .update(update_data) \
#         .eq("id", task_id) \
#         .eq("mentee_id", str(user.id)) \
#         .execute()

#     if not result.data:
#         raise HTTPException(404, "Task not found or not yours")

#     return {"success": True, "completed": body.completed}


# @router.patch("/weekly-tasks/{task_id}/content")
# async def update_task_content(
#     task_id: str,
#     body: UpdateTaskContentRequest,
#     user=Depends(get_current_user)
# ):
#     # Step 1: get the task and its focus_id
#     task_res = supabase.table("weekly_tasks") \
#         .select("id, focus_id") \
#         .eq("id", task_id) \
#         .execute()

#     if not task_res.data:
#         raise HTTPException(status_code=404, detail="Task not found")

#     focus_id = task_res.data[0]["focus_id"]

#     # Step 2: get the focus and verify this user is the mentor
#     focus_res = supabase.table("weekly_focus") \
#         .select("id, mentor_id") \
#         .eq("id", focus_id) \
#         .execute()

#     if not focus_res.data:
#         raise HTTPException(status_code=404, detail="Focus week not found")

#     if focus_res.data[0]["mentor_id"] != str(user.id):
#         raise HTTPException(status_code=403, detail="Only the assigned mentor can edit this task")

#     update_data = {}
#     if body.title is not None:
#         update_data["title"] = body.title
#     if body.description is not None:
#         update_data["description"] = body.description
#     if body.category is not None:
#         update_data["category"] = body.category

#     if not update_data:
#         raise HTTPException(status_code=400, detail="No valid fields to update")

#     result = supabase.table("weekly_tasks") \
#         .update(update_data) \
#         .eq("id", task_id) \
#         .execute()

#     return {"success": True, "task": result.data[0] if result.data else {}}


# @router.get("/weekly-focus/{focus_id}/review-preview")
# async def get_review_preview(
#     focus_id: str,
#     user=Depends(get_current_user)
# ):
#     focus_res = supabase.table("weekly_focus") \
#         .select("*") \
#         .eq("id", focus_id) \
#         .execute()

#     if not focus_res.data:
#         raise HTTPException(status_code=404, detail="Focus week not found")

#     focus = focus_res.data[0]

#     if focus["mentor_id"] != str(user.id):
#         raise HTTPException(status_code=403, detail="Only the mentor can preview this review")

#     tasks_res = supabase.table("weekly_tasks") \
#         .select("*") \
#         .eq("focus_id", focus_id) \
#         .execute()
#     tasks = tasks_res.data or []

#     logs_res = supabase.table("daily_logs") \
#         .select("structured_title, structured_topics, structured_content, log_date") \
#         .eq("user_id", focus["mentee_id"]) \
#         .gte("log_date", focus["week_start"]) \
#         .lte("log_date", focus["week_end"]) \
#         .execute()
#     logs = logs_res.data or []

#     result = await generate_review_preview(focus=focus, tasks=tasks, logs=logs)
#     return result


# class SendReviewRequest(BaseModel):
#     summary: Optional[str] = None
#     progress: Optional[str] = None
#     recommendations: Optional[str] = None
#     next_week_focus: Optional[str] = None
#     week_label: Optional[str] = None
    
# @router.post("/weekly-focus/{focus_id}/send-review")
# async def send_weekly_review(
#     focus_id: str,
#     user=Depends(get_current_user)
# ):
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

#     mentee_profile = supabase.table("profiles") \
#         .select("full_name").eq("id", focus_data["mentee_id"]).execute()
#     mentee_name = mentee_profile.data[0]["full_name"] if mentee_profile.data else "Mentee"

#     mentor_profile = supabase.table("profiles") \
#         .select("full_name").eq("id", focus_data["mentor_id"]).execute()
#     mentor_name = mentor_profile.data[0]["full_name"] if mentor_profile.data else "Mentor"

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

#     bar_color = "#059669" if completion_rate >= 80 else "#D97706" if completion_rate >= 50 else "#DC2626"

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
#         all_users = supabase.auth.admin.list_users()
#         mentee_email = None
#         mentor_email = None
#         for u in all_users:
#             if str(u.id) == focus_data["mentee_id"]:
#                 mentee_email = u.email
#             if str(u.id) == focus_data["mentor_id"]:
#                 mentor_email = u.email

#         subject = f"📊 Weekly Review: {mentee_name} completed {completion_rate}% this week"

#         if mentee_email:
#             send_email(mentee_email, subject, html)
#         if mentor_email and mentor_email != mentee_email:
#             send_email(mentor_email, subject, html)

#     except Exception as e:
#         raise HTTPException(500, f"Failed to send review emails: {str(e)}")

#     return {"success": True, "completion_rate": completion_rate}