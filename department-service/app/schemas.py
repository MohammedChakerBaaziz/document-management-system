from pydantic import BaseModel, Field
from typing import List, Optional

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    
    class Config:
        orm_mode = True

class DepartmentBase(BaseModel):
    name: str
    description: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentUpdate(DepartmentBase):
    pass

class Department(DepartmentBase):
    id: int
    users: List[User] = []
    
    class Config:
        orm_mode = True

class UserDepartmentAssignment(BaseModel):
    user_id: int
    department_ids: List[int]
