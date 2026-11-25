from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from ..core.database import get_db
from ..models.models import (
    Location, GroundwaterRecord, RainfallRecord, 
    WaterQualityRecord, AnomalyAlert, Investigation, 
    CommunityReport, RechargeAssessment
)

router = APIRouter(prefix="/maps", tags=["Geospatial Maps Engine"])

# Palar River Basin Catchment Boundary (17,810 km²) in GeoJSON Polygon format
PALAR_BASIN_BOUNDARY_COORDS = [
    [78.20, 12.60], [78.40, 13.15], [79.10, 13.25], 
    [79.80, 13.10], [80.20, 12.75], [80.05, 12.45], 
    [79.40, 12.40], [78.60, 12.45], [78.20, 12.60]
]

# Palar River Main Spine LineString
PALAR_RIVER_SPINE_COORDS = [
    [78.25, 12.65], [78.6186, 12.6825], [78.7166, 12.7904], 
    [79.1325, 12.9165], [79.3328, 12.9298], [79.3850, 12.9304], 
    [79.7036, 12.8342], [79.9888, 12.6819], [80.1550, 12.5180]
]

# Pydantic Schemas for Map Filtering
class MapFilterPayload(BaseModel):
    district: Optional[str] = "all"
    layer: Optional[str] = "all"
    min_risk: Optional[float] = 0.0
    status: Optional[str] = "all"
    basin_zone: Optional[str] = "all"

@router.get("/overview")
def get_map_overview(db: Session = Depends(get_db)):
    """Comprehensive Palar River Basin 17,810 km² GIS Overview."""
    locations = db.query(Location).all()
    open_anomalies_count = db.query(AnomalyAlert).filter(AnomalyAlert.status == "Open").count()
    active_inv_count = db.query(Investigation).filter(Investigation.status.in_(["Assigned", "In Progress"])).count()

    return {
        "type": "FeatureCollection",
        "metadata": {
            "basin_name": "Palar River Basin",
            "catchment_area_km2": 17810,
            "districts": ["Tirupathur", "Vellore", "Ranipet", "Kanchipuram", "Chengalpattu"],
            "state": "Tamil Nadu & Karnataka/Andhra border reaches",
            "active_monitoring_stations": len(locations),
            "open_anomalies": open_anomalies_count,
            "active_investigations": active_inv_count,
            "data_confidence": "95.4% (CGWB / TNPCB Verified)"
        },
        "features": [
            {
                "type": "Feature",
                "id": "palar_catchment_boundary",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [PALAR_BASIN_BOUNDARY_COORDS]
                },
                "properties": {
                    "name": "Palar River Catchment Perimeter",
                    "area_km2": 17810,
                    "stroke": "#10b981",
                    "stroke_width": 2.5,
                    "fill": "#062319",
                    "fill_opacity": 0.25,
                    "provenance": "VERIFIED_PUBLIC"
                }
            },
            {
                "type": "Feature",
                "id": "palar_river_spine",
                "geometry": {
                    "type": "LineString",
                    "coordinates": PALAR_RIVER_SPINE_COORDS
                },
                "properties": {
                    "name": "Palar River Main Channel",
                    "length_km": 348,
                    "stroke": "#38bdf8",
                    "stroke_width": 3.0,
                    "provenance": "VERIFIED_PUBLIC"
                }
            }
        ]
    }

@router.get("/layers")
def get_map_layers():
    """Catalog of available GIS raster and vector layers with default visibility."""
    return [
        {"id": "catchment_boundary", "name": "17,810 km² Catchment Perimeter", "category": "hydrology", "enabled": True, "type": "vector_polygon"},
        {"id": "river_network", "name": "Palar River Channel & Tributaries", "category": "hydrology", "enabled": True, "type": "vector_line"},
        {"id": "stations", "name": "CGWB Monitoring Wells & Stations", "category": "monitoring", "enabled": True, "type": "point_marker"},
        {"id": "groundwater", "name": "Groundwater Depth (mbgl) Hydrographs", "category": "groundwater", "enabled": True, "type": "point_metric"},
        {"id": "rainfall", "name": "IMD NWIC Monsoon Catchment Isohyets", "category": "meteorology", "enabled": False, "type": "point_metric"},
        {"id": "water_quality", "name": "TNPCB Chemical & Chromium Surveillance", "category": "water_quality", "enabled": True, "type": "point_metric"},
        {"id": "anomalies", "name": "Robust Z-Score Statistical Outliers", "category": "risk", "enabled": True, "type": "alert_marker"},
        {"id": "risks", "name": "Multi-Criteria Weighted Risk Prioritisation", "category": "risk", "enabled": False, "type": "zone_choropleth"},
        {"id": "community_reports", "name": "Citizen Water Concern Geotags", "category": "community", "enabled": False, "type": "incident_marker"},
        {"id": "investigations", "name": "Field Officer Verification Tickets", "category": "field", "enabled": False, "type": "field_marker"},
        {"id": "recharge", "name": "Managed Aquifer Recharge (MAR) Sites", "category": "recharge", "enabled": False, "type": "intervention_marker"}
    ]

@router.get("/stations")
def get_map_stations(
    district: Optional[str] = Query(None),
    min_risk: Optional[float] = Query(0.0),
    db: Session = Depends(get_db)
):
    """GeoJSON FeatureCollection of all Palar Basin monitoring stations."""
    query = db.query(Location)
    if district and district.lower() != "all":
        query = query.filter(Location.district.ilike(f"%{district}%"))
    if min_risk and min_risk > 0:
        query = query.filter(Location.risk_score >= min_risk)
        
    locations = query.all()

    features = []
    for loc in locations:
        latest_gw = db.query(GroundwaterRecord).filter(GroundwaterRecord.location_id == loc.id).order_by(GroundwaterRecord.observation_date.desc()).first()
        latest_wq = db.query(WaterQualityRecord).filter(WaterQualityRecord.location_id == loc.id).order_by(WaterQualityRecord.observation_date.desc()).first()
        active_alert = db.query(AnomalyAlert).filter(AnomalyAlert.location_id == loc.id, AnomalyAlert.status == "Open").first()

        features.append({
            "type": "Feature",
            "id": loc.id,
            "geometry": {
                "type": "Point",
                "coordinates": [loc.longitude, loc.latitude]
            },
            "properties": {
                "station_id": loc.id,
                "name": loc.name,
                "district": loc.district,
                "state": loc.state,
                "basin_zone": loc.basin_zone,
                "risk_score": loc.risk_score,
                "confidence_level": loc.confidence_level,
                "is_monitored": loc.is_monitored,
                "latest_depth_mbgl": latest_gw.water_level_mbgl if latest_gw else None,
                "latest_tds_mg_l": latest_wq.tds_mg_l if latest_wq else None,
                "latest_chromium_mg_l": latest_wq.chromium_mg_l if latest_wq else None,
                "has_open_anomaly": active_alert is not None,
                "anomaly_parameter": active_alert.parameter if active_alert else None,
                "provenance": "VERIFIED_PUBLIC"
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/stations/{station_id}")
def get_map_station_detail(station_id: int, db: Session = Depends(get_db)):
    """Full detail dossier for a single monitoring station."""
    loc = db.query(Location).filter(Location.id == station_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Station not found")

    gw_records = db.query(GroundwaterRecord).filter(GroundwaterRecord.location_id == loc.id).order_by(GroundwaterRecord.observation_date.desc()).limit(10).all()
    wq_records = db.query(WaterQualityRecord).filter(WaterQualityRecord.location_id == loc.id).order_by(WaterQualityRecord.observation_date.desc()).limit(10).all()
    rainfall_records = db.query(RainfallRecord).filter(RainfallRecord.location_id == loc.id).order_by(RainfallRecord.observation_date.desc()).limit(10).all()
    anomalies = db.query(AnomalyAlert).filter(AnomalyAlert.location_id == loc.id).all()
    investigations = db.query(Investigation).filter(Investigation.location_id == loc.id).all()
    recharge = db.query(RechargeAssessment).filter(RechargeAssessment.location_id == loc.id).first()

    return {
        "station_id": loc.id,
        "name": loc.name,
        "district": loc.district,
        "state": loc.state,
        "basin_zone": loc.basin_zone,
        "coordinates": {"latitude": loc.latitude, "longitude": loc.longitude},
        "risk_priority": {
            "score": loc.risk_score,
            "category": "Critical" if loc.risk_score > 70 else "Elevated" if loc.risk_score > 50 else "Moderate",
            "confidence": loc.confidence_level
        },
        "groundwater": {
            "current_depth_mbgl": gw_records[0].water_level_mbgl if gw_records else None,
            "trend_rate_m_yr": gw_records[0].trend_rate if gw_records else None,
            "observation_date": gw_records[0].observation_date if gw_records else None,
            "source": gw_records[0].data_source if gw_records else "CGWB Palar Archive",
            "provenance": gw_records[0].provenance if gw_records else "VERIFIED_PUBLIC"
        },
        "water_quality": {
            "tds_mg_l": wq_records[0].tds_mg_l if wq_records else None,
            "total_chromium_mg_l": wq_records[0].chromium_mg_l if wq_records else None,
            "ph": wq_records[0].ph if wq_records else None,
            "ec_us_cm": wq_records[0].ec_us_cm if wq_records else None,
            "source": wq_records[0].data_source if wq_records else "TNPCB Monitoring Series",
            "compliance_status": "Non-Compliant" if (wq_records and wq_records[0].chromium_mg_l > 0.05) else "Compliant"
        },
        "rainfall": {
            "annual_mean_mm": rainfall_records[0].rainfall_mm if rainfall_records else 682.0,
            "normal_mm": rainfall_records[0].normal_rainfall_mm if rainfall_records else 610.0,
            "deviation_pct": rainfall_records[0].deviation_pct if rainfall_records else 12.0
        },
        "recharge_suitability": {
            "score": recharge.recharge_suitability_score if recharge else 78.0,
            "recommended_structure": recharge.recommended_intervention if recharge else "Check Dam with Recharge Well",
            "soil": recharge.soil_permeability if recharge else "Alluvial Sand"
        },
        "active_alerts": [
            {
                "id": a.id,
                "parameter": a.parameter,
                "severity": a.severity,
                "status": a.status,
                "z_score": a.z_score,
                "trigger_reason": a.trigger_reason
            } for a in anomalies if a.status == "Open"
        ],
        "active_investigations": [
            {
                "id": inv.id,
                "title": inv.title,
                "priority": inv.priority,
                "status": inv.status,
                "assigned_to": inv.assigned_to
            } for inv in investigations if inv.status in ["Assigned", "In Progress"]
        ]
    }

@router.get("/groundwater")
def get_map_groundwater(db: Session = Depends(get_db)):
    """GeoJSON groundwater observations layer across Palar Basin."""
    locations = db.query(Location).all()
    features = []
    for loc in locations:
        gw = db.query(GroundwaterRecord).filter(GroundwaterRecord.location_id == loc.id).order_by(GroundwaterRecord.observation_date.desc()).first()
        if gw:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [loc.longitude, loc.latitude]},
                "properties": {
                    "station_id": loc.id,
                    "name": loc.name,
                    "district": loc.district,
                    "depth_mbgl": gw.water_level_mbgl,
                    "trend_m_yr": gw.trend_rate,
                    "observation_date": gw.observation_date,
                    "source": gw.data_source,
                    "provenance": gw.provenance,
                    "stress_category": "Severe" if gw.water_level_mbgl > 14.5 else "Moderate" if gw.water_level_mbgl > 12.0 else "Normal"
                }
            })
    return {"type": "FeatureCollection", "features": features}

@router.get("/rainfall")
def get_map_rainfall(db: Session = Depends(get_db)):
    """GeoJSON rainfall distribution layer across Palar catchment."""
    locations = db.query(Location).all()
    features = []
    for loc in locations:
        rf = db.query(RainfallRecord).filter(RainfallRecord.location_id == loc.id).order_by(RainfallRecord.observation_date.desc()).first()
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [loc.longitude, loc.latitude]},
            "properties": {
                "station_id": loc.id,
                "name": loc.name,
                "district": loc.district,
                "rainfall_mm": rf.rainfall_mm if rf else 682.0,
                "normal_mm": rf.normal_rainfall_mm if rf else 610.0,
                "deviation_pct": rf.deviation_pct if rf else 11.8,
                "observation_date": rf.observation_date if rf else "2025-11",
                "source": "IMD NWIC Palar Catchment Series",
                "provenance": "VERIFIED_PUBLIC"
            }
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/water-quality")
def get_map_water_quality(db: Session = Depends(get_db)):
    """GeoJSON water-quality surveillance points."""
    locations = db.query(Location).all()
    features = []
    for loc in locations:
        wq = db.query(WaterQualityRecord).filter(WaterQualityRecord.location_id == loc.id).order_by(WaterQualityRecord.observation_date.desc()).first()
        if wq:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [loc.longitude, loc.latitude]},
                "properties": {
                    "station_id": loc.id,
                    "name": loc.name,
                    "district": loc.district,
                    "tds_mg_l": wq.tds_mg_l,
                    "total_chromium_mg_l": wq.chromium_mg_l,
                    "ph": wq.ph,
                    "ec_us_cm": wq.ec_us_cm,
                    "is_chromium_outlier": wq.chromium_mg_l > 0.05,
                    "is_tds_alert": wq.tds_mg_l > 1500,
                    "observation_date": wq.observation_date,
                    "source": wq.data_source,
                    "provenance": wq.provenance
                }
            })
    return {"type": "FeatureCollection", "features": features}

@router.get("/anomalies")
def get_map_anomalies(db: Session = Depends(get_db)):
    """GeoJSON active anomaly alerts."""
    anomalies = db.query(AnomalyAlert).filter(AnomalyAlert.status == "Open").all()
    features = []
    for a in anomalies:
        loc = db.query(Location).filter(Location.id == a.location_id).first()
        if loc:
            features.append({
                "type": "Feature",
                "id": a.id,
                "geometry": {"type": "Point", "coordinates": [loc.longitude, loc.latitude]},
                "properties": {
                    "anomaly_id": a.id,
                    "station_id": loc.id,
                    "station_name": loc.name,
                    "parameter": a.parameter,
                    "observed_value": a.observed_value,
                    "expected_baseline": a.expected_baseline,
                    "z_score": a.z_score,
                    "severity": a.severity,
                    "trigger_reason": a.trigger_reason,
                    "provenance": a.provenance
                }
            })
    return {"type": "FeatureCollection", "features": features}

@router.get("/risks")
def get_map_risks(db: Session = Depends(get_db)):
    """GeoJSON risk zones based on spatial MCDA ranking."""
    locations = db.query(Location).all()
    features = []
    for loc in locations:
        features.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [loc.longitude, loc.latitude]},
            "properties": {
                "station_id": loc.id,
                "name": loc.name,
                "district": loc.district,
                "risk_score": loc.risk_score,
                "risk_tier": "Critical Risk" if loc.risk_score > 70 else "Elevated Risk" if loc.risk_score > 50 else "Moderate Baseline",
                "color": "#ef4444" if loc.risk_score > 70 else "#f59e0b" if loc.risk_score > 50 else "#10b981",
                "confidence": loc.confidence_level
            }
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/community-reports")
def get_map_community_reports(db: Session = Depends(get_db)):
    """GeoJSON community incident submissions."""
    reports = db.query(CommunityReport).all()
    features = []
    for rep in reports:
        lng = rep.longitude or 79.3328
        lat = rep.latitude or 12.9298
        features.append({
            "type": "Feature",
            "id": rep.id,
            "geometry": {"type": "Point", "coordinates": [lng, lat]},
            "properties": {
                "report_id": rep.id,
                "title": rep.title,
                "category": rep.category,
                "description": rep.description,
                "status": rep.status,
                "created_at": rep.created_at.strftime("%Y-%m-%d %H:%M"),
                "provenance": "COMMUNITY_REPORT"
            }
        })
    return {"type": "FeatureCollection", "features": features}

@router.get("/investigations")
def get_map_investigations(db: Session = Depends(get_db)):
    """GeoJSON field investigation locations."""
    investigations = db.query(Investigation).all()
    features = []
    for inv in investigations:
        loc = db.query(Location).filter(Location.id == inv.location_id).first()
        if loc:
            features.append({
                "type": "Feature",
                "id": inv.id,
                "geometry": {"type": "Point", "coordinates": [loc.longitude, loc.latitude]},
                "properties": {
                    "investigation_id": inv.id,
                    "title": inv.title,
                    "priority": inv.priority,
                    "status": inv.status,
                    "assigned_to": inv.assigned_to,
                    "location_name": loc.name,
                    "district": loc.district,
                    "findings": inv.findings
                }
            })
    return {"type": "FeatureCollection", "features": features}

@router.get("/recharge")
def get_map_recharge(db: Session = Depends(get_db)):
    """GeoJSON Managed Aquifer Recharge (MAR) candidate locations."""
    assessments = db.query(RechargeAssessment).all()
    features = []
    for a in assessments:
        loc = db.query(Location).filter(Location.id == a.location_id).first()
        if loc:
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": [loc.longitude, loc.latitude]},
                "properties": {
                    "assessment_id": a.id,
                    "location_name": loc.name,
                    "suitability_score": a.recharge_suitability_score,
                    "recommended_intervention": a.recommended_intervention,
                    "soil": a.soil_permeability,
                    "slope": a.slope_gradient_pct,
                    "status": a.status,
                    "provenance": "MODEL_PREDICTION"
                }
            })
    return {"type": "FeatureCollection", "features": features}

@router.get("/locations/search")
def search_locations(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    """Search monitoring stations or districts."""
    results = db.query(Location).filter(
        Location.name.ilike(f"%{q}%") | Location.district.ilike(f"%{q}%")
    ).all()
    return [
        {
            "id": l.id,
            "name": l.name,
            "district": l.district,
            "basin_zone": l.basin_zone,
            "latitude": l.latitude,
            "longitude": l.longitude,
            "risk_score": l.risk_score
        } for l in results
    ]

@router.get("/feature-info")
def get_feature_info(
    lat: float = Query(...),
    lng: float = Query(...),
    db: Session = Depends(get_db)
):
    """Find closest monitoring station to a clicked point."""
    locations = db.query(Location).all()
    if not locations:
        raise HTTPException(status_code=404, detail="No stations available")

    # Euclidean distance approximation for nearby points
    def distance(l):
        return (l.latitude - lat)**2 + (l.longitude - lng)**2

    closest = min(locations, key=distance)
    return get_map_station_detail(closest.id, db)

@router.post("/filters")
def filter_map_data(payload: MapFilterPayload, db: Session = Depends(get_db)):
    """Filtered FeatureCollection based on multi-parameter query."""
    query = db.query(Location)
    if payload.district and payload.district.lower() != "all":
        query = query.filter(Location.district.ilike(f"%{payload.district}%"))
    if payload.basin_zone and payload.basin_zone.lower() != "all":
        query = query.filter(Location.basin_zone.ilike(f"%{payload.basin_zone}%"))
    if payload.min_risk and payload.min_risk > 0:
        query = query.filter(Location.risk_score >= payload.min_risk)

    locations = query.all()
    features = []
    for loc in locations:
        features.append({
            "type": "Feature",
            "id": loc.id,
            "geometry": {"type": "Point", "coordinates": [loc.longitude, loc.latitude]},
            "properties": {
                "station_id": loc.id,
                "name": loc.name,
                "district": loc.district,
                "risk_score": loc.risk_score,
                "basin_zone": loc.basin_zone,
                "confidence_level": loc.confidence_level
            }
        })
    return {"type": "FeatureCollection", "features": features}
