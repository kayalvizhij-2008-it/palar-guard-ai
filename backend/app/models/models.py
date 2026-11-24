from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Viewer")  # Administrator, Environmental Analyst, Researcher, Field Investigator, Community Reporter, Viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    district = Column(String(255), index=True, nullable=False) # Vellore, Ranipet, Tirupathur, Kanchipuram, Chengalpattu
    state = Column(String(100), default="Tamil Nadu")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    basin_zone = Column(String(100), default="Upper Basin") # Upper Basin, Middle Basin, Coastal Discharge Zone
    is_monitored = Column(Boolean, default=True)
    risk_score = Column(Float, default=50.0) # 0-100
    confidence_level = Column(String(50), default="Medium") # High, Medium, Low
    
    # Relationships
    groundwater_records = relationship("GroundwaterRecord", back_populates="location")
    rainfall_records = relationship("RainfallRecord", back_populates="location")
    water_quality_records = relationship("WaterQualityRecord", back_populates="location")
    anomalies = relationship("AnomalyAlert", back_populates="location")
    investigations = relationship("Investigation", back_populates="location")
    community_reports = relationship("CommunityReport", back_populates="location")

class GroundwaterRecord(Base):
    __tablename__ = "groundwater_records"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    observation_date = Column(String(50), nullable=False) # YYYY-MM
    water_level_mbgl = Column(Float, nullable=False) # Meters below ground level
    trend_rate = Column(Float, default=0.0) # m/year change
    provenance = Column(String(100), default="VERIFIED_PUBLIC") # VERIFIED_PUBLIC, HISTORICAL_REPORT, SYNTHETIC_DEMO
    is_synthetic = Column(Boolean, default=False)
    data_source = Column(String(255), default="CGWB Palar Aquifer Report / India-WRIS")
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="groundwater_records")

class RainfallRecord(Base):
    __tablename__ = "rainfall_records"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    observation_date = Column(String(50), nullable=False) # YYYY-MM
    rainfall_mm = Column(Float, nullable=False)
    normal_rainfall_mm = Column(Float, nullable=False)
    deviation_pct = Column(Float, default=0.0)
    provenance = Column(String(100), default="VERIFIED_PUBLIC")
    is_synthetic = Column(Boolean, default=False)
    data_source = Column(String(255), default="IMD NWIC Palar Catchment Series")
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="rainfall_records")

class WaterQualityRecord(Base):
    __tablename__ = "water_quality_records"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    observation_date = Column(String(50), nullable=False)
    ph = Column(Float, nullable=False) # 6.5 - 8.5 standard
    tds_mg_l = Column(Float, nullable=False) # Total Dissolved Solids (< 500 standard)
    ec_us_cm = Column(Float, nullable=False) # Electrical Conductivity
    chromium_mg_l = Column(Float, default=0.01) # Total Chromium (< 0.05 standard)
    bod_mg_l = Column(Float, default=2.5) # Biochemical Oxygen Demand (< 3 standard)
    do_mg_l = Column(Float, default=6.5) # Dissolved Oxygen (> 5 standard)
    provenance = Column(String(100), default="VERIFIED_PUBLIC")
    is_synthetic = Column(Boolean, default=False)
    data_source = Column(String(255), default="TNPCB / CPCB River Basin Monitoring")
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="water_quality_records")

class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    parameter = Column(String(100), nullable=False) # e.g. "TDS Spike", "Chromium Outlier", "Rapid Groundwater Drop"
    observed_value = Column(Float, nullable=False)
    expected_baseline = Column(Float, nullable=False)
    z_score = Column(Float, nullable=False)
    severity = Column(String(50), default="Medium") # Critical, High, Medium, Low
    status = Column(String(50), default="Open") # Open, Under Review, Verified, Dismissed
    trigger_reason = Column(Text, nullable=False)
    provenance = Column(String(100), default="MODEL_PREDICTION")
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="anomalies")

class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    title = Column(String(255), nullable=False)
    priority = Column(String(50), default="Medium") # Urgent, High, Medium, Normal
    status = Column(String(50), default="Assigned") # Assigned, In Progress, Field Samples Collected, Report Filed, Resolved
    assigned_to = Column(String(255), default="Field Team Alpha")
    findings = Column(Text, default="")
    verification_checklist = Column(Text, default="Verify well depth; Measure field EC; Inspect upstream drain; Check duplicate record")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="investigations")

class CommunityReport(Base):
    __tablename__ = "community_reports"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False) # Well Depletion, Effluent Discoloration, Odor/Foaming, Sand Mining
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(50), default="Pending Review") # Pending Review, Verified, Rejected, Action Initiated
    reporter_name = Column(String(255), default="Anonymous Citizen")
    reporter_contact = Column(String(255), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="community_reports")

class RechargeAssessment(Base):
    __tablename__ = "recharge_assessments"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    soil_permeability = Column(String(100), default="Sandy Alluvium (High)")
    slope_gradient_pct = Column(Float, default=1.8)
    aquifer_storage_head_m = Column(Float, default=12.5)
    recharge_suitability_score = Column(Float, default=82.0) # 0 - 100
    recommended_intervention = Column(String(255), default="Percolation Pond with Recharge Shaft")
    status = Column(String(100), default="Preliminary Assessment (Field Verification Required)")
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), default="system")
    action = Column(String(255), nullable=False)
    entity = Column(String(100), nullable=False)
    details = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
