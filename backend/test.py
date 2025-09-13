import asyncio
from database import db

async def test():
    info = await db.list_collection_names()
    print(info)

asyncio.run(test())
