from typing import List
from fastapi import Depends, APIRouter
from sqlmodel import select, Session

from app.core.database import get_session
from app.utils.helpers import generate_id, get_or_404
from app.models.log import Log
from app.schemas.log_schema import *


router = APIRouter()


@router.post("", response_model=LogRead, status_code=201)
def create_log(log: LogCreate, session: Session = Depends(get_session)):
    log_id = log.id or generate_id("LOG")
    db_log = Log(id=log_id, **log.model_dump(exclude={"id"}, exclude_none=True))
    session.add(db_log)
    session.commit()
    session.refresh(db_log)
    return db_log


@router.get("", response_model=List[LogRead])
def list_logs(session: Session = Depends(get_session)):
    return session.exec(select(Log)).all()


@router.get("/{log_id}", response_model=LogRead)
def get_log(log_id: str, session: Session = Depends(get_session)):
    return get_or_404(session, Log, log_id)


@router.put("/{log_id}", response_model=LogRead)
def put_log(log_id: str, log: LogCreate, session: Session = Depends(get_session)):
    existing = session.get(Log, log_id)
    payload = log.model_dump(exclude_unset=True)
    if existing:
        for k, v in payload.items():
            if k != "id":
                setattr(existing, k, v)
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing
    new = Log(id=log_id, **payload)
    session.add(new)
    session.commit()
    session.refresh(new)
    return new


@router.patch("/{log_id}", response_model=LogRead)
def patch_log(log_id: str, log: LogUpdate, session: Session = Depends(get_session)):
    existing = get_or_404(session, Log, log_id)
    for k, v in log.model_dump(exclude_unset=True).items():
        setattr(existing, k, v)
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@router.delete("/{log_id}", status_code=204)
def delete_log(log_id: str, session: Session = Depends(get_session)):
    existing = get_or_404(session, Log, log_id)
    session.delete(existing)
    session.commit()
    return