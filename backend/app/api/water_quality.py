from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.models import WaterQualityRecord
from ..schemas.schemas import WaterQualityRecordOut

router = APIRouter(prefix="/water-quality", tags=["Water Quality Intelligence"])

@router.get("/records", response_model=List[WaterQualityRecordOut])
def get_quality_records(location_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(WaterQualityRecord)
    if location_id:
        query = query.filter(WaterQualityRecord.location_id == location_id)
    return query.all()

@router.get("/standards-reference")
def get_standards():
    return {
        "reference_standard": "Bureau of Indian Standards (BIS 10500:2012) & CPCB Designated Best Use (Class C)",
        "parameters": [
            {"name": "pH", "acceptable_limit": "6.5 - 8.5", "unit": "pH Units", "health_significance": "Corrosivity and chemical equilibrium"},
            {"name": "TDS (Total Dissolved Solids)", "acceptable_limit": "< 500", "permissible_limit": "2000", "unit": "mg/L", "health_significance": "Palatability, gastrointestinal irritation, mineral toxicity"},
            {"name": "Electrical Conductivity (EC)", "acceptable_limit": "< 1500", "unit": "µS/cm", "health_significance": "Indicator of ionic discharge & salinity intrusion"},
            {"name": "Chromium (Total)", "acceptable_limit": "< 0.05", "unit": "mg/L", "health_significance": "Carcinogenic heavy metal associated with industrial tannery effluent"},
            {"name": "BOD (Biochemical Oxygen Demand)", "acceptable_limit": "< 3.0", "unit": "mg/L", "health_significance": "Organic pollutant load and aquatic life depletion"},
            {"name": "DO (Dissolved Oxygen)", "acceptable_limit": "> 5.0", "unit": "mg/L", "health_significance": "Primary index of aquatic ecosystem health"}
        ],
        "important_guideline": "Standards applied strictly with appropriate distinction between river environmental water and treated tap water."
    }
