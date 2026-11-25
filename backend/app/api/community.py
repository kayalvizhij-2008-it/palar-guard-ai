from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.deps import get_current_user, get_optional_user, require_roles
from ..models.models import CommunityReport, AuditLog, User
from ..schemas.schemas import CommunityReportOut, CommunityReportCreate, CommunityReportUpdate

router = APIRouter(prefix="/community", tags=["Community Water Reporting"])


@router.get("/", response_model=List[CommunityReportOut])
@router.get("/reports", response_model=List[CommunityReportOut])
def get_reports(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(CommunityReport)
    if status:
        query = query.filter(CommunityReport.status == status)
    return query.order_by(CommunityReport.created_at.desc()).all()


@router.get("/my-reports", response_model=List[CommunityReportOut])
def get_my_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(CommunityReport)
        .filter(CommunityReport.owner_id == current_user.id)
        .order_by(CommunityReport.created_at.desc())
        .all()
    )


@router.post("/", response_model=CommunityReportOut, status_code=status.HTTP_201_CREATED)
@router.post("/reports", response_model=CommunityReportOut, status_code=status.HTTP_201_CREATED)
def submit_report(
    report_in: CommunityReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    category = (report_in.category or report_in.incident_type or "General Observation").strip()
    title = (report_in.title or f"{category} — {report_in.description[:48]}").strip()
    reporter_name = (
        current_user.full_name
        if current_user
        else (report_in.reporter_name or "Anonymous Citizen").strip()
    )

    report = CommunityReport(
        location_id=report_in.location_id,
        owner_id=current_user.id if current_user else None,
        title=title,
        category=category,
        description=report_in.description.strip(),
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        status="Pending Review",
        reporter_name=reporter_name,
        reporter_contact=(report_in.reporter_contact or "").strip(),
    )
    db.add(report)
    db.flush()
    db.add(
        AuditLog(
            user_email=current_user.email if current_user else "public_reporter",
            action="SUBMIT_COMMUNITY_REPORT",
            entity=f"REPORT #{report.id}",
            details=f"Submitted community report '{report.title}' ({report.category}).",
        )
    )
    db.commit()
    db.refresh(report)
    return report


@router.patch("/reports/{report_id}", response_model=CommunityReportOut)
def update_own_report(
    report_id: int,
    payload: CommunityReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Community report not found")

    if current_user.role != "Administrator" and report.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify another user's report.",
        )

    if report.status != "Pending Review" and current_user.role != "Administrator":
        raise HTTPException(
            status_code=400,
            detail="Reports already under review or verified cannot be edited.",
        )

    if payload.title is not None:
        report.title = payload.title.strip()
    if payload.description is not None:
        report.description = payload.description.strip()
    if payload.category is not None:
        report.category = payload.category.strip()

    db.commit()
    db.refresh(report)
    return report


@router.patch("/reports/{report_id}/status")
def moderate_report(
    report_id: int,
    new_status: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles("Administrator", "Environmental Analyst", "Field Investigator")
    ),
):
    report = db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Community report not found")

    valid_statuses = ["Pending Review", "Verified", "Rejected", "Action Initiated"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")

    old_status = report.status
    report.status = new_status
    db.add(
        AuditLog(
            user_email=current_user.email,
            action="MODERATE_COMMUNITY_REPORT",
            entity=f"REPORT #{report.id}",
            details=f"Changed status from '{old_status}' to '{new_status}'.",
        )
    )
    db.commit()
    return {"message": "Report status updated", "report_id": report.id, "status": report.status}
