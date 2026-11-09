import os
import shutil
import subprocess
from pathlib import Path
from app.core.config import settings
from .base import BaseRenderEngine

class AfterEffectsRenderEngine(BaseRenderEngine):

    @property
    def supported_extensions(self) -> set[str]:
        return {".aep"}

    def find_executable(self) -> str:
        configured = getattr(settings, "AFTER_EFFECTS_EXECUTABLE", None)
        if configured:
            executable = shutil.which(configured) or configured
            if Path(executable).is_file():
                return str(Path(executable).resolve())
            raise RuntimeError(f"No se encuentra After Effects (aerender): {configured}")

        executable = shutil.which("aerender")
        if executable:
            return executable

        candidates = [
            Path("/Applications/Adobe After Effects 2024/aerender"),
        ]
        program_files = os.environ.get("PROGRAMFILES")
        if program_files:
            candidates.extend(
                Path(program_files).glob("Adobe/Adobe After Effects*/Support Files/aerender.exe")
            )

        for candidate in candidates:
            if candidate.is_file():
                return str(candidate.resolve())

        raise RuntimeError("No se ha encontrado aerender. Configura AFTER_EFFECTS_EXECUTABLE.")

    def render(
        self,
        project_path: Path,
        output_path: Path,
        log_path: Path,
        timeout: int
    ) -> Path:
        aerender = self.find_executable()

        command = [
            aerender,
            "-project", str(project_path),
            "-output", str(output_path)
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
                    f"aerender terminó con código {result.returncode}. Consulta el log: {log_path}"
                )

            return output_path

        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Renderizado de After Effects superó el límite de {timeout} segundos.")