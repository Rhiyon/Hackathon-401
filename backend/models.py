from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr,Field



# =========================
# User Models
# =========================
class UserBase(BaseModel):
    name: str
    age: Optional[int] = None
    email: EmailStr
    company: Optional[str] = None
    employerFlag: bool = False 


class UserCreate(UserBase):
    password: str


class User(UserBase):
    uid: str
    employer_uid: Optional[int] = None
    resume_id: Optional[int] = None
    avatar_base64: Optional[str] = None

    class Config:
        from_attributes = True


# =========================
# Resume Models
# =========================
class ResumeBase(BaseModel):
    content: str


class ResumeCreate(ResumeBase):
    child_uid: str
    parent_uid: Optional[int] = None


class Resume(ResumeBase):
    resume_id: str
    child_uid: str
    parent_uid: Optional[int] = None
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


# =========================
# Job Posting Models
# =========================
class JobPostingBase(BaseModel):
    title: str
    description: str
    location: str
    company: str
    salary_min: float
    salary_max: float


class JobPostingCreate(JobPostingBase):
    employer_id: str  # matches what front-end sends
    datetime: Optional[datetime] = None
    created_at: Optional[datetime] = None

class JobPosting(JobPostingBase):
    job_id: str
    datetime: datetime
    employer_id: str  # use string to match frontend

    class Config:
        from_attributes = True


# =========================
# Application Models
# =========================

class ApplicationBase(BaseModel):
    status: Optional[str] = "applied"   # default instead of "submitted"


class ApplicationCreate(ApplicationBase):
    job_id: str           # which job this is for
    employer_id: str      # the employer who posted the job
    employee_id: str      # the user who applied
    resume_id: Optional[str] = None     # optional, in case they attach a resume
    applied_at: Optional[datetime] = None


class Application(ApplicationBase):
    application_id: str
    job_id: str
    employer_id: str
    employee_id: str
    resume_id: Optional[str] = None
    applied_at: datetime

    class Config:
        from_attributes = True

# =========================
# Notification Models
# =========================
class NotificationBase(BaseModel):
    content: str


class NotificationCreate(NotificationBase):
    from_uid: str
    to_uid: str


class Notification(NotificationBase):
    notification_id: int
    from_uid: str
    to_uid: int
    datetime: datetime

    class Config:
        from_attributes = True


# =========================
# Chat Models
# =========================
class ChatBase(BaseModel):
    content: str


class ChatCreate(ChatBase):
    from_uid: int
    to_uid: int


class Chat(ChatBase):
    chat_id: int
    from_uid: int
    to_uid: int
    datetime: datetime

    class Config:
        from_attributes = True