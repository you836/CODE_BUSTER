import os
import logging
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import settings
from app.models.models import Base

logger = logging.getLogger("uvicorn")

db_url = settings.get_database_url()

# If running on Render/cloud and URL accidentally points to localhost, default to SQLite
is_cloud = bool(os.environ.get("RENDER") or os.environ.get("PORT"))
if is_cloud and "localhost" in db_url:
    logger.warning("Detected cloud environment with localhost DATABASE_URL. Falling back to SQLite.")
    db_url = "sqlite+aiosqlite:///./iam_mitigator.db"

engine = create_async_engine(db_url, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

async def create_tables():
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info(f"Database tables initialized successfully using: {engine.url.drivername}")
    except Exception as e:
        logger.error(f"Failed to connect to primary database ({e}).")
        if "sqlite" not in str(engine.url):
            logger.warning("Falling back to local SQLite database (iam_mitigator.db)...")
            engine = create_async_engine("sqlite+aiosqlite:///./iam_mitigator.db", echo=False)
            AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Fallback SQLite database initialized successfully.")
        else:
            raise e

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

