from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.response import format_response
from dependencies.rbac import require_roles
from schemas.auth import BaseResponse, UserResponse
from services.user_service import get_all_users, get_user_by_id
from dependencies.auth import get_current_user
from models.enums import RoleEnum

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=BaseResponse[list[UserResponse]])
def list_users(db: Session = Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, allowed_roles=["admin", "manager"])
    users = get_all_users(db)
    message = "No users found" if not users else "Users retrieved successfully"
    return format_response(message=message, data=users)

@router.get("/{user_id}", response_model=BaseResponse[UserResponse])
def get_user(user_id, db: Session = Depends(get_db), user=Depends(get_current_user)):
    user_data = get_user_by_id(db, user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    print(f"Current user: {user.email} (ID: {user.id}, Role: {user.role})")
    print(f"Owner user: {user_data.email} (ID: {user_data.id}, Role: {user_data.role})")
    if(str(user.id) != str(user_data.id) and user.role not in [RoleEnum.admin, RoleEnum.manager]):
        raise HTTPException(status_code=403, detail="Forbidden: Not authorized for this action")

    return format_response(message="User retrieved successfully", data=user_data)