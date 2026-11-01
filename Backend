"""
FastAPI application entrypoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router
from app.api.v1.endpoints import health as health_router
from app.models import Base
from app.core.database import engine

# Create tables (Alembic manages migrations in production; this is for dev convenience)
# Best-effort: does not block startup if the database is unavailable
try:
    Base.metadata.create_all(bind=engine)
except Exception:  # pragma: no cover
    import logging
    logging.getLogger(__name__).warning(
        "Could not connect to database at import time. "
        "Run `alembic upgrade head` once PostgreSQL is available."
    )

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/docs" if settings.ENVIRONMENT != "production" else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(health_router.router)

@app.get("/")
def root():
    return {"name": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running"}
