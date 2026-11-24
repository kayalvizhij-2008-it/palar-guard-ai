import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PALAR GUARD AI"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "palar-guard-ai-secret-key-development-mode-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./palar_guard.db")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # CORS defaults
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://palar-guard-ai.vercel.app",
        "https://palar-guard-ai-frontend.vercel.app",
    ]

    def get_cors_origins(self) -> list[str]:
        origins = list(self.BACKEND_CORS_ORIGINS)
        env_origins = os.getenv("CORS_ORIGINS", "")
        if env_origins:
            for item in env_origins.split(","):
                clean = item.strip()
                if clean and clean not in origins:
                    origins.append(clean)
        return origins

    class Config:
        case_sensitive = True

settings = Settings()
