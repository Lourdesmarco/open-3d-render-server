
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class JobResponse(BaseModel):
    id: str
    filename: str
    status: str
    created_at: datetime
    result_available: bool = False
    error: Optional[str] = None
