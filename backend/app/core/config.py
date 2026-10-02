import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "VayuSync — Personalized Mausam Intelligence"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Host
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() in ("true", "1")
    
    # Provider Settings
    ACTIVE_PROVIDER: str = os.getenv("WEATHER_PROVIDER", "mock")  # "open_meteo", "mock", "imd"
    IMD_API_BASE_URL: str = os.getenv("IMD_API_BASE_URL", "https://mausam.imd.gov.in/api/v1")
    IMD_API_KEY: str = os.getenv("IMD_API_KEY", "")
    
    # LLM Settings (Optional)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    USE_MOCK_LLM: bool = os.getenv("USE_MOCK_LLM", "true").lower() in ("true", "1")
    
    # Database (SQLite default for seamless zero-setup, PostgreSQL compatible)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./vayusync.db")
    
    # Points & Leaderboard Configuration
    POINTS_PER_VALID_FEEDBACK: int = int(os.getenv("POINTS_PER_VALID_FEEDBACK", "10"))
    
    # CORS Origins (allow localhost, local IP, and any custom origins from env)
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:8000,http://127.0.0.1:8000",
        ).split(",")
        if origin.strip() and origin.strip() != "*"
    ]

settings = Settings()
