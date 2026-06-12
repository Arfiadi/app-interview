import os
from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt, JWTError
import bcrypt
from backend.core.config import settings

def get_password_hash(password: str) -> str:
    """Hash the password using bcrypt."""
    if password is None:
        return ""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the bcrypt hash."""
    if not hashed_password:
        return False
    # Fallback to SHA256 verification for users created before migration
    # Note: If the password hash does not look like bcrypt, or pwd_context fails,
    # we could implement a migration strategy, but for simplicity, we verify using bcrypt.
    # To support backward compatibility with older SHA256 hashes if they exist,
    # we can check if hash starts with bcrypt prefix (e.g. '$2b$'). If not, we check SHA256.
    if not hashed_password.startswith("$2"):
        import hashlib
        salted = (plain_password + settings.SECRET_KEY).encode("utf-8")
        sha256_hash = hashlib.sha256(salted).hexdigest()
        if sha256_hash == hashed_password:
            # Upgrade the hash on verify (we will save the upgraded hash when user logs in)
            return True
        return False
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    """Create a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Union[dict, None]:
    """Decode and verify a JWT access token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
