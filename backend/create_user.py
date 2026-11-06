
from getpass import getpass

from app.services.job_manager import initialize_database
from app.services.user_manager import create_user


def main():
    initialize_database()

    print("\nOPEN 3D RENDER — Crear usuario\n")

    username = input("Nombre de usuario: ").strip()
    password = getpass("Contraseña: ")
    confirmation = getpass("Repetir contraseña: ")

    if password != confirmation:
        print("Las contraseñas no coinciden.")
        return

    try:
        user = create_user(
            username=username,
            password=password,
            role="student"
        )

        print("\nUsuario creado correctamente.")
        print(f"Usuario: {user['username']}")
        print(f"Rol: {user['role']}")

    except Exception as error:
        print(f"\nError: {error}")


if __name__ == "__main__":
    main()
