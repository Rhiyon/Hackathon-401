from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
from models import Item
from database import db

app = FastAPI()

# CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CREATE ---
@app.post("/items")
async def create_item(item: Item):
    item_dict = item.dict()
    result = await db.items.insert_one(item_dict)
    item_dict["_id"] = str(result.inserted_id)
    return item_dict

# --- READ ALL ---
@app.get("/items")
async def get_items():
    items = []
    cursor = db.items.find()
    async for item in cursor:
        item["_id"] = str(item["_id"])
        items.append(item)
    return items

# --- READ ONE ---
@app.get("/items/{item_id}")
async def get_item(item_id: str):
    item = await db.items.find_one({"_id": ObjectId(item_id)})
    if item:
        item["_id"] = str(item["_id"])
        return item
    raise HTTPException(status_code=404, detail="Item not found")

# --- UPDATE ---
@app.put("/items/{item_id}")
async def update_item(item_id: str, updated_item: Item):
    result = await db.items.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": updated_item.dict()}
    )
    if result.modified_count == 1:
        return {"message": "Item updated successfully"}
    raise HTTPException(status_code=404, detail="Item not found")

# --- DELETE ---
@app.delete("/items/{item_id}")
async def delete_item(item_id: str):
    result = await db.items.delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 1:
        return {"message": "Item deleted successfully"}
    raise HTTPException(status_code=404, detail="Item not found")
