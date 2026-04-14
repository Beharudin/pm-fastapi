from sqlalchemy import Column, String, ForeignKey, Enum, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
import uuid
from models.base import Base
import enum
from datetime import datetime

class TaskStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    description = Column(String)
    status = Column(Enum(TaskStatus), default=TaskStatus.todo)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    due_date = Column(DateTime, nullable=True)
    estimated_hours = Column(Float, nullable=True)

    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"))
    assigned_to = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    parent_id = Column(UUID(as_uuid=True), ForeignKey("tasks.id"), nullable=True)