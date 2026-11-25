from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str


class UserCreate(BaseModel):
    email: str
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2, max_length=120)
    role: Optional[str] = "Community Reporter"


class UserRoleUpdate(BaseModel):
    role: str
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# Location Schemas
class LocationOut(BaseModel):
    id: int
    name: str
    district: str
    state: str
    latitude: float
    longitude: float
    basin_zone: str
    is_monitored: bool
    risk_score: float
    confidence_level: str

    class Config:
        from_attributes = True


# Groundwater Schemas
class GroundwaterRecordOut(BaseModel):
    id: int
    location_id: int
    observation_date: str
    water_level_mbgl: float
    trend_rate: float
    provenance: str
    is_synthetic: bool
    data_source: str

    class Config:
        from_attributes = True


# Rainfall Schemas
class RainfallRecordOut(BaseModel):
    id: int
    location_id: int
    observation_date: str
    rainfall_mm: float
    normal_rainfall_mm: float
    deviation_pct: float
    provenance: str
    is_synthetic: bool
    data_source: str

    class Config:
        from_attributes = True


# Water Quality Schemas
class WaterQualityRecordOut(BaseModel):
    id: int
    location_id: int
    observation_date: str
    ph: float
    tds_mg_l: float
    ec_us_cm: float
    chromium_mg_l: float
    bod_mg_l: float
    do_mg_l: float
    provenance: str
    is_synthetic: bool
    data_source: str

    class Config:
        from_attributes = True


# Anomaly Schemas
class AnomalyAlertOut(BaseModel):
    id: int
    location_id: int
    parameter: str
    observed_value: float
    expected_baseline: float
    z_score: float
    severity: str
    status: str
    trigger_reason: str
    provenance: str
    created_at: datetime

    class Config:
        from_attributes = True


# Investigation Schemas
class InvestigationCreate(BaseModel):
    location_id: int
    title: str = Field(..., min_length=3, max_length=255)
    priority: str = "Medium"
    assigned_to: str = "Unassigned"
    findings: Optional[str] = ""
    verification_checklist: Optional[str] = ""


class InvestigationUpdate(BaseModel):
    status: Optional[str] = None
    findings: Optional[str] = None
    verification_checklist: Optional[str] = None
    assigned_to: Optional[str] = None


class InvestigationOut(BaseModel):
    id: int
    location_id: int
    created_by_id: Optional[int] = None
    title: str
    priority: str
    status: str
    assigned_to: str
    findings: str
    verification_checklist: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Community Report Schemas
class CommunityReportCreate(BaseModel):
    location_id: Optional[int] = None
    title: Optional[str] = None
    category: Optional[str] = None
    incident_type: Optional[str] = None
    description: str = Field(..., min_length=5)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reporter_name: Optional[str] = "Anonymous Citizen"
    reporter_contact: Optional[str] = ""


class CommunityReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class CommunityReportOut(BaseModel):
    id: int
    location_id: Optional[int]
    owner_id: Optional[int] = None
    title: str
    category: str
    description: str
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    reporter_name: str
    created_at: datetime

    class Config:
        from_attributes = True


# AI Assistant Query & Response
class AssistantQuery(BaseModel):
    query: Optional[str] = None
    prompt: Optional[str] = None
    location_id: Optional[int] = None


class AssistantResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: str
    provenance: str
    limitations: str


# Document Intelligence Schemas
class DocumentAnalyzeRequest(BaseModel):
    task_type: str = "summarise"
    instruction: str = Field(..., min_length=2)
    language: str = "en"
    compare_document_id: Optional[int] = None


class DocumentAnalysisOut(BaseModel):
    id: int
    document_id: int
    compared_document_id: Optional[int] = None
    task_type: str
    instruction: str
    language: str
    provider_mode: str
    result_markdown: str
    observations: List[str]
    interpretations: List[str]
    missing_information: List[str]
    citations: List[str]
    created_at: datetime


class DocumentOut(BaseModel):
    id: int
    owner_id: int
    filename: str
    file_type: str
    file_size_bytes: int
    sha256_hash: str
    page_count: int
    extraction_status: str
    extraction_notes: str
    extracted_text: str
    tables: List[Any]
    created_at: datetime


# Watchlist Schemas
class WatchlistCreate(BaseModel):
    location_id: int
    alert_threshold_mbgl: float = 15.0
    alert_threshold_tds: float = 1500.0
    notes: Optional[str] = ""
