
from datetime import datetime, timedelta, timezone

import jwt

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.services.user_manager import get_user_by_id


bearer_scheme = HTTPBearer(auto_error=False)


def create_access_token(user_id: str) -> str:
    secret = settings.JWT_SECRET_KEY

    if not secret or len(secret) < 32:
        raise RuntimeError(
            "JWT_SECRET_KEY no está configurada correctamente"
        )

    expires = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "exp": expires,
        "iat": datetime.now(timezone.utc),
    }

    return jwt.encode(
        payload,
        secret,
        algorithm="HS256"
    )


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)
):
    token = None

    # 1. Leer de la cookie de sesión
    cookie_token = request.cookies.get("access_token")
    if cookie_token:
        # Por si el valor guardado es "Bearer <token>" o solo el "<token>"
        token = cookie_token.replace("Bearer ", "").strip()

    # 2. Fallback por si viene en cabecera Authorization
    elif credentials:
        token = credentials.credentials

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticación requerida",
            headers={"WWW-Authenticate": "Bearer"}
        )

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=["HS256"]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise ValueError("Token sin identidad")

    except (jwt.InvalidTokenError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión no válida o expirada",
            headers={"WWW-Authenticate": "Bearer"}
        )

    user = get_user_by_id(user_id)

    if not user or not user["active"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario inexistente o desactivado"
        )

    return user


def require_roles(*roles: str):
    def role_checker(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta operación"
            )

        return user

    return role_checker
