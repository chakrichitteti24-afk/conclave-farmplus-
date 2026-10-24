"""Application settings — loaded from .env"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "FarmPulse Advisory API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    SECRET_KEY: str = "change-me"
    DATABASE_URL: str = "sqlite+aiosqlite:///./farmplus.db"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173"]
    GEMINI_API_KEY: str = ""
    LOG_LEVEL: str = "INFO"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
