from fastapi import APIRouter, HTTPException
from bson import ObjectId, errors as bson_errors
from database import db

router = APIRouter()

def oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")

@router.get("/applications/user/{user_uid}")
async def get_applications_by_user(user_uid: str):
    """Get all applications for a specific user with job posting details"""
    applications = []
    async for app in db.applications.find({"user_uid": user_uid}):
        # Get job posting details
        job_posting = await db.job_postings.find_one({"_id": oid(app["job_id"])})
        if job_posting:
            # Combine application with job posting data
            app_data = {
                "application_id": str(app["_id"]),
                "job_id": str(app["job_id"]),
                "user_uid": app["user_uid"],
                "resume_id": app["resume_id"],
                "status": app["status"],
                "datetime": app["datetime"].isoformat(),
                "job_title": job_posting["title"],
                "company": job_posting["company"],
                "location": job_posting["location"],
                "salary_min": job_posting["salary_min"],
                "salary_max": job_posting["salary_max"],
                "date_posted": job_posting["datetime"].isoformat()
            }
            applications.append(app_data)
    return applications
