from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.models import Investigation
from ..schemas.schemas import InvestigationOut, InvestigationCreate, InvestigationUpdate

router = APIRouter(prefix="/investigations", tags=["Investigations & Dispatch"])

@router.get("/", response_model=List[InvestigationOut])
def get_investigations(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Investigation)
    if status:
        query = query.filter(Investigation.status == status)
    return query.order_by(Investigation.created_at.desc()).all()

@router.post("/", response_model=InvestigationOut)
def create_investigation(inv_in: InvestigationCreate, db: Session = Depends(get_db)):
    inv = Investigation(
        location_id=inv_in.location_id,
        title=inv_in.title,
        priority=inv_in.priority,
        status="Assigned",
        assigned_to=inv_in.assigned_to,
        findings=inv_in.findings or "",
        verification_checklist=inv_in.verification_checklist or "Verify sensor reading; Obtain physical sample; Inspect upstream terrain"
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

@router.patch("/{inv_id}", response_model=InvestigationOut)
def update_investigation(inv_id: int, inv_update: InvestigationUpdate, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == inv_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    
    if inv_update.status:
        inv.status = inv_update.status
    if inv_update.findings is not None:
        inv.findings = inv_update.findings
    if inv_update.verification_checklist is not None:
        inv.verification_checklist = inv_update.verification_checklist
    inv.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(inv)
    return inv
