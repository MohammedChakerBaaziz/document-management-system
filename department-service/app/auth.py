import os
import httpx
from fastapi import HTTPException, Header, Depends
from typing import Optional, Dict, Any

# Auth service URL
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")

async def verify_token(authorization: str = Header(None)) -> Dict[str, Any]:
    """
    Verify JWT token by calling the auth service
    """
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

async def verify_admin(user_info: Dict[str, Any] = Depends(verify_token)) -> Dict[str, Any]:
    """
    Verify that the user has admin role
    """
    roles = user_info.get("roles", [])
    if "ROLE_ADMIN" not in roles:
        raise HTTPException(status_code=403, detail="Admin role required")
    return user_info
