# import secrets
# from datetime import date, datetime
# from fastapi import APIRouter, Depends, HTTPException, Request
# from models import (
#     CreateLogRequest, DifficultyRequest,
#     VerifyAnswerRequest, EditLogRequest, SendToMentorRequest
# )
# from dependencies import get_current_user
# from services.supabase_service import supabase, update_streak, create_notification
# from services.groq_service import (
#     restructure_log, generate_verification_question,
#     evaluate_answer, detect_difficulty, summarise_mentee_logs
# )
# from services.resend_service import send_log_to_mentor
# from slowapi import Limiter
# from slowapi.util import get_remote_address

# limiter = Limiter(key_func=get_remote_address)

# router = APIRouter(prefix="/logs", tags=["logs"])


# @router.post("/create")
# @limiter.limit("10/minute")
# async def create_log(request: Request, body: CreateLogRequest, user=Depends(get_current_user)):
#     user_id = str(user.id)
#     today = str(date.today())

#     existing = supabase.table("daily_logs") \
#         .select("id").eq("user_id", user_id).eq("log_date", today).execute()

#     if existing.data:
#         raise HTTPException(400, "You've already submitted a log today. Come back tomorrow!")

#     structured = await restructure_log(body.raw_content)

#     log_data = {
#         "user_id": user_id,
#         "raw_content": body.raw_content,
#         "structured_title": structured.get("title"),
#         "structured_topics": structured.get("topics", []),
#         "structured_content": structured.get("structured_content"),
#         "log_date": today,
#         "mentor_id": body.mentor_id,
#     }

#     result = supabase.table("daily_logs").insert(log_data).execute()
#     if not result.data:
#         raise HTTPException(500, "Failed to save log")

#     log = result.data[0]
#     await update_streak(user_id, today)

#     return {
#         "success": True,
#         "log_id": log["id"],
#         "structured_title": log["structured_title"],
#         "structured_topics": log["structured_topics"],
#         "structured_content": log["structured_content"],
#     }


# @router.post("/generate-question")
# @limiter.limit("20/minute")
# async def generate_question(request: Request, body: DifficultyRequest, user=Depends(get_current_user)):
#     log = supabase.table("daily_logs") \
#         .select("*").eq("id", body.log_id).eq("user_id", str(user.id)).execute()

#     if not log.data:
#         raise HTTPException(404, "Log not found")

#     log_data = log.data[0]

#     if not body.difficulty or body.difficulty == 'auto':
#         difficulty = await detect_difficulty(log_data["structured_content"])
#     else:
#         difficulty = body.difficulty

#     qa = await generate_verification_question(log_data["structured_content"], difficulty)

#     supabase.table("daily_logs").update({
#         "difficulty_level": difficulty,
#         "verification_question": qa["question"],
#         "correct_answer": qa["correct_answer"],
#         "test_attempted": True,
#     }).eq("id", body.log_id).execute()

#     return {
#         "success": True,
#         "question": qa["question"],
#         "difficulty": difficulty,
#     }


# @router.post("/verify-answer")
# async def verify_answer(body: VerifyAnswerRequest, user=Depends(get_current_user)):
#     log = supabase.table("daily_logs") \
#         .select("*").eq("id", body.log_id).eq("user_id", str(user.id)).execute()

#     if not log.data:
#         raise HTTPException(404, "Log not found")

#     log_data = log.data[0]

#     if not log_data.get("verification_question"):
#         raise HTTPException(400, "No question generated yet")

#     result = await evaluate_answer(
#         question=log_data["verification_question"],
#         correct_answer=log_data["correct_answer"],
#         user_answer=body.answer,
#         difficulty=log_data["difficulty_level"]
#     )

#     supabase.table("daily_logs").update({
#         "test_passed": result["passed"]
#     }).eq("id", body.log_id).execute()

#     if result["passed"]:
#         await create_notification(
#             str(user.id), "test_passed",
#             "✅ Test Passed!",
#             f"You passed the {log_data['difficulty_level']} verification for today's log."
#         )

#     return result


# @router.put("/edit")
# async def edit_log(body: EditLogRequest, user=Depends(get_current_user)):
#     supabase.table("daily_logs").update({
#         "structured_content": body.structured_content,
#         "structured_title": body.structured_title,
#         "structured_topics": body.structured_topics,
#     }).eq("id", body.log_id).eq("user_id", str(user.id)).execute()

#     return {"success": True}


# @router.post("/send-to-mentor")
# @limiter.limit("10/minute")
# async def send_to_mentor(request: Request, body: SendToMentorRequest, user=Depends(get_current_user)):
#     user_id = str(user.id)

#     log = supabase.table("daily_logs") \
#         .select("*").eq("id", body.log_id).eq("user_id", user_id).execute()

#     if not log.data:
#         raise HTTPException(404, "Log not found")

#     log_data = log.data[0]

#     if log_data.get("sent_to_mentor"):
#         raise HTTPException(400, "Log already sent to mentor")

#     active_mentor = supabase.table("mentor_relationships") \
#         .select("*, profiles!mentor_relationships_mentor_id_fkey(email, full_name)") \
#         .eq("mentee_id", user_id) \
#         .eq("status", "active") \
#         .execute()

#     mentor_name = body.mentor_email
#     mentor_validated = False

#     if active_mentor.data:
#         for rel in active_mentor.data:
#             mentor_email_on_record = rel.get("profiles", {}).get("email", "")
#             if mentor_email_on_record.lower() == body.mentor_email.lower():
#                 mentor_validated = True
#                 mentor_name = rel["profiles"].get("full_name") or body.mentor_email
#                 break

#     if not mentor_validated:
#         email_exists = supabase.table("profiles") \
#             .select("id, full_name") \
#             .eq("email", body.mentor_email) \
#             .execute()

#         if email_exists.data:
#             raise HTTPException(400, {
#                 "code": "not_your_mentor",
#                 "message": f"{body.mentor_email} is a Trackme user but is not your mentor. Add them as your mentor first.",
#                 "suggestion": "add_mentor"
#             })
#         else:
#             raise HTTPException(400, {
#                 "code": "not_registered",
#                 "message": f"{body.mentor_email} doesn't have a Trackme account yet.",
#                 "suggestion": "invite"
#             })

#     profile = supabase.table("profiles") \
#         .select("full_name").eq("id", user_id).execute()
#     mentee_name = profile.data[0]["full_name"] if profile.data else user.email

#     sign_token = secrets.token_urlsafe(32)

#     update_payload = {
#         "sent_to_mentor": True,
#         "sent_at": datetime.utcnow().isoformat(),
#         "mentor_sign_token": sign_token,
#     }

#     if body.project_id:
#         update_payload["project_id"] = body.project_id

#     supabase.table("daily_logs").update(update_payload).eq("id", body.log_id).execute()

#     await send_log_to_mentor(
#         mentor_email=body.mentor_email,
#         mentor_name=mentor_name,
#         mentee_name=mentee_name,
#         log_title=log_data["structured_title"],
#         log_content=log_data["structured_content"],
#         log_topics=log_data["structured_topics"] or [],
#         sign_token=sign_token,
#         log_id=body.log_id,
#     )

#     return {
#         "success": True,
#         "message": f"Log sent to {mentor_name}!",
#         "mentor_email": body.mentor_email
#     }


# @router.get("/my-logs")
# async def get_my_logs(user=Depends(get_current_user)):
#     result = supabase.table("daily_logs") \
#         .select("*").eq("user_id", str(user.id)) \
#         .order("created_at", desc=True).execute()
#     return {"logs": result.data}


# @router.get("/streak")
# async def get_streak(user=Depends(get_current_user)):
#     result = supabase.table("streaks").select("*").eq("user_id", str(user.id)).execute()
#     if not result.data:
#         return {"current_streak": 0, "longest_streak": 0}
#     return result.data[0]


# @router.get("/mentee/{mentee_id}")
# async def get_mentee_logs(mentee_id: str, user=Depends(get_current_user)):
#     mentor_id = str(user.id)

#     rel = supabase.table("mentor_relationships") \
#         .select("id") \
#         .eq("mentor_id", mentor_id) \
#         .eq("mentee_id", mentee_id) \
#         .eq("status", "active") \
#         .execute()

#     if not rel.data:
#         raise HTTPException(403, "You are not this mentee's mentor")

#     logs = supabase.table("daily_logs") \
#         .select("*") \
#         .eq("user_id", mentee_id) \
#         .order("created_at", desc=True) \
#         .execute()

#     return {"logs": logs.data or []}


# @router.get("/mentee/{mentee_id}/overview")
# async def get_mentee_overview(mentee_id: str, user=Depends(get_current_user)):
#     mentor_id = str(user.id)

#     rel = supabase.table("mentor_relationships") \
#         .select("id") \
#         .eq("mentor_id", mentor_id) \
#         .eq("mentee_id", mentee_id) \
#         .eq("status", "active") \
#         .execute()

#     if not rel.data:
#         raise HTTPException(403, "You are not this mentee's mentor")

#     profile = supabase.table("profiles").select("full_name").eq("id", mentee_id).execute()
#     mentee_name = profile.data[0]["full_name"] if profile.data else "Your mentee"

#     logs = supabase.table("daily_logs") \
#         .select("*") \
#         .eq("user_id", mentee_id) \
#         .order("created_at", desc=True) \
#         .execute()

#     log_list = logs.data or []

#     overview = await summarise_mentee_logs(log_list, mentee_name)

#     total = len(log_list)
#     signed = sum(1 for l in log_list if l.get("signed"))
#     sent = sum(1 for l in log_list if l.get("sent_to_mentor"))
#     passed = sum(1 for l in log_list if l.get("test_passed"))

#     hours = []
#     for l in log_list:
#         try:
#             dt = datetime.fromisoformat(l["created_at"].replace("Z", "+00:00"))
#             hours.append(dt.hour)
#         except Exception:
#             pass

#     most_active_hour = None
#     if hours:
#         most_active_hour = max(set(hours), key=hours.count)
#         h = most_active_hour
#         most_active_hour = f"{'12' if h == 0 else h if h <= 12 else h - 12}{'am' if h < 12 else 'pm'}"

#     return {
#         "mentee_name": mentee_name,
#         "stats": {
#             "total_logs": total,
#             "signed_logs": signed,
#             "sent_logs": sent,
#             "tests_passed": passed,
#             "sign_rate": round((signed / total * 100) if total > 0 else 0),
#             "most_active_time": most_active_hour or "Unknown",
#         },
#         "ai_overview": overview,
#         "recent_logs": log_list[:5],
#     }


# @router.delete("/{log_id}")
# async def delete_log(log_id: str, user=Depends(get_current_user)):
#     log = supabase.table("daily_logs") \
#         .select("sent_to_mentor, signed") \
#         .eq("id", log_id) \
#         .eq("user_id", str(user.id)) \
#         .execute()

#     if not log.data:
#         raise HTTPException(404, "Log not found")

#     if log.data[0].get("sent_to_mentor"):
#         raise HTTPException(400, "Cannot delete a log that has been sent to your mentor")

#     supabase.table("daily_logs").delete() \
#         .eq("id", log_id) \
#         .eq("user_id", str(user.id)) \
#         .execute()

#     return {"success": True}




import secrets
from config import settings
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from models import (
    CreateLogRequest, DifficultyRequest,
    VerifyAnswerRequest, EditLogRequest, SendToMentorRequest
)
from dependencies import get_current_user
from services.supabase_service import supabase, update_streak, create_notification
from services.groq_service import (
    restructure_log, generate_verification_question,
    evaluate_answer, detect_difficulty, summarise_mentee_logs
)
from services.brevo_service import send_log_to_mentor
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/logs", tags=["logs"])


@router.post("/create")
@limiter.limit("10/minute")
async def create_log(request: Request, body: CreateLogRequest, user=Depends(get_current_user)):
    user_id = str(user.id)
    today = str(date.today())

    existing = supabase.table("daily_logs") \
        .select("id").eq("user_id", user_id).eq("log_date", today).execute()

    if existing.data:
        raise HTTPException(400, "You've already submitted a log today. Come back tomorrow!")

    structured = await restructure_log(body.raw_content)

    log_data = {
        "user_id": user_id,
        "raw_content": body.raw_content,
        "structured_title": structured.get("title"),
        "structured_topics": structured.get("topics", []),
        "structured_content": structured.get("structured_content"),
        "log_date": today,
        "mentor_id": body.mentor_id,
    }

    result = supabase.table("daily_logs").insert(log_data).execute()
    if not result.data:
        raise HTTPException(500, "Failed to save log")

    log = result.data[0]
    await update_streak(user_id, today)

    return {
        "success": True,
        "log_id": log["id"],
        "structured_title": log["structured_title"],
        "structured_topics": log["structured_topics"],
        "structured_content": log["structured_content"],
    }


# @router.post("/generate-question")
# @limiter.limit("20/minute")
# async def generate_question(request: Request, body: DifficultyRequest, user=Depends(get_current_user)):
#     log = supabase.table("daily_logs") \
#         .select("*").eq("id", body.log_id).eq("user_id", str(user.id)).execute()

#     if not log.data:
#         raise HTTPException(404, "Log not found")

#     log_data = log.data[0]

#     if not body.difficulty or body.difficulty == 'auto':
#         difficulty = await detect_difficulty(log_data["structured_content"])
#     else:
#         difficulty = body.difficulty

#     qa = await generate_verification_question(log_data["structured_content"], difficulty)

#     supabase.table("daily_logs").update({
#         "difficulty_level": difficulty,
#         "verification_question": qa["question"],
#         "correct_answer": qa["correct_answer"],
#         "test_attempted": True,
#     }).eq("id", body.log_id).execute()

#     return {
#         "success": True,
#         "question": qa["question"],
#         "difficulty": difficulty,
#     }

@router.post("/generate-question")
@limiter.limit("20/minute")
async def generate_question(request: Request, body: DifficultyRequest, user=Depends(get_current_user)):
    log = supabase.table("daily_logs") \
        .select("*").eq("id", body.log_id).eq("user_id", str(user.id)).execute()

    if not log.data:
        raise HTTPException(404, "Log not found")

    log_data = log.data[0]

    if not body.difficulty or body.difficulty == 'auto':
        difficulty = await detect_difficulty(log_data["structured_content"])
    else:
        difficulty = body.difficulty

    qa = await generate_verification_question(log_data["structured_content"], difficulty)

    scenario_question = qa.get("scenario_question", "")
    reflection_question = qa.get("reflection_question", "")
    correct_answer = qa.get("correct_answer", "")
    bloom_level = qa.get("bloom_level", "")
    frame = qa.get("frame", "")

    supabase.table("daily_logs").update({
        "difficulty_level": difficulty,
        "verification_question": scenario_question,
        "correct_answer": correct_answer,
        "test_attempted": True,
    }).eq("id", body.log_id).execute()

    return {
        "success": True,
        "scenario_question": scenario_question,
        "reflection_question": reflection_question,
        "correct_answer": correct_answer,
        "bloom_level": bloom_level,
        "frame": frame,
        "difficulty": difficulty,
    }


# @router.post("/verify-answer")
# async def verify_answer(body: VerifyAnswerRequest, user=Depends(get_current_user)):
#     log = supabase.table("daily_logs") \
#         .select("*").eq("id", body.log_id).eq("user_id", str(user.id)).execute()

#     if not log.data:
#         raise HTTPException(404, "Log not found")

#     log_data = log.data[0]

#     if not log_data.get("verification_question"):
#         raise HTTPException(400, "No question generated yet")

#     result = await evaluate_answer(
#         question=log_data["verification_question"],
#         correct_answer=log_data["correct_answer"],
#         user_answer=body.answer,
#         difficulty=log_data["difficulty_level"]
#     )

#     supabase.table("daily_logs").update({
#         "test_passed": result["passed"]
#     }).eq("id", body.log_id).execute()

#     if result["passed"]:
#         await create_notification(
#             str(user.id), "test_passed",
#             "✅ Test Passed!",
#             f"You passed the {log_data['difficulty_level']} verification for today's log."
#         )

#     return result

@router.post("/verify-answer")
async def verify_answer(body: VerifyAnswerRequest, user=Depends(get_current_user)):
    log = supabase.table("daily_logs") \
        .select("*").eq("id", body.log_id).eq("user_id", str(user.id)).execute()

    if not log.data:
        raise HTTPException(404, "Log not found")

    log_data = log.data[0]

    if not log_data.get("verification_question"):
        raise HTTPException(400, "No question generated yet")

    question_type = getattr(body, "question_type", "scenario")

    result = await evaluate_answer(
        question=log_data["verification_question"],
        correct_answer=log_data["correct_answer"],
        user_answer=body.answer,
        difficulty=log_data["difficulty_level"],
        question_type=question_type,
    )

    # Only update test_passed on scenario — reflection doesn't override the main result
    if question_type == "scenario":
        supabase.table("daily_logs").update({
            "test_passed": result["passed"]
        }).eq("id", body.log_id).execute()

    if result["passed"] and question_type == "scenario":
        await create_notification(
            str(user.id), "test_passed",
            "Test Passed",
            f"You passed the {log_data['difficulty_level']} verification for today's log."
        )

    return result


@router.put("/edit")
async def edit_log(body: EditLogRequest, user=Depends(get_current_user)):
    supabase.table("daily_logs").update({
        "structured_content": body.structured_content,
        "structured_title": body.structured_title,
        "structured_topics": body.structured_topics,
    }).eq("id", body.log_id).eq("user_id", str(user.id)).execute()

    return {"success": True}


@router.post("/send-to-mentor")
@limiter.limit("10/minute")
async def send_to_mentor(request: Request, body: SendToMentorRequest, user=Depends(get_current_user)):
    user_id = str(user.id)

    log = supabase.table("daily_logs") \
        .select("*").eq("id", body.log_id).eq("user_id", user_id).execute()

    if not log.data:
        raise HTTPException(404, "Log not found")

    log_data = log.data[0]

    if log_data.get("sent_to_mentor"):
        raise HTTPException(400, "Log already sent to mentor")

    active_mentor = supabase.table("mentor_relationships") \
        .select("*, profiles!mentor_relationships_mentor_id_fkey(email, full_name)") \
        .eq("mentee_id", user_id) \
        .eq("status", "active") \
        .execute()

    mentor_name = body.mentor_email
    mentor_validated = False

    if active_mentor.data:
        for rel in active_mentor.data:
            mentor_email_on_record = rel.get("profiles", {}).get("email", "")
            if mentor_email_on_record.lower() == body.mentor_email.lower():
                mentor_validated = True
                mentor_name = rel["profiles"].get("full_name") or body.mentor_email
                break

    if not mentor_validated:
        email_exists = supabase.table("profiles") \
            .select("id, full_name") \
            .eq("email", body.mentor_email) \
            .execute()

        if email_exists.data:
            raise HTTPException(400, {
                "code": "not_your_mentor",
                "message": f"{body.mentor_email} is a Dôti user but is not your mentor. Add them as your mentor first.",
                "suggestion": "add_mentor"
            })
        else:
            raise HTTPException(400, {
                "code": "not_registered",
                "message": f"{body.mentor_email} doesn't have a Dôti account yet.",
                "suggestion": "invite"
            })

    profile = supabase.table("profiles") \
        .select("full_name").eq("id", user_id).execute()
    mentee_name = profile.data[0]["full_name"] if profile.data else user.email

    sign_token = secrets.token_urlsafe(32)

    update_payload = {
        "sent_to_mentor": True,
        "sent_at": datetime.utcnow().isoformat(),
        "mentor_sign_token": sign_token,
    }

    if body.project_id:
        update_payload["project_id"] = body.project_id

    supabase.table("daily_logs").update(update_payload).eq("id", body.log_id).execute()

    print(f"[DEBUG] Sending email to mentor: {body.mentor_email}")
    print(f"[DEBUG] Mentee: {mentee_name}, Log: {log_data['structured_title']}")
    print(f"[DEBUG] Sign URL will be: {settings.backend_url}/api/sign/{sign_token}")

    try:
        await send_log_to_mentor(
            mentor_email=body.mentor_email,
            mentor_name=mentor_name,
            mentee_name=mentee_name,
            log_title=log_data["structured_title"],
            log_content=log_data["structured_content"],
            log_topics=log_data["structured_topics"] or [],
            sign_token=sign_token,
            log_id=body.log_id,
        )
        print(f"[DEBUG] ✅ Email sent successfully")
    except Exception as e:
        print(f"[DEBUG] ❌ Email failed: {type(e).__name__}: {e}")
        # Don't raise — log is already marked sent, don't break the UX
        # but we know exactly what failed now

    return {
        "success": True,
        "message": f"Log sent to {mentor_name}!",
        "mentor_email": body.mentor_email
    }


@router.get("/my-logs")
async def get_my_logs(user=Depends(get_current_user)):
    result = supabase.table("daily_logs") \
        .select("*").eq("user_id", str(user.id)) \
        .order("created_at", desc=True).execute()
    return {"logs": result.data}


@router.get("/streak")
async def get_streak(user=Depends(get_current_user)):
    result = supabase.table("streaks").select("*").eq("user_id", str(user.id)).execute()
    if not result.data:
        return {"current_streak": 0, "longest_streak": 0}
    return result.data[0]


@router.get("/mentee/{mentee_id}")
async def get_mentee_logs(mentee_id: str, user=Depends(get_current_user)):
    mentor_id = str(user.id)

    rel = supabase.table("mentor_relationships") \
        .select("id") \
        .eq("mentor_id", mentor_id) \
        .eq("mentee_id", mentee_id) \
        .eq("status", "active") \
        .execute()

    if not rel.data:
        raise HTTPException(403, "You are not this mentee's mentor")

    logs = supabase.table("daily_logs") \
        .select("*") \
        .eq("user_id", mentee_id) \
        .order("created_at", desc=True) \
        .execute()

    return {"logs": logs.data or []}


@router.get("/mentee/{mentee_id}/overview")
async def get_mentee_overview(mentee_id: str, user=Depends(get_current_user)):
    mentor_id = str(user.id)

    rel = supabase.table("mentor_relationships") \
        .select("id") \
        .eq("mentor_id", mentor_id) \
        .eq("mentee_id", mentee_id) \
        .eq("status", "active") \
        .execute()

    if not rel.data:
        raise HTTPException(403, "You are not this mentee's mentor")

    profile = supabase.table("profiles").select("full_name").eq("id", mentee_id).execute()
    mentee_name = profile.data[0]["full_name"] if profile.data else "Your mentee"

    logs = supabase.table("daily_logs") \
        .select("*") \
        .eq("user_id", mentee_id) \
        .order("created_at", desc=True) \
        .execute()

    log_list = logs.data or []

    overview = await summarise_mentee_logs(log_list, mentee_name)

    total = len(log_list)
    signed = sum(1 for l in log_list if l.get("signed"))
    sent = sum(1 for l in log_list if l.get("sent_to_mentor"))
    passed = sum(1 for l in log_list if l.get("test_passed"))

    hours = []
    for l in log_list:
        try:
            dt = datetime.fromisoformat(l["created_at"].replace("Z", "+00:00"))
            hours.append(dt.hour)
        except Exception:
            pass

    most_active_hour = None
    if hours:
        most_active_hour = max(set(hours), key=hours.count)
        h = most_active_hour
        most_active_hour = f"{'12' if h == 0 else h if h <= 12 else h - 12}{'am' if h < 12 else 'pm'}"

    return {
        "mentee_name": mentee_name,
        "stats": {
            "total_logs": total,
            "signed_logs": signed,
            "sent_logs": sent,
            "tests_passed": passed,
            "sign_rate": round((signed / total * 100) if total > 0 else 0),
            "most_active_time": most_active_hour or "Unknown",
        },
        "ai_overview": overview,
        "recent_logs": log_list[:5],
    }


@router.delete("/{log_id}")
async def delete_log(log_id: str, user=Depends(get_current_user)):
    log = supabase.table("daily_logs") \
        .select("sent_to_mentor, signed") \
        .eq("id", log_id) \
        .eq("user_id", str(user.id)) \
        .execute()

    if not log.data:
        raise HTTPException(404, "Log not found")

    if log.data[0].get("sent_to_mentor"):
        raise HTTPException(400, "Cannot delete a log that has been sent to your mentor")

    supabase.table("daily_logs").delete() \
        .eq("id", log_id) \
        .eq("user_id", str(user.id)) \
        .execute()

    return {"success": True}