"""
Application configuration.
Reads environment variables with sensible defaults for local development.
All secrets must come from environment variables in production.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "EdTech CRM & Inquiry Management System"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = True

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database - Supabase PostgreSQL connection string
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/edtech_crm"

    # Security
    SECRET_KEY: str = "dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS (comma-separated in .env, auto-parsed)
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # Password hashing
    PASSWORD_HASH_SCHEME: str = "argon2"  # argon2 | bcrypt

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
