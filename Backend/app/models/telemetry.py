from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


class Telemetry(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)

    device_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    speed: Optional[float] = None
    battery_level: Optional[int] = None
    timestamp: Optional[datetime] = None
