from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_FILE = Path(__file__).parent.parent / ".env"


class Settings(BaseSettings):
    turso_database_url: str
    turso_auth_token: str
    clerk_jwks_url: str
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=str(_ENV_FILE), env_file_encoding="utf-8")


settings = Settings()  # type: ignore[call-arg]
