from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from services.user_service import get_all_users, get_user_by_id
from dependencies.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/")
def list_users(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_all_users(db)

@router.get("/{user_id}")
def get_user(user_id, db: Session = Depends(get_db), user=Depends(get_current_user)):
    return get_user_by_id(db, user_id)