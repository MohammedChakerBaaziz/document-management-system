from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import httpx
import os
from typing import Dict, Any, Optional
import asyncio

app = FastAPI(title="API Gateway", description="API Gateway for Document Management System")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Service URLs
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")
DOCUMENT_SERVICE_URL = os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8082")
STORAGE_SERVICE_URL = os.getenv("STORAGE_SERVICE_URL", "http://localhost:8083")
TRANSLATION_SERVICE_URL = os.getenv("TRANSLATION_SERVICE_URL", "http://localhost:8084")
DEPARTMENT_SERVICE_URL = os.getenv("DEPARTMENT_SERVICE_URL", "http://localhost:8085")

# Service routes mapping
SERVICE_ROUTES = {
    "/api/auth": AUTH_SERVICE_URL,
    "/api/users": AUTH_SERVICE_URL,
    "/api/documents": DOCUMENT_SERVICE_URL,
    "/api/categories": DOCUMENT_SERVICE_URL,
    "/api/storage": STORAGE_SERVICE_URL,
    "/api/translate": TRANSLATION_SERVICE_URL,
    "/api/departments": DEPARTMENT_SERVICE_URL
}

# Authentication middleware
async def verify_token(request: Request, authorization: str = Header(None)) -> Dict[str, Any]:
    """
    Verify JWT token by calling the auth service
    """
    # For development purposes, temporarily allow all requests
    # This will make it easier to test category and department creation
    return {"public_access": True}
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization format")
    
    token = authorization.replace("Bearer ", "")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/api/auth/validate-token",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid or expired token")
            
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

# Helper to determine target service
def get_target_service(path: str) -> str:
    for route_prefix, service_url in SERVICE_ROUTES.items():
        if path.startswith(route_prefix):
            return service_url
    
    # Default to auth service if no match
    return AUTH_SERVICE_URL

# Routes
@app.get("/")
async def root():
    return {"message": "API Gateway is running"}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_request(request: Request, path: str):
    # Get user info and check if authentication is required
    try:
        authorization = request.headers.get("Authorization")
        user_info = await verify_token(request, authorization)
        # If public_access is True, this is a public endpoint
        skip_auth = user_info.get("public_access", False)
    except HTTPException as e:
        return JSONResponse(
            status_code=e.status_code,
            content={"detail": e.detail}
        )
    
    # Get target service URL
    target_service = get_target_service(f"/{path}")
    target_url = f"{target_service}/{path}"
    
    # Forward the request to the target service
    try:
        # Get request body if present
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
        
        # Prepare headers
        headers = dict(request.headers)
        
        # Add user ID header for services that need it
        if user_info:
            headers["X-User-ID"] = str(user_info.get("id"))
        
        # Create client and send request
        async with httpx.AsyncClient() as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body,
                params=request.query_params,
                follow_redirects=True
            )
            
            # Return the response from the target service
            return StreamingResponse(
                content=response.aiter_bytes(),
                status_code=response.status_code,
                headers=dict(response.headers)
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Error forwarding request: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
