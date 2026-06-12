import pytest
import asyncio
from typing import Generator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel
from httpx import AsyncClient, ASGITransport

from backend.main import app
from backend.core.database import get_session
from backend.models.db_models import UserDB

# Use an in-memory SQLite database for testing
DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the session."""
    policy = asyncio.get_event_loop_policy()
    res = policy.new_event_loop()
    yield res
    res.close()

@pytest.fixture(scope="function", autouse=True)
async def init_test_db():
    """Initialize database tables for each test."""
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)

@pytest.fixture(scope="function")
async def db_session() -> Generator[AsyncSession, None, None]:
    """Provide database session fixture."""
    async with async_session() as session:
        yield session
        await session.close()

@pytest.fixture(scope="function")
async def client(db_session: AsyncSession) -> Generator[AsyncClient, None, None]:
    """Provide async client fixture with database session override."""
    async def override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = override_get_session
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
