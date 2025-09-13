from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr



# =========================
# User Models
# =========================
class UserBase(BaseModel):
    name: str
    age: Optional[int] = None
    email: EmailStr
    company: Optional[str] = None


class UserCreate(UserBase):
    password: str


class User(UserBase):
    uid: str
    employer_uid: Optional[int] = None
    resume_id: Optional[int] = None

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
    updated_at: datetime

    class Config:
        from_attributes = True


# =========================
# Job Posting Models
# =========================
class JobPostingBase(BaseModel):
    name: str
    description: str
    location: str
    company: str
    pay: float


class JobPostingCreate(JobPostingBase):
    employer_uid: str


class JobPosting(JobPostingBase):
    job_id: str
    datetime: datetime
    employer_uid: int

    class Config:
        from_attributes = True


# =========================
# Application Models
# =========================
class ApplicationBase(BaseModel):
    status: Optional[str] = "submitted"


class ApplicationCreate(ApplicationBase):
    job_id: str
    user_uid: str
    resume_id: str


class Application(ApplicationBase):
    application_id: int
    job_id: int
    user_uid: str
    resume_id: str
    datetime: datetime

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