
import uuid

from datetime import datetime, timezone
from pwdlib import PasswordHash
from app.services.job_manager import get_connection

password_hasher = PasswordHash.recommended()


def create_user(
    username: str,
    password: str,
    role: str = "student"
):
    if role not in {"student", "admin"}:
        raise ValueError("Rol no válido")

    username = username.strip().lower()

    if not username:
        raise ValueError("El usuario es obligatorio")

    if len(password) < 12:
        raise ValueError(
            "La contraseña debe tener al menos 12 caracteres"
        )

    user_id = uuid.uuid4().hex
    password_hash = password_hasher.hash(password)

    created_at = datetime.now(timezone.utc).isoformat()

    with get_connection() as db:
        db.execute("""
            INSERT INTO users (
                id, username, password_hash,
                role, active, created_at
            )
            VALUES (?, ?, ?, ?, 1, ?)
        """, (
            user_id,
            username,
            password_hash,
            role,
            created_at
        ))

    return get_user_by_id(user_id)


def get_user_by_id(user_id: str):
    with get_connection() as db:
        row = db.execute("""
            SELECT id, username, role, active, created_at
            FROM users
            WHERE id = ?
        """, (user_id,)).fetchone()

    return dict(row) if row else None


def get_user_by_username(username: str):
    with get_connection() as db:
        row = db.execute("""
            SELECT *
            FROM users
            WHERE username = ?
        """, (username.strip().lower(),)).fetchone()

    return dict(row) if row else None


def verify_password(password: str, password_hash: str) -> bool:
    return password_hasher.verify(password, password_hash)


def get_all_users() -> list[dict]:
    """
    Obtiene todos los usuarios registrados en la base de datos (excluyendo la contraseña).
    """
    with get_connection() as db:
        rows = db.execute("""
            SELECT id, username, role, active, created_at
            FROM users
            ORDER BY created_at DESC
        """).fetchall()

    return [dict(row) for row in rows]


def update_role(user_id: str, new_role: str) -> bool:
    """
    Actualiza el rol de un usuario ('student', 'admin').
    """
    if new_role not in {"student", "admin"}:
        raise ValueError("Rol no válido")

    with get_connection() as db:
        cursor = db.execute("""
            UPDATE users
            SET role = ?
            WHERE id = ?
        """, (new_role, user_id))

    return cursor.rowcount > 0


def delete_user(user_id: str) -> bool:
    """
    Elimina a un usuario de la base de datos por su ID.
    """
    with get_connection() as db:
        cursor = db.execute("""
            DELETE FROM users
            WHERE id = ?
        """, (user_id,))

    return cursor.rowcount > 0