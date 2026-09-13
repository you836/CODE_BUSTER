from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/iam_mitigator"
    SECRET_KEY: str = "a_dev_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    AI_PROVIDER: str = "none"
    AI_API_KEY: str = ""
    AI_MODEL: str = "gpt-4"
    AWS_INTEGRATION_ENABLED: bool = False
    MAX_SIMULATION_ITERATIONS: int = 5
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
