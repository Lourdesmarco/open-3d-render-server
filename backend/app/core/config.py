
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]

def resolve_path(value: str) -> Path:
    path = Path(value).expanduser()
    if not path.is_absolute():
        path = BASE_DIR / path
    return path.resolve()

class Settings:
    APP_NAME = os.getenv(
        "APP_NAME",
        "Open 3D Render Server"
    )

    APP_ENV = os.getenv("APP_ENV", "development")

    API_HOST = os.getenv("API_HOST", "127.0.0.1")

    API_PORT = int(os.getenv("API_PORT", "8080"))

    STORAGE_PATH = resolve_path(
        os.getenv("STORAGE_PATH", "storage")
    )

    MAX_UPLOAD_SIZE_MB = int(
        os.getenv("MAX_UPLOAD_SIZE_MB", "500")
    )

    BLENDER_EXECUTABLE = os.getenv(
        "BLENDER_EXECUTABLE", ""
    )

    RENDER_TIMEOUT_SECONDS = int(
        os.getenv("RENDER_TIMEOUT_SECONDS", "3600")
    )

    DATABASE_PATH = STORAGE_PATH / "jobs.db"

settings = Settings()

for directory in (
    settings.STORAGE_PATH,
    settings.STORAGE_PATH / "uploads",
    settings.STORAGE_PATH / "renders",
    settings.STORAGE_PATH / "logs",
):
    directory.mkdir(parents=True, exist_ok=True)
