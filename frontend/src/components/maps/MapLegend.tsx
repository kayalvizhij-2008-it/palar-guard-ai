import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const MapLegend: React.FC = () => {
  const { lang } = useLanguage();

  return (
    <div className="p-3 bg-[#061811]/90 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl text-[11px] space-y-2 pointer-events-auto select-none">
      <div className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
        {lang === 'ta' ? 'வரைபட விளக்கம்' : 'Map Legend'}
      </div>

      <div className="space-y-1.5 text-stone-300">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1.5 rounded-full bg-[#10b981] border border-emerald-300" />
          <span>{lang === 'ta' ? '17,810 கிமீ² படுகை எல்லை' : '17,810 km² Catchment'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-1 rounded-full bg-[#38bdf8]" />
          <span>{lang === 'ta' ? 'பாலாறு & துணையாறுகள்' : 'Palar River Channel'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          <span>{lang === 'ta' ? 'இயல்பு நிலை கிணறு' : 'Normal / Permissible'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
          <span>{lang === 'ta' ? 'எச்சரிக்கை நிலை' : 'Elevated Drawdown'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm" />
          <span>{lang === 'ta' ? 'தீவிர அபாய நிலையம்' : 'Critical Chemical Anomaly'}</span>
        </div>
      </div>

      <div className="pt-1.5 border-t border-white/10 text-[9px] font-mono text-stone-400">
        Tiles: Esri World Imagery (Public Free)
      </div>
    </div>
  );
};
