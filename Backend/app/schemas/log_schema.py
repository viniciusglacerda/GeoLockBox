from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class LogBase(BaseModel):
    event_type: str = Field(..., description="Tipo do evento (info, warning, error)")
    message: str = Field(..., description="Mensagem descritiva do log")
    source: Optional[str] = Field(None, description="Origem do log (ex: device_id, módulo, API, etc)")


class LogCreate(LogBase):
    pass


class LogResponse(LogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
