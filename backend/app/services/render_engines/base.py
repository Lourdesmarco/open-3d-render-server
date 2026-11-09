from abc import ABC, abstractmethod
from pathlib import Path

class BaseRenderEngine(ABC):
    
    @property
    @abstractmethod
    def supported_extensions(self) -> set[str]:
        """Devuelve las extensiones que soporta este motor (ej: {'.blend'})."""
        pass

    def can_handle(self, project_path: Path) -> bool:
        """Comprueba si el motor puede procesar el archivo."""
        return project_path.suffix.lower() in self.supported_extensions

    @abstractmethod
    def render(
        self,
        project_path: Path,
        output_path: Path,
        log_path: Path,
        timeout: int
    ) -> Path:
        """Ejecuta el renderizado y devuelve la ruta de salida generada."""
        pass