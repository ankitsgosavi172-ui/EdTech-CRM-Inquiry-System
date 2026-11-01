from sqlalchemy import String, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, UUIDMixin, TimestampMixin


class Institution(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "institutions"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str | None] = mapped_column(String(40), unique=True, nullable=True, index=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    users: Mapped[list["User"]] = relationship(back_populates="institution")
    students: Mapped[list["Student"]] = relationship(back_populates="institution")
    courses: Mapped[list["Course"]] = relationship(back_populates="institution")
    inquiries: Mapped[list["Inquiry"]] = relationship(back_populates="institution")

    def __repr__(self):  # pragma: no cover
        return f"<Institution {self.name}>"
