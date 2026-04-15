from pydantic import BaseModel
from typing import Generic, TypeVar

T = TypeVar("T")

class BaseResponse(BaseModel, Generic[T]):
    message: str
    status: str
    data: T

class RegisterRequest(BaseModel):
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class RegisterResponse(BaseResponse[UserResponse]):
    pass

class LoginResponse(BaseResponse[TokenResponse]):
    pass