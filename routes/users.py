from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.response import format_response
from services.user_service import get_all_users, get_user_by_id
from dependencies.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def list_users(db: Session = Depends(get_db), user=Depends(get_current_user)):
    users = get_all_users(db)
    message = "No users found" if not users else "Users retrieved successfully"
    return format_response(message=message, data=users)

@router.get("/{user_id}")
def get_user(user_id, db: Session = Depends(get_db), user=Depends(get_current_user)):
    user_data = get_user_by_id(db, user_id)
    if not user_data:
        raise HTTPException(status_code=404, detail="User not found")
    return format_response(message="User retrieved successfully", data=user_data)