import { LocationData, GroundwaterPoint, WaterQualityPoint, AnomalyAlertItem, InvestigationItem, CommunityReportItem, RechargeItem } from '../types';

export const PALAR_LOCATIONS: LocationData[] = [
  { id: 1, name: "Ranipet Industrial Corridor", district: "Ranipet", state: "Tamil Nadu", latitude: 12.9274, longitude: 79.3330, basin_zone: "Middle Basin", risk_score: 78.5, confidence_level: "High" },
  { id: 2, name: "Ambur Tannery Cluster", district: "Tirupathur", state: "Tamil Nadu", latitude: 12.7904, longitude: 78.7166, basin_zone: "Upper Basin", risk_score: 74.2, confidence_level: "High" },
  { id: 3, name: "Vaniyambadi Watershed", district: "Tirupathur", state: "Tamil Nadu", latitude: 12.6825, longitude: 78.6186, basin_zone: "Upper Basin", risk_score: 68.0, confidence_level: "High" },
  { id: 4, name: "Vellore Central Anicut", district: "Vellore", state: "Tamil Nadu", latitude: 12.9165, longitude: 79.1325, basin_zone: "Central Basin", risk_score: 55.4, confidence_level: "Medium" },
  { id: 5, name: "Walajapet Agricultural Plains", district: "Ranipet", state: "Tamil Nadu", latitude: 12.9304, longitude: 79.3817, basin_zone: "Middle Basin", risk_score: 48.0, confidence_level: "High" },
  { id: 6, name: "Kanchipuram Temple Tank Grid", district: "Kanchipuram", state: "Tamil Nadu", latitude: 12.8342, longitude: 79.7036, basin_zone: "Lower Basin", risk_score: 42.5, confidence_level: "High" },
  { id: 7, name: "Chengalpattu Estuarine Reach", district: "Chengalpattu", state: "Tamil Nadu", latitude: 12.6841, longitude: 79.9836, basin_zone: "Coastal Discharge Zone", risk_score: 36.8, confidence_level: "Medium" },
];

export const GROUNDWATER_TIMESERIES: Record<number, GroundwaterPoint[]> = {
  1: [
    { period: "2023-Q1", depth_mbgl: 13.7, trend: -0.4, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q2", depth_mbgl: 16.3, trend: -0.8, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q3", depth_mbgl: 14.9, trend: 0.3, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q4", depth_mbgl: 11.4, trend: 1.8, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q1", depth_mbgl: 13.0, trend: -0.2, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q2", depth_mbgl: 16.7, trend: -1.1, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q3", depth_mbgl: 15.4, trend: 0.4, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q4", depth_mbgl: 11.6, trend: 2.1, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q1", depth_mbgl: 14.3, trend: -0.5, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q2", depth_mbgl: 18.1, trend: -1.4, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q3", depth_mbgl: 15.7, trend: 0.6, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q4", depth_mbgl: 12.3, trend: 1.9, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
    { period: "2026-Q1", depth_mbgl: 14.9, trend: -0.6, source: "CGWB Palar Aquifer Report", provenance: "VERIFIED_PUBLIC" },
  ],
  2: [
    { period: "2023-Q1", depth_mbgl: 13.2, trend: -0.3, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q2", depth_mbgl: 15.8, trend: -0.7, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q3", depth_mbgl: 14.1, trend: 0.4, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q4", depth_mbgl: 10.8, trend: 1.9, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q1", depth_mbgl: 12.5, trend: -0.3, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q2", depth_mbgl: 16.1, trend: -1.0, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q3", depth_mbgl: 14.7, trend: 0.5, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q4", depth_mbgl: 11.2, trend: 2.0, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q1", depth_mbgl: 13.8, trend: -0.4, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q2", depth_mbgl: 17.5, trend: -1.3, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q3", depth_mbgl: 15.2, trend: 0.7, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q4", depth_mbgl: 11.9, trend: 1.8, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2026-Q1", depth_mbgl: 14.5, trend: -0.5, source: "CGWB Monitoring Well", provenance: "VERIFIED_PUBLIC" },
  ],
  4: [
    { period: "2023-Q1", depth_mbgl: 11.2, trend: -0.4, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q2", depth_mbgl: 13.8, trend: -0.8, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q3", depth_mbgl: 12.4, trend: 0.3, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q4", depth_mbgl: 8.9, trend: 1.8, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q1", depth_mbgl: 10.5, trend: -0.2, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q2", depth_mbgl: 14.2, trend: -1.1, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q3", depth_mbgl: 12.9, trend: 0.4, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q4", depth_mbgl: 9.1, trend: 2.1, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q1", depth_mbgl: 11.8, trend: -0.5, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q2", depth_mbgl: 15.6, trend: -1.4, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q3", depth_mbgl: 13.2, trend: 0.6, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q4", depth_mbgl: 9.8, trend: 1.9, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
    { period: "2026-Q1", depth_mbgl: 12.4, trend: -0.6, source: "CGWB Central Well", provenance: "VERIFIED_PUBLIC" },
  ]
};

export const WATER_QUALITY_STATIONS: WaterQualityPoint[] = [
  { location_id: 1, location_name: "Ranipet Industrial Corridor", ph: 7.9, tds_mg_l: 1850.0, ec_us_cm: 2920.0, chromium_mg_l: 0.082, bod_mg_l: 4.8, do_mg_l: 4.2, status: "Critical", provenance: "HISTORICAL_REPORT" },
  { location_id: 2, location_name: "Ambur Tannery Cluster", ph: 8.1, tds_mg_l: 1920.0, ec_us_cm: 2840.0, chromium_mg_l: 0.071, bod_mg_l: 5.2, do_mg_l: 3.9, status: "Critical", provenance: "HISTORICAL_REPORT" },
  { location_id: 3, location_name: "Vaniyambadi Watershed", ph: 7.8, tds_mg_l: 1340.0, ec_us_cm: 2150.0, chromium_mg_l: 0.042, bod_mg_l: 3.6, do_mg_l: 4.8, status: "Elevated", provenance: "VERIFIED_PUBLIC" },
  { location_id: 4, location_name: "Vellore Central Anicut", ph: 7.5, tds_mg_l: 890.0, ec_us_cm: 1420.0, chromium_mg_l: 0.018, bod_mg_l: 2.8, do_mg_l: 5.6, status: "Normal", provenance: "VERIFIED_PUBLIC" },
  { location_id: 5, location_name: "Walajapet Agricultural Plains", ph: 7.3, tds_mg_l: 620.0, ec_us_cm: 980.0, chromium_mg_l: 0.010, bod_mg_l: 2.1, do_mg_l: 6.4, status: "Normal", provenance: "VERIFIED_PUBLIC" },
  { location_id: 6, location_name: "Kanchipuram Temple Tank Grid", ph: 7.2, tds_mg_l: 540.0, ec_us_cm: 860.0, chromium_mg_l: 0.008, bod_mg_l: 1.8, do_mg_l: 6.9, status: "Normal", provenance: "VERIFIED_PUBLIC" },
  { location_id: 7, location_name: "Chengalpattu Estuarine Reach", ph: 7.6, tds_mg_l: 1250.0, ec_us_cm: 1980.0, chromium_mg_l: 0.012, bod_mg_l: 2.4, do_mg_l: 6.1, status: "Normal", provenance: "VERIFIED_PUBLIC" },
];

export const ANOMALIES_DATA: AnomalyAlertItem[] = [
  {
    id: 1,
    location_id: 1,
    location_name: "Ranipet Industrial Corridor",
    parameter: "Chromium (Total) Surge",
    observed_value: 0.082,
    expected_baseline: 0.015,
    z_score: 3.84,
    severity: "Critical",
    status: "Open",
    trigger_reason: "Chromium concentration exceeds BIS 10500 drinking standard (0.05 mg/L) by 64% with Z-score 3.84 vs seasonal baseline.",
    created_at: "2026-02-21T09:30:00Z",
    provenance: "MODEL_PREDICTION"
  },
  {
    id: 2,
    location_id: 2,
    location_name: "Ambur Tannery Cluster",
    parameter: "EC & TDS Spillage Anomaly",
    observed_value: 2840.0,
    expected_baseline: 1450.0,
    z_score: 2.92,
    severity: "High",
    status: "Under Review",
    trigger_reason: "Surge in electrical conductivity indicating concentrated mineral effluent or high salinity seepage along drain stretch.",
    created_at: "2026-02-19T14:15:00Z",
    provenance: "MODEL_PREDICTION"
  },
  {
    id: 3,
    location_id: 3,
    location_name: "Vaniyambadi Watershed",
    parameter: "Accelerated Groundwater Drawdown",
    observed_value: 15.6,
    expected_baseline: 11.2,
    z_score: 2.45,
    severity: "Medium",
    status: "Open",
    trigger_reason: "Quarterly water table drawdown accelerated beyond historical mean by 3.4 meters following pre-monsoon extraction.",
    created_at: "2026-02-15T11:00:00Z",
    provenance: "MODEL_PREDICTION"
  }
];

export const INVESTIGATIONS_DATA: InvestigationItem[] = [
  {
    id: 101,
    location_id: 1,
    location_name: "Ranipet Industrial Corridor",
    title: "Ranipet Sluice Outflow & Chromium Verification",
    priority: "Urgent",
    status: "Assigned",
    assigned_to: "Aarthi L (Field Investigator)",
    findings: "Preliminary sensor calibration verified; field team dispatched with portable spectrophotometer and duplicate 1L sampling bottles.",
    checklist: [
      "Calibrate field photometer against zero-reference",
      "Collect duplicate 1L sample for laboratory ICP-MS testing",
      "Inspect upstream industrial discharge canal gate",
      "Log GPS coordinates and time of peak discoloration"
    ],
    created_at: "2026-02-21T10:00:00Z"
  },
  {
    id: 102,
    location_id: 2,
    location_name: "Ambur Tannery Cluster",
    title: "Ambur Riparian Salinity Ground Audit",
    priority: "High",
    status: "In Progress",
    assigned_to: "Harini S (Environmental Analyst)",
    findings: "Observed localized foaming near discharge channel. Community complaints corroborate sensor readings within 500m.",
    checklist: [
      "Test electrical conductivity across 4 adjacent farm borewells",
      "Interview local agricultural cooperative representative",
      "Cross-reference zero-liquid discharge (ZLD) operational logs",
      "Submit preliminary dispatch report"
    ],
    created_at: "2026-02-19T15:30:00Z"
  }
];

export const COMMUNITY_REPORTS_DATA: CommunityReportItem[] = [
  {
    id: 1,
    location_id: 2,
    location_name: "Ambur Tannery Cluster",
    title: "Dark discolored stream water near bypass canal",
    category: "Effluent Discoloration",
    description: "Dark brownish tint visible in the stream during evening hours with pungent smell. Irrigation well water tastes unusually saline.",
    latitude: 12.7885,
    longitude: 78.7210,
    status: "Verified",
    reporter_name: "K. Murugan (Ambur Farmer)",
    created_at: "2026-02-18T17:40:00Z"
  },
  {
    id: 2,
    location_id: 3,
    location_name: "Vaniyambadi Watershed",
    title: "Agricultural borewell dried up unexpectedly",
    category: "Well Depletion",
    description: "Borewell depth was 140 feet; stopped producing water three days ago after rapid drawdown in adjacent open agricultural wells.",
    latitude: 12.6790,
    longitude: 78.6220,
    status: "Action Initiated",
    reporter_name: "S. Selvaraj",
    created_at: "2026-02-14T08:15:00Z"
  }
];

export const RECHARGE_ASSESSMENTS_DATA: RechargeItem[] = [
  { id: 1, location_name: "Walajapet Agricultural Plains", soil: "Coarse Sand & Gravel Alluvium", slope: 1.4, head_m: 11.2, score: 88.0, recommended: "Series of Check Dams & Percolation Tanks", status: "High Priority Recharge Zone" },
  { id: 2, location_name: "Kanchipuram Temple Tank Grid", soil: "Fine Sand & Silt Clay", slope: 1.1, head_m: 8.4, score: 84.5, recommended: "Desiltation of Interconnected Traditional Eri/Tanks", status: "Restoration Opportunity" },
  { id: 3, location_name: "Vellore Central Anicut", soil: "Coarse River Sand over Gneiss", slope: 2.1, head_m: 12.8, score: 76.0, recommended: "Subsurface Dyke with Recharge Shaft", status: "Feasible" },
  { id: 4, location_name: "Ranipet Industrial Corridor", soil: "Weathered Charnockite / Clay Silt", slope: 2.6, head_m: 14.9, score: 58.0, recommended: "Infiltration requires strict pre-testing to avoid aquifer contamination", status: "Caution: Hydrochemical Risk" },
];

export const RAINFALL_SERIES = [
  { month: "Jun", rainfall_mm: 52.4, normal_mm: 60.0 },
  { month: "Jul", rainfall_mm: 78.2, normal_mm: 85.0 },
  { month: "Aug", rainfall_mm: 124.6, normal_mm: 110.0 },
  { month: "Sep", rainfall_mm: 145.8, normal_mm: 130.0 },
  { month: "Oct", rainfall_mm: 210.4, normal_mm: 195.0 },
  { month: "Nov", rainfall_mm: 285.0, normal_mm: 240.0 },
  { month: "Dec", rainfall_mm: 95.2, normal_mm: 80.0 },
  { month: "Jan", rainfall_mm: 12.4, normal_mm: 15.0 },
  { month: "Feb", rainfall_mm: 4.2, normal_mm: 8.0 },
];
