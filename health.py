"""
Health check endpoint.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.deps import get_db
from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health(db: Session = Depends(get_db)):
    # Simple DB connectivity check
    db.execute(text("SELECT 1"))
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "version": settings.APP_VERSION,
    }
