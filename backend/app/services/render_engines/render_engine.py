from pathlib import Path
from app.services.render_engines.base import BaseRenderEngine
from app.services.render_engines.blender import BlenderRenderEngine
from app.services.render_engines.cinema import Cinema4DRenderEngine
from app.services.render_engines.maya import MayaRenderEngine
from app.services.render_engines.after_effects import AfterEffectsRenderEngine

# Registro de motores disponibles
REGISTERED_ENGINES: list[BaseRenderEngine] = [
    BlenderRenderEngine(),
    Cinema4DRenderEngine(),
    MayaRenderEngine(),
    AfterEffectsRenderEngine(),
]

def get_engine_for_file(project_path: Path) -> BaseRenderEngine:
    """Busca el motor adecuado según la extensión del archivo."""
    for engine in REGISTERED_ENGINES:
        if engine.can_handle(project_path):
            return engine

    raise ValueError(
        f"Formato no soportado: '{project_path.suffix}'. "
        f"Extensiones válidas: {get_supported_extensions()}"
    )

def get_supported_extensions() -> set[str]:
    """Obtiene todas las extensiones soportadas por los motores registrados."""
    extensions = set()
    for engine in REGISTERED_ENGINES:
        extensions.update(engine.supported_extensions)
    return extensions

def render_project(
    project_path: Path,
    output_path: Path,
    log_path: Path,
    timeout: int,
    render_type: str = "2d"
) -> Path:
    """Delegación transparente al motor especializado."""
    engine = get_engine_for_file(project_path)
    return engine.render(
        project_path=project_path,
        output_path=output_path,
        log_path=log_path,
        timeout=timeout,
        render_type=render_type
    )