from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.deps import require_roles
from ..models.models import AnomalyAlert, AuditLog, User
from ..schemas.schemas import AnomalyAlertOut

router = APIRouter(prefix="/anomalies", tags=["Pollution & Water Anomalies"])


@router.get("/", response_model=List[AnomalyAlertOut])
def get_anomalies(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AnomalyAlert)
    if status:
        query = query.filter(AnomalyAlert.status == status)
    return query.order_by(AnomalyAlert.created_at.desc()).all()


@router.patch("/{alert_id}/status")
def update_anomaly_status(
    alert_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrator", "Environmental Analyst")),
):
    alert = db.query(AnomalyAlert).filter(AnomalyAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Anomaly alert not found")

    valid_statuses = ["Open", "Under Review", "Verified", "Dismissed"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    old_status = alert.status
    alert.status = new_status
    db.add(
        AuditLog(
            user_email=current_user.email,
            action="ANOMALY_TRIAGE",
            entity=f"ANOMALY #{alert.id}",
            details=f"Changed status from '{old_status}' to '{new_status}'.",
        )
    )
    db.commit()
    db.refresh(alert)
    return {"message": "Status updated successfully", "alert_id": alert.id, "status": alert.status}
