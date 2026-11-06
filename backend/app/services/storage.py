
import os
import uuid

from pathlib import Path
from fastapi import UploadFile

from app.core.config import settings


UPLOAD_DIR = settings.STORAGE_PATH / "uploads"


async def save_upload(
    upload: UploadFile,
    max_size: int
) -> tuple[str, Path]:

    original_name = (
        (upload.filename or "project.blend")
        .replace("\\", "/")
        .split("/")[-1]
    )

    if Path(original_name).suffix.lower() != ".blend":
        raise ValueError("Solo se admiten archivos .blend")

    job_id = uuid.uuid4().hex
    job_dir = UPLOAD_DIR / job_id
    job_dir.mkdir(parents=True, exist_ok=False)

    destination = job_dir / "project.blend"
    temporary = job_dir / "project.part"

    total_size = 0

    try:
        with temporary.open("wb") as output:
            while True:
                chunk = await upload.read(1024 * 1024)

                if not chunk:
                    break

                total_size += len(chunk)

                if total_size > max_size:
                    raise ValueError(
                        "El archivo supera el límite permitido"
                    )

                output.write(chunk)

        if total_size == 0:
            raise ValueError("El archivo está vacío")

        os.replace(temporary, destination)

        return original_name, destination

    except Exception:
        temporary.unlink(missing_ok=True)
        destination.unlink(missing_ok=True)

        try:
            job_dir.rmdir()
        except OSError:
            pass

        raise

    finally:
        await upload.close()
