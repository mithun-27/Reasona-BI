from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.insight_engine import generate_insights

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

class ChatResponse(BaseModel):
    reply: str
    insights: dict | None = None

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        result = generate_insights(request.message)
        return ChatResponse(reply=result.get("reply", ""), insights=result.get("insights"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

