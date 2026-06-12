import json
import logging
from typing import Optional
from redis.asyncio import Redis
from backend.core.config import settings

logger = logging.getLogger(__name__)

# In-memory fallback dictionary in case Redis is not available (e.g. running unit tests without Redis)
_fallback_cache = {}
_use_fallback = False

redis_client: Optional[Redis] = None

def get_redis_client() -> Optional[Redis]:
    global redis_client, _use_fallback
    if _use_fallback:
        return None
    if redis_client is None:
        try:
            redis_client = Redis.from_url(settings.REDIS_URL, decode_responses=True)
        except Exception as e:
            logger.warning(f"Failed to initialize Redis client, using in-memory fallback: {e}")
            _use_fallback = True
            return None
    return redis_client

async def set_session(session_id: str, session_data: dict, expire_seconds: int = 7200):
    """Set active session in Redis with 2 hours TTL by default."""
    client = get_redis_client()
    if client is None:
        _fallback_cache[session_id] = session_data
        return
    try:
        await client.set(f"session:{session_id}", json.dumps(session_data), ex=expire_seconds)
    except Exception as e:
        logger.error(f"Redis set error: {e}. Falling back to in-memory cache.")
        _fallback_cache[session_id] = session_data

async def get_session(session_id: str) -> Optional[dict]:
    """Get active session from Redis."""
    client = get_redis_client()
    if client is None:
        return _fallback_cache.get(session_id)
    try:
        data = await client.get(f"session:{session_id}")
        if data:
            return json.loads(data)
        # Check fallback just in case
        return _fallback_cache.get(session_id)
    except Exception as e:
        logger.error(f"Redis get error: {e}. Checking in-memory fallback.")
        return _fallback_cache.get(session_id)

async def delete_session(session_id: str):
    """Delete session from Redis."""
    client = get_redis_client()
    if session_id in _fallback_cache:
        del _fallback_cache[session_id]
    if client is None:
        return
    try:
        await client.delete(f"session:{session_id}")
    except Exception as e:
        logger.error(f"Redis delete error: {e}")
