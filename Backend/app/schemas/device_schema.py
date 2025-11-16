from sqlmodel import SQLModel
from typing import Optional
from datetime import datetime


class DeviceBase(SQLModel):
    name: Optional[str] = None
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    battery_level: Optional[int] = None
    last_update: Optional[datetime] = None
    active: Optional[bool] = None
    assigned_user_id: Optional[str] = None


class DeviceCreate(DeviceBase):
    id: Optional[str] = None


class DeviceRead(DeviceBase):
    id: str


class DeviceUpdate(SQLModel):
    name: Optional[str] = None
    status: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    battery_level: Optional[int] = None
    last_update: Optional[datetime] = None
    active: Optional[bool] = None
    assigned_user_id: Optional[str] = None
