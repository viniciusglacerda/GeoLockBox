from sqlmodel import SQLModel
from pydantic import BaseModel
from typing import Optional


class UserBase(SQLModel):
    username: str
    password: str
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None


class UserCreate(UserBase):
    id: Optional[str] = None


class UserRead(UserBase):
    id: str


class UserUpdate(SQLModel):
    username: Optional[str] = None
    password: Optional[str] = None
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None

class Token(BaseModel):
    user: UserBase
    access_token: str
    token_type: str = "bearer"
