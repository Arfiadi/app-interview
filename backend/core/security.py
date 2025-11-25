import os
import hashlib
import hmac
import uuid
import base64
from datetime import datetime, timedelta

# Minimal security helpers for password hashing and token creation.
# IMPORTANT: keep this module lightweight and avoid importing any application
# modules (e.g., routers) here to prevent circular imports.

# Use an application secret (can be set via env var); fallback to a dev value.
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")


def get_password_hash(password: str) -> str:
    """Return a deterministic SHA256-based hash for the given password.

    This implementation is intentionally simple to avoid extra dependencies
    (no passlib/bcrypt). For production use, replace with a proper password
    hashing algorithm (bcrypt/argon2).
    """
    if password is None:
        return ""
    salted = (password + SECRET_KEY).encode("utf-8")
    return hashlib.sha256(salted).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored hash."""
    return get_password_hash(plain_password) == (hashed_password or "")


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a simple opaque access token string.

    This function returns a random token (UUID-based, urlsafe). It does not
    encode the payload. For a real JWT implementation, swap this out with
    a proper JWT library (e.g. python-jose) and sign tokens with
    `SECRET_KEY`.
    """
    # We include a timestamp to help debugging/rotation if needed.
    token_uuid = uuid.uuid4()
    ts = int(datetime.utcnow().timestamp())
    raw = f"{token_uuid.hex}.{ts}".encode("utf-8")
    token = base64.urlsafe_b64encode(hmac.new(SECRET_KEY.encode(), raw, hashlib.sha256).digest()).decode().rstrip("=\n")
    return token
