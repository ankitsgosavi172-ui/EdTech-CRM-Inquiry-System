import uuid
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class InquiryActivity(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "inquiry_activities"

    __table_args__ = (
        Index("ix_activities_inquiry_created", "inquiry_id", "created_at"),
    )

    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inquiry_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    actor_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    from_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    to_status: Mapped[str | None] = mapped_column(String(40), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    activity_metadata: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    institution: Mapped["Institution"] = relationship(back_populates="activities")
    inquiry: Mapped["Inquiry"] = relationship(back_populates="activities")
    actor: Mapped["User | None"] = relationship(back_populates="activities")

    def __repr__(self):  # pragma: no cover
        return f"<InquiryActivity {self.activity_type} on {self.inquiry_id}>"
