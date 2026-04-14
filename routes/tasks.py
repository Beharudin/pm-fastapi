from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
import aiofiles
import os
import json
from core.websocket_manager import manager
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

from schemas.task import TaskCreate, TaskUpdate

from models.task import Task

router = APIRouter(prefix="/tasks", tags=["Tasks"])

# Ensure uploads directory exists
os.makedirs("uploads", exist_ok=True)

async def send_notification(user_email: str, task_id: str, action: str):
    subject = f"Task {action.capitalize()}"
    body = f"<p>Task {task_id} has been {action}.</p>"
    await send_notification_email([EmailStr(user_email)], subject, body)

def send_notification(task_id: str, action: str):
    print(f"Notification: Task {task_id} {action}")

@router.post("/")
async def create_new_task(
    payload: TaskCreate,
    background: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    task = create_task(db, payload)
    await manager.broadcast(json.dumps({"type": "task_created", "task_id": str(task.id)}))
    background.add_task(send_notification, user.email, str(task.id), "created")
    return task

@router.get("/")
def list_tasks(project_id: str | None = None,
               db: Session = Depends(get_db),
               user=Depends(get_current_user)):
    return get_tasks(db, project_id)

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
    task = update_task(db, task, payload)
    await manager.broadcast(json.dumps({"type": "task_updated", "task_id": str(task.id)}))
    background.add_task(send_notification, user.email, str(task.id), "updated")
    return task

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
    delete_task(db, task)
    await manager.broadcast(json.dumps({"type": "task_deleted", "task_id": str(task.id)}))
    background.add_task(send_notification, user.email, str(task.id), "deleted")
    return {"message": "Task deleted"}

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
    
    file_path = f"uploads/{task_id}_{file.filename}"
    async with aiofiles.open(file_path, "wb") as f:
        content = await file.read()
        await f.write(content)
    
    await manager.broadcast(json.dumps({"type": "file_uploaded", "task_id": str(task.id), "filename": file.filename}))
    background.add_task(send_notification, user.email, str(task.id), f"file {file.filename} uploaded")
    return {"filename": file.filename, "path": file_path}