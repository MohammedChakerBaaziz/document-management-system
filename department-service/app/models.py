from sqlalchemy import Column, Integer, String, Table, ForeignKey, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import os

# Database configuration
DB_HOST = os.getenv("POSTGRES_HOST", "localhost")
DB_PORT = os.getenv("POSTGRES_PORT", "5432")
DB_USER = os.getenv("POSTGRES_USER", "dmsuser")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD", "dmspassword")
DB_NAME = os.getenv("POSTGRES_DB", "dms")

DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
Base = declarative_base()

# Association table for many-to-many relationship between users and departments
user_department = Table(
    'user_department',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('department_id', Integer, ForeignKey('departments.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    
    # Relationship with departments
    departments = relationship("Department", secondary=user_department, back_populates="users")

class Department(Base):
    __tablename__ = "departments"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    description = Column(Text, nullable=True)
    
    # Relationship with users
    users = relationship("User", secondary=user_department, back_populates="departments")

# Create tables
def create_tables():
    Base.metadata.create_all(bind=engine)
