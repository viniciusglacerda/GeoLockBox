from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from typing import Optional, Dict, Any
from datetime import datetime


class Log(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)

    level: Optional[str] = None
    message: Optional[str] = None
    timestamp: Optional[datetime] = None

    extra: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )
