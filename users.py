"""
User management endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session, joinedload
from app.api.deps import get_db, get_current_user, require_role, get_institution_id
from app.models.user import User
from app.models.role import Role
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.services.auth import AuthService
import uuid

router = APIRouter()


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    users = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.institution_id == uuid.UUID(institution_id))
        .all()
    )
    return users


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )
    user = User(
        institution_id=uuid.UUID(institution_id),
        role_id=uuid.UUID(user_in.role_id),
        full_name=user_in.full_name,
        email=user_in.email,
        password_hash=AuthService.hash_password(user_in.password),
        is_active=user_in.is_active,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    user = (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.id == uuid.UUID(user_id))
        .filter(User.institution_id == uuid.UUID(institution_id))
        .first()
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    user = (
        db.query(User)
        .filter(User.id == uuid.UUID(user_id))
        .filter(User.institution_id == uuid.UUID(institution_id))
        .first()
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    data = user_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        if field in ("role_id",) and value:
            setattr(user, field, uuid.UUID(value))
        else:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["super_admin", "institution_admin"])),
    institution_id: str = Depends(get_institution_id),
):
    user = (
        db.query(User)
        .filter(User.id == uuid.UUID(user_id))
        .filter(User.institution_id == uuid.UUID(institution_id))
        .first()
    )
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(user)
    db.commit()
    return None
