from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.models import CommunityReport
from ..schemas.schemas import CommunityReportOut, CommunityReportCreate

router = APIRouter(prefix="/community", tags=["Community Water Reporting"])

@router.get("/", response_model=List[CommunityReportOut])
@router.get("/reports", response_model=List[CommunityReportOut])
def get_reports(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CommunityReport)
    if status:
        query = query.filter(CommunityReport.status == status)
    return query.order_by(CommunityReport.created_at.desc()).all()

@router.post("/", response_model=CommunityReportOut)
@router.post("/reports", response_model=CommunityReportOut)
def submit_report(report_in: CommunityReportCreate, db: Session = Depends(get_db)):
    report = CommunityReport(
        location_id=report_in.location_id,
        title=report_in.title,
        category=report_in.category,
        description=report_in.description,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        status="Pending Review",
        reporter_name=report_in.reporter_name or "Anonymous Citizen",
        reporter_contact=report_in.reporter_contact or ""
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.patch("/reports/{report_id}/status")
def moderate_report(report_id: int, new_status: str, db: Session = Depends(get_db)):
    report = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Community report not found")
    
    valid_statuses = ["Pending Review", "Verified", "Rejected", "Action Initiated"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    report.status = new_status
    db.commit()
    return {"message": "Report status updated", "report_id": report.id, "status": report.status}
