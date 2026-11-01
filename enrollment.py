import uuid
from datetime import date
from sqlalchemy import String, Numeric, ForeignKey, Index
from sqlalchemy.dialects.postgresql import DATE
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class Enrollment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "enrollments"

    __table_args__ = (
        Index("ix_enrollments_inquiry_unique", "inquiry_id", unique=True),
    )

    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True
    )
    inquiry_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("inquiries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    enrollment_date: Mapped[date] = mapped_column(DATE, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="active")
    fee_agreed: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)

    institution: Mapped["Institution"] = relationship(back_populates="enrollments")
    student: Mapped["Student"] = relationship(back_populates="enrollments")
    inquiry: Mapped["Inquiry"] = relationship(back_populates="enrollment")
    course: Mapped["Course"] = relationship(back_populates="enrollments")

    def __repr__(self):  # pragma: no cover
        return f"<Enrollment {self.student_id} -> {self.course_id}>"
