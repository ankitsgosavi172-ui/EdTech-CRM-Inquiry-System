import uuid
from sqlalchemy import String, Text, ForeignKey, Index, CheckConstraint
from sqlalchemy.dialects.postgresql import TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class FollowUp(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "follow_ups"

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'completed', 'cancelled')",
            name="ck_follow_up_status_valid",
        ),
        Index("ix_follow_ups_due_status", "due_at", "status"),
        Index("ix_follow_ups_owner_status", "assigned_to", "status"),
    )

    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inquiry_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assigned_to: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    due_at: Mapped[TIMESTAMP] = mapped_column(TIMESTAMP(timezone=True), nullable=False, index=True)
    channel: Mapped[str | None] = mapped_column(String(30), nullable=True)
    purpose: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", index=True)
    outcome: Mapped[str | None] = mapped_column(Text, nullable=True)
    completed_at: Mapped[TIMESTAMP | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )

    institution: Mapped["Institution"] = relationship(back_populates="follow_ups")
    inquiry: Mapped["Inquiry"] = relationship(back_populates="follow_ups")
    assigned_user: Mapped["User"] = relationship(back_populates="assigned_follow_ups")

    def __repr__(self):  # pragma: no cover
        return f"<FollowUp {self.id} ({self.status})>"
