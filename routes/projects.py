from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from core.response import format_response
from dependencies.auth import get_current_user
from dependencies.rbac import require_roles
from services.project_service import create_project
from models.project import Project
from schemas.project import ProjectCreate

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/")
def create_project_route(payload: ProjectCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["admin", "manager"])
    project = create_project(db, payload.name, user.id)
    return format_response(message="Project created successfully", data=project)


@router.get("/")
def get_projects(db: Session = Depends(get_db), user=Depends(get_current_user)):
    projects = db.query(Project).filter(Project.owner_id == user.id).all()
    return format_response(message="Projects retrieved successfully", data=projects)