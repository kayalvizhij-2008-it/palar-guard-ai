from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import verify_password, get_password_hash, create_access_token
from ..core.deps import (
    get_current_user,
    require_roles,
    ALLOWED_ROLES,
    PUBLIC_REGISTRATION_ROLES,
)
from ..models.models import User, AuditLog
from ..schemas.schemas import UserLogin, UserCreate, UserOut, UserRoleUpdate, Token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")

    access_token = create_access_token(subject=user.email, role=user.role, user_id=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    email = user_in.email.strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=422, detail="A valid email address is required")

    requested_role = (user_in.role or "Community Reporter").strip()
    if requested_role not in PUBLIC_REGISTRATION_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Public registration is restricted to Community Reporter or Viewer roles. "
                "Privileged roles require administrator approval."
            ),
        )

    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already registered")

    user = User(
        email=email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name.strip(),
        role=requested_role,
        is_active=True,
    )
    db.add(user)
    db.add(
        AuditLog(
            user_email=email,
            action="USER_REGISTERED",
            entity="USER",
            details=f"Registered public account with role '{requested_role}'.",
        )
    )
    db.commit()
    db.refresh(user)
    return user


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/users/{user_id}/role", response_model=UserOut)
def update_user_role(
    user_id: int,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_roles("Administrator")),
):
    if payload.role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Allowed roles: {', '.join(ALLOWED_ROLES)}",
        )

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = target.role
    target.role = payload.role
    if payload.is_active is not None:
        target.is_active = payload.is_active

    db.add(
        AuditLog(
            user_email=admin_user.email,
            action="ROLE_UPDATED",
            entity=f"USER #{target.id}",
            details=f"Updated role for {target.email} from '{old_role}' to '{payload.role}'.",
        )
    )
    db.commit()
    db.refresh(target)
    return target
