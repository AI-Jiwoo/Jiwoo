import uvicorn
from fastapi import FastAPI
from app.api import routes
from app.database import connect_to_milvus

app = FastAPI()

@app.on_event("startup")
async def startup_event():
    connect_to_milvus()

app.include_router(routes.router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)