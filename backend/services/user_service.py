from typing import Optional
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.db_models import UserDB
from backend.models.user import UserCreate
from backend.core.security import get_password_hash

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[UserDB]:
    """Get a user by username or email from the database."""
    statement = select(UserDB).where((UserDB.username == username) | (UserDB.email == username))
    result = await db.execute(statement)
    return result.scalars().first()

async def create_user(db: AsyncSession, user: UserCreate) -> Optional[UserDB]:
    """Create a new user in the database."""
    # Check if username or email already exists
    existing_user = await get_user_by_username(db, user.username)
    if existing_user:
        return None
    existing_email = await get_user_by_username(db, user.email)
    if existing_email:
        return None
        
    db_user = UserDB(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password)
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def update_user_password(db: AsyncSession, user: UserDB, plain_password: str) -> UserDB:
    """Update a user's password to bcrypt (used for password migration)."""
    user.hashed_password = get_password_hash(plain_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user