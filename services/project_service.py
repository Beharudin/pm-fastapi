from sqlalchemy.orm import Session
from models.project import Project

def create_project(db: Session, name: str, owner_id):
    project = Project(name=name, owner_id=owner_id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

def get_projects(db: Session, owner_id=None):
    query = db.query(Project)
    if owner_id:
        query = query.filter(Project.owner_id == owner_id)
    return query.all()

def get_project_by_id(db: Session, project_id):
    return db.query(Project).filter(Project.id == project_id).first()