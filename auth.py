"""
Authentication endpoints: login, me, change-password.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.models.role import Role
from app.schemas.token import Token, LoginRequest, ChangePasswordRequest
from app.services.auth import AuthService

router = APIRouter()


@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    role = db.query(Role).filter(Role.id == user.role_id).first()
    role_name = role.name if role else ""
    return AuthService.create_token_for_user(user, role_name)


@router.get("/me", response_model=dict)
def get_me(current_user: User = Depends(get_current_user)):
    role = current_user.role
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": role.name if role else None,
        "institution_id": str(current_user.institution_id),
        "is_active": current_user.is_active,
    }


@router.post("/change-password")
def change_password(
    pwd_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(pwd_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.password_hash = get_password_hash(pwd_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
