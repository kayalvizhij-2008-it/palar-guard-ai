from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.deps import require_roles
from ..core.config import settings
from ..models.models import (
    User,
    AuditLog,
    Location,
    GroundwaterRecord,
    WaterQualityRecord,
    RainfallRecord,
    AnomalyAlert,
    Investigation,
    CommunityReport,
    DocumentRecord,
)

router = APIRouter(prefix="/admin", tags=["Administration & Audit"])


@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("Administrator")),
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.get("/audit-logs")
def list_audit_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("Administrator")),
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(min(limit, 200)).all()
    return [
        {
            "id": log.id,
            "user_email": log.user_email,
            "action": log.action,
            "entity": log.entity,
            "details": log.details,
            "created_at": log.created_at.isoformat(),
        }
        for log in logs
    ]


@router.get("/system-status")
def get_system_status(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_roles("Administrator")),
):
    return {
        "environment": settings.ENVIRONMENT,
        "database_backend": "sqlite" if settings.DATABASE_URL.startswith("sqlite") else "postgresql",
        "counts": {
            "users": db.query(User).count(),
            "locations": db.query(Location).count(),
            "groundwater_records": db.query(GroundwaterRecord).count(),
            "water_quality_records": db.query(WaterQualityRecord).count(),
            "rainfall_records": db.query(RainfallRecord).count(),
            "anomalies": db.query(AnomalyAlert).count(),
            "investigations": db.query(Investigation).count(),
            "community_reports": db.query(CommunityReport).count(),
            "documents": db.query(DocumentRecord).count(),
            "audit_logs": db.query(AuditLog).count(),
        },
    }
