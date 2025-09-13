from typing import List, Dict, Callable, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId, errors as bson_errors

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

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
<<<<<<< Updated upstream
    allow_origins=["http://localhost:3000"],
=======
    allow_origins=["*"],   # allows all
>>>>>>> Stashed changes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------
# Helpers
# ---------------------

def oid(id_str: str) -> ObjectId:
    try:
        return ObjectId(id_str)
    except bson_errors.InvalidId:
        raise HTTPException(status_code=400, detail="Invalid id")

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
            d = _serialize_id(d)
            d[id_field] = d.pop("_id")
            out.append(ReadModel(**d))
        return out

    # GET ONE
    @app.get(f"/{coll_name}/{{obj_id}}", response_model=ReadModel, tags=[tag])
    async def get_obj(obj_id: str):
        d = await coll.find_one({"_id": oid(obj_id)})
        if not d:
            raise HTTPException(status_code=404, detail=f"{coll_name[:-1].capitalize()} not found")
        d = _serialize_id(d)
        d[id_field] = d.pop("_id")
        return ReadModel(**d)
<<<<<<< Updated upstream

=======
    
>>>>>>> Stashed changes
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

# ---------------------
# Job Postings
# ---------------------
_mk_crud(
    coll_name="job_postings",
    id_field="job_id",
    CreateModel=JobPostingCreate,
    ReadModel=JobPosting,
    defaults=with_created_and_dt,
)

# ---------------------
# Applications
# ---------------------
_mk_crud(
    coll_name="applications",
    id_field="application_id",
    CreateModel=ApplicationCreate,
    ReadModel=Application,
    defaults=with_created_and_dt,
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