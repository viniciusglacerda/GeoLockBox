from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    name: str = Field(..., example="João Silva")
    email: EmailStr = Field(..., example="joao.silva@email.com")
    role: Optional[str] = Field(default="receiver", example="sender")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, example="senhaSegura123")

class UserLogin(BaseModel):
    email: EmailStr = Field(..., example="joao.silva@email.com")
    password: str = Field(..., min_length=6, example="senhaSegura123")

class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Schema de token ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
