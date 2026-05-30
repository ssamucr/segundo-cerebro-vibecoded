from typing import Optional
import libsql_client
from app.config import settings

_client: Optional[libsql_client.Client] = None


def _normalize_url(url: str) -> str:
    """Convierte URLs libsql:// a https:// para usar el protocolo HTTP en lugar de WebSocket."""
    if url.startswith("libsql://"):
        return "https://" + url[len("libsql://"):]
    return url


def get_client() -> libsql_client.Client:
    global _client
    if _client is None:
        _client = libsql_client.create_client_sync(
            url=_normalize_url(settings.turso_database_url),
            auth_token=settings.turso_auth_token,
        )
    return _client
