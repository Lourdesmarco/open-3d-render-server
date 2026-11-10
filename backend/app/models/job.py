
from dataclasses import dataclass
from typing import Optional


@dataclass
class RenderJob:
    id: str
    filename: str
    status: str
    created_at: str
    project_path: str
    result_path: Optional[str] = None
    error: Optional[str] = None
    render_type = Column(String, default="2d")


# initial status
#-------------------
# queued: pending
# processing: processing
# completed: finished
# failed: error
# cancelled: cancelled