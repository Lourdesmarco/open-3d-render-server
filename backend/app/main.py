
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router
from app.api.admin_routes import router as admin_router
from app.services.job_manager import initialize_database

import logging

# Silencia las líneas HTTP repetitivas de Uvicorn (INFO 200 OK)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

@asynccontextmanager
async def lifespan(app: FastAPI):
    initialize_database()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Open source 3D rendering platform",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

app.include_router(router)
app.include_router(admin_router, prefix="/api")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": settings.APP_NAME,
        "version": "0.1.0"
    }
