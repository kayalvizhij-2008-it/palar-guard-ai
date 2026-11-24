from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.models import RainfallRecord
from ..schemas.schemas import RainfallRecordOut

router = APIRouter(prefix="/rainfall", tags=["Rainfall & Recharge"])

@router.get("/", response_model=List[RainfallRecordOut])
@router.get("/records", response_model=List[RainfallRecordOut])
def get_rainfall_records(location_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(RainfallRecord)
    if location_id:
        query = query.filter(RainfallRecord.location_id == location_id)
    return query.order_by(RainfallRecord.observation_date.asc()).all()

@router.get("/monsoon-summary")
def get_monsoon_summary():
    return {
        "basin": "Palar River Basin",
        "catchment_area_sq_km": 17810,
        "primary_monsoon": "Northeast Monsoon (Oct - Dec) accounts for 55% of annual precipitation",
        "secondary_monsoon": "Southwest Monsoon (Jun - Sep) accounts for 32% of annual precipitation",
        "recent_pattern": "Normal to slightly above-normal late monsoon events recorded across Ranipet and Vellore, providing seasonal recharge opportunity in coarse alluvium stretches."
    }
