"""
Report service: conversion reports and CSV-ready data.
"""
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.inquiry import Inquiry
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.user import User


class ReportService:
    @staticmethod
    def get_conversions(
        db: Session,
        institution_id: str,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        user_role: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> dict:
        inst_uuid = uuid.UUID(institution_id)
        query = db.query(Inquiry).filter(Inquiry.institution_id == inst_uuid)

        if user_role == "counsellor" and user_id:
            query = query.filter(Inquiry.assigned_to == uuid.UUID(user_id))

        if from_date:
            query = query.filter(Inquiry.created_at >= from_date)
        if to_date:
            query = query.filter(Inquiry.created_at <= to_date)

        total = query.count()
        converted = query.filter(Inquiry.status == "admission_confirmed").count()
        application = query.filter(Inquiry.status == "application_submitted").count()

        inquiry_to_app_pct = round((application / total) * 100, 2) if total > 0 else 0.0
        app_to_admission_pct = round((converted / application) * 100, 2) if application > 0 else 0.0
        overall_pct = round((converted / total) * 100, 2) if total > 0 else 0.0

        # By source
        by_source = (
            db.query(Inquiry.source, func.count(Inquiry.id))
            .filter(Inquiry.institution_id == inst_uuid)
            .group_by(Inquiry.source)
            .all()
        )

        # By course
        by_course = (
            db.query(Course.name, func.count(Inquiry.id))
            .join(Inquiry, Inquiry.course_id == Course.id)
            .filter(Inquiry.institution_id == inst_uuid)
            .group_by(Course.name)
            .all()
        )

        # By counsellor
        by_counsellor = (
            db.query(User.full_name, func.count(Inquiry.id))
            .join(Inquiry, Inquiry.assigned_to == User.id)
            .filter(Inquiry.institution_id == inst_uuid)
            .group_by(User.full_name)
            .all()
        )

        return {
            "total_inquiries": total,
            "applications": application,
            "admissions": converted,
            "inquiry_to_application_percentage": inquiry_to_app_pct,
            "application_to_admission_percentage": app_to_admission_pct,
            "overall_conversion_percentage": overall_pct,
            "by_source": [{"source": s or "unknown", "count": c} for s, c in by_source],
            "by_course": [{"course": name, "count": c} for name, c in by_course],
            "by_counsellor": [{"counsellor": name, "count": c} for name, c in by_counsellor],
        }
