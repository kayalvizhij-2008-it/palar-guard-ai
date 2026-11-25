import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Layers, Check } from 'lucide-react';

export interface MapLayerState {
  catchment: boolean;
  riverNetwork: boolean;
  stations: boolean;
  groundwater: boolean;
  rainfall: boolean;
  waterQuality: boolean;
  anomalies: boolean;
  risks: boolean;
  community: boolean;
  investigations: boolean;
  recharge: boolean;
}

interface MapLayerControlProps {
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  onClose?: () => void;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  layers,
  onToggleLayer,
  onClose
}) => {
  const { lang } = useLanguage();

  const layerItems: { key: keyof MapLayerState; label: string; labelTa: string; color: string }[] = [
    { key: 'catchment', label: '17,810 km² Catchment Polygon', labelTa: 'படுகை எல்லை வரைபடம்', color: '#10b981' },
    { key: 'riverNetwork', label: 'Palar River Channel & Tributaries', labelTa: 'பாலாறு & துணையாறுகள்', color: '#38bdf8' },
    { key: 'stations', label: 'CGWB Monitoring Wells (Stations)', labelTa: 'கண்காணிப்பு நிலையங்கள்', color: '#10b981' },
    { key: 'groundwater', label: 'Groundwater Depth (mbgl)', labelTa: 'நிலத்தடி நீர் ஆழம்', color: '#06b6d4' },
    { key: 'rainfall', label: 'Monsoon Rainfall Isohyets', labelTa: 'மழைப்பொழிவு பரவல்', color: '#60a5fa' },
    { key: 'waterQuality', label: 'Water Quality & Chromium', labelTa: 'நீர் தரம் & குரோமியம்', color: '#f59e0b' },
    { key: 'anomalies', label: 'Statistical Anomaly Outliers (Z-score)', labelTa: 'புள்ளிவிவர இடர் விலகல்கள்', color: '#ef4444' },
    { key: 'risks', label: 'Multi-Criteria Risk Priority Zones', labelTa: 'இடர் முன்னுரிமை மண்டலங்கள்', color: '#dc2626' },
    { key: 'community', label: 'Citizen Incident Geotags', labelTa: 'மக்கள் புகார்கள்', color: '#a855f7' },
    { key: 'investigations', label: 'Field Officer Tickets', labelTa: 'கள ஆய்வுப் பணிகள்', color: '#f97316' },
    { key: 'recharge', label: 'Managed Recharge (MAR) Sites', labelTa: 'மறுசுழற்சி உகந்த இடங்கள்', color: '#34d399' },
  ];

  return (
    <div className="p-3.5 bg-[#061811]/95 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl w-64 space-y-3 pointer-events-auto select-none">
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white font-sans">
            {lang === 'ta' ? 'வரைபட அடுக்குகள்' : 'Active GIS Layers'}
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-stone-400 hover:text-white text-xs">✕</button>
        )}
      </div>

      <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin pr-1 text-xs">
        {layerItems.map((item) => {
          const isEnabled = layers[item.key];
          return (
            <label
              key={item.key}
              onClick={() => onToggleLayer(item.key)}
              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-[11px] text-stone-200">
                  {lang === 'ta' ? item.labelTa : item.label}
                </span>
              </div>
              <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                isEnabled ? 'bg-emerald-600 border-emerald-400 text-white' : 'border-white/20'
              }`}>
                {isEnabled && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
