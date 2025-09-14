from typing import List, Dict, Callable, Any
from datetime import datetime
import base64
from fastapi import FastAPI, HTTPException, Body, Query, APIRouter, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from bson import ObjectId, errors as bson_errors

import asyncio, tempfile
from pathlib import Path
from fastapi import Response


# Import your Pydantic models (v2)
from models import (
    User, UserCreate,
    Resume, ResumeCreate,
    JobPosting, JobPostingCreate,
    Application, ApplicationCreate,
    Notification, NotificationCreate,
    Chat, ChatCreate,
)
from database import db  # Motor async client/DB

app = FastAPI(title="Hackathon API")

users_collection = db.users
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------
# Helpers
# ---------------------

async def _run_tectonic(tex_path: Path, outdir: Path) -> None:
    """
    Run 'tectonic -X compile main.tex --outdir <outdir>' and raise on error.
    """
    proc = await asyncio.create_subprocess_exec(
        "tectonic", "-X", "compile", str(tex_path),
        "--outdir", str(outdir), "--keep-logs",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    out, err = await proc.communicate()
    if proc.returncode != 0:
        msg = ((err or out) or b"").decode("utf-8", "ignore")
        raise RuntimeError(f"LaTeX compile failed:\n{msg}")


def oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")
    
def _stringify_oids(value):
    """Recursively convert any bson.ObjectId to str."""
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, dict):
        return {k: _stringify_oids(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_stringify_oids(v) for v in value]
    return value

def _jsonify_doc(doc: dict, id_field: str) -> dict:
    """
    Convert a Mongo doc into an API-friendly dict:
    - _id -> id_field (stringified)
    - any other ObjectId fields -> str
    """
    if not doc:
        return doc
    out = _stringify_oids(doc)
    out[id_field] = str(out.pop("_id"))  # rename _id
    return out


def _serialize_id(doc: dict) -> dict:
    """Mongo ObjectId -> string."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def _mk_crud(
    *,
    coll_name: str,
    id_field: str,
    CreateModel,
    ReadModel,
    defaults: Callable[[dict], dict] | None = None,
):
    """
    Factory that registers 5 routes (create, list, get, update, delete) for a collection.
    - coll_name: Mongo collection name (e.g., 'users')
    - id_field:  the field name in the ReadModel (e.g., 'uid', 'resume_id', etc.)
    - CreateModel: Pydantic model for create
    - ReadModel:   Pydantic model for response
    - defaults(payload)->payload: optional function to set server-side defaults (timestamps, etc.)
    """
    coll = getattr(db, coll_name)

    tag = coll_name

    # CREATE
    @app.post(f"/{coll_name}", response_model=ReadModel, tags=[tag])
    async def create_obj(payload: CreateModel):
        doc = payload.model_dump(exclude_none=True)
        if defaults:
            doc = defaults(doc)
        result = await coll.insert_one(doc)
        # build response with id_field
        out = {**doc, id_field: str(result.inserted_id)}
        return ReadModel(**out)

    # LIST
    @app.get(f"/{coll_name}", response_model=List[ReadModel], tags=[tag])
    async def list_objs():
        out: List[ReadModel] = []
        async for d in coll.find():
            d = _jsonify_doc(d, id_field)
            out.append(ReadModel(**d))
        return out

    # GET ONE
    @app.get(f"/{coll_name}/{{obj_id}}", response_model=ReadModel, tags=[tag])
    async def get_obj(obj_id: str):
        d = await coll.find_one({"_id": oid(obj_id)})
        if not d:
            raise HTTPException(status_code=404, detail=f"{coll_name[:-1].capitalize()} not found")
        d = _jsonify_doc(d, id_field)
        return ReadModel(**d)
    
    # UPDATE
    @app.put(f"/{coll_name}/{{obj_id}}", response_model=Dict[str, str], tags=[tag])
    async def update_obj(obj_id: str, payload: CreateModel):
        doc = payload.model_dump(exclude_none=True)
        res = await coll.update_one({"_id": oid(obj_id)}, {"$set": doc})
        if res.matched_count == 0:
            raise HTTPException(status_code=404, detail=f"{coll_name[:-1].capitalize()} not found")
        return {"message": "Updated successfully"}

    # DELETE
    @app.delete(f"/{coll_name}/{{obj_id}}", response_model=Dict[str, str], tags=[tag])
    async def delete_obj(obj_id: str):
        res = await coll.delete_one({"_id": oid(obj_id)})
        if res.deleted_count == 0:
            raise HTTPException(status_code=404, detail=f"{coll_name[:-1].capitalize()} not found")
        return {"message": "Deleted successfully"}


# ---------------------
# Login (Employee / Employer)
# ---------------------
@app.post("/login", tags=["users"])
async def login_user(
    email: str = Body(...),
    password: str = Body(...),
    user_type: str = Body(...)  # "employee" or "employer"
):
    # 1️⃣ Find user by email only
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="No account found with this email.")

    # 2️⃣ Check password
    if user.get("password") != password:
        raise HTTPException(status_code=401, detail="Incorrect password.")

    # 3️⃣ Handle missing employerFlag (legacy users)
    employer_flag = user.get("employerFlag", False)  # default to employee

    # 4️⃣ Check if user type matches
    if user_type == "employer" and not employer_flag:
        raise HTTPException(
            status_code=403,
            detail="This account is an employee account, not an employer account."
        )
    if user_type == "employee" and employer_flag:
        raise HTTPException(
            status_code=403,
            detail="This account is an employer account, not an employee account."
        )

    # 5️⃣ Convert ObjectId to string for frontend
    user["_id"] = str(user["_id"])

    return {
        "message": f"Welcome back {user['name']}!",
        "user": user
    }

@app.get("/job_postings/employer/{employer_id}")
async def get_jobs_by_employer(employer_id: str):
    jobs = []
    async for job in db.job_postings.find({"employer_id": employer_id}):
        job["_id"] = str(job["_id"])
        job["job_id"] = job.pop("_id")
        jobs.append(job)
    return jobs

@app.post("/users/{user_id}/avatar")
async def upload_avatar(user_id: str, file: UploadFile = File(...)):
    file_bytes = await file.read()
    file_b64 = base64.b64encode(file_bytes).decode("utf-8")
    res = await db.users.update_one(
        {"_id": oid(user_id)},
        {"$set": {"avatar_base64": file_b64}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "Avatar uploaded successfully", "avatar_base64": file_b64}


@router.get("/search-users")
async def search_users(q: str = Query(...)):
    users = []
    cursor = db.users.find(
        {"name": {"$regex": q, "$options": "i"}},  # <- must be $regex
        {"_id": 1, "name": 1, "email": 1, "company": 1}
    )
    async for user in cursor:
        user["_id"] = str(user["_id"])  # convert ObjectId to string
        users.append(user)
    return users





@app.get("/jobs")
async def get_all_jobs():
    jobs = []
    async for job in db.job_postings.find():
        job["_id"] = str(job["_id"])
        job["job_id"] = job["_id"]
        jobs.append(job)
    return jobs


@app.get("/applications/user/{user_id}")
async def get_applications_by_user(user_id: str):
    applications = []
    async for app in db.applications.find({"user_id": user_id}):
        app["_id"] = str(app["_id"])
        app["application_id"] = app.pop("_id")
        applications.append(app)
    return applications

@app.post("/applications")
async def apply_for_job(payload: ApplicationCreate):
    # check if job exists
    job = await db.job_postings.find_one({"_id": oid(payload.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # prevent duplicate applications (same user + same job)
    existing = await db.applications.find_one({
        "job_id": payload.job_id,
        "user_id": payload.user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    app_doc = payload.model_dump(exclude_none=True)
    app_doc["created_at"] = datetime.utcnow()

    result = await db.applications.insert_one(app_doc)
    return {
        "application_id": str(result.inserted_id),
        **app_doc,
    }

@app.get("/jobs/{job_id}")
async def get_job(job_id: str):
    job = await db.job_postings.find_one({"_id": oid(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["_id"] = str(job["_id"])
    job["job_id"] = job["_id"]
    return job


@app.post("/apply/{job_id}", tags=["applications"])
async def apply_for_job(job_id: str, payload: dict = Body(...)):
    """
    Apply to a job by job_id.
    Payload must include:
    {
        "user_id": "...",
        "resume_id": "..."
    }
    """

    # 1️⃣ Validate job_id and fetch job
    try:
        obj_id = ObjectId(job_id)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid job_id")

    job = await db.job_postings.find_one({"_id": obj_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2️⃣ Extract user_id and resume_id
    user_id = payload.get("user_id")
    resume_id = payload.get("resume_id")
    if not user_id or not resume_id:
        raise HTTPException(status_code=400, detail="Missing user_id or resume_id")

    # 3️⃣ Prevent duplicate applications
    existing = await db.applications.find_one({
        "job_id": job_id,   # stored as string
        "user_id": user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # 4️⃣ Create application
    app_doc = {
        "job_id": job_id,       # store as string
        "user_id": user_id,
        "resume_id": resume_id,
        "status": "applied",
        "applied_at": datetime.utcnow(),
        "created_at": datetime.utcnow()
    }

    result = await db.applications.insert_one(app_doc)

    # 5️⃣ Return created application
    return {
        "application_id": str(result.inserted_id),
        **app_doc
    }


@app.get("/jobs")
async def get_all_jobs():
    jobs = []
    async for job in db.job_postings.find():
        job["_id"] = str(job["_id"])
        job["job_id"] = job["_id"]
        jobs.append(job)
    return jobs


@app.get("/applications/user/{user_id}")
async def get_applications_by_user(user_id: str):
    applications = []
    async for app in db.applications.find({"user_id": user_id}):
        app["_id"] = str(app["_id"])
        app["application_id"] = app.pop("_id")
        applications.append(app)
    return applications

@app.post("/applications")
async def apply_for_job(payload: ApplicationCreate):
    # check if job exists
    job = await db.job_postings.find_one({"_id": oid(payload.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # prevent duplicate applications (same user + same job)
    existing = await db.applications.find_one({
        "job_id": payload.job_id,
        "user_id": payload.user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    app_doc = payload.model_dump(exclude_none=True)
    app_doc["created_at"] = datetime.utcnow()

    result = await db.applications.insert_one(app_doc)
    return {
        "application_id": str(result.inserted_id),
        **app_doc,
    }

@app.get("/jobs/{job_id}")
async def get_job(job_id: str):
    job = await db.job_postings.find_one({"_id": oid(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job["_id"] = str(job["_id"])
    job["job_id"] = job["_id"]
    return job


@app.post("/apply/{job_id}", tags=["applications"])
async def apply_for_job(job_id: str, payload: dict = Body(...)):
    """
    Apply to a job by job_id.
    Payload must include:
    {
        "user_id": "...",
        "resume_id": "..."
    }
    """

    # 1️⃣ Validate job_id and fetch job
    try:
        obj_id = ObjectId(job_id)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid job_id")

    job = await db.job_postings.find_one({"_id": obj_id})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # 2️⃣ Extract user_id and resume_id
    user_id = payload.get("user_id")
    resume_id = payload.get("resume_id")
    if not user_id or not resume_id:
        raise HTTPException(status_code=400, detail="Missing user_id or resume_id")

    # 3️⃣ Prevent duplicate applications
    existing = await db.applications.find_one({
        "job_id": job_id,   # stored as string
        "user_id": user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="You have already applied for this job")

    # 4️⃣ Create application
    app_doc = {
        "job_id": job_id,       # store as string
        "user_id": user_id,
        "resume_id": resume_id,
        "status": "applied",
        "applied_at": datetime.utcnow(),
        "created_at": datetime.utcnow()
    }

    result = await db.applications.insert_one(app_doc)

    # 5️⃣ Return created application
    return {
        "application_id": str(result.inserted_id),
        **app_doc
    }

# ---------------------
# Defaults per resource
# ---------------------

def with_created_at(d: dict) -> dict:
    return {**d, "created_at": d.get("created_at") or datetime.utcnow()}

def with_created_and_dt(d: dict) -> dict:
    # for models that have a 'datetime' field for the event/created time
    now = datetime.utcnow()
    return {
        **d,
        "datetime": d.get("datetime") or now,
        "created_at": d.get("created_at") or now,
    }

def job_posting_defaults(d: dict) -> dict:
    now = datetime.utcnow()
    d["created_at"] = d.get("created_at") or now
    d["datetime"] = d.get("datetime") or now
    if "employer_id" not in d:
        raise HTTPException(status_code=400, detail="Missing employer_id")
    if "salary_min" not in d or "salary_max" not in d:
        raise HTTPException(status_code=400, detail="Missing salary range")
    return d




# ---------------------
# Users
# ---------------------
_mk_crud(
    coll_name="users",
    id_field="uid",
    CreateModel=UserCreate,
    ReadModel=User,
    defaults=with_created_at,
)

# ---------------------
# Resumes
# ---------------------
_mk_crud(
    coll_name="resumes",
    id_field="resume_id",
    CreateModel=ResumeCreate,
    ReadModel=Resume,
    defaults=with_created_at,
)

@app.get("/resumes/{resume_id}/pdf", tags=["resumes"])
async def get_resume_pdf(resume_id: str):
    # Fetch the resume document by Mongo _id (your CRUD uses ObjectId)
    doc = await db.resumes.find_one({"_id": oid(resume_id)})
    if not doc or not doc.get("content"):
        raise HTTPException(status_code=404, detail="Resume not found")

    tex_source = doc["content"]

    # If the stored text is only a fragment (no \documentclass), wrap it
    if "\\begin{document}" not in tex_source:
        tex_source = rf"""\documentclass[10pt]{{article}}
        \usepackage[margin=1in]{{geometry}}
        \usepackage{{hyperref}}
        \usepackage{{enumitem}}
        \begin{document}
        {tex_source}
        \end{document}
        """.strip()

    try:
        with tempfile.TemporaryDirectory() as tmp:
            tmpdir = Path(tmp)
            tex_path = tmpdir / "main.tex"
            tex_path.write_text(tex_source, encoding="utf-8")

            # If you reference local assets (images/.bib), write them into tmpdir here.

            await _run_tectonic(tex_path, tmpdir)

            pdf_path = tmpdir / "main.pdf"
            if not pdf_path.exists():
                raise RuntimeError("PDF not created")
            pdf_bytes = pdf_path.read_bytes()

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="resume_{resume_id}.pdf"',
                "Cache-Control": "public, max-age=60",
            },
        )

    except RuntimeError as e:
        # LaTeX errors surface as 400 with the compile log
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")

# ---------------------
# Job Postings
# ---------------------
_mk_crud(
    coll_name="job_postings",
    id_field="job_id",
    CreateModel=JobPostingCreate,
    ReadModel=JobPosting,
    defaults=job_posting_defaults, 
)

# ---------------------
# Notifications
# ---------------------
_mk_crud(
    coll_name="notifications",
    id_field="notification_id",
    CreateModel=NotificationCreate,
    ReadModel=Notification,
    defaults=with_created_and_dt,
)

# ---------------------
# Chat
# ---------------------
_mk_crud(
    coll_name="chat",
    id_field="chat_id",
    CreateModel=ChatCreate,
    ReadModel=Chat,
    defaults=with_created_and_dt,
)


app.include_router(router) # make sure this is AFTER router definitions