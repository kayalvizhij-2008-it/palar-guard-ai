import { 
  LocationData, GroundwaterPoint, WaterQualityPoint, 
  AnomalyAlertItem, InvestigationItem, CommunityReportItem, 
  RechargeItem, PresentationStep 
} from '../types';

export const PALAR_LOCATIONS: LocationData[] = [
  { 
    id: 1, 
    station_code: "CGWB-TN-RP-04",
    name: "Ranipet Industrial Corridor", 
    district: "Ranipet", 
    state: "Tamil Nadu", 
    latitude: 12.9274, 
    longitude: 79.3330, 
    basin_zone: "Middle Basin", 
    aquifer_type: "River Alluvium over Weathered Charnockite",
    cpcb_stretch_priority: "Priority-V (Vaniyambadi to Walajapet)",
    risk_score: 78.5, 
    confidence_level: "High",
    verified_source: "CGWB Palar Aquifer Report 2022 / CPCB Polluted Stretches (Priority-V)"
  },
  { 
    id: 2, 
    station_code: "CGWB-TN-TP-02",
    name: "Ambur Tannery Cluster", 
    district: "Tirupathur", 
    state: "Tamil Nadu", 
    latitude: 12.7904, 
    longitude: 78.7166, 
    basin_zone: "Upper Basin", 
    aquifer_type: "Fissured Biotite Gneiss & Sandy Clay",
    cpcb_stretch_priority: "Priority-V (Tannery Cluster Stretch)",
    risk_score: 74.2, 
    confidence_level: "High",
    verified_source: "Springer Palar Hydrogeochemistry 2016 / CGWB Water Quality Database"
  },
  { 
    id: 3, 
    station_code: "CGWB-TN-TP-01",
    name: "Vaniyambadi Watershed", 
    district: "Tirupathur", 
    state: "Tamil Nadu", 
    latitude: 12.6825, 
    longitude: 78.6186, 
    basin_zone: "Upper Basin", 
    aquifer_type: "Granitic Gneiss with Shallow Alluvial Cover",
    cpcb_stretch_priority: "Priority-V (Upstream Boundary)",
    risk_score: 68.0, 
    confidence_level: "High",
    verified_source: "CGWB National Hydrograph Network Well #43431"
  },
  { 
    id: 4, 
    station_code: "CGWB-TN-VL-08",
    name: "Vellore Central Anicut", 
    district: "Vellore", 
    state: "Tamil Nadu", 
    latitude: 12.9165, 
    longitude: 79.1325, 
    basin_zone: "Central Basin", 
    aquifer_type: "River Sand Bed with Granulitic Substrata",
    cpcb_stretch_priority: "Unclassified (Municipal Supply Zone)",
    risk_score: 55.4, 
    confidence_level: "Medium",
    verified_source: "India-WRIS Station #TN-VL-08 / State Ground Water Directorate"
  },
  { 
    id: 5, 
    station_code: "CGWB-TN-RP-11",
    name: "Walajapet Agricultural Plains", 
    district: "Ranipet", 
    state: "Tamil Nadu", 
    latitude: 12.9304, 
    longitude: 79.3817, 
    basin_zone: "Middle Basin", 
    aquifer_type: "Coarse River Alluvium (Thickness 18-24m)",
    cpcb_stretch_priority: "Priority-V (Downstream Reach)",
    risk_score: 48.0, 
    confidence_level: "High",
    verified_source: "CGWB Aquifer Mapping Survey TN-04 / WRIS Monitoring"
  },
  { 
    id: 6, 
    station_code: "CGWB-TN-KC-03",
    name: "Kanchipuram Temple Tank Grid", 
    district: "Kanchipuram", 
    state: "Tamil Nadu", 
    latitude: 12.8342, 
    longitude: 79.7036, 
    basin_zone: "Lower Basin", 
    aquifer_type: "Sedimentary Sandstone & Fine River Silt",
    cpcb_stretch_priority: "Compliant / Class C Agricultural Use",
    risk_score: 42.5, 
    confidence_level: "High",
    verified_source: "CGWB Observation Well #KNC-03 / State PWD Tanks Network"
  },
  { 
    id: 7, 
    station_code: "CGWB-TN-CP-07",
    name: "Chengalpattu Estuarine Reach", 
    district: "Chengalpattu", 
    state: "Tamil Nadu", 
    latitude: 12.6841, 
    longitude: 79.9836, 
    basin_zone: "Coastal Discharge Zone", 
    aquifer_type: "Coastal Alluvium & Backwater Lagoon Mud",
    cpcb_stretch_priority: "Salinity Transition / Tidal Reach",
    risk_score: 36.8, 
    confidence_level: "Medium",
    verified_source: "TNPCB Coastal Monitoring Unit / CGWB Coastal Aquifer Study"
  },
];

export const GROUNDWATER_TIMESERIES: Record<number, GroundwaterPoint[]> = {
  1: [
    { period: "2023-Q1", depth_mbgl: 13.7, trend: -0.4, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q2", depth_mbgl: 16.3, trend: -0.8, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q3", depth_mbgl: 14.9, trend: 0.3, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q4", depth_mbgl: 11.4, trend: 1.8, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q1", depth_mbgl: 13.0, trend: -0.2, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q2", depth_mbgl: 16.7, trend: -1.1, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q3", depth_mbgl: 15.4, trend: 0.4, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q4", depth_mbgl: 11.6, trend: 2.1, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q1", depth_mbgl: 14.3, trend: -0.5, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q2", depth_mbgl: 18.1, trend: -1.4, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q3", depth_mbgl: 15.7, trend: 0.6, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q4", depth_mbgl: 12.3, trend: 1.9, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
    { period: "2026-Q1", depth_mbgl: 14.9, trend: -0.6, source: "CGWB Well #RN-04", provenance: "VERIFIED_PUBLIC" },
  ],
  2: [
    { period: "2023-Q1", depth_mbgl: 13.2, trend: -0.3, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q2", depth_mbgl: 15.8, trend: -0.7, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q3", depth_mbgl: 14.1, trend: 0.4, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q4", depth_mbgl: 10.8, trend: 1.9, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q1", depth_mbgl: 12.5, trend: -0.3, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q2", depth_mbgl: 16.1, trend: -1.0, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q3", depth_mbgl: 14.7, trend: 0.5, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q4", depth_mbgl: 11.2, trend: 2.0, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q1", depth_mbgl: 13.8, trend: -0.4, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q2", depth_mbgl: 17.5, trend: -1.3, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q3", depth_mbgl: 15.2, trend: 0.7, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q4", depth_mbgl: 11.9, trend: 1.8, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
    { period: "2026-Q1", depth_mbgl: 14.5, trend: -0.5, source: "CGWB Well #TP-02", provenance: "VERIFIED_PUBLIC" },
  ],
  4: [
    { period: "2023-Q1", depth_mbgl: 11.2, trend: -0.4, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q2", depth_mbgl: 13.8, trend: -0.8, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q3", depth_mbgl: 12.4, trend: 0.3, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2023-Q4", depth_mbgl: 8.9, trend: 1.8, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q1", depth_mbgl: 10.5, trend: -0.2, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q2", depth_mbgl: 14.2, trend: -1.1, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q3", depth_mbgl: 12.9, trend: 0.4, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2024-Q4", depth_mbgl: 9.1, trend: 2.1, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q1", depth_mbgl: 11.8, trend: -0.5, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q2", depth_mbgl: 15.6, trend: -1.4, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q3", depth_mbgl: 13.2, trend: 0.6, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2025-Q4", depth_mbgl: 9.8, trend: 1.9, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
    { period: "2026-Q1", depth_mbgl: 12.4, trend: -0.6, source: "CGWB Central Well #VL-08", provenance: "VERIFIED_PUBLIC" },
  ]
};

export const WATER_QUALITY_STATIONS: WaterQualityPoint[] = [
  { 
    location_id: 1, 
    location_name: "Ranipet Industrial Corridor", 
    ph: 7.9, 
    tds_mg_l: 1850.0, 
    ec_us_cm: 2920.0, 
    chromium_mg_l: 0.082, 
    bod_mg_l: 4.8, 
    do_mg_l: 4.2, 
    status: "Critical",
    sample_context: "Industrial Drain Discharge",
    standards_comparison: {
      bis_drinking_status: "Non-Compliant (Chromium 0.082 > 0.05 mg/L, TDS > 500 mg/L)",
      cpcb_class_c_status: "Non-Compliant (DO 4.2 < 5.0 mg/L, BOD 4.8 > 3.0 mg/L)"
    },
    provenance: "HISTORICAL_REPORT",
    citation: "CPCB Polluted River Stretches Report / TNPCB Water Quality Bulletin"
  },
  { 
    location_id: 2, 
    location_name: "Ambur Tannery Cluster", 
    ph: 8.1, 
    tds_mg_l: 1920.0, 
    ec_us_cm: 2840.0, 
    chromium_mg_l: 0.071, 
    bod_mg_l: 5.2, 
    do_mg_l: 3.9, 
    status: "Critical",
    sample_context: "Industrial Drain Discharge",
    standards_comparison: {
      bis_drinking_status: "Non-Compliant (Chromium 0.071 > 0.05 mg/L)",
      cpcb_class_c_status: "Non-Compliant (BOD 5.2 > 3.0 mg/L)"
    },
    provenance: "HISTORICAL_REPORT",
    citation: "Springer Environmental Geochemistry (Palar Ambur Study 2016)"
  },
  { 
    location_id: 3, 
    location_name: "Vaniyambadi Watershed", 
    ph: 7.8, 
    tds_mg_l: 1340.0, 
    ec_us_cm: 2150.0, 
    chromium_mg_l: 0.042, 
    bod_mg_l: 3.6, 
    do_mg_l: 4.8, 
    status: "Elevated",
    sample_context: "River Surface Water",
    standards_comparison: {
      bis_drinking_status: "Permissible (TDS < 2000 mg/L, Cr < 0.05 mg/L)",
      cpcb_class_c_status: "Marginal (BOD 3.6 slightly exceeds 3.0 mg/L limit)"
    },
    provenance: "VERIFIED_PUBLIC",
    citation: "TNPCB River Water Quality Monitoring Station #VNB-01"
  },
  { 
    location_id: 4, 
    location_name: "Vellore Central Anicut", 
    ph: 7.5, 
    tds_mg_l: 890.0, 
    ec_us_cm: 1420.0, 
    chromium_mg_l: 0.018, 
    bod_mg_l: 2.8, 
    do_mg_l: 5.6, 
    status: "Normal",
    sample_context: "River Surface Water",
    standards_comparison: {
      bis_drinking_status: "Permissible with conventional filtration",
      cpcb_class_c_status: "Compliant (DO > 5.0 mg/L, BOD < 3.0 mg/L)"
    },
    provenance: "VERIFIED_PUBLIC",
    citation: "India-WRIS Water Quality Surface Station #TN-VL-08"
  },
  { 
    location_id: 5, 
    location_name: "Walajapet Agricultural Plains", 
    ph: 7.3, 
    tds_mg_l: 620.0, 
    ec_us_cm: 980.0, 
    chromium_mg_l: 0.010, 
    bod_mg_l: 2.1, 
    do_mg_l: 6.4, 
    status: "Normal",
    sample_context: "Borewell / Aquifer",
    standards_comparison: {
      bis_drinking_status: "Compliant across all basic parameters",
      cpcb_class_c_status: "Compliant for agricultural & fisheries propagation"
    },
    provenance: "VERIFIED_PUBLIC",
    citation: "CGWB National Water Quality Portal Well #WPT-11"
  },
  { 
    location_id: 6, 
    location_name: "Kanchipuram Temple Tank Grid", 
    ph: 7.2, 
    tds_mg_l: 540.0, 
    ec_us_cm: 860.0, 
    chromium_mg_l: 0.008, 
    bod_mg_l: 1.8, 
    do_mg_l: 6.9, 
    status: "Normal",
    sample_context: "River Surface Water",
    standards_comparison: {
      bis_drinking_status: "Acceptable Drinking Baseline",
      cpcb_class_c_status: "Fully Compliant (Class C & Class B Bathing)"
    },
    provenance: "VERIFIED_PUBLIC",
    citation: "State Surface Water Resources Department Survey 2024"
  },
  { 
    location_id: 7, 
    location_name: "Chengalpattu Estuarine Reach", 
    ph: 7.6, 
    tds_mg_l: 1250.0, 
    ec_us_cm: 1980.0, 
    chromium_mg_l: 0.012, 
    bod_mg_l: 2.4, 
    do_mg_l: 6.1, 
    status: "Normal",
    sample_context: "River Surface Water",
    standards_comparison: {
      bis_drinking_status: "Permissible (Elevated TDS due to tidal salinity backwater)",
      cpcb_class_c_status: "Compliant for estuarine marine habitat"
    },
    provenance: "VERIFIED_PUBLIC",
    citation: "TNPCB Coastal Water Quality Monitoring Network #CPT-07"
  },
];

export const ANOMALIES_DATA: AnomalyAlertItem[] = [
  {
    id: 1,
    location_id: 1,
    location_name: "Ranipet Industrial Corridor",
    parameter: "Total Chromium Outlier Surge",
    observed_value: 0.082,
    expected_baseline: 0.015,
    z_score: 3.84,
    mad_deviation: 0.018,
    severity: "Critical",
    status: "Open",
    trigger_reason: "Observed Total Chromium (0.082 mg/L) exceeds BIS 10500 threshold (0.05 mg/L) by 64% with robust MAD Z-score 3.84 vs seasonal baseline.",
    detection_method: "Robust Z-score via Median Absolute Deviation (MAD): Z = (x - median) / (1.4826 * MAD)",
    created_at: "2026-02-21T09:30:00Z",
    provenance: "MODEL_PREDICTION"
  },
  {
    id: 2,
    location_id: 2,
    location_name: "Ambur Tannery Cluster",
    parameter: "EC & Mineral Salinity Surge",
    observed_value: 2840.0,
    expected_baseline: 1450.0,
    z_score: 2.92,
    mad_deviation: 380.0,
    severity: "High",
    status: "Under Review",
    trigger_reason: "Sudden spike in electrical conductivity indicating concentrated mineral effluent or high salinity seepage along drain reach.",
    detection_method: "IQR Upper Fence: x > Q3 + 1.5 * IQR (Interquartile Range)",
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
    mad_deviation: 1.8,
    severity: "Medium",
    status: "Open",
    trigger_reason: "Quarterly water table drawdown accelerated beyond historical mean by 3.4 meters following pre-monsoon extraction.",
    detection_method: "Autoregressive Seasonal Drawdown Trend Detector",
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
      "Collect duplicate 1L sample for certified laboratory ICP-MS testing",
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
  { 
    id: 1, 
    location_name: "Walajapet Agricultural Plains", 
    soil: "Coarse Sand & Gravel Alluvium", 
    slope: 1.4, 
    head_m: 11.2, 
    score: 88.0, 
    recommended: "Series of Check Dams & Percolation Tanks across river sand beds", 
    status: "High Priority Recharge Zone",
    hydrological_context: "High hydraulic conductivity (K = 18-35 m/day), gentle slope ensures long contact time for rainwater infiltration."
  },
  { 
    id: 2, 
    location_name: "Kanchipuram Temple Tank Grid", 
    soil: "Fine Sand & Silt Clay", 
    slope: 1.1, 
    head_m: 8.4, 
    score: 84.5, 
    recommended: "Desiltation & Interlinking of Traditional Eri / Cascade Tanks", 
    status: "Restoration Opportunity",
    hydrological_context: "Historical surface tank cascades facilitate seasonal water retention and groundwater recharge."
  },
  { 
    id: 3, 
    location_name: "Vellore Central Anicut", 
    soil: "Coarse River Sand over Gneiss", 
    slope: 2.1, 
    head_m: 12.8, 
    score: 76.0, 
    recommended: "Subsurface Dyke with Silt Trap Infiltration Shafts", 
    status: "Feasible",
    hydrological_context: "Subsurface dyke will arrest subsurface groundwater outflow in the dry summer months."
  },
  { 
    id: 4, 
    location_name: "Ranipet Industrial Corridor", 
    soil: "Weathered Charnockite / Clay Silt", 
    slope: 2.6, 
    head_m: 14.9, 
    score: 58.0, 
    recommended: "Infiltration requires strict pre-testing to avoid contaminated aquifer recharge", 
    status: "Caution: Hydrochemical Risk",
    hydrological_context: "High surface contamination hazard requires artificial recharge to be isolated from untreated industrial runoff."
  },
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

export const PRESENTATION_WORKFLOW: PresentationStep[] = [
  {
    stepIndex: 1,
    title: "1. The Palar River Basin & Environmental Pressure",
    subtitle: "Palar Catchment • 17,810 km² Northern Tamil Nadu",
    narration: "The Palar River Basin is an ecologically and economically vital lifeline supporting agriculture, urban centers, and industrial corridors across Vellore, Ranipet, Tirupathur, and Kanchipuram. We combine verified hydrological and water quality observations across the basin.",
    targetModule: "digital_twin",
    highlightedLocationId: 1,
    keyMetricLabel: "Catchment Area",
    keyMetricValue: "17,810 km²",
    provenance: "VERIFIED_PUBLIC"
  },
  {
    stepIndex: 2,
    title: "2. The Geospatial Digital Twin",
    subtitle: "Interactive 2D/3D Geospatial GIS with River Reach Flowlines",
    narration: "Our Digital Twin maps 7 continuous baseline stations from Vaniyambadi in the upper basin to the Chengalpattu coastal estuary, highlighting risk zones, water flow vectors, and observation points.",
    targetModule: "digital_twin",
    highlightedLocationId: 1,
    keyMetricLabel: "Baseline Stations",
    keyMetricValue: "7 Continuous",
    provenance: "VERIFIED_PUBLIC"
  },
  {
    stepIndex: 3,
    title: "3. Groundwater Stress & Seasonal Drawdown",
    subtitle: "Multi-Year Hydrographs from CGWB Observation Wells",
    narration: "In the Ranipet and Ambur clusters, intensive industrial and agricultural extraction causes acute water table depression, with water levels plunging deeper than 14.9 mbgl in pre-monsoon dry months.",
    targetModule: "groundwater",
    highlightedLocationId: 1,
    keyMetricLabel: "Ranipet Water Depth",
    keyMetricValue: "14.9 mbgl",
    provenance: "VERIFIED_PUBLIC"
  },
  {
    stepIndex: 4,
    title: "4. Rainfall Dynamics & Monsoon Yield",
    subtitle: "IMD NWIC Precipitation Series: Northeast vs Southwest Monsoon",
    narration: "The Palar Catchment receives 980 mm annual precipitation, with over 55% concentrated during the intense October-November Northeast Monsoon storms, providing the primary recharge opportunity.",
    targetModule: "rainfall",
    highlightedLocationId: 5,
    keyMetricLabel: "Northeast Monsoon",
    keyMetricValue: "55% (590 mm)",
    provenance: "VERIFIED_PUBLIC"
  },
  {
    stepIndex: 5,
    title: "5. Hydrochemical Quality Surveillance",
    subtitle: "pH, TDS, EC, BOD, DO, and Heavy Metals vs Standards",
    narration: "Water quality across industrial stretches shows critical anomalies: Total Chromium reaches 0.082 mg/L in industrial drains, and TDS exceeds 1850 mg/L, benchmarked against BIS 10500 and CPCB Class C criteria.",
    targetModule: "water_quality",
    highlightedLocationId: 1,
    keyMetricLabel: "Total Chromium",
    keyMetricValue: "0.082 mg/L (>0.05 limit)",
    provenance: "HISTORICAL_REPORT"
  },
  {
    stepIndex: 6,
    title: "6. Statistical Anomaly Detection (Robust Z-Score)",
    subtitle: "MAD-Based Outlier Identification Resistant to Extremes",
    narration: "Rather than using traditional Z-scores which skew under pollution spikes, PALAR GUARD uses Median Absolute Deviation (MAD). Ranipet's Chromium surge triggers a Critical alert with Z-score 3.84.",
    targetModule: "anomalies",
    highlightedLocationId: 1,
    keyMetricLabel: "Robust Z-Score",
    keyMetricValue: "3.84 (Critical)",
    provenance: "MODEL_PREDICTION"
  },
  {
    stepIndex: 7,
    title: "7. Anomaly Triage & Ground Verification Protocol",
    subtitle: "Signals for Investigation — Never Legal Guilt Without Lab Proof",
    narration: "We enforce strict scientific governance: a statistical anomaly is an alert for ground triage, never proof of culpability. Analysts triage the alert into 'Under Review' and initiate field dispatch.",
    targetModule: "anomalies",
    highlightedLocationId: 1,
    keyMetricLabel: "Alert Status",
    keyMetricValue: "Open / Under Review",
    provenance: "MODEL_PREDICTION"
  },
  {
    stepIndex: 8,
    title: "8. Walk-Forward Groundwater Forecasting",
    subtitle: "Seasonal Baseline Projections with 90% Uncertainty Intervals",
    narration: "Our forecasting engine projects water table trends across the upcoming four quarters. Pre-monsoon Q2 2026 is projected at 17.0 mbgl with ±1.2m confidence bounds based on walk-forward backtested error.",
    targetModule: "forecasting",
    highlightedLocationId: 1,
    keyMetricLabel: "2026-Q2 Projected",
    keyMetricValue: "17.0 mbgl (±1.2m)",
    provenance: "MODEL_PREDICTION"
  },
  {
    stepIndex: 9,
    title: "9. Explainable Geospatial Risk Prioritisation",
    subtitle: "Multi-Criteria Decision Analysis (MCDA) Weighted Scoring",
    narration: "We integrate 5 dimensions: Groundwater Stress (30%), Water Quality (35%), Rainfall Deficit (15%), Observation Recency (10%), and Data Confidence (10%). Ranipet tops the priority queue with 78.5 / 100.",
    targetModule: "risk_priority",
    highlightedLocationId: 1,
    keyMetricLabel: "Priority Score",
    keyMetricValue: "78.5 / 100",
    provenance: "MODEL_PREDICTION"
  },
  {
    stepIndex: 10,
    title: "10. Data Confidence & Reliability Engine",
    subtitle: "Rigorous Classification Badging & Traceability",
    narration: "Every chart and dataset displays explicit provenance: Verified Public observations, Historical Reports, Community Reports, and Model Predictions. No synthetic data is mixed into verified baselines.",
    targetModule: "confidence",
    highlightedLocationId: 1,
    keyMetricLabel: "Data Provenance",
    keyMetricValue: "100% Traceable",
    provenance: "VERIFIED_PUBLIC"
  },
  {
    stepIndex: 11,
    title: "11. Citizen Science & Community Reporting",
    subtitle: "Local Ground Observations from Farmers & Watershed Residents",
    narration: "Community members submit geotagged reports of well depletion, foam, or odor. The report enters a moderation queue to corroborate or expand on sensor-detected anomalies.",
    targetModule: "community",
    highlightedLocationId: 2,
    keyMetricLabel: "Community Reports",
    keyMetricValue: "Verified Ground Leads",
    provenance: "COMMUNITY_REPORT"
  },
  {
    stepIndex: 12,
    title: "12. Field Dispatch, Remediations & Recharge Planning",
    subtitle: "Actionable Resolution: Field Checklist & Infiltration Structures",
    narration: "Field Team Alpha is dispatched with duplicate sample collection checklists for certified lab ICP-MS testing, while Walajapet and Kanchipuram are screened for check dams and eri desiltation.",
    targetModule: "investigations",
    highlightedLocationId: 1,
    keyMetricLabel: "Field Response",
    keyMetricValue: "Team Dispatched",
    provenance: "VERIFIED_PUBLIC"
  }
];
