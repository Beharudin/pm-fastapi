from pydantic import BaseModel
from uuid import UUID
from models.enums import RoleEnum

class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: UUID
    email: str
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True