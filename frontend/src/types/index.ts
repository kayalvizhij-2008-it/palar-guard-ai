export type UserRole = 
  | 'Administrator'
  | 'Environmental Analyst'
  | 'Researcher'
  | 'Field Investigator'
  | 'Community Reporter'
  | 'Viewer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export type ProvenanceType = 
  | 'VERIFIED_PUBLIC'
  | 'HISTORICAL_REPORT'
  | 'COMMUNITY_REPORT'
  | 'MODEL_PREDICTION'
  | 'SYNTHETIC_DEMO'
  | 'FIELD_VERIFIED';

export interface LocationData {
  id: number;
  station_code: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  basin_zone: 'Upper Basin' | 'Central Basin' | 'Middle Basin' | 'Lower Basin' | 'Coastal Discharge Zone';
  aquifer_type: string;
  cpcb_stretch_priority?: string;
  risk_score: number;
  confidence_level: 'High' | 'Medium' | 'Low';
  verified_source: string;
}

export interface GroundwaterPoint {
  period: string;
  depth_mbgl: number;
  trend: number;
  source: string;
  provenance: ProvenanceType;
}

export interface WaterQualityPoint {
  location_id: number;
  location_name: string;
  ph: number;
  tds_mg_l: number;
  ec_us_cm: number;
  chromium_mg_l: number;
  bod_mg_l: number;
  do_mg_l: number;
  status: 'Normal' | 'Elevated' | 'Critical';
  sample_context: 'River Surface Water' | 'Borewell / Aquifer' | 'Industrial Drain Discharge';
  standards_comparison: {
    bis_drinking_status: string;
    cpcb_class_c_status: string;
  };
  provenance: ProvenanceType;
  citation: string;
}

export interface AnomalyAlertItem {
  id: number;
  location_id: number;
  location_name: string;
  parameter: string;
  observed_value: number;
  expected_baseline: number;
  z_score: number;
  mad_deviation: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Under Review' | 'Verified' | 'Dismissed';
  trigger_reason: string;
  detection_method: string;
  created_at: string;
  provenance: ProvenanceType;
}

export interface InvestigationItem {
  id: number;
  location_id: number;
  location_name: string;
  title: string;
  priority: 'Urgent' | 'High' | 'Medium';
  status: 'Assigned' | 'In Progress' | 'Field Samples Collected' | 'Resolved';
  assigned_to: string;
  findings: string;
  checklist: string[];
  created_at: string;
}

export interface CommunityReportItem {
  id: number;
  location_id?: number;
  location_name: string;
  title: string;
  category: 'Well Depletion' | 'Effluent Discoloration' | 'Odor/Foaming' | 'Sand Mining';
  description: string;
  latitude: number;
  longitude: number;
  status: 'Pending Review' | 'Verified' | 'Rejected' | 'Action Initiated';
  reporter_name: string;
  created_at: string;
}

export interface RechargeItem {
  id: number;
  location_name: string;
  soil: string;
  slope: number;
  head_m: number;
  score: number;
  recommended: string;
  status: string;
  hydrological_context: string;
}

export interface PresentationStep {
  stepIndex: number;
  title: string;
  subtitle: string;
  narration: string;
  targetModule: string;
  highlightedLocationId?: number;
  keyMetricLabel: string;
  keyMetricValue: string;
  provenance: ProvenanceType;
}
