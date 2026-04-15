from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.response import format_response
from dependencies.auth import get_current_user
from dependencies.rbac import require_roles
from services.project_service import create_project

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/")
def create_project_route(name: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["admin", "manager"])
    project = create_project(db, name, user.id)
    return format_response(message="Project created successfully", data=project)