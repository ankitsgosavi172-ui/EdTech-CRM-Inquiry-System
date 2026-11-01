import uuid
from sqlalchemy import String, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class Inquiry(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "inquiries"

    __table_args__ = (
        Index("ix_inquiries_institution_status", "institution_id", "status"),
        Index("ix_inquiries_institution_created", "institution_id", "created_at"),
        Index("ix_inquiries_assigned_status", "assigned_to", "status"),
    )

    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("students.id", ondelete="SET NULL"), nullable=True, index=True
    )
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    course_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("courses.id", ondelete="SET NULL"), nullable=True, index=True
    )
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True, index=True)
    source: Mapped[str | None] = mapped_column(String(60), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="new", index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    lost_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    institution: Mapped["Institution"] = relationship(back_populates="inquiries")
    student: Mapped["Student | None"] = relationship(back_populates="inquiries")
    assigned_user: Mapped["User | None"] = relationship(
        back_populates="assigned_inquiries", foreign_keys=[assigned_to]
    )
    course: Mapped["Course | None"] = relationship(back_populates="inquiries")
    follow_ups: Mapped[list["FollowUp"]] = relationship(back_populates="inquiry")
    activities: Mapped[list["InquiryActivity"]] = relationship(back_populates="inquiry")
    enrollment: Mapped["Enrollment | None"] = relationship(
        back_populates="inquiry", uselist=False
    )

    def __repr__(self):  # pragma: no cover
        return f"<Inquiry {self.full_name} ({self.status})>"
