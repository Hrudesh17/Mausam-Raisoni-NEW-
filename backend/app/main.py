import time
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .api import api_router

logger = logging.getLogger("vayusync.diagnostics")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "Personalized Mausam Intelligence Engine.\n\n"
        "Translates raw IMD / meteorological telemetry into personalized decisions, "
        "activity scores, proactive routine protection, and voice-assisted intelligence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration supporting localhost, custom origins, and all Netlify preview/production subdomains
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https://([a-zA-Z0-9_-]+\.)?onrender\.com$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Safe production diagnostics middleware (never logs sensitive tokens or credentials)
@app.middleware("http")
async def diagnostics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(
        f"Request: {request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)"
    )
    return response

# Include API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": "1.0.0",
        "team": "VayuSync",
        "docs": "/docs",
        "status": "operational",
    }

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "vayusync-backend",
        "version": "1.0.0",
    }
