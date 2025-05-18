# Document Management System

A comprehensive microservices-based document management system with document categorization, department-based access control, file storage, and AI-powered translation features. This system allows organizations to manage documents with fine-grained access control based on departments.

## Table of Contents

- [System Overview](#system-overview)
- [Microservices Architecture](#microservices-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Clone the Repository](#clone-the-repository)
  - [Start the Backend Services](#start-the-backend-services)
  - [Initialize the Database](#initialize-the-database)
  - [Access the Application](#access-the-application)
- [Test Scenarios](#test-scenarios)
  - [Department and User Setup](#department-and-user-setup)
  - [Document Management Testing](#document-management-testing)
- [Service Details](#service-details)
- [Frontend Development](#frontend-development)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## System Overview

This document management system allows organizations to manage documents with the following features:

### Admin Capabilities
- Create/Edit/Delete users
- Create/Edit/Delete document categories
- Create/Edit/Delete departments
- Assign/Unassign users to departments (many-to-many relationship)

### User Capabilities
- Create documents with:
  - Document category (many-to-one)
  - Title (in English)
  - Department (many-to-one)
  - File attachment
- View documents only in departments they are assigned to
- Automatic translation of document titles to Spanish

## Microservices Architecture

1. **Authentication Service** (Spring Boot)
   - User registration and login
   - JWT token generation and validation
   - Role-based access control

2. **Document Service** (Spring Boot)
   - CRUD operations for document metadata
   - Search and filtering

3. **Storage Service** (FastAPI)
   - File upload/download to S3
   - File verification and validation
   - Generation of pre-signed URLs

4. **Translation Service** (FastAPI)
   - Integration with Gemini API
   - Document title translation to Spanish

5. **Department Service** (Python/FastAPI)
   - Department management
   - User-department assignments

6. **API Gateway** (Python/FastAPI)
   - Unified API entry point
   - Request routing to appropriate microservices

7. **Frontend** (React)
   - Modern UI with Material-UI components
   - Responsive design

## Prerequisites

- Docker and Docker Compose
- Git
- Google Gemini API key (for translation service)

## Getting Started

### Clone the Repository

```bash
git clone https://github.com/yourusername/document-management-system.git
cd document-management-system
```

### Configure Environment Variables

Before starting the services, update the following environment variables in the `docker-compose.yml` file:

1. Update the JWT secret key:
   - Find `JWT_SECRET=your_jwt_secret_key_here` in the auth-service section
   - Replace with a strong secret key

2. Set your Gemini API key for translation:
   - Find `GEMINI_API_KEY=your_gemini_api_key_here` in the translation-service section
   - Replace with your actual Gemini API key

### Start the Backend Services

```bash
# Build and start all services
docker-compose up -d

# Check if all services are running
docker-compose ps
```

This will start all the microservices, the database, Kafka, LocalStack (S3 mock), and the frontend.

### Initialize the Database

After the services are running, you need to create the initial roles and admin user:

```bash
# Connect to the PostgreSQL container
docker exec -it dms-postgres psql -U dmsuser -d dms

# Insert roles
INSERT INTO roles (name) VALUES ('ROLE_USER'), ('ROLE_ADMIN');

# Create admin user (password is 'admin' encrypted with BCrypt)
INSERT INTO users (username, email, password) 
VALUES ('admin', 'admin@example.com', '$2a$10$EqKMCxzJp9QcZkfS/BvJY.Iv2p/aPRuQRQZ0R1hxk2WFYJB0TH6Gy');

# Assign admin role
INSERT INTO user_roles (user_id, role_id) VALUES (1, 2);

# Exit PostgreSQL
\q
```

### Access the Application

Once all services are running and the database is initialized, you can access the application:

- Frontend: http://localhost:3000
- API Gateway: http://localhost:8080

Login with the admin credentials:
- Username: `admin`
- Password: `admin`

## Test Scenarios

The application includes a built-in test scenario guide that can be accessed from the sidebar after logging in. You can also follow these manual steps to test the system's core functionality.

### Department and User Setup

1. **Create Departments**
   - Log in with admin credentials
   - Click on "Departments" in the sidebar
   - Create two departments: "Finance" and "IT"

2. **Create Users**
   - Click on "Users" in the sidebar
   - Create three users with the following details:
     - User 1: Username: u1, Email: u1@ensia.dz, Password: password123
     - User 2: Username: u2, Email: u2@ensia.dz, Password: password123
     - User 3: Username: u3, Email: u3@ensia.dz, Password: password123

3. **Assign Users to Departments**
   - For each user, click the "Departments" button (chip)
   - Assign departments as follows:
     - u1 → IT department
     - u2 → Finance department
     - u3 → Both IT and Finance departments

4. **Create Document Categories**
   - Click on "Categories" in the sidebar
   - Create three categories: "General", "Administrative", and "Training"

### Document Management Testing

5. **User 1 Document Upload**
   - Log out and log in as u1@ensia.dz
   - Click on "Upload Document" in the sidebar
   - Fill in the form with a title, select a category, and choose the IT department
   - Upload a PDF file
   - Go to "My Documents" to verify the document appears and can be downloaded

6. **User 2 Access Control Test**
   - Log out and log in as u2@ensia.dz
   - Go to "My Documents"
   - Verify that User 2 cannot see the document uploaded by User 1 (IT department document)
   - Upload a new document to the Finance department

7. **User 3 Cross-Department Access**
   - Log out and log in as u3@ensia.dz
   - Go to "My Documents"
   - Verify that User 3 can see both documents (from IT and Finance departments)
   - Test downloading both files

8. **Translation Verification**
   - Log out and log in as u1@ensia.dz again
   - Go to "My Documents"
   - Check that the "Spanish Title" column shows the translated title of the document
   - Note: Translation may take a moment to process

## Service Details

### Port Configuration

- PostgreSQL: 5432
- Kafka: 9092
- LocalStack (S3): 4566
- Authentication Service: 8081
- Document Service: 8082
- Storage Service: 8083
- Translation Service: 8084
- Department Service: 8085
- API Gateway: 8080
- Frontend: 3000

### API Endpoints

#### Authentication Service
- POST `/api/auth/signin` - User login
- POST `/api/auth/signup` - User registration
- GET `/api/auth/validate-token` - Validate JWT token

#### User Management
- GET `/api/users` - Get all users (admin only)
- GET `/api/users/{id}` - Get user by ID
- POST `/api/users` - Create user (admin only)
- PUT `/api/users/{id}` - Update user (admin only)
- DELETE `/api/users/{id}` - Delete user (admin only)
- POST `/api/users/assign-departments` - Assign departments to user

#### Department Management
- GET `/api/departments` - Get all departments
- GET `/api/departments/{id}` - Get department by ID
- POST `/api/departments` - Create department (admin only)
- PUT `/api/departments/{id}` - Update department (admin only)
- DELETE `/api/departments/{id}` - Delete department (admin only)

#### Document Management
- GET `/api/documents` - Get all documents
- GET `/api/documents/{id}` - Get document by ID
- POST `/api/documents` - Create document
- PUT `/api/documents/{id}` - Update document
- DELETE `/api/documents/{id}` - Delete document
- GET `/api/documents/department/{departmentId}` - Get documents by department
- GET `/api/documents/search` - Search documents

#### Category Management
- GET `/api/categories` - Get all categories
- GET `/api/categories/{id}` - Get category by ID
- POST `/api/categories` - Create category (admin only)
- PUT `/api/categories/{id}` - Update category (admin only)
- DELETE `/api/categories/{id}` - Delete category (admin only)

#### Storage Service
- POST `/api/storage/upload` - Upload file
- GET `/api/storage/download-url/{fileKey}` - Get download URL

#### Translation Service
- POST `/api/translate` - Translate text

## Frontend Development

If you want to make changes to the frontend:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## API Documentation

API documentation is available at:

- API Gateway Swagger UI: http://localhost:8080/docs
- Storage Service Swagger UI: http://localhost:8083/docs
- Translation Service Swagger UI: http://localhost:8084/docs
- Department Service Swagger UI: http://localhost:8085/docs

## Troubleshooting

### Common Issues

1. **Admin Menu Items Not Visible**
   - **Problem**: The sidebar doesn't show Departments, Categories, or Users options
   - **Solution**: Ensure you're logged in with an admin account. Regular users don't have access to these menu items.

2. **Service Connection Errors**
   - **Problem**: Frontend can't connect to backend services
   - **Solution**: 
     - Ensure all services are running with `docker-compose ps`
     - Check individual service logs with `docker logs <container-name>`
     - Verify network configuration in docker-compose.yml

3. **Database Connection Issues**
   - **Problem**: Services can't connect to the database
   - **Solution**:
     - Check PostgreSQL logs with `docker logs dms-postgres`
     - Ensure database credentials are correct in service configurations
     - Verify PostgreSQL is running on port 5433 (not the default 5432)

4. **Document Upload Failures**
   - **Problem**: Unable to upload documents
   - **Solution**:
     - Check storage service logs: `docker logs dms-storage-service`
     - Verify LocalStack S3 is running properly
     - Ensure file size is within limits

5. **JWT Authentication Errors**
   - **Problem**: "Unauthorized" errors when accessing protected endpoints
   - **Solution**:
     - Verify the JWT_SECRET is consistent across services
     - Check that token expiration is set appropriately
     - For development, the API Gateway has been modified to temporarily bypass authentication

6. **Translation Not Working**
   - **Problem**: Document titles aren't being translated
   - **Solution**:
     - Check translation service logs: `docker logs dms-translation-service`
     - Verify Kafka is running and topics are created
     - Ensure Gemini API key is correctly configured

7. **Container Port Conflicts**
   - **Problem**: Services fail to start due to port conflicts
   - **Solution**:
     - Check if other applications are using the same ports
     - Modify port mappings in docker-compose.yml if needed
     - Stop conflicting services before starting the application

### Restarting Services

To restart a specific service:

```bash
docker-compose restart [service-name]
```

To restart all services:

```bash
docker-compose down
docker-compose up -d
```

## Technology Stack

- **Backend**: Spring Boot (Java), FastAPI (Python)
- **Frontend**: React, Material-UI
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Message Broker**: Apache Kafka
- **File Storage**: AWS S3 (LocalStack for development)
- **AI Translation**: Google Gemini API
- **Containerization**: Docker & Docker Compose
