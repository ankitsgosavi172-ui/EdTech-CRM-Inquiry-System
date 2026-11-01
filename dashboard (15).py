"""
Dashboard analytics service: aggregates from persisted data.
"""
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from app.models.inquiry import Inquiry
from app.models.follow_up import FollowUp
from app.models.course import Course
from app.models.student import Student


class DashboardService:
    @staticmethod
    def get_analytics(
        db: Session,
        institution_id: str,
        from_date: Optional[str] = None,
        to_date: Optional[str] = None,
        user_role: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> dict:
        inst_uuid = uuid.UUID(institution_id)
        query = db.query(Inquiry).filter(Inquiry.institution_id == inst_uuid)

        # Scope by role
        if user_role == "counsellor" and user_id:
            query = query.filter(Inquiry.assigned_to == uuid.UUID(user_id))

        if from_date:
            query = query.filter(Inquiry.created_at >= from_date)
        if to_date:
            query = query.filter(Inquiry.created_at <= to_date)

        total = query.count()
        new_count = query.filter(Inquiry.status == "new").count()
        contacted_count = query.filter(Inquiry.status == "contacted").count()
        interested_count = query.filter(Inquiry.status == "interested").count()
        follow_up_count = query.filter(Inquiry.status == "follow_up_scheduled").count()
        application_count = query.filter(Inquiry.status == "application_submitted").count()
        converted_count = query.filter(Inquiry.status == "admission_confirmed").count()
        lost_count = query.filter(Inquiry.status == "lost").count()

        conversion_pct = round((converted_count / total) * 100, 2) if total > 0 else 0.0

        # Overdue follow-ups
        fu_query = db.query(FollowUp).filter(FollowUp.institution_id == inst_uuid)
        if user_role == "counsellor" and user_id:
            fu_query = fu_query.filter(FollowUp.assigned_to == uuid.UUID(user_id))
        overdue = fu_query.filter(
            FollowUp.status == "pending",
            FollowUp.due_at < datetime.now(timezone.utc),
        ).count()

        # Status funnel
        status_breakdown = (
            db.query(Inquiry.status, func.count(Inquiry.id))
            .filter(Inquiry.institution_id == inst_uuid)
            .group_by(Inquiry.status)
            .all()
        )

        # Source breakdown
        source_breakdown = (
            db.query(Inquiry.source, func.count(Inquiry.id))
            .filter(Inquiry.institution_id == inst_uuid)
            .group_by(Inquiry.source)
            .all()
        )

        # Inquiry trend (last 30 days, daily counts)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        trend_query = db.query(
            func.date(Inquiry.created_at).label("day"),
            func.count(Inquiry.id).label("count"),
        ).filter(Inquiry.institution_id == inst_uuid)
        if from_date:
            trend_query = trend_query.filter(Inquiry.created_at >= from_date)
        if to_date:
            trend_query = trend_query.filter(Inquiry.created_at <= to_date)
        trend = trend_query.group_by(func.date(Inquiry.created_at)).order_by(func.date(Inquiry.created_at)).all()

        return {
            "total": total,
            "new": new_count,
            "contacted": contacted_count,
            "interested": interested_count,
            "follow_up_scheduled": follow_up_count,
            "application_submitted": application_count,
            "admission_confirmed": converted_count,
            "lost": lost_count,
            "conversion_percentage": conversion_pct,
            "overdue_follow_ups": overdue,
            "status_breakdown": [{"status": s, "count": c} for s, c in status_breakdown],
            "source_breakdown": [{"source": s or "unknown", "count": c} for s, c in source_breakdown],
            "trend": [{"day": str(d), "count": c} for d, c in trend],
        }
