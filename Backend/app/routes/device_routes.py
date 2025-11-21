from typing import List
from fastapi import Depends, APIRouter
from sqlmodel import select, Session
from datetime import datetime, timezone

from app.core.database import get_session
from app.utils.helpers import generate_id, get_or_404
from app.services.lock_services import is_in_geofence
from app.models.device import Device
from app.models.delivery import Delivery
from app.schemas.device_schema import *


router = APIRouter()


@router.post("", response_model=DeviceRead, status_code=201)
def create_device(device: DeviceCreate, session: Session = Depends(get_session)):
    device_id = device.id or generate_id("BOX")
    db_device = Device(id=device_id, **device.model_dump(exclude={"id"}, exclude_none=True))
    session.add(db_device)
    session.commit()
    session.refresh(db_device)
    return db_device


@router.get("", response_model=List[DeviceRead])
def list_devices(session: Session = Depends(get_session)):
    return session.exec(select(Device)).all()


@router.get("/{device_id}", response_model=DeviceRead)
def get_device(device_id: str, session: Session = Depends(get_session)):
    return get_or_404(session, Device, device_id)


@router.put("/{device_id}", response_model=DeviceRead)
def put_device(device_id: str, device: DeviceCreate, session: Session = Depends(get_session)):
    existing = session.get(Device, device_id)
    payload = device.model_dump(exclude_unset=True)
    if existing:
        for k, v in payload.items():
            if k != "id":
                setattr(existing, k, v)
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    new = Device(id=device_id, **payload)
    session.add(new)
    session.commit()
    session.refresh(new)
    return new


@router.patch("/{device_id}", response_model=DeviceRead)
def patch_device(device_id: str, device: DeviceUpdate, session: Session = Depends(get_session)):
    existing = get_or_404(session, Device, device_id)
    for k, v in device.model_dump(exclude_unset=True).items():
        setattr(existing, k, v)

    existing.last_update = datetime.now(timezone.utc)

    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@router.delete("/{device_id}", status_code=204)
def delete_device(device_id: str, session: Session = Depends(get_session)):
    existing = get_or_404(session, Device, device_id)
    session.delete(existing)
    session.commit()
    return


@router.get("/{device_id}/lock")
def get_device(device_id: str, session: Session = Depends(get_session)):
    device = get_or_404(session, Device, device_id)

    delivery = session.exec(
        select(Delivery).where(Delivery.device_id == device_id)
    ).first()

    if not delivery:
        return {"lock": "close"}

    in_area = is_in_geofence(device, delivery)

    lock_state = "open" if in_area or device.active else "close"

    return {"lock": lock_state}
