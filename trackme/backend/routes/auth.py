from fastapi import APIRouter
from pydantic import BaseModel
from services.brevo_service import send_welcome_email

router = APIRouter(prefix="/auth", tags=["auth"])

class WelcomeRequest(BaseModel):
    email: str
    full_name: str
    role: str

@router.post("/welcome")
async def welcome(body: WelcomeRequest):
    await send_welcome_email(
        user_email=body.email,
        full_name=body.full_name,
        role=body.role,
    )
    return {"success": True}