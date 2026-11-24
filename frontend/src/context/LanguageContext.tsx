import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ta';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    app_title: "PALAR GUARD AI",
    tagline: "See the Risk. Predict the Change. Protect Every Drop.",
    explore_platform: "Explore Platform",
    sign_in: "Sign In",
    sign_out: "Sign Out",
    welcome: "Welcome",
    overview: "Overview",
    digital_twin: "Digital Twin",
    groundwater: "Groundwater Stress",
    forecasting: "Forecasts",
    rainfall: "Rainfall & Recharge",
    water_quality: "Water Quality",
    anomalies: "Anomalies",
    risk_priority: "Risk Prioritisation",
    confidence: "Data Confidence",
    community: "Community Reports",
    investigations: "Investigations",
    recharge: "Recharge Interventions",
    assistant: "PALAR AI Assistant",
    analytics: "Analytics & Export",
    role_access: "Role Access",
    admin_audit: "Administration",
    provenance_verified: "Verified Public",
    provenance_historical: "Historical Report",
    provenance_community: "Community Report",
    provenance_prediction: "Model Prediction",
    provenance_synthetic: "Synthetic Demo",
  },
  ta: {
    app_title: "பாலாறு காப்பாளர் AI",
    tagline: "ஆபத்தை உணர். மாற்றத்தை கணி. ஒவ்வொரு துளியையும் பாதுகாப்போம்.",
    explore_platform: "தளத்தை ஆராய்க",
    sign_in: "உள்நுழைக",
    sign_out: "வெளியேறுக",
    welcome: "வணக்கம்",
    overview: "கண்ணோட்டம்",
    digital_twin: "டிஜிட்டல் இரட்டை வரைபடம்",
    groundwater: "நிலத்தடி நீர் அழுத்தம்",
    forecasting: "எதிர்கால கணிப்புகள்",
    rainfall: "மழை & நீர் செறிவூட்டல்",
    water_quality: "நீர் தரம் & நச்சு பகுப்பாய்வு",
    anomalies: "நீர் மாறுபாடுகள்",
    risk_priority: "ஆபத்து முன்னுரிமை",
    confidence: "தரவு நம்பகத்தன்மை",
    community: "மக்கள் புகார்கள்",
    investigations: "கள ஆய்வுகள்",
    recharge: "நீர் மறுசெறிவூட்டல் வாய்ப்புகள்",
    assistant: "பாலாறு AI உதவியாளர்",
    analytics: "அறிக்கைகள் & பதிவிறக்கம்",
    role_access: "அணுகல் உரிமைகள்",
    admin_audit: "நிர்வாகம் & தணிக்கை",
    provenance_verified: "அரசு சரிபார்க்கப்பட்டது",
    provenance_historical: "வரலாற்று ஆய்வு அறிக்கை",
    provenance_community: "மக்கள் சமர்ப்பித்தது",
    provenance_prediction: "AI மாதிரி கணிப்பு",
    provenance_synthetic: "மாதிரி டெமோ தரவு",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
