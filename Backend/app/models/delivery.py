from sqlmodel import SQLModel, Field, Column
from typing import Optional, Dict, Any
from sqlalchemy import JSON
from datetime import datetime


class Delivery(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)

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

    geofence: Optional[Dict[str, Any]] = Field(
        default=None,
        sa_column=Column(JSON)
    )

    created_at: Optional[datetime] = None
    eta_minutes: Optional[int] = None
