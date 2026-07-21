from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# ============================================================
# AUTH MODELS
# ============================================================

class SignupRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "mentee"


class LoginRequest(BaseModel):
    email: str
    password: str


class AccessRequestModel(BaseModel):
    full_name: str
    email: str
    reason: Optional[str] = None


# ============================================================
# LOG MODELS
# ============================================================

class CreateLogRequest(BaseModel):
    raw_content: str = Field(..., min_length=50)
    mentor_id: Optional[str] = None


class StructuredLog(BaseModel):
    title: str
    topics: List[str]
    structured_content: str


class DifficultyRequest(BaseModel):
    log_id: str
    difficulty: str = 'auto'


class VerifyAnswerRequest(BaseModel):
    log_id: str
    answer: str


class EditLogRequest(BaseModel):
    log_id: str
    structured_content: str
    structured_title: str
    structured_topics: List[str]


class SendToMentorRequest(BaseModel):
    log_id: str
    mentor_email: str
    project_id: Optional[str] = None


# ============================================================
# PROJECT MODELS
# ============================================================

class CreateProjectRequest(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[date] = None
    mentee_ids: List[str] = []


# ============================================================
# MENTOR RELATIONSHIP MODELS
# ============================================================

class MentorRequestModel(BaseModel):
    mentor_email: str


class RespondMentorRequest(BaseModel):
    relationship_id: str
    action: str  # 'accept' or 'decline'


# ============================================================
# PROFILE MODELS
# ============================================================

class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    bio: Optional[str] = None
    field_of_study: Optional[str] = None


# ============================================================
# SECURITY MODELS
# ============================================================

class ChangePasswordRequest(BaseModel):
    new_password: str = Field(..., min_length=8)