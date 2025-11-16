import uuid
from fastapi import HTTPException
from sqlmodel import SQLModel, Session

def get_or_404(session: Session, model, id: str):
    obj = session.get(model, id)
    if not obj:
        raise HTTPException(status_code=404, detail=f"{model.__name__} {id} not found")
    return obj


def create_db_and_tables(engine):
    SQLModel.metadata.create_all(engine)


def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"