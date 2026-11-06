
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.config import settings
from app.api.routes import router
from app.services.job_manager import initialize_database


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


app.include_router(router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "application": settings.APP_NAME,
        "version": "0.1.0"
    }
