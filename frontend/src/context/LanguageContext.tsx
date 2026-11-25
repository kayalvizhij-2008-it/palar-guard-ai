import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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
    app_title: 'PALAR GUARD AI',
    tagline: 'See the Risk. Predict the Change. Protect Every Drop.',
    search_placeholder: 'Search basin, station, or parameter...',
    simple_mode: 'Community',
    expert_mode: 'Professional',
    science_team: 'Authenticated Session',
    notifications: 'Basin Alerts',
    mark_all_read: 'Mark all read',
    explore_platform: 'Explore Platform',
    sign_in: 'Sign In',
    sign_out: 'Sign Out',
    welcome: 'Welcome',
    pitch_mode: 'Guided Tour',

    // Sidebar Items
    overview: 'Overview',
    digital_twin: 'Basin Explorer',
    groundwater: 'Groundwater',
    forecasting: 'Forecasting',
    rainfall: 'Rainfall & Recharge',
    water_quality: 'Water Quality',
    anomalies: 'Pollution Risk',
    risk_priority: 'Risk Prioritisation',
    confidence: 'Data Confidence',
    community: 'Community Reports',
    investigations: 'Field Verification',
    recharge: 'Recharge Siting',
    assistant: 'PALAR AI',
    documents: 'Document Intelligence',
    monitoring: 'Monitoring Watchlist',
    analytics: 'Reports & Dossiers',
    role_access: 'Access & RBAC',
    admin_audit: 'Administration',
    sidebar_banner_title: 'Protect Palar River',
    sidebar_banner_subtitle: 'Guard our collective future',

    // KPI & Summary
    kpi_rainfall_title: 'Rainfall',
    kpi_rainfall_sub: 'Catchment seasonal record',
    kpi_groundwater_title: 'Groundwater',
    kpi_groundwater_sub: 'Basin observation average',
    kpi_risk_title: 'Priority Risk',
    kpi_risk_val: 'High Watch',
    kpi_risk_sub: 'Highest monitored reach',
    kpi_reliability_title: 'Observations',
    kpi_reliability_sub: 'Provenance tagged',
    kpi_live_data_title: 'API Sync',
    kpi_live_data_sub: 'Backend database status',

    catchment_title: 'Palar Catchment Area',
    catchment_area: '17,810 km²',
    catchment_official: '(Catchment)',
    legend_boundary: 'Catchment Boundary',
    legend_river: 'Station Corridor',
    legend_tributaries: 'Tributaries',
    legend_stations: 'Monitoring Stations',
    open_digital_twin: 'Open Basin Explorer',

    chart_summary_title: 'Water Status Summary',
    chart_7d: '7 Days',
    chart_30d: '30 Days',
    chart_1y: '1 Year',
    legend_rain: 'Rainfall',
    legend_gw: 'Groundwater',
    legend_wq: 'Water Quality',

    priority_alerts_title: 'Priority Alerts',
    view_all_alerts: 'View All →',
    alert_1_title: 'Chromium exceedance flagged in Ranipet stretch',
    alert_1_time: 'Open Alert',
    alert_2_title: 'Conductivity surge under review in Ambur',
    alert_2_time: 'Under Review',
    alert_3_title: 'Drawdown alert logged in Vaniyambadi',
    alert_3_time: 'Open Alert',

    card_global_title: 'Palar: Basin Explorer',
    card_global_btn: 'View →',
    card_3d_title: 'Document Intelligence Studio',
    card_3d_btn: 'Open →',
    card_assistant_title: 'PALAR AI Assistant',
    card_assistant_greeting: 'Hello. Ask about grounded Palar Basin observations.',
    card_assistant_listening: 'Listening...',
    card_assistant_speak: 'Ask a question',
    card_feedback_title: 'Community Reporting',
    card_feedback_text: 'Share local observations to assist field verification',
    card_feedback_btn: 'Submit Report →',

    provenance_verified: 'Verified Public',
    provenance_historical: 'Historical Report',
    provenance_community: 'Community Report',
    provenance_prediction: 'Model Prediction',
    provenance_synthetic: 'Synthetic Demo Data',
  },
  ta: {
    app_title: 'பாலாறு காப்பாளர் AI',
    tagline: 'ஆபத்தை உணர். மாற்றத்தை கணி. ஒவ்வொரு துளியையும் பாதுகாப்போம்.',
    search_placeholder: 'நிலையம் அல்லது அளவுருவைத் தேடுங்கள்...',
    simple_mode: 'மக்கள் பகுதி',
    expert_mode: 'தொழில்முறை',
    science_team: 'சரிபார்க்கப்பட்ட அமர்வு',
    notifications: 'பாலாறு எச்சரிக்கைகள்',
    mark_all_read: 'அனைத்தும் வாசித்ததாகக் குறி',
    explore_platform: 'தளத்தை ஆராய்க',
    sign_in: 'உள்நுழைக',
    sign_out: 'வெளியேறுக',
    welcome: 'வணக்கம்',
    pitch_mode: 'விளக்கக் காட்சி',

    // Sidebar Items
    overview: 'முகப்பு பலகம்',
    digital_twin: 'வடிநில ஆய்வகம்',
    groundwater: 'நிலத்தடி நீர்',
    forecasting: 'நீர்மட்ட கணிப்பு',
    rainfall: 'மழை & மறுசுழற்சி',
    water_quality: 'நீர் தரம்',
    anomalies: 'மாசு அபாயம்',
    risk_priority: 'இடர் முன்னுரிமை',
    confidence: 'தரவு நம்பகத்தன்மை',
    community: 'மக்கள் புகார்கள்',
    investigations: 'கள சரிபார்ப்பு',
    recharge: 'மறுசுழற்சி இடங்கள்',
    assistant: 'PALAR AI உதவியாளர்',
    documents: 'ஆவண நுண்ணறிவு',
    monitoring: 'கண்காணிப்புப் பட்டியல்',
    analytics: 'அறிக்கைகள்',
    role_access: 'அணுகல் உரிமைகள்',
    admin_audit: 'நிர்வாகம்',
    sidebar_banner_title: 'பாலாறு பாதுகாப்போம்',
    sidebar_banner_subtitle: 'நம் எதிர்காலத்தைக் காப்போம்',

    kpi_rainfall_title: 'மழைப்பொழிவு',
    kpi_rainfall_sub: 'வடிநில பருவகாலப் பதிவு',
    kpi_groundwater_title: 'நிலத்தடி நீர்',
    kpi_groundwater_sub: 'படுகை சராசரி ஆழம்',
    kpi_risk_title: 'அபாய நிலை',
    kpi_risk_val: 'உயர் கண்காணிப்பு',
    kpi_risk_sub: 'அதிகபட்ச இடர் பகுதி',
    kpi_reliability_title: 'பதிவுகள்',
    kpi_reliability_sub: 'மூலச் சான்று குறியிடப்பட்டது',
    kpi_live_data_title: 'API இணைப்பு',
    kpi_live_data_sub: 'தரவுத்தள நிலை',

    catchment_title: 'பாலாறு நீர்ப்பிடிப்பு பகுதி',
    catchment_area: '17,810 km²',
    catchment_official: '(நீர்ப்பிடிப்பு)',
    legend_boundary: 'நீர்ப்பிடிப்பு எல்லை',
    legend_river: 'நிலையப் பாதை',
    legend_tributaries: 'துணை நதிகள்',
    legend_stations: 'கண்காணிப்பு நிலையங்கள்',
    open_digital_twin: 'வடிநில ஆய்வகம் திற',

    chart_summary_title: 'நீர்நிலை சுருக்கம்',
    chart_7d: '7 நாள்',
    chart_30d: '30 நாள்',
    chart_1y: '1 ஆண்டு',
    legend_rain: 'மழை',
    legend_gw: 'நிலத்தடி நீர்',
    legend_wq: 'நீர் தரம்',

    priority_alerts_title: 'முக்கிய எச்சரிக்கைகள்',
    view_all_alerts: 'அனைத்தும் பார்க்க →',
    alert_1_title: 'ராணிப்பேட்டை பகுதியில் குரோமியம் உயர்வு எச்சரிக்கை',
    alert_1_time: 'திறந்த நிலை',
    alert_2_title: 'ஆம்பூர் பகுதியில் மின் கடத்துத்திறன் உயர்வு ஆய்வு',
    alert_2_time: 'ஆய்வில்',
    alert_3_title: 'வாணியம்பாடியில் நீர்மட்ட குறைவு எச்சரிக்கை',
    alert_3_time: 'திறந்த நிலை',

    card_global_title: 'பாலாறு: வடிநில ஆய்வகம்',
    card_global_btn: 'பார்க்க →',
    card_3d_title: 'ஆவண நுண்ணறிவு பிரிவு',
    card_3d_btn: 'திற →',
    card_assistant_title: 'PALAR AI உதவியாளர்',
    card_assistant_greeting: 'வணக்கம். பாலாறு வடிநிலத் தரவுகள் குறித்து கேளுங்கள்.',
    card_assistant_listening: 'கேட்கிறது...',
    card_assistant_speak: 'கேள்வி கேளுங்கள்',
    card_feedback_title: 'மக்கள் புகார் பதிவு',
    card_feedback_text: 'கள ஆய்வுக்கு உதவ உங்கள் பகுதி நீர் நிலவரத்தைப் பகிரவும்',
    card_feedback_btn: 'புகார் பதிவு →',

    provenance_verified: 'அரசு சரிபார்க்கப்பட்டது',
    provenance_historical: 'வரலாற்று ஆய்வு அறிக்கை',
    provenance_community: 'மக்கள் சமர்ப்பித்தது',
    provenance_prediction: 'AI மாதிரி கணிப்பு',
    provenance_synthetic: 'மாதிரி டெமோ தரவு',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('palar_lang');
      return saved === 'ta' || saved === 'en' ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const [mode, setModeState] = useState<ExperienceMode>(() => {
    try {
      const saved = localStorage.getItem('palar_mode');
      return saved === 'simple' || saved === 'expert' ? saved : 'expert';
    } catch {
      return 'expert';
    }
  });

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem('palar_lang', next);
    } catch {
      // ignore storage failure
    }
  };

  const setMode = (next: ExperienceMode) => {
    setModeState(next);
    try {
      localStorage.setItem('palar_mode', next);
    } catch {
      // ignore storage failure
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'ta' ? 'ta' : 'en';
  }, [lang]);

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
