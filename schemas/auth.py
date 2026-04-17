from pydantic import BaseModel, field_validator, Field
from typing import Generic, TypeVar
from models.enums import RoleEnum
from uuid import UUID

T = TypeVar("T")

class BaseResponse(BaseModel, Generic[T]):
    message: str
    status: str
    data: T

class RegisterRequest(BaseModel):
    email: str = Field(..., description="User's email address")
    password: str = Field(..., description="User's password", min_length=6)
    is_active: bool = Field(default=True, description="Indicates if the user is active")
    
    @field_validator("password")
    def validate_password(cls, value):
        if value is None:
            raise ValueError("Password cannot be None")
        if not isinstance(value, str):
            raise ValueError("Password must be a string")
        if len(value.encode('utf-8')) > 72:
            raise ValueError("Password must be less than 72 bytes")
        return value
    
    @field_validator("email")
    def validate_email(cls, value):
        if value is None:
            raise ValueError("Email cannot be None")
        if not isinstance(value, str):
            raise ValueError("Email must be a string")
        return value

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserResponse(BaseModel):
    id: UUID
    email: str
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True

class RegisterResponse(BaseResponse[UserResponse]):
    pass

class LoginResponse(BaseResponse[TokenResponse]):
    pass

class AdminRegisterRequest(BaseModel):
        email: str = Field(..., description="User's email address")
        password: str = Field(..., description="User's password", min_length=6)
        is_active: bool = Field(default=True, description="Indicates if the user is active")
        role: str = Field(default="member", description="User role (e.g., admin, manager, member)")