
import os
import shutil
import subprocess

from pathlib import Path

from app.core.config import settings


def find_blender() -> str:
    # 1. Ruta configurada por el usuario
    configured = settings.BLENDER_EXECUTABLE

    if configured:
        executable = shutil.which(configured) or configured

        if Path(executable).is_file():
            return str(Path(executable).resolve())

        raise RuntimeError(
            f"No se encuentra Blender: {configured}"
        )

    # 2. Ejecutable disponible en PATH
    executable = shutil.which("blender")

    if executable:
        return executable

    # 3. Instalaciones habituales de macOS
    candidates = [
        Path("/Applications/Blender.app/Contents/MacOS/Blender"),
    ]

    # 4. Instalaciones habituales de Windows
    program_files = os.environ.get("PROGRAMFILES")

    if program_files:
        candidates.extend(
            Path(program_files).glob(
                "Blender Foundation/Blender*/blender.exe"
            )
        )

    for candidate in candidates:
        if candidate.is_file():
            return str(candidate.resolve())

    raise RuntimeError(
        "No se ha encontrado Blender. "
        "Configura BLENDER_EXECUTABLE."
    )


def render_project(
    project_path: Path,
    output_path: Path,
    log_path: Path,
    timeout: int
):
    blender = find_blender()

    script_path = project_path.parent / "_render_job.py"

    script = r"""
import bpy
import sys

args = sys.argv[sys.argv.index("--") + 1:]
output_path = args[0]

scene = bpy.context.scene

if scene.camera is None:
    raise RuntimeError("La escena no tiene una cámara activa")

scene.render.image_settings.file_format = "PNG"
scene.render.filepath = output_path

# Intentar utilizar GPU cuando el motor sea Cycles.
if scene.render.engine == "CYCLES":
    try:
        prefs = bpy.context.preferences.addons[
            "cycles"
        ].preferences

        for device_type in ("OPTIX", "CUDA", "METAL", "HIP"):
            try:
                prefs.compute_device_type = device_type
                prefs.get_devices()

                devices = list(prefs.devices)
                gpu_devices = [
                    device for device in devices
                    if device.type != "CPU"
                ]

                if gpu_devices:
                    for device in devices:
                        device.use = device.type != "CPU"

                    scene.cycles.device = "GPU"
                    break

            except Exception:
                continue

    except Exception:
        pass

bpy.ops.render.render(write_still=True)
"""

    script_path.write_text(script, encoding="utf-8")

    command = [
        blender,
        "--background",
        "--disable-autoexec",
        str(project_path),
        "--python-exit-code", "1",
        "--python", str(script_path),
        "--",
        str(output_path)
    ]

    try:
        with log_path.open("w", encoding="utf-8") as log:
            result = subprocess.run(
                command,
                stdout=log,
                stderr=subprocess.STDOUT,
                timeout=timeout,
                cwd=str(project_path.parent),
                check=False
            )

        if result.returncode != 0:
            raise RuntimeError(
                f"Blender terminó con código {result.returncode}. "
                f"Consulta el log: {log_path}"
            )

        if not output_path.is_file():
            raise RuntimeError(
                "Blender terminó sin generar la imagen."
            )

        return output_path

    except subprocess.TimeoutExpired:
        raise RuntimeError(
            f"Renderizado superó el límite de {timeout} segundos."
        )

    finally:
        script_path.unlink(missing_ok=True)
