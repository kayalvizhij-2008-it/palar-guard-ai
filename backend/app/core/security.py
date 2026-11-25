import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
import jwt
from .config import settings


def get_password_hash(password: str) -> str:
    """Generate a salted PBKDF2-SHA256 password hash (210,000 iterations)."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 210000)
    return f"{salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against stored salt$hash (supports legacy 100k or 210k)."""
    try:
        salt, stored_hash = hashed_password.split("$")
        for iterations in (210000, 100000):
            key = hashlib.pbkdf2_hmac("sha256", plain_password.encode("utf-8"), salt.encode("utf-8"), iterations)
            if secrets.compare_digest(key.hex(), stored_hash):
                return True
        return False
    except Exception:
        return False


def create_access_token(
    subject: str | Any,
    role: Optional[str] = None,
    user_id: Optional[int] = None,
    expires_delta: Optional[timedelta] = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {
        "exp": expire,
        "iat": now,
        "sub": str(subject),
        "type": "access",
    }
    if role:
        to_encode["role"] = role
    if user_id is not None:
        to_encode["uid"] = user_id
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    if not token or not isinstance(token, str):
        return None
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
            options={"require": ["exp", "sub"]},
        )
        if payload.get("type") not in (None, "access"):
            return None
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception:
        return None
