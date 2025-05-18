from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import threading
import time
from typing import Optional, Dict, Any
import httpx
from kafka import KafkaConsumer
import google.generativeai as genai
from pydantic import BaseModel

app = FastAPI(title="Translation Service", description="Translation service for Document Management System")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your_gemini_api_key_here")
genai.configure(api_key=GEMINI_API_KEY)

# Kafka configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
KAFKA_TOPIC = "document-created"

# Document service URL
DOCUMENT_SERVICE_URL = os.getenv("DOCUMENT_SERVICE_URL", "http://localhost:8082")

# Auth service URL
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8081")

# Authentication dependency
async def verify_token(authorization: str = Header(None)):
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

# Translation model
class TranslationRequest(BaseModel):
    text: str

class TranslationResponse(BaseModel):
    original_text: str
    translated_text: str

# Translate text using Gemini API
async def translate_text(text: str, target_language: str = "Spanish") -> str:
    try:
        model = genai.GenerativeModel('gemini-pro')
        prompt = f"Translate the following English text to {target_language}. Return only the translated text without any additional explanation: '{text}'"
        
        response = model.generate_content(prompt)
        translated_text = response.text.strip()
        
        # Remove quotes if present
        if translated_text.startswith('"') and translated_text.endswith('"'):
            translated_text = translated_text[1:-1]
        
        return translated_text
    except Exception as e:
        print(f"Translation error: {str(e)}")
        return ""

# Update document with translated title
async def update_document_with_translation(document_id: int, translated_title: str):
    try:
        # Get admin token for internal service communication
        async with httpx.AsyncClient() as client:
            auth_response = await client.post(
                f"{AUTH_SERVICE_URL}/api/auth/signin",
                json={"username": "admin", "password": "admin"}
            )
            
            if auth_response.status_code != 200:
                print(f"Failed to get admin token: {auth_response.text}")
                return
            
            admin_token = auth_response.json().get("token")
            
            # Update document with translated title
            update_response = await client.patch(
                f"{DOCUMENT_SERVICE_URL}/api/documents/{document_id}/translated-title",
                json={"translatedTitle": translated_title},
                headers={"Authorization": f"Bearer {admin_token}"}
            )
            
            if update_response.status_code != 200:
                print(f"Failed to update document: {update_response.text}")
    except Exception as e:
        print(f"Error updating document: {str(e)}")

# Kafka consumer thread
def start_kafka_consumer():
    try:
        consumer = KafkaConsumer(
            KAFKA_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='translation-service',
            value_deserializer=lambda m: json.loads(m.decode('utf-8'))
        )
        
        for message in consumer:
            try:
                document_data = message.value
                document_id = document_data.get('documentId')
                title = document_data.get('title')
                
                if document_id and title:
                    # Run in a separate thread to avoid blocking
                    threading.Thread(
                        target=process_translation,
                        args=(document_id, title),
                        daemon=True
                    ).start()
            except Exception as e:
                print(f"Error processing message: {str(e)}")
    except Exception as e:
        print(f"Kafka consumer error: {str(e)}")
        time.sleep(5)  # Wait before retrying
        start_kafka_consumer()  # Restart consumer

# Process translation in a separate thread
def process_translation(document_id: int, title: str):
    import asyncio
    
    async def translate_and_update():
        translated_title = await translate_text(title)
        if translated_title:
            await update_document_with_translation(document_id, translated_title)
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(translate_and_update())
    loop.close()

# Start Kafka consumer on application startup
@app.on_event("startup")
async def startup_event():
    threading.Thread(target=start_kafka_consumer, daemon=True).start()

# Routes
@app.get("/")
async def root():
    return {"message": "Translation Service is running"}

@app.post("/api/translate", response_model=TranslationResponse)
async def translate(
    request: TranslationRequest,
    user_info = Depends(verify_token)
):
    translated_text = await translate_text(request.text)
    return {
        "original_text": request.text,
        "translated_text": translated_text
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
