from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_anon_key: str
    groq_api_key: str
    gmail_user: str
    gmail_app_password: str
    app_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    secret_key: str = "change-me-in-production"
    cors_origins: str = "http://localhost:5173"
    allowed_hosts: str = "*"
    debug: bool = False
    health_secret: str = "default-secret"  # Add this line

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def allowed_hosts_list(self) -> List[str]:
        return [h.strip() for h in self.allowed_hosts.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()