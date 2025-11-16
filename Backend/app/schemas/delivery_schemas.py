from sqlmodel import SQLModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class Geofence(SQLModel):
    center: List[float]
    radius_m: float


class DeliveryBase(SQLModel):
    order_number: Optional[str] = None
    receiver_name: Optional[str] = None

    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None

    status: Optional[str] = None

    device_id: Optional[str] = None
    driver_id: Optional[str] = None

    dest_lat: Optional[float] = None
    dest_lon: Optional[float] = None

    geofence_radius: Optional[float] = None
    geofence: Optional[Dict[str, Any]] = None

    created_at: Optional[datetime] = None
    eta_minutes: Optional[int] = None


class DeliveryCreate(DeliveryBase):
    id: Optional[str] = None


class DeliveryRead(DeliveryBase):
    id: str


class DeliveryUpdate(SQLModel):
    order_number: Optional[str] = None
    receiver_name: Optional[str] = None

    address_street: Optional[str] = None
    address_number: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_zip: Optional[str] = None

    status: Optional[str] = None

    device_id: Optional[str] = None
    driver_id: Optional[str] = None

    dest_lat: Optional[float] = None
    dest_lon: Optional[float] = None

    geofence_radius: Optional[float] = None
    geofence: Optional[Dict[str, Any]] = None

    created_at: Optional[datetime] = None
    eta_minutes: Optional[int] = None
