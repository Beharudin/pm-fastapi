from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
import aiofiles
import os
import json
from core.websocket_manager import manager
from core.response import format_response
from services.email_service import send_notification_email
from pydantic import EmailStr
from typing import List

from core.database import get_db
from dependencies.auth import get_current_user
from services.task_service import (
    create_task,
    get_tasks,
    update_task,
    delete_task
)
from services.project_service import get_project_by_id

from schemas.task import TaskCreate, TaskUpdate

from models.task import Task

router = APIRouter(prefix="/tasks", tags=["Tasks"])

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

async def send_notification(user_email: str, task_id: str, action: str):
    subject = f"Task {action.capitalize()}"
    body = f"<p>Task {task_id} has been {action}.</p>"
    await send_notification_email([EmailStr(user_email)], subject, body)

def ensure_project_owner(db: Session, project_id: str, user):
    project = get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Project does not belong to the current user")
    return project

@router.post("/")
async def create_new_task(
    payload: TaskCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    ensure_project_owner(db, payload.project_id, user)
    task = create_task(db, payload)
    await manager.broadcast(json.dumps({"type": "task_created", "task_id": str(task.id)}))
    background.add_task(send_notification, user.email, str(task.id), "created")
    return format_response(message="Task created successfully", data=task)

@router.get("/")
def list_tasks(project_id: str | None = None,
               db: Session = Depends(get_db),
               user=Depends(get_current_user)):
    if project_id:
        ensure_project_owner(db, project_id, user)
    tasks = get_tasks(db, project_id)
    message = "No tasks found" if not tasks else "Tasks retrieved successfully"
    return format_response(message=message, data=tasks)

@router.put("/{task_id}")
async def edit_task(
    task_id: str,
    payload: TaskUpdate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    ensure_project_owner(db, task.project_id, user)
    task = update_task(db, task, payload)
    await manager.broadcast(json.dumps({"type": "task_updated", "task_id": str(task.id)}))
    background.add_task(send_notification, user.email, str(task.id), "updated")
    return format_response(message="Task updated successfully", data=task)

@router.delete("/{task_id}")
async def remove_task(
    task_id: str,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    ensure_project_owner(db, task.project_id, user)
    delete_task(db, task)
    await manager.broadcast(json.dumps({"type": "task_deleted", "task_id": str(task.id)}))
    background.add_task(send_notification, user.email, str(task.id), "deleted")
    return format_response(message="Task deleted successfully", data={"id": str(task.id)})

@router.post("/{task_id}/upload")
async def upload_file(
    task_id: str,
    background: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    ensure_project_owner(db, task.project_id, user)
    
    file_path = f"uploads/{task_id}_{file.filename}"
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    await manager.broadcast(json.dumps({"type": "file_uploaded", "task_id": str(task.id), "filename": file.filename}))
    background.add_task(send_notification, user.email, str(task.id), f"file {file.filename} uploaded")
    return format_response(message="File uploaded successfully", data={"filename": file.filename, "path": file_path})