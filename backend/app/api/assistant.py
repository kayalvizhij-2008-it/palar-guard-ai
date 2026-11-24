from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.models import Location, AnomalyAlert, GroundwaterRecord, WaterQualityRecord
from ..schemas.schemas import AssistantQuery, AssistantResponse

router = APIRouter(prefix="/assistant", tags=["PALAR AI Assistant"])

@router.post("/query", response_model=AssistantResponse)
def query_assistant(payload: AssistantQuery, db: Session = Depends(get_db)):
    q = payload.query.lower()
    
    # Context retrieval from database
    locations = db.query(Location).all()
    anomalies = db.query(AnomalyAlert).all()
    
    # Specific location match
    target_loc = None
    for loc in locations:
        if loc.name.lower() in q or loc.district.lower() in q:
            target_loc = loc
            break
            
    if target_loc:
        gw = db.query(GroundwaterRecord).filter(GroundwaterRecord.location_id == target_loc.id).order_by(GroundwaterRecord.observation_date.desc()).first()
        wq = db.query(WaterQualityRecord).filter(WaterQualityRecord.location_id == target_loc.id).order_by(WaterQualityRecord.observation_date.desc()).first()
        alert = db.query(AnomalyAlert).filter(AnomalyAlert.location_id == target_loc.id, AnomalyAlert.status == "Open").first()
        
        answer = f"**Location Intelligence for {target_loc.name} ({target_loc.district} District)**:\n\n"
        answer += f"- **Basin Zone**: {target_loc.basin_zone}\n"
        answer += f"- **Current Risk Priority Score**: {target_loc.risk_score} / 100 ({target_loc.confidence_level} Confidence)\n"
        if gw:
            answer += f"- **Latest Groundwater Depth**: {gw.water_level_mbgl} mbgl (Observed {gw.observation_date}, Source: {gw.data_source})\n"
        if wq:
            answer += f"- **Water Quality Profile**: TDS {wq.tds_mg_l} mg/L, Total Chromium {wq.chromium_mg_l} mg/L, pH {wq.ph} (Status: {'Elevated Contamination' if wq.chromium_mg_l > 0.05 else 'Within Normal Limits'})\n"
        if alert:
            answer += f"- ⚠️ **Active Anomaly Alert**: {alert.parameter} triggered on {alert.created_at.strftime('%Y-%m-%d')} with Z-score {alert.z_score}. Severity: {alert.severity} ({alert.trigger_reason})\n"
        else:
            answer += "- **Active Anomaly Alert**: No critical anomalies actively open for this station.\n"
            
        answer += f"\n**Recommended Action**: {'Field investigation dispatched for chemical validation' if target_loc.risk_score > 70 else 'Continue regular seasonal monitoring'}.\n"
        
        return {
            "answer": answer,
            "sources": [
                f"CGWB Palar Aquifer Report 2022 ({target_loc.name} Observation Well)",
                f"TNPCB / CPCB River Basin Monitoring Series (2025-2026)",
                f"PALAR GUARD Statistical Anomaly Detection Engine"
            ],
            "confidence": "High (Direct Database Grounding)",
            "provenance": "VERIFIED_PUBLIC & HISTORICAL_REPORT",
            "limitations": "Readings represent point monitoring observations. Local micro-variations between wells within a 2km radius may occur."
        }
    
    # General queries about anomalies, basin status, or methods
    if "anomaly" in q or "risk" in q or "pollution" in q:
        open_anomalies = [a for a in anomalies if a.status == "Open"]
        answer = f"**PALAR Basin Water-Risk Anomaly Summary**:\n\n"
        answer += f"Currently tracking **{len(open_anomalies)} open anomalies** across the Palar River Basin:\n\n"
        for idx, a in enumerate(open_anomalies, 1):
            loc_name = next((l.name for l in locations if l.id == a.location_id), "Unknown")
            answer += f"{idx}. **{loc_name}**: {a.parameter} (Observed: {a.observed_value}, Baseline: {a.expected_baseline}, Severity: {a.severity})\n"
        answer += "\n*Note: Anomaly detection indicates a statistically unusual departure from historical baseline, signaling a need for priority field verification rather than definitive causation.*"
        
        return {
            "answer": answer,
            "sources": [
                "PALAR GUARD Statistical Outlier Detection (Robust Z-Score / IQR)",
                "CPCB Polluted River Stretches Report (Palar Stretches)"
            ],
            "confidence": "High",
            "provenance": "MODEL_PREDICTION & VERIFIED_PUBLIC",
            "limitations": "Statistical departures should be cross-verified with physical borehole testing before regulatory enforcement."
        }

    # Default overview
    return {
        "answer": (
            "**PALAR GUARD AI Environmental Decision Assistant**\n\n"
            "I can answer specific questions regarding:\n"
            "1. **Groundwater trends** by location (e.g. *What is the groundwater trend in Ranipet?*)\n"
            "2. **Water quality and anomalies** (e.g. *Which locations have active pollution alerts?*)\n"
            "3. **Rainfall and recharge opportunities** across the Upper, Middle, and Coastal Basin\n"
            "4. **Data provenance and reliability** across monitoring stations\n\n"
            "Please ask about a specific Palar Basin location (Ranipet, Ambur, Vaniyambadi, Vellore, Walajapet, Kanchipuram, Chengalpattu) or risk parameter."
        ),
        "sources": [
            "Central Ground Water Board (CGWB) Palar Aquifer Master Report",
            "Central Pollution Control Board (CPCB) River Quality Directory",
            "India Water Resources Information System (India-WRIS)"
        ],
        "confidence": "High",
        "provenance": "SYSTEM_GROUNDED",
        "limitations": "AI responses are deterministic and grounded in verified Palar Basin observations."
    }
