import os
import secrets
import warnings
from pydantic_settings import BaseSettings

def _detect_environment() -> str:
    """Explicit ENVIRONMENT wins; a Render deployment defaults to production.

    Render injects RENDER / RENDER_EXTERNAL_URL into every service, so a deployed
    backend runs with production CORS + signing rules without extra dashboard setup.
    """
    explicit = os.getenv("ENVIRONMENT", "").strip().lower()
    if explicit:
        return explicit
    if os.getenv("RENDER") or os.getenv("RENDER_EXTERNAL_URL"):
        return "production"
    return "development"


_INSECURE_PLACEHOLDERS = {
    "",
    "palar-guard-ai-secret-key-development-mode-2026",
    "palar_guard_ai_secret_key_change_in_production_2026",
    "changeme",
    "secret",
}


class Settings(BaseSettings):
    PROJECT_NAME: str = "PALAR GUARD AI"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = _detect_environment()
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./palar_guard.db")

    # Explicit development CORS origins (never wildcard '*' with credentials)
    DEV_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # Production CORS origins: CORS_ORIGINS env var overrides this list; otherwise the
    # project's own deployed frontend origins are used (explicit allowlist, never '*')
    DEPLOYED_FRONTEND_ORIGINS: list[str] = [
        "https://frontend-tau-kohl-99.vercel.app",
        "https://frontend-6xbla5345-kayalvizhij-2008-its-projects.vercel.app",
    ]
    PROD_CORS_ORIGINS: list[str] = []

    def model_post_init(self, __context) -> None:
        env = (self.ENVIRONMENT or "development").lower()
        key = (self.SECRET_KEY or "").strip()

        if env == "production":
            if key in _INSECURE_PLACEHOLDERS or len(key) < 32:
                raise RuntimeError(
                    "CRITICAL SECURITY ERROR: SECRET_KEY must be explicitly set to a strong "
                    "random string (>= 32 characters) in production."
                )
        else:
            if not key or key in _INSECURE_PLACEHOLDERS:
                # Generate an ephemeral per-process secret in development/test rather than
                # using a static hardcoded fallback.
                self.SECRET_KEY = secrets.token_urlsafe(48)
                warnings.warn(
                    "SECRET_KEY not configured; generated an ephemeral development secret for this process.",
                    UserWarning,
                    stacklevel=2,
                )

        # Fall back cleanly to SQLite if DATABASE_URL is blank
        if not (self.DATABASE_URL or "").strip():
            self.DATABASE_URL = "sqlite:///./palar_guard.db"

        # Normalize postgres:// URLs for SQLAlchemy 2.x
        if self.DATABASE_URL.startswith("postgres://"):
            self.DATABASE_URL = self.DATABASE_URL.replace("postgres://", "postgresql://", 1)

    def get_cors_origins(self) -> list[str]:
        env = (self.ENVIRONMENT or "development").lower()
        raw_env = os.getenv("CORS_ORIGINS", "")
        parsed = [item.strip().rstrip("/") for item in raw_env.split(",") if item.strip()]

        if "*" in parsed:
            raise RuntimeError(
                "CRITICAL SECURITY ERROR: Wildcard '*' is forbidden in CORS_ORIGINS when allow_credentials=True."
            )

        if env == "production":
            origins = parsed or list(self.PROD_CORS_ORIGINS) or list(self.DEPLOYED_FRONTEND_ORIGINS)
            if not origins:
                raise RuntimeError(
                    "CRITICAL SECURITY ERROR: CORS_ORIGINS must be configured in production."
                )
            return origins

        # Development / test: combine local dev origins with any explicit CORS_ORIGINS
        origins = list(self.DEV_CORS_ORIGINS)
        for origin in parsed:
            if origin not in origins:
                origins.append(origin)
        return origins

    @property
    def is_production(self) -> bool:
        return (self.ENVIRONMENT or "").lower() == "production"

    class Config:
        case_sensitive = True


settings = Settings()
