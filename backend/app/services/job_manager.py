
import sqlite3
import uuid

from datetime import datetime, timezone
from pathlib import Path

from app.core.config import settings

from contextlib import contextmanager

@contextmanager
def get_connection():
    connection = sqlite3.connect(
        str(settings.DATABASE_PATH),
        timeout=30
    )
    connection.row_factory = sqlite3.Row

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()



def initialize_database():
    with get_connection() as db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                status TEXT NOT NULL,
                created_at TEXT NOT NULL,
                project_path TEXT NOT NULL,
                result_path TEXT,
                error TEXT,
                worker_id TEXT
            )
        """)
        columns = {
            row["name"]
            for row in db.execute("PRAGMA table_info(jobs)").fetchall()
        }

        if "worker_id" not in columns:
            db.execute("ALTER TABLE jobs ADD COLUMN worker_id TEXT")

        if "owner_id" not in columns:
            db.execute(
                "ALTER TABLE jobs ADD COLUMN owner_id TEXT"
            )

        db.execute("""
            CREATE INDEX IF NOT EXISTS idx_jobs_owner
            ON jobs(owner_id)
        """)

        db.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                active INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL
            )
        """)

def create_job(filename: str, project_path: Path, owner_id: str):
    job_id = uuid.uuid4().hex

    created_at = datetime.now(
        timezone.utc
    ).isoformat()

    with get_connection() as db:
        db.execute("""
            INSERT INTO jobs (
                id,
                filename,
                status,
                created_at,
                project_path,
                owner_id
            )
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            job_id,
            filename,
            "queued",
            created_at,
            str(project_path),
            owner_id
        ))

    return get_job(job_id)


def get_job(job_id: str):
    with get_connection() as db:
        row = db.execute(
            "SELECT * FROM jobs WHERE id = ?",
            (job_id,)
        ).fetchone()

    return dict(row) if row else None


def list_jobs(owner_id=None):
    with get_connection() as db:

        if owner_id is None:
            rows = db.execute("""
                SELECT * FROM jobs
                ORDER BY created_at DESC
            """).fetchall()

        else:
            rows = db.execute("""
                SELECT * FROM jobs
                WHERE owner_id = ?
                ORDER BY created_at DESC
            """, (owner_id,)).fetchall()

    return [dict(row) for row in rows]


def update_job(job_id: str, **fields):
    allowed = {
        "status",
        "result_path",
        "error",
        "worker_id"
    }

    if not fields or not set(fields).issubset(allowed):
        raise ValueError("Campos de actualización no permitidos")

    assignments = ", ".join(
        f"{key} = ?" for key in fields
    )

    values = list(fields.values()) + [job_id]

    with get_connection() as db:
        cursor = db.execute(
            f"UPDATE jobs SET {assignments} WHERE id = ?",
            values
        )

    return cursor.rowcount > 0



def claim_next_job(worker_id: str):
    with get_connection() as db:
        db.execute("BEGIN IMMEDIATE")

        row = db.execute("""
            SELECT * FROM jobs
            WHERE status = 'queued'
            ORDER BY created_at ASC
            LIMIT 1
        """).fetchone()

        if row is None:
            return None

        job_id = row["id"]

        db.execute("""
            UPDATE jobs
            SET status = 'processing',
                worker_id = ?
            WHERE id = ?
              AND status = 'queued'
        """, (worker_id, job_id))

        updated = db.execute(
            "SELECT * FROM jobs WHERE id = ?",
            (job_id,)
        ).fetchone()

        return dict(updated)


def finish_job(job_id: str, result_path: Path):
    update_job(
        job_id,
        status="completed",
        result_path=str(result_path),
        error=None
    )


def fail_job(job_id: str, error: str):
    update_job(
        job_id,
        status="failed",
        error=error[-4000:]
    )
