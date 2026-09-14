import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    SECRET_KEY: str = "a_dev_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    AI_PROVIDER: str = "none"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4"
    AWS_INTEGRATION_ENABLED: bool = False
    MAX_SIMULATION_ITERATIONS: int = 5
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def get_database_url(self) -> str:
        raw_url = (self.DATABASE_URL or os.environ.get("DATABASE_URL", "")).strip()

        # If no DATABASE_URL is configured, use SQLite fallback
        if not raw_url:
            return "sqlite+aiosqlite:///./iam_mitigator.db"

        url = raw_url

        # Render / Supabase / Neon / Heroku compatibility
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)

        # Fix sslmode parameter for asyncpg
        if "sslmode=require" in url:
            url = url.replace("sslmode=require", "ssl=require")
        elif "sslmode=prefer" in url:
            url = url.replace("sslmode=prefer", "ssl=prefer")
        elif "sslmode=disable" in url:
            url = url.replace("sslmode=disable", "ssl=disable")

        return url

settings = Settings()

