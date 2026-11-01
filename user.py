import uuid
from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"

    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(CITEXT, unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    institution: Mapped["Institution"] = relationship(back_populates="users")
    role: Mapped["Role"] = relationship(back_populates="users")
    counsellor_profile: Mapped["Counsellor | None"] = relationship(
        back_populates="user", uselist=False
    )
    activities: Mapped[list["InquiryActivity"]] = relationship(back_populates="actor")
    assigned_inquiries: Mapped[list["Inquiry"]] = relationship(
        back_populates="assigned_user", foreign_keys="[Inquiry.assigned_to]"
    )
    assigned_follow_ups: Mapped[list["FollowUp"]] = relationship(
        back_populates="assigned_user", foreign_keys="[FollowUp.assigned_to]"
    )
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")

    def __repr__(self):  # pragma: no cover
        return f"<User {self.email}>"
