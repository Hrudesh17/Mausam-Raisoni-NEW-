import uuid
import logging
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter
from ..models.weather import WeatherResponse
from ..models.user_context import UserContext
from ..models.intelligence import IntelligenceSummary
from ..ai.assistant import AIAssistantService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["VayuSync Sahayak (AI)"])

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or prompt")
    dashboard_location: Optional[str] = Field("Pune", description="Current UI selected dashboard location")
    conversation_location: Optional[str] = Field(None, description="Active multi-turn conversation location")
    session_id: Optional[str] = Field(None, description="Client session UUID")
    persona: Optional[List[str]] = Field(default_factory=list, description="Active persona roles")
    input_mode: Optional[str] = Field("text", description="'text' or 'voice'")
    weather: Optional[WeatherResponse] = Field(None, description="Current dashboard weather telemetry")
    context: Optional[UserContext] = Field(None, description="User context and preferences")
    intelligence: Optional[IntelligenceSummary] = Field(None, description="Personalized intelligence summary")
    language: Optional[str] = Field("en", description="Active language code (e.g. 'hi', 'en')")

class ChatResponse(BaseModel):
    success: bool = True
    answer: str
    reply: str
    location: Dict[str, Any]
    intent: str
    requested_time: str
    weather: Dict[str, Any]
    data: Dict[str, Any]
    suggested_actions: List[str]
    source: str
    data_timestamp: str
    conversation_location: str
    input_mode: str
    session_id: str
    confidence: float = 0.95

@router.post("/chat")
async def chat_with_assistant(req: ChatRequest):
    """
    Conversational Weather Intelligence Endpoint.
    Translates raw meteorological variables into context-aware user advice.
    Maintains location continuity, strict data grounding, and zero hardcoded weather fallbacks.
    """
    session_id = req.session_id or str(uuid.uuid4())
    return await AIAssistantService.answer_query(
        user_message=req.message,
        weather=req.weather,
        context=req.context,
        intelligence=req.intelligence,
        dashboard_location=req.dashboard_location,
        conversation_location=req.conversation_location,
        session_id=session_id,
        persona=req.persona,
        input_mode=req.input_mode or "text",
        language=req.language or "en",
    )
