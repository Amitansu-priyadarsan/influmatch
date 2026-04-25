from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str

    ADMIN_EMAIL: str = "admin@influmatch.com"
    ADMIN_PASSWORD: str = "Admin@1234"

    SESSION_TOKEN_TTL: int = 3600
    AUTH_TOKEN_TTL: int = 60 * 60 * 24 * 7

    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
