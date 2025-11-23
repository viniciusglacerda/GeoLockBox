from typing import List
from fastapi import Depends, APIRouter
from sqlmodel import select, Session

from app.core.database import get_session
from app.utils.helpers import generate_id, get_or_404
from app.models.telemetry import Telemetry
from app.schemas.telemetry_schemas import *


router = APIRouter()


@router.post("", status_code=201)
def create_telemetry(tel: TelemetryCreate, session: Session = Depends(get_session)):
    tel_id = tel.id or generate_id("TEL")
    db_tel = Telemetry(id=tel_id, **tel.model_dump(exclude={"id"}, exclude_none=True))
    session.add(db_tel)
    session.commit()
    session.refresh(db_tel)
    return db_tel


@router.get("", response_model=List[TelemetryRead])
def list_telemetry(device_id: Optional[str] = None, session: Session = Depends(get_session)):
    q = select(Telemetry)
    if device_id:
        q = q.where(Telemetry.device_id == device_id)
    return session.exec(q).all()


@router.get("/{tel_id}", response_model=TelemetryRead)
def get_telemetry(tel_id: str, session: Session = Depends(get_session)):
    return get_or_404(session, Telemetry, tel_id)


@router.put("/{tel_id}", response_model=TelemetryRead)
def put_telemetry(tel_id: str, tel: TelemetryCreate, session: Session = Depends(get_session)):
    existing = session.get(Telemetry, tel_id)
    payload = tel.model_dump(exclude_unset=True)
    if existing:
        for k, v in payload.items():
            if k != "id":
                setattr(existing, k, v)
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    new = Telemetry(id=tel_id, **payload)
    session.add(new)
    session.commit()
    session.refresh(new)
    return new


@router.patch("/{tel_id}", response_model=TelemetryRead)
def patch_telemetry(tel_id: str, tel: TelemetryUpdate, session: Session = Depends(get_session)):
    existing = get_or_404(session, Telemetry, tel_id)
    for k, v in tel.model_dump(exclude_unset=True).items():
        setattr(existing, k, v)
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@router.delete("/{tel_id}", status_code=204)
def delete_telemetry(tel_id: str, session: Session = Depends(get_session)):
    existing = get_or_404(session, Telemetry, tel_id)
    session.delete(existing)
    session.commit()
    return