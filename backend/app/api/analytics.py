from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.models import Location, GroundwaterRecord, WaterQualityRecord, AnomalyAlert, Investigation, CommunityReport

router = APIRouter(prefix="/analytics", tags=["Analytics & System Overview"])

@router.get("/summary")
def get_system_summary(db: Session = Depends(get_db)):
    total_locations = db.query(Location).count()
    total_gw_records = db.query(GroundwaterRecord).count()
    total_wq_records = db.query(WaterQualityRecord).count()
    open_anomalies = db.query(AnomalyAlert).filter(AnomalyAlert.status == "Open").count()
    active_investigations = db.query(Investigation).filter(Investigation.status != "Resolved").count()
    community_reports = db.query(CommunityReport).count()
    
    # Calculate average basin groundwater level
    recent_gw = db.query(GroundwaterRecord).order_by(GroundwaterRecord.observation_date.desc()).limit(10).all()
    avg_gw = round(sum(r.water_level_mbgl for r in recent_gw) / len(recent_gw), 2) if recent_gw else 12.4
    
    return {
        "monitored_stations": total_locations,
        "groundwater_observations_count": total_gw_records,
        "water_quality_observations_count": total_wq_records,
        "active_anomalies": open_anomalies,
        "active_investigations": active_investigations,
        "community_reports_count": community_reports,
        "basin_average_gw_mbgl": avg_gw,
        "basin_status": "Elevated Monitoring Required in Upper/Middle Tannery & Industrial Stretches",
        "last_sync": "2026-02-24T10:00:00Z"
    }
