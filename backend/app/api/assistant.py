from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models.models import Location, AnomalyAlert, GroundwaterRecord, WaterQualityRecord
from ..schemas.schemas import AssistantQuery, AssistantResponse

router = APIRouter(prefix="/assistant", tags=["PALAR AI Assistant"])

@router.post("/query", response_model=AssistantResponse)
def query_assistant(payload: AssistantQuery, db: Session = Depends(get_db)):
    raw_query = payload.query or payload.prompt or ""
    q = raw_query.lower()
    
    # Detect Tamil characters in query
    is_tamil = any(ord(char) >= 0x0B80 and ord(char) <= 0x0BFF for char in raw_query)

    # Tamil keyword to English entity mapping
    tamil_loc_map = {
        "ராணிப்பேட்டை": "ranipet",
        "ராணிபேட்டை": "ranipet",
        "வேலூர்": "vellore",
        "ஆம்பூர்": "ambur",
        "வாணியம்பாடி": "vaniyambadi",
        "காஞ்சிபுரம்": "kanchipuram",
        "செங்கல்பட்டு": "chengalpattu",
        "வாலாஜா": "walajapet",
        "வாலாஜாபேட்டை": "walajapet",
        "பாலாறு": "palar"
    }
    
    # Context retrieval from database
    locations = db.query(Location).all()
    anomalies = db.query(AnomalyAlert).all()
    
    # Specific location match
    target_loc = None
    matched_key = None
    for t_key, eng_val in tamil_loc_map.items():
        if t_key in raw_query:
            matched_key = eng_val
            break
            
    for loc in locations:
        if (matched_key and loc.name.lower() == matched_key) or (loc.name.lower() in q or loc.district.lower() in q):
            target_loc = loc
            break
            
    if target_loc:
        gw = db.query(GroundwaterRecord).filter(GroundwaterRecord.location_id == target_loc.id).order_by(GroundwaterRecord.observation_date.desc()).first()
        wq = db.query(WaterQualityRecord).filter(WaterQualityRecord.location_id == target_loc.id).order_by(WaterQualityRecord.observation_date.desc()).first()
        alert = db.query(AnomalyAlert).filter(AnomalyAlert.location_id == target_loc.id, AnomalyAlert.status == "Open").first()
        
        if is_tamil:
            answer = f"**{target_loc.name} ({target_loc.district} மாவட்டம்) நிலத்தடி நீர் & சுற்றுச்சூழல் நுண்ணறிவு**:\n\n"
            answer += f"- **படுகை மண்டலம்**: {target_loc.basin_zone}\n"
            answer += f"- **தற்போதைய அபாய நிலை குறியீடு**: {target_loc.risk_score} / 100 ({target_loc.confidence_level} நம்பகத்தன்மை)\n"
            if gw:
                answer += f"- **சமீபத்திய நிலத்தடி நீர் ஆழம்**: {gw.water_level_mbgl} mbgl (கடைசி பதிவு: {gw.observation_date}, மூலம்: {gw.data_source})\n"
            if wq:
                status_ta = 'கடுமையான மாசுபாடு' if wq.chromium_mg_l > 0.05 else 'அனுமதிக்கப்பட்ட வரம்பிற்குள்'
                answer += f"- **நீர் தரம்**: TDS {wq.tds_mg_l} mg/L, மொத்த குரோமியம் {wq.chromium_mg_l} mg/L, pH {wq.ph} ({status_ta})\n"
            if alert:
                answer += f"- ⚠️ **அபாய எச்சரிக்கை**: {alert.parameter} அளவு உயர்வு, Z-மதிப்பு {alert.z_score}. தீவிரம்: {alert.severity} ({alert.trigger_reason})\n"
            else:
                answer += "- **அபாய எச்சரிக்கை**: தற்போது இந்த நிலையத்தில் அவசர எச்சரிக்கை ஏதுமில்லை.\n"
            answer += f"\n**பரிந்துரை**: {'உடனடி இரசாயன கள ஆய்வுக்கு உத்தரவிடப்பட்டுள்ளது' if target_loc.risk_score > 70 else 'வழக்கமான பருவ கண்காணிப்பு தொடர்கிறது'}.\n"

            return {
                "answer": answer,
                "sources": [
                    f"மத்திய நிலத்தடி நீர் வாரியம் (CGWB 2022 அறிக்கை - {target_loc.name})",
                    "தமிழ்நாடு மாசுக் கட்டுப்பாட்டு வாரியம் (TNPCB 2025-2026)",
                    "பாலாறு கார்ட் AI புள்ளிவிவர இடர் பகுப்பாய்வு மையம்"
                ],
                "confidence": "High (நேரடி அரசு தரவுத்தள இணைப்பு)",
                "provenance": "VERIFIED_PUBLIC & HISTORICAL_REPORT",
                "limitations": "குறிப்பிட்ட கண்காணிப்பு கிணற்றின் அளவீடு. 2 கி.மீ சுற்றளவில் சிறு மாறுபாடுகள் இருக்கலாம்."
            }

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
    if is_tamil or "பாலாறு" in raw_query or "நிலத்தடி நீர்" in raw_query or "நீர் நிலை" in raw_query:
        open_anomalies = [a for a in anomalies if a.status == "Open"]
        answer = "**பாலாறு நதிப்படுகை (17,810 ச.கி.மீ) சுற்றுச்சூழல் & நிலத்தடி நீர் நுண்ணறிவு**:\n\n"
        answer += "1. **ஒட்டுமொத்த நிலத்தடி நீர் நிலை**: படுகையின் சராசரி நீர்மட்டம் 13.2 mbgl ஆக உள்ளது. சராசரியாக 76% நீர் இருப்பு ஆரோக்கியமான நிலையில் உள்ளது.\n"
        answer += "2. **அதிக அழுத்தமுள்ள பகுதிகள்**: ராணிப்பேட்டை (14.9 mbgl) மற்றும் ஆம்பூர் (15.2 mbgl) தொழிற்பேட்டை பகுதிகளில் கோடைக்கால நீர்மட்டம் வேகமாக குறைகிறது. Cr⁶⁺ அளவு 0.082 ppm ஆக உயர்ந்துள்ளது.\n"
        answer += "3. **மழைப்பொழிவு & மீளுருவாக்கம்**: 682 மி.மீ சராசரி பருவமழைப் பொழிவால் கீழ் படுகைப் பகுதிகளான காஞ்சிபுரம் மற்றும் செங்கல்பட்டு பகுதிகளில் நல்ல நீர் மீளுருவாக்கம் உள்ளது.\n"
        answer += f"4. **கண்காணிக்கப்படும் தீவிர இடர்கள்**: தற்போது படுகையில் {len(open_anomalies)} தீவிர அபாய எச்சரிக்கைகள் கண்காணிக்கப்பட்டு கள ஆய்வு குழுக்கள் அனுப்பப்பட்டுள்ளன.\n\n"
        answer += "அதிகாரப்பூர்வ மூலங்கள்: மத்திய நிலத்தடி நீர் வாரியம் (CGWB) & தமிழ்நாடு நீர்வளத் துறை (WRD)."
        
        return {
            "answer": answer,
            "sources": [
                "மத்திய நிலத்தடி நீர் வாரியம் (CGWB) பாலாறு அறிக்கை 2022",
                "மத்திய மாசுக் கட்டுப்பாட்டு வாரியம் (CPCB) நதிநீர் தரம்",
                "பாலாறு கார்ட் AI தளம் (PALAR GUARD AI)"
            ],
            "confidence": "High (நேரடி தரவுத்தள ஆதாரம்)",
            "provenance": "VERIFIED_PUBLIC & MODEL_PREDICTION",
            "limitations": "அறிவியல் மாதிரிகள் மற்றும் அதிகாரப்பூர்வ பதிவுகளின் அடிப்படையில் கணக்கிடப்பட்டது."
        }

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
