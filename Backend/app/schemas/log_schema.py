from sqlmodel import SQLModel
from typing import Optional, Dict, Any
from datetime import datetime


class LogBase(SQLModel):
    level: Optional[str] = None
    message: Optional[str] = None
    timestamp: Optional[datetime] = None
    extra: Optional[Dict[str, Any]] = None


class LogCreate(LogBase):
    id: Optional[str] = None


class LogRead(LogBase):
    id: str


class LogUpdate(SQLModel):
    level: Optional[str] = None
    message: Optional[str] = None
    timestamp: Optional[datetime] = None
    extra: Optional[Dict[str, Any]] = None
