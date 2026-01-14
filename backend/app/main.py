from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from .database import init_db
from .api import router
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    os.makedirs(settings.upload_dir, exist_ok=True)
    yield

app = FastAPI(
    title="Airbnb Checkout Checker",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")
