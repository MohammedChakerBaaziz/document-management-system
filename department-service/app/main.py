from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import httpx

from app.database import get_db
from app.models import create_tables, Department, User, user_department
from app.schemas import Department as DepartmentSchema
from app.schemas import DepartmentCreate, DepartmentUpdate, UserDepartmentAssignment
from app.auth import verify_token, verify_admin

app = FastAPI(title="Department Service", description="Department management service for Document Management System")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    create_tables()

# Routes
@app.get("/")
async def root():
    return {"message": "Department Service is running"}

@app.get("/api/departments", response_model=List[DepartmentSchema])
async def get_departments(
    db: Session = Depends(get_db),
    user_info = Depends(verify_token)
):
    departments = db.query(Department).all()
    return departments

@app.get("/api/departments/{department_id}", response_model=DepartmentSchema)
async def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    user_info = Depends(verify_token)
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department

@app.post("/api/departments", response_model=DepartmentSchema, status_code=status.HTTP_201_CREATED)
async def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    user_info = Depends(verify_admin)
):
    # Check if department with same name already exists
    existing_department = db.query(Department).filter(Department.name == department.name).first()
    if existing_department:
        raise HTTPException(status_code=400, detail="Department with this name already exists")
    
    new_department = Department(name=department.name, description=department.description)
    db.add(new_department)
    db.commit()
    db.refresh(new_department)
    return new_department

@app.put("/api/departments/{department_id}", response_model=DepartmentSchema)
async def update_department(
    department_id: int,
    department_update: DepartmentUpdate,
    db: Session = Depends(get_db),
    user_info = Depends(verify_admin)
):
    db_department = db.query(Department).filter(Department.id == department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if name is being changed and if new name is already taken
    if db_department.name != department_update.name:
        existing_department = db.query(Department).filter(Department.name == department_update.name).first()
        if existing_department:
            raise HTTPException(status_code=400, detail="Department with this name already exists")
    
    db_department.name = department_update.name
    db_department.description = department_update.description
    
    db.commit()
    db.refresh(db_department)
    return db_department

@app.delete("/api/departments/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    user_info = Depends(verify_admin)
):
    db_department = db.query(Department).filter(Department.id == department_id).first()
    if not db_department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    db.delete(db_department)
    db.commit()
    return None

@app.get("/api/departments/{department_id}/users", response_model=List[dict])
async def get_department_users(
    department_id: int,
    db: Session = Depends(get_db),
    user_info = Depends(verify_token)
):
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    return [{"id": user.id, "username": user.username, "email": user.email} for user in department.users]

@app.post("/api/departments/assign-users", status_code=status.HTTP_200_OK)
async def assign_users_to_departments(
    assignment: UserDepartmentAssignment,
    db: Session = Depends(get_db),
    user_info = Depends(verify_admin)
):
    # Check if user exists
    user = db.query(User).filter(User.id == assignment.user_id).first()
    if not user:
        # Try to fetch user from auth service
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{AUTH_SERVICE_URL}/api/users/{assignment.user_id}",
                    headers={"Authorization": f"Bearer {user_info.get('token')}"}
                )
                
                if response.status_code == 200:
                    user_data = response.json()
                    user = User(id=user_data["id"], username=user_data["username"], email=user_data["email"])
                    db.add(user)
                    db.commit()
                else:
                    raise HTTPException(status_code=404, detail="User not found")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")
    
    # Clear existing department assignments
    user.departments = []
    
    # Assign new departments
    for dept_id in assignment.department_ids:
        department = db.query(Department).filter(Department.id == dept_id).first()
        if not department:
            raise HTTPException(status_code=404, detail=f"Department with ID {dept_id} not found")
        user.departments.append(department)
    
    db.commit()
    return {"message": "User assigned to departments successfully"}

@app.get("/api/users/{user_id}/departments", response_model=List[DepartmentSchema])
async def get_user_departments(
    user_id: int,
    db: Session = Depends(get_db),
    user_info = Depends(verify_token)
):
    # Check if user exists in our database
    user = db.query(User).filter(User.id == user_id).first()
    
    # If user not found in our database, check auth service
    if not user:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{AUTH_SERVICE_URL}/api/users/{user_id}",
                    headers={"Authorization": f"Bearer {user_info.get('token')}"}
                )
                
                if response.status_code != 200:
                    raise HTTPException(status_code=404, detail="User not found")
                
                # User exists in auth service but not in our database
                # Return empty list of departments
                return []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")
    
    return user.departments

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
