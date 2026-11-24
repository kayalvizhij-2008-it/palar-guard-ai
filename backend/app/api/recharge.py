from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.models import RechargeAssessment, Location

router = APIRouter(prefix="/recharge", tags=["Recharge Intervention Intelligence"])

@router.get("/assessments")
def get_recharge_assessments(db: Session = Depends(get_db)):
    results = db.query(RechargeAssessment, Location).join(Location, RechargeAssessment.location_id == Location.id).all()
    output = []
    for ra, loc in results:
        output.append({
            "id": ra.id,
            "location_id": loc.id,
            "location_name": loc.name,
            "district": loc.district,
            "soil_permeability": ra.soil_permeability,
            "slope_gradient_pct": ra.slope_gradient_pct,
            "aquifer_storage_head_m": ra.aquifer_storage_head_m,
            "recharge_suitability_score": ra.recharge_suitability_score,
            "recommended_intervention": ra.recommended_intervention,
            "status": ra.status,
            "methodology": "Hydrogeological Suitability Index evaluating sand thickness, hydraulic conductivity, and infiltration capacity."
        })
    return output
