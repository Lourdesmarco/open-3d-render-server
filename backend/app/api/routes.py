import logging
logger = logging.getLogger(__name__)

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Response
from fastapi.responses import FileResponse
from pathlib import Path

from app.core.config import settings
from app.core.security import create_access_token, get_current_user
from app.services.user_manager import (
    get_user_by_username,
    verify_password,
)
from app.services import job_manager, storage
from app.api.schemas import JobResponse, LoginRequest, UserResponse



router = APIRouter(prefix="/api", tags=["Render jobs"])

def get_authorized_job(job_id: str, user: dict):
    job = job_manager.get_job(job_id)

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Trabajo no encontrado"
        )

    # El administrador puede consultar cualquier trabajo.
    # Los demás usuarios solamente los suyos.
    if user["role"] != "admin" and job["owner_id"] != user["id"]:
        raise HTTPException(
            status_code=404,
            detail="Trabajo no encontrado"
        )

    return job


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
async def upload_project(file: UploadFile = File(...), user=Depends(get_current_user)):

    try:
        filename, project_path = await storage.save_upload(
            file,
            settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        )

        job = job_manager.create_job(
            filename,
            project_path,
            owner_id=user["id"]
        )

        return public_job(job)

    except ValueError as exc:
        raise HTTPException(400, str(exc))

    except Exception:
        logger.exception("Error al crear el trabajo de renderizado")
        raise HTTPException(
            500,
            "No se pudo almacenar el proyecto"
        )


@router.get("/jobs", response_model=list[JobResponse])
def get_jobs(user=Depends(get_current_user)):
    if user["role"] == "admin":
        jobs = job_manager.list_jobs()
    else:
        jobs = job_manager.list_jobs(
            owner_id=user["id"]
        )

    return [public_job(job) for job in jobs]



@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(job_id: str, user=Depends(get_current_user)):
    job = get_authorized_job(job_id, user)
    return public_job(job)



@router.get("/jobs/{job_id}/result")
def get_render_result(job_id: str, user=Depends(get_current_user)):
    job = get_authorized_job(job_id, user)

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
def download_render(job_id: str, user=Depends(get_current_user)):
    job = get_authorized_job(job_id, user)

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



@router.post("/auth/login", response_model=UserResponse)
def login(data: LoginRequest, response: Response):
    user = get_user_by_username(data.username)

    if (
        not user
        or not user["active"]
        or not verify_password(
            data.password,
            user["password_hash"]
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    token = create_access_token(user["id"])

    # Al omitir max_age / expires, la cookie se elimina al cerrar la pestaña o el navegador
    response.set_cookie(
        key="access_token",
        value=f"Bearer {token}",
        httponly=True,
        samesite="lax",
        secure=False,  # En producción con HTTPS se cambia a True
        path="/"
    )

    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "active": bool(user["active"])
    }


@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(key="access_token", path="/")
    return {"message": "Sesión cerrada correctamente"}


@router.get("/auth/me", response_model=UserResponse)
def get_me(user=Depends(get_current_user)):
    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "active": bool(user["active"])
    }


@router.get("/dashboard/summary")
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    role = current_user.get("role", "user")

    # 1. Obtener la lista de trabajos segun el rol
    if role == "admin":
        jobs = job_manager.list_jobs()
    else:
        jobs = job_manager.list_jobs(owner_id=user_id)

    # 2. Calcular metricas exactas
    total_jobs = len(jobs)
    queued_jobs = sum(1 for j in jobs if j.get("status") == "queued")
    processing_jobs = sum(1 for j in jobs if j.get("status") == "processing")
    completed_jobs = sum(1 for j in jobs if j.get("status") == "completed")
    failed_jobs = sum(1 for j in jobs if j.get("status") == "failed")

    # 3. Formatear la respuesta
    return {
        "stats": {
            "total": total_jobs,
            "queued": queued_jobs,
            "processing": processing_jobs,
            "completed": completed_jobs,
            "failed": failed_jobs,
        },
        # Devuelve los 5 trabajos mas recientes para el historial rápido
        "recent_jobs": [public_job(job) for job in jobs[:5]]
    }