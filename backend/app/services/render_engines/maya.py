import os
import shutil
import subprocess
from pathlib import Path
from app.core.config import settings
from .base import BaseRenderEngine

class MayaRenderEngine(BaseRenderEngine):

    @property
    def supported_extensions(self) -> set[str]:
        return {".ma", ".mb"}

    def find_executable(self) -> str:
        configured = getattr(settings, "MAYA_EXECUTABLE", None)
        if configured:
            executable = shutil.which(configured) or configured
            if Path(executable).is_file():
                return str(Path(executable).resolve())
            raise RuntimeError(f"No se encuentra Maya Render: {configured}")

        executable = shutil.which("render") or shutil.which("MayaRender")
        if executable:
            return executable

        candidates = [
            Path("/Applications/Autodesk/maya2024/Maya.app/Contents/bin/Render"),
        ]
        program_files = os.environ.get("PROGRAMFILES")
        if program_files:
            candidates.extend(
                Path(program_files).glob("Autodesk/Maya*/bin/Render.exe")
            )

        for candidate in candidates:
            if candidate.is_file():
                return str(candidate.resolve())

        raise RuntimeError("No se ha encontrado Maya Render. Configura MAYA_EXECUTABLE.")

    def render(
        self,
        project_path: Path,
        output_path: Path,
        log_path: Path,
        timeout: int
    ) -> Path:
        maya_exec = self.find_executable()

        # Render de Maya en segundo plano (usando renderizador Arnold por defecto)
        command = [
            maya_exec,
            "-r", "arnold",
            "-rd", str(output_path.parent),
            "-im", output_path.stem,
            str(project_path)
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
                    f"Maya Render terminó con código {result.returncode}. Consulta el log: {log_path}"
                )

            return output_path

        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Renderizado de Maya superó el límite de {timeout} segundos.")