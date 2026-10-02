from fastapi import APIRouter
from .weather import router as weather_router
from .intelligence import router as intelligence_router
from .assistant import router as assistant_router
from .help import router as help_router

api_router = APIRouter()
api_router.include_router(weather_router)
api_router.include_router(intelligence_router)
api_router.include_router(assistant_router)
api_router.include_router(help_router)

@api_router.get("/health", tags=["System Health"])
async def api_health():
    return {
        "status": "ok",
        "service": "vayusync-backend-api",
        "version": "1.0.0",
    }

__all__ = ["api_router"]

