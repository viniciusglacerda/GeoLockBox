from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime


class TelemetryBase(SQLModel):
    device_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    speed: Optional[float] = None
    battery_level: Optional[int] = None
    timestamp: Optional[datetime] = None


class TelemetryCreate(TelemetryBase):
    id: Optional[str] = None


class TelemetryRead(TelemetryBase):
    id: str


class TelemetryUpdate(SQLModel):
    device_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    speed: Optional[float] = None
    battery_level: Optional[int] = None
    timestamp: Optional[datetime] = None
