import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load root .env if available, or backend .env
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

class Settings(BaseModel):
    PROJECT_NAME: str = "BaleKerta Spatial Audit Engine"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # AI Credentials
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
    
    # Server configuration
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    # Wildcard "*" sengaja tidak dipakai: endpoint audit membakar kuota API key
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://balekerta.web.id",
        "https://www.balekerta.web.id",
    ]
    
    # Directory paths
    DATA_DIR: Path = Path(__file__).resolve().parent.parent / "data"
    CACHE_DIR: Path = Path(__file__).resolve().parent.parent / "data" / "cache"
    PRESETS_DIR: Path = Path(__file__).resolve().parent.parent / "data" / "presets"

settings = Settings()

# Ensure required directories exist
settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)
settings.PRESETS_DIR.mkdir(parents=True, exist_ok=True)
