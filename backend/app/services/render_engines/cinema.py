import os
import shutil
import subprocess
from pathlib import Path
from app.core.config import settings
from .base import BaseRenderEngine

class Cinema4DRenderEngine(BaseRenderEngine):

    @property
    def supported_extensions(self) -> set[str]:
        return {".c4d"}

    def find_executable(self) -> str:
        configured = getattr(settings, "C4D_EXECUTABLE", None)
        if configured:
            executable = shutil.which(configured) or configured
            if Path(executable).is_file():
                return str(Path(executable).resolve())
            raise RuntimeError(f"No se encuentra Cinema 4D: {configured}")

        executable = shutil.which("Commandline") or shutil.which("CINEMA 4D")
        if executable:
            return executable

        # Rutas habituales según SO
        candidates = [
            Path("/Applications/Maxon Cinema 4D 2024/Commandline.app/Contents/MacOS/Commandline"),
        ]
        program_files = os.environ.get("PROGRAMFILES")
        if program_files:
            candidates.extend(
                Path(program_files).glob("Maxon Cinema 4D*/Commandline.exe")
            )

        for candidate in candidates:
            if candidate.is_file():
                return str(candidate.resolve())

        raise RuntimeError("No se ha encontrado Cinema 4D Commandline. Configura C4D_EXECUTABLE.")

    def render(
        self,
        project_path: Path,
        output_path: Path,
        log_path: Path,
        timeout: int
    ) -> Path:
        c4d_exec = self.find_executable()

        command = [
            c4d_exec,
            "-render", str(project_path),
            "-oimage", str(output_path)
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
                    f"Cinema 4D terminó con código {result.returncode}. Consulta el log: {log_path}"
                )

            return output_path

        except subprocess.TimeoutExpired:
            raise RuntimeError(f"Renderizado de Cinema 4D superó el límite de {timeout} segundos.")