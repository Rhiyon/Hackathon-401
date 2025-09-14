from typing import List, Dict, Callable, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException,Body
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


@app.post("/login", tags=["users"])
async def login_user(email: str = Body(...), password: str = Body(...)):
    user = await db.users.find_one({"email": email, "password": password})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user["_id"] = str(user["_id"])
    return {"message": f"Welcome back {user['name']}!", "user": user}
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