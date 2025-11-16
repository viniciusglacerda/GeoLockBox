from typing import List
from fastapi import Depends, APIRouter
from sqlmodel import select, Session

from app.core.database import get_session
from app.utils.helpers import generate_id, get_or_404
from app.models.user import *
from app.schemas.user_schema import *


router = APIRouter()


@router.post("", response_model=UserRead, status_code=201)
def create_user(user: UserCreate, session: Session = Depends(get_session)):
    user_id = user.id or generate_id("USR")
    db_user = User(id=user_id, **user.model_dump(exclude={"id"}, exclude_none=True))
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


@router.get("", response_model=List[UserRead])
def list_users(session: Session = Depends(get_session)):
    users = session.exec(select(User)).all()
    return users


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: str, session: Session = Depends(get_session)):
    return get_or_404(session, User, user_id)


@router.put("/{user_id}", response_model=UserRead)
def put_user(user_id: str, user: UserCreate, session: Session = Depends(get_session)):
    existing = session.get(User, user_id)
    payload = user.model_dump(exclude_unset=True)
    if existing:
        for k, v in payload.items():
            if k != "id":
                setattr(existing, k, v)
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    new = User(id=user_id, **payload)
    session.add(new)
    session.commit()
    session.refresh(new)
    return new


@router.patch("/{user_id}", response_model=UserRead)
def patch_user(user_id: str, user: UserUpdate, session: Session = Depends(get_session)):
    existing = get_or_404(session, User, user_id)
    for k, v in user.model_dump(exclude_unset=True).items():
        setattr(existing, k, v)
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, session: Session = Depends(get_session)):
    existing = get_or_404(session, User, user_id)
    session.delete(existing)
    session.commit()
    return