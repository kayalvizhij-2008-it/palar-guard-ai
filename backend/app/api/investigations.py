from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.deps import require_roles
from ..models.models import Investigation, Location, AuditLog, User
from ..schemas.schemas import InvestigationOut, InvestigationCreate, InvestigationUpdate

router = APIRouter(prefix="/investigations", tags=["Investigations & Dispatch"])

VALID_STATUSES = ("Assigned", "In Progress", "Field Samples Collected", "Report Filed", "Resolved")


@router.get("/", response_model=List[InvestigationOut])
def get_investigations(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Administrator", "Environmental Analyst", "Field Investigator", "Researcher")
    ),
):
    query = db.query(Investigation)
    if status_filter:
        query = query.filter(Investigation.status == status_filter)
    return query.order_by(Investigation.created_at.desc()).all()


@router.post("/", response_model=InvestigationOut, status_code=status.HTTP_201_CREATED)
def create_investigation(
    inv_in: InvestigationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("Administrator", "Environmental Analyst")),
):
    loc = db.query(Location).filter(Location.id == inv_in.location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Target location not found")

    inv = Investigation(
        location_id=inv_in.location_id,
        created_by_id=current_user.id,
        title=inv_in.title,
        priority=inv_in.priority,
        status="Assigned",
        assigned_to=inv_in.assigned_to,
        findings=inv_in.findings or "",
        verification_checklist=inv_in.verification_checklist
        or "Verify sensor reading; Obtain duplicate sample; Inspect upstream terrain",
    )
    db.add(inv)
    db.flush()
    db.add(
        AuditLog(
            user_email=current_user.email,
            action="CREATE_INVESTIGATION",
            entity=f"INVESTIGATION #{inv.id}",
            details=f"Created field investigation '{inv.title}' for {loc.name}.",
        )
    )
    db.commit()
    db.refresh(inv)
    return inv


@router.patch("/{inv_id}", response_model=InvestigationOut)
def update_investigation(
    inv_id: int,
    inv_update: InvestigationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Administrator", "Environmental Analyst", "Field Investigator")
    ),
):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Field Investigators may only modify investigations assigned to them or created by them
    if current_user.role == "Field Investigator":
        assigned = (inv.assigned_to or "").lower()
        is_assigned = (
            current_user.email.lower() in assigned
            or current_user.full_name.lower() in assigned
            or inv.created_by_id == current_user.id
        )
        if not is_assigned:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Field investigators can only update investigations assigned to them.",
            )

    if inv_update.status:
        if inv_update.status not in VALID_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}",
            )
        inv.status = inv_update.status
    if inv_update.findings is not None:
        inv.findings = inv_update.findings
    if inv_update.verification_checklist is not None:
        inv.verification_checklist = inv_update.verification_checklist
    if inv_update.assigned_to is not None:
        if current_user.role not in ("Administrator", "Environmental Analyst"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only administrators or analysts can reassign investigations.",
            )
        inv.assigned_to = inv_update.assigned_to

    inv.updated_at = datetime.utcnow()
    db.add(
        AuditLog(
            user_email=current_user.email,
            action="UPDATE_INVESTIGATION",
            entity=f"INVESTIGATION #{inv.id}",
            details=f"Updated status='{inv.status}'.",
        )
    )
    db.commit()
    db.refresh(inv)
    return inv
