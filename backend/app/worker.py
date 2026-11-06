
import logging
import os
import socket
import time
import uuid

from pathlib import Path

from app.core.config import settings
from app.services import job_manager
from app.services.blender_engine import render_project


WORKER_ID = (
    f"{socket.gethostname()}-{uuid.uuid4().hex[:8]}"
)

POLL_INTERVAL = 2

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

logger = logging.getLogger("render-worker")


def process_job(job):
    job_id = job["id"]

    project_path = Path(job["project_path"])

    output_path = (
        settings.STORAGE_PATH
        / "renders"
        / f"{job_id}.png"
    )

    log_path = (
        settings.STORAGE_PATH
        / "logs"
        / f"{job_id}.log"
    )

    logger.info("Iniciando trabajo %s", job_id)

    try:
        if not project_path.is_file():
            raise RuntimeError(
                "No se encuentra el archivo del proyecto"
            )

        render_project(
            project_path=project_path,
            output_path=output_path,
            log_path=log_path,
            timeout=settings.RENDER_TIMEOUT_SECONDS
        )

        job_manager.finish_job(
            job_id,
            output_path
        )

        logger.info(
            "Trabajo completado: %s",
            job_id
        )

    except Exception as exc:
        logger.exception(
            "Error procesando trabajo %s",
            job_id
        )

        job_manager.fail_job(
            job_id,
            str(exc)
        )


def run_worker():
    job_manager.initialize_database()

    logger.info("Blender Worker iniciado")
    logger.info("Worker ID: %s", WORKER_ID)

    while True:
        try:
            job = job_manager.claim_next_job(WORKER_ID)

            if job is None:
                time.sleep(POLL_INTERVAL)
                continue

            process_job(job)

        except KeyboardInterrupt:
            logger.info("Deteniendo worker")
            break

        except Exception:
            logger.exception("Error en el ciclo del worker")
            time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    run_worker()
