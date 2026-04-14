import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    manager = "manager"
    member = "member"