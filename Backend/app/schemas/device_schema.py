from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DeviceBase(BaseModel):
    name: str = Field(..., example="Locker 01")
    status: Optional[str] = Field(default="idle", example="locked")
    latitude: Optional[float] = Field(default=None, example=-19.9208)
    longitude: Optional[float] = Field(default=None, example=-43.9378)
    battery_level: Optional[float] = Field(default=None, example=85.0)
    active: Optional[bool] = Field(default=True)


class DeviceCreate(DeviceBase):
    assigned_user_id: Optional[int] = Field(default=None, example=1)


class DeviceUpdate(BaseModel):
    name: Optional[str]
    status: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    battery_level: Optional[float]
    active: Optional[bool]
    assigned_user_id: Optional[int]


class DeviceInDB(DeviceBase):
    id: int
    assigned_user_id: Optional[int]
    last_update: datetime

    class Config:
        from_attributes = True


class DeviceResponse(DeviceInDB):
    pass
