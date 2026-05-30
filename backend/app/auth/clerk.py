"""Validación de JWTs emitidos por Clerk usando JWKS público."""
from typing import Optional
import httpx
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings

_jwks_cache: Optional[dict] = None
bearer_scheme = HTTPBearer()


def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache is None:
        resp = httpx.get(settings.clerk_jwks_url, timeout=10)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = credentials.credentials
    try:
        jwks = _get_jwks()
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido: {exc}",
        )


def get_current_user_id(payload: dict = Depends(verify_token)) -> str:
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="sub ausente en token")
    return user_id
