from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.response import format_response
from dependencies.auth import get_current_user
from dependencies.rbac import require_roles
from models.enums import RoleEnum
from schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RegisterResponse, LoginResponse, UserResponse, AdminRegisterRequest
from services.auth_service import register_user, authenticate_user, register_admin
from core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=RegisterResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, payload.email, payload.password, is_active=payload.is_active if payload.is_active is not None else True)
    user_data = UserResponse(id=str(user.id), email=user.email, role=user.role.value, is_active=user.is_active)
    return format_response(message="User created successfully", data=user_data)


@router.post("/admin/register", response_model=RegisterResponse)
def register(payload: AdminRegisterRequest, db: Session = Depends(get_db), admin_user=Depends(get_current_user)):
    require_roles(admin_user, ["admin"])
    user = register_admin(db, email=payload.email, password=payload.password, role=payload.role if payload.role else RoleEnum.MEMBER, is_active=payload.is_active if payload.is_active is not None else True)
    user_data = UserResponse(id=str(user.id), email=user.email, role=user.role.value, is_active=user.is_active)
    return format_response(message="User created successfully", data=user_data)

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user.id)})
    token_data = TokenResponse(access_token=token)
    return format_response(message="Login successful", data=token_data)