from typing import List
from fastapi import Depends, APIRouter
from sqlmodel import select, Session

from app.core.database import get_session
from app.utils.helpers import generate_id, get_or_404
from app.models.delivery import Delivery
from app.schemas.delivery_schemas import *


router = APIRouter()


@router.post("", response_model=DeliveryRead, status_code=201)
def create_delivery(delivery: DeliveryCreate, session: Session = Depends(get_session)):
    delivery_id = delivery.id or generate_id("DEL")
    db_delivery = Delivery(id=delivery_id, **delivery.model_dump(exclude={"id"}, exclude_none=True))
    session.add(db_delivery)
    session.commit()
    session.refresh(db_delivery)
    return db_delivery


@router.get("", response_model=List[DeliveryRead])
def list_deliveries(session: Session = Depends(get_session)):
    return session.exec(select(Delivery)).all()


@router.get("/{delivery_id}", response_model=DeliveryRead)
def get_delivery(delivery_id: str, session: Session = Depends(get_session)):
    return get_or_404(session, Delivery, delivery_id)


@router.put("/{delivery_id}", response_model=DeliveryRead)
def put_delivery(delivery_id: str, delivery: DeliveryCreate, session: Session = Depends(get_session)):
    existing = session.get(Delivery, delivery_id)
    payload = delivery.model_dump(exclude_unset=True)
    if existing:
        for k, v in payload.items():
            if k != "id":
                setattr(existing, k, v)
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    new = Delivery(id=delivery_id, **payload)
    session.add(new)
    session.commit()
    session.refresh(new)
    return new


@router.patch("/{delivery_id}", response_model=DeliveryRead)
def patch_delivery(delivery_id: str, delivery: DeliveryUpdate, session: Session = Depends(get_session)):
    existing = get_or_404(session, Delivery, delivery_id)
    for k, v in delivery.model_dump(exclude_unset=True).items():
        setattr(existing, k, v)
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@router.delete("/{delivery_id}", status_code=204)
def delete_delivery(delivery_id: str, session: Session = Depends(get_session)):
    existing = get_or_404(session, Delivery, delivery_id)
    session.delete(existing)
    session.commit()
    return
