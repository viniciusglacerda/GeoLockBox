from sqlmodel import SQLModel, Field
from typing import Optional


class User(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True)

    username: str
    password: str
    name: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
