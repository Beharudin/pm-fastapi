from sqlalchemy.orm import Session
from models.task import Task

def create_task(db: Session, data):
    task = Task(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

def get_tasks(db: Session, project_id=None):
    query = db.query(Task)
    if project_id:
        query = query.filter(Task.project_id == project_id)
    return query.all()

def update_task(db: Session, task, data):
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task):
    db.delete(task)
    db.commit()