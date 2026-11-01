import uuid
from sqlalchemy import String, Text, Integer, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class Course(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "courses"

    __table_args__ = (
        CheckConstraint("duration_months > 0", name="ck_course_duration_positive"),
        CheckConstraint("fee >= 0", name="ck_course_fee_nonnegative"),
    )

    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    code: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_months: Mapped[int] = mapped_column(Integer, nullable=False)
    fee: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    institution: Mapped["Institution"] = relationship(back_populates="courses")
    inquiries: Mapped[list["Inquiry"]] = relationship(back_populates="course")
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="course")

    def __repr__(self):  # pragma: no cover
        return f"<Course {self.code}>"
