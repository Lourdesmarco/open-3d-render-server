
from getpass import getpass

from app.services.job_manager import initialize_database
from app.services.user_manager import create_user


def main():
    initialize_database()

    print("\nOPEN 3D RENDER — Crear administrador\n")

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
            role="admin"
        )

        print("\nAdministrador creado correctamente.")
        print(f"Usuario: {user['username']}")
        print(f"Identificador: {user['id']}")

    except ValueError as error:
        print(f"\nError: {error}")

    except Exception as error:
        print(f"\nNo se pudo crear el usuario: {error}")


if __name__ == "__main__":
    main()
