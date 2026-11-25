import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ta';
export type ExperienceMode = 'simple' | 'expert';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  mode: ExperienceMode;
  setMode: (mode: ExperienceMode) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    app_title: "PALAR GUARD AI",
    tagline: "See the Risk. Predict the Change. Protect Every Drop.",
    search_placeholder: "Search basin, station, or parameter...",
    simple_mode: "Community",
    expert_mode: "Professional",
    science_team: "Science Team",
    notifications: "Basin Alerts",
    mark_all_read: "Mark all read",
    explore_platform: "Explore Platform",
    sign_in: "Sign In",
    sign_out: "Sign Out",
    welcome: "Welcome",
    pitch_mode: "Pitch Mode",

    // Sidebar Items
    overview: "Overview",
    digital_twin: "Digital Twin",
    groundwater: "Groundwater Stress",
    forecasting: "Groundwater Forecast",
    rainfall: "Rainfall & Recharge",
    water_quality: "Water Quality",
    anomalies: "Anomaly Detection",
    risk_priority: "Geospatial Risk",
    confidence: "Data Confidence",
    community: "Community Reports",
    investigations: "Field Investigations",
    recharge: "Recharge Interventions",
    assistant: "AI Assistant",
    analytics: "Reports & Export",
    role_access: "Role Access",
    admin_audit: "Administration",
    sidebar_banner_title: "Protect Palar River",
    sidebar_banner_subtitle: "Guard our collective future",

    // Top 5 KPI Cards
    kpi_rainfall_title: "Rainfall",
    kpi_rainfall_sub: "↑ +12% above normal",
    kpi_groundwater_title: "Groundwater",
    kpi_groundwater_sub: "Healthy condition",
    kpi_risk_title: "Risk Level",
    kpi_risk_val: "Very High",
    kpi_risk_sub: "(Ranipet Sector)",
    kpi_reliability_title: "Overall Reliability",
    kpi_reliability_sub: "High Confidence",
    kpi_live_data_title: "Direct Data",
    kpi_live_data_sub: "Last updated: 2 min ago",

    // Map Section
    catchment_title: "Palar Catchment Area",
    catchment_area: "17,810 km²",
    catchment_official: "(Official)",
    legend_boundary: "Catchment Boundary",
    legend_river: "Palar River",
    legend_tributaries: "Tributaries",
    legend_stations: "Monitoring Stations",
    open_digital_twin: "Open Basin Digital Twin",

    // Chart Section
    chart_summary_title: "Water Status Summary",
    chart_7d: "7 Days",
    chart_30d: "30 Days",
    chart_1y: "1 Year",
    legend_rain: "Rainfall",
    legend_gw: "Groundwater",
    legend_wq: "Water Quality",

    // Priority Alerts
    priority_alerts_title: "Priority Alerts",
    view_all_alerts: "View All →",
    alert_1_title: "Water level drawdown in Ranipet sector",
    alert_1_time: "2 min ago",
    alert_2_title: "Water quality concerning near Kanchipuram",
    alert_2_time: "5 min ago",
    alert_3_title: "Rainfall deficit - precautionary check required",
    alert_3_time: "15 min ago",

    // Bottom 4 Cards
    card_global_title: "Palar: On the Global Map",
    card_global_btn: "View →",
    card_3d_title: "Palar Catchment - 3D View",
    card_3d_btn: "Explore →",
    card_assistant_title: "AI Assistant",
    card_assistant_greeting: "Hello! How can I assist you with Palar Basin data?",
    card_assistant_listening: "Listening...",
    card_assistant_speak: "Ask a question",
    card_feedback_title: "Your Voice & Action",
    card_feedback_text: "Share your observations to safeguard our river ecosystem",
    card_feedback_btn: "Submit Report →",

    // Provenance
    provenance_verified: "Verified Public",
    provenance_historical: "Historical Report",
    provenance_community: "Community Report",
    provenance_prediction: "Model Prediction",
    provenance_synthetic: "Synthetic Demo Data",
  },
  ta: {
    // Brand & Header
    app_title: "பாலாறு காப்பாளர் AI",
    tagline: "ஆபத்தை உணர். மாற்றத்தை கணி. ஒவ்வொரு துளியையும் பாதுகாப்போம்.",
    search_placeholder: "தேடுங்கள்...",
    simple_mode: "மக்கள் பயன்பாடு",
    expert_mode: "தொழில்முறை ஆய்வு",
    science_team: "அறிவியல் குழு",
    notifications: "பாலாறு எச்சரிக்கைகள்",
    mark_all_read: "அனைத்தும் வாசித்ததாகக் குறி",
    explore_platform: "தளத்தை ஆராய்க",
    sign_in: "உள்நுழைக",
    sign_out: "வெளியேறுக",
    welcome: "வணக்கம்",
    pitch_mode: "விளக்கக் காட்சி",

    // Sidebar Items
    overview: "முகப்பு பலகம்",
    digital_twin: "டிஜிட்டல் ட்வின்",
    groundwater: "நிலத்தடி நீர் நுண்ணறிவு",
    forecasting: "எதிர்கால கணிப்புகள்",
    rainfall: "மழை மற்றும் மறுசுழற்சி",
    water_quality: "நீர் தரம்",
    anomalies: "அபாய கண்டறிதல்",
    risk_priority: "புவியியல் அபாயம்",
    confidence: "தரவு நம்பகத்தன்மை",
    community: "மக்கள் புகார்",
    investigations: "புல ஆய்வு",
    recharge: "மறுசுழற்சி திட்டங்கள்",
    assistant: "AI உதவியாளர்",
    analytics: "அறிக்கைகள்",
    role_access: "அணுகல் உரிமைகள்",
    admin_audit: "நிர்வாகம்",
    sidebar_banner_title: "பாலாறு பாதுகாப்போம்",
    sidebar_banner_subtitle: "நம் எதிர்காலத்தைக் காப்போம்",

    // Top 5 KPI Cards
    kpi_rainfall_title: "மழைப்பொழிவு",
    kpi_rainfall_sub: "↑ +12% இயல்பை விட",
    kpi_groundwater_title: "நிலத்தடி நீர்",
    kpi_groundwater_sub: "நல்ல நிலையில்",
    kpi_risk_title: "அபாய நிலை",
    kpi_risk_val: "மிக அதிகம்",
    kpi_risk_sub: "(ராணிப்பேட்டை பகுதி)",
    kpi_reliability_title: "மொத்த நம்பகத்தன்மை",
    kpi_reliability_sub: "உயர் நம்பிக்கை",
    kpi_live_data_title: "நேரடி தரவு",
    kpi_live_data_sub: "கடைசி புதுப்பிப்பு: 2 நிமிடங்களுக்கு முன்",

    // Map Section
    catchment_title: "பாலாறு நீர்ப்பிடிப்பு பகுதி",
    catchment_area: "17,810 km²",
    catchment_official: "(அதிகாரப்பூர்வம்)",
    legend_boundary: "நீர்ப்பிடிப்பு எல்லை",
    legend_river: "பாலாறு",
    legend_tributaries: "துணை நதிகள்",
    legend_stations: "நிலையங்கள்",
    open_digital_twin: "டிஜிட்டல் ட்வின் வரைபடம் திற",

    // Chart Section
    chart_summary_title: "நீர்நிலை சுருக்கம்",
    chart_7d: "7 நாள்",
    chart_30d: "30 நாள்",
    chart_1y: "1 ஆண்டு",
    legend_rain: "மழை",
    legend_gw: "நிலத்தடி நீர்",
    legend_wq: "நீர் தரம்",

    // Priority Alerts
    priority_alerts_title: "முக்கிய எச்சரிக்கைகள்",
    view_all_alerts: "அனைத்தும் பார்க்க →",
    alert_1_title: "ராணிப்பேட்டை பகுதியில் நீர்மட்டம் குறைவு",
    alert_1_time: "2 நிமிட முன்",
    alert_2_title: "காஞ்சிபுரம் அருகே நீர் தரம் கவலைக்கிடம்",
    alert_2_time: "5 நிமிட முன்",
    alert_3_title: "மழை குறைவு - முன்னெச்சரிக்கை அவசியம்",
    alert_3_time: "15 நிமிட முன்",

    // Bottom 4 Cards
    card_global_title: "பாலாறு: உலக வரைபடத்தில்",
    card_global_btn: "பார்க்க →",
    card_3d_title: "பாலாறு நீர்ப்பிடிப்பு பகுதி - 3D காட்சி",
    card_3d_btn: "ஆய்வு →",
    card_assistant_title: "AI உதவியாளர் - தமிழ்",
    card_assistant_greeting: "வணக்கம்! பாலாறு பற்றிய தகவல்களை கேட்க என்ன உதவ வேண்டும்?",
    card_assistant_listening: "கேட்கிறது...",
    card_assistant_speak: "கேள்வி கேளுங்கள்",
    card_feedback_title: "உங்கள் கருத்து",
    card_feedback_text: "பகிர்ந்து கொள்ளுங்கள் நமது ஆற்றைப் பாதுகாக்க உங்கள் கருத்தை தெரிவிக்கவும்",
    card_feedback_btn: "பதிவு செய் →",

    // Provenance
    provenance_verified: "அரசு சரிபார்க்கப்பட்டது",
    provenance_historical: "வரலாற்று ஆய்வு அறிக்கை",
    provenance_community: "மக்கள் சமர்ப்பித்தது",
    provenance_prediction: "AI மாதிரி கணிப்பு",
    provenance_synthetic: "மாதிரி டெமோ தரவு",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('ta'); // Default to Tamil as in the reference blueprint!
  const [mode, setMode] = useState<ExperienceMode>('expert');

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, mode, setMode, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
