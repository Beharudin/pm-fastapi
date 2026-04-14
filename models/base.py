from core.database import Base

# This file is mainly for future extensibility
# You can add mixins like timestamps, soft delete, etc.

class BaseModel(Base):
    __abstract__ = True
    pass