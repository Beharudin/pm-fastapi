from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from dependencies.auth import get_current_user
from dependencies.rbac import require_roles
from models.project import Project

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/")
def create_project(name: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    require_roles(user, ["admin", "manager"])
    project = Project(name=name, owner_id=user.id)
    db.add(project)
    db.commit()
    return project