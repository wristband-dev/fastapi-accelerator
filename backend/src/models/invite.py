from pydantic import BaseModel, EmailStr
from typing import Optional, List

class InviteUserRequest(BaseModel):
    email: EmailStr
    roles: List[str] = []  # List of role SKUs to assign

class InviteUserResponse(BaseModel):
    message: str
    email: str
    roles_assigned: List[str]
