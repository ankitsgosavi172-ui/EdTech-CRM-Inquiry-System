import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class Counsellor(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "counsellors"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    institution_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("institutions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    user: Mapped["User"] = relationship(back_populates="counsellor_profile")
    institution: Mapped["Institution"] = relationship(back_populates="counsellors")
    assigned_inquiries: Mapped[list["Inquiry"]] = relationship(
        back_populates="counsellor_profile", foreign_keys="[Inquiry.assigned_to]"
    )

    def __repr__(self):  # pragma: no cover
        return f"<Counsellor {self.user_id}>"
