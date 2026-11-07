from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from app.core.security import require_admin
from app.services import user_manager  # Tu servicio de gestión de usuarios

router = APIRouter(prefix="/users", tags=["Users Management"])


class UpdateUserRoleSchema(BaseModel):
    role: str  # "admin" o "user"

@router.get("", summary="List all users (Only Admin)")
def list_all_users(admin: dict = Depends(require_admin)):
    """Obtiene la lista completa de usuarios registrados."""
    return user_manager.get_all_users()



@router.patch("/{user_id}/role", summary="Update role (Only Admin)")
def update_user_role(user_id: str, payload: UpdateUserRoleSchema, admin: dict = Depends(require_admin)):
    """Cambia el rol de un usuario."""
    updated = user_manager.update_role(user_id, payload.role)
    if not updated:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": f"Rol actualizado a {payload.role}"}



@router.delete("/{user_id}", summary="Delete user (Only Admin)")
def delete_user(user_id: str, admin: dict = Depends(require_admin)):
    """Elimina a un usuario del sistema."""
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="No puedes eliminar tu propio usuario")
    
    deleted = user_manager.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"message": "Usuario eliminado correctamente"}



class CreateUserSchema(BaseModel):
    username: str
    password: str
    role: str | None = "student"  # "student" o "admin"

@router.post("", status_code=status.HTTP_201_CREATED, summary="Create user (Only Admin)")
def create_new_user(payload: CreateUserSchema, admin: dict = Depends(require_admin)):
    """Crea un nuevo usuario en el sistema."""
    try:
        new_user = user_manager.create_user(
            username=payload.username,
            password=payload.password,
            role=payload.role
        )
        return new_user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )