from pydantic import BaseModel
from uuid import UUID

class ProjectCreate(BaseModel):
    name: str

class ProjectResponse(BaseModel):
    id: UUID
    name: str
    owner_id: UUID

    class Config:
        from_attributes = True