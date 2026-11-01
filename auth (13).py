"""
Authentication service: user lookup, password verification, token creation.
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import User
from app.schemas.token import Token, TokenData, LoginRequest


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return user

    @staticmethod
    def create_token_for_user(user: User, role_name: str) -> Token:
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "institution_id": str(user.institution_id),
                "role": role_name,
            }
        )
        return Token(access_token=access_token)

    @staticmethod
    def hash_password(password: str) -> str:
        return get_password_hash(password)

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        import uuid
        return db.query(User).filter(User.id == uuid.UUID(user_id)).first()
