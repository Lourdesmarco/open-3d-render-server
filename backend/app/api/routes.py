
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path

from app.core.config import settings
from app.services import job_manager, storage
from app.api.schemas import JobResponse



router = APIRouter(prefix="/api", tags=["Render jobs"])


def public_job(job):
    return JobResponse(
        id=job["id"],
        filename=job["filename"],
        status=job["status"],
        created_at=job["created_at"],
        result_available=bool(job["result_path"]),
        error=job["error"]
    )


@router.post("/jobs", response_model=JobResponse)
async def upload_project(file: UploadFile = File(...)):

    try:
        filename, project_path = await storage.save_upload(
            file,
            settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        )

        job = job_manager.create_job(
            filename,
            project_path
        )

        return public_job(job)

    except ValueError as exc:
        raise HTTPException(400, str(exc))

    except Exception:
        raise HTTPException(
            500,
            "No se pudo almacenar el proyecto"
        )


@router.get("/jobs", response_model=list[JobResponse])
def get_jobs():
    return [
        public_job(job)
        for job in job_manager.list_jobs()
    ]


@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: str):
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    return public_job(job)



@router.get("/jobs/{job_id}/result")
def get_render_result(job_id: str):
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    if job["status"] != "completed" or not job["result_path"]:
        raise HTTPException(409, "Render todavía no disponible")

    output = Path(job["result_path"]).resolve()
    render_dir = (settings.STORAGE_PATH / "renders").resolve()

    if output.parent != render_dir or not output.is_file():
        raise HTTPException(404, "Resultado no disponible")

    return FileResponse(
        output,
        media_type="image/png"
    )


@router.get("/jobs/{job_id}/download")
def download_render(job_id: str):
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(404, "Trabajo no encontrado")

    if job["status"] != "completed" or not job["result_path"]:
        raise HTTPException(409, "Render todavía no disponible")

    output = Path(job["result_path"]).resolve()
    render_dir = (settings.STORAGE_PATH / "renders").resolve()

    if output.parent != render_dir or not output.is_file():
        raise HTTPException(404, "Resultado no disponible")

    return FileResponse(
        output,
        media_type="image/png",
        filename=f"render_{job_id}.png"
    )
