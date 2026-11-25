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
    role = Column(String(50), default="Community Reporter")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, index=True, nullable=False)
    district = Column(String(255), index=True, nullable=False)
    state = Column(String(100), default="Tamil Nadu")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    basin_zone = Column(String(100), default="Upper Basin")
    is_monitored = Column(Boolean, default=True)
    risk_score = Column(Float, default=50.0)
    confidence_level = Column(String(50), default="Medium")

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
    observation_date = Column(String(50), nullable=False)
    water_level_mbgl = Column(Float, nullable=False)
    trend_rate = Column(Float, default=0.0)
    provenance = Column(String(100), default="VERIFIED_PUBLIC")
    is_synthetic = Column(Boolean, default=False)
    data_source = Column(String(255), default="CGWB Palar Aquifer Report / India-WRIS")
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="groundwater_records")


class RainfallRecord(Base):
    __tablename__ = "rainfall_records"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    observation_date = Column(String(50), nullable=False)
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
    ph = Column(Float, nullable=False)
    tds_mg_l = Column(Float, nullable=False)
    ec_us_cm = Column(Float, nullable=False)
    chromium_mg_l = Column(Float, default=0.01)
    bod_mg_l = Column(Float, default=2.5)
    do_mg_l = Column(Float, default=6.5)
    provenance = Column(String(100), default="VERIFIED_PUBLIC")
    is_synthetic = Column(Boolean, default=False)
    data_source = Column(String(255), default="TNPCB / CPCB River Basin Monitoring")
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="water_quality_records")


class AnomalyAlert(Base):
    __tablename__ = "anomaly_alerts"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    parameter = Column(String(100), nullable=False)
    observed_value = Column(Float, nullable=False)
    expected_baseline = Column(Float, nullable=False)
    z_score = Column(Float, nullable=False)
    severity = Column(String(50), default="Medium")
    status = Column(String(50), default="Open")
    trigger_reason = Column(Text, nullable=False)
    provenance = Column(String(100), default="MODEL_PREDICTION")
    created_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="anomalies")


class Investigation(Base):
    __tablename__ = "investigations"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    priority = Column(String(50), default="Medium")
    status = Column(String(50), default="Assigned")
    assigned_to = Column(String(255), default="Unassigned")
    findings = Column(Text, default="")
    verification_checklist = Column(
        Text,
        default="Verify well depth; Measure field EC; Inspect upstream drain; Check duplicate record",
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    location = relationship("Location", back_populates="investigations")


class CommunityReport(Base):
    __tablename__ = "community_reports"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    status = Column(String(50), default="Pending Review")
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
    recharge_suitability_score = Column(Float, default=82.0)
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


class DocumentRecord(Base):
    __tablename__ = "document_records"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(32), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    page_count = Column(Integer, default=1)
    extraction_status = Column(String(50), default="extracted")  # extracted | partial | failed | ocr_unavailable
    extraction_notes = Column(Text, default="")
    extracted_text = Column(Text, default="")
    extracted_tables_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    analyses = relationship(
        "DocumentAnalysis",
        foreign_keys="[DocumentAnalysis.document_id]",
        back_populates="document",
        cascade="all, delete-orphan",
    )


class DocumentAnalysis(Base):
    __tablename__ = "document_analyses"
    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("document_records.id"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    compared_document_id = Column(Integer, ForeignKey("document_records.id"), nullable=True)
    task_type = Column(String(64), nullable=False)
    instruction = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    provider_mode = Column(String(64), default="deterministic_extraction")
    result_markdown = Column(Text, nullable=False)
    observations_json = Column(Text, default="[]")
    interpretations_json = Column(Text, default="[]")
    missing_info_json = Column(Text, default="[]")
    citations_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("DocumentRecord", foreign_keys=[document_id], back_populates="analyses")


class WatchlistLocation(Base):
    __tablename__ = "watchlist_locations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    alert_threshold_mbgl = Column(Float, default=15.0)
    alert_threshold_tds = Column(Float, default=1500.0)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
