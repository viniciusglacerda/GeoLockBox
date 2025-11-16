import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from app.core.database import get_session
from app.models.user import User
from app.utils.security import create_access_token
from app.schemas.user_schema import UserCreate, UserRead, Token

router = APIRouter()

@router.post("/register", response_model=UserRead, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_session)):
    statement = select(User).where(User.email == user.email)
    existing_user = db.exec(statement).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = User(
        id=f"USR-{uuid.uuid4().hex[:8].upper()}",
        username=user.username,
        name=user.name,
        role=user.role,
        email=user.email,
        password=user.password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    # Procura usuário por email
    statement = select(User).where(User.email == form_data.username)
    user = db.exec(statement).first()
    
    if not user or not form_data.password == user.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
