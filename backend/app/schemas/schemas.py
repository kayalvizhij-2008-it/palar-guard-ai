from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserLogin(BaseModel):
    email: str
    password: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "Viewer"

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
    title: str
    priority: str = "Medium"
    assigned_to: str = "Field Team Alpha"
    findings: Optional[str] = ""
    verification_checklist: Optional[str] = ""

class InvestigationUpdate(BaseModel):
    status: Optional[str] = None
    findings: Optional[str] = None
    verification_checklist: Optional[str] = None

class InvestigationOut(BaseModel):
    id: int
    location_id: int
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
    title: str
    category: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    reporter_name: Optional[str] = "Anonymous Citizen"
    reporter_contact: Optional[str] = ""

class CommunityReportOut(BaseModel):
    id: int
    location_id: Optional[int]
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
    query: str
    location_id: Optional[int] = None

class AssistantResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence: str
    provenance: str
    limitations: str
