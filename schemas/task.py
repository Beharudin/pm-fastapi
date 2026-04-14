from pydantic import BaseModel
from uuid import UUID
from models.task import TaskStatus
from datetime import datetime
from typing import Optional

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    project_id: UUID
    assigned_to: Optional[UUID] = None
    parent_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    assigned_to: Optional[UUID] = None
    parent_id: Optional[UUID] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None

class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    status: TaskStatus
    project_id: UUID
    assigned_to: Optional[UUID]
    parent_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    due_date: Optional[datetime]
    estimated_hours: Optional[float]

    class Config:
        from_attributes = True