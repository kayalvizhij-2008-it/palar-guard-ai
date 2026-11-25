import React from 'react';
import { WATER_QUALITY_STATIONS } from '../../data/palarData';

export const WaterQualityLayer: React.FC = () => {
  return (
    <div className="p-3 bg-[#061811]/90 rounded-xl border border-white/10 text-xs space-y-1.5 font-mono">
      <div className="font-bold text-amber-300 font-sans">Chemical & Chromium Outliers</div>
      <div className="text-[11px] space-y-1">
        {WATER_QUALITY_STATIONS.slice(0, 3).map(wq => (
          <div key={wq.location_id} className="flex justify-between text-stone-300">
            <span>{wq.location_name}:</span>
            <span className={wq.chromium_mg_l > 0.05 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              Cr: {wq.chromium_mg_l} mg/L
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
