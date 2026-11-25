import React from 'react';
import { PALAR_LOCATIONS } from '../../data/palarData';

export const RiskLayer: React.FC = () => {
  return (
    <div className="p-3 bg-[#061811]/90 rounded-xl border border-white/10 text-xs space-y-1.5 font-mono">
      <div className="font-bold text-rose-300 font-sans">MCDA Spatial Risk Prioritisation</div>
      <div className="text-[11px] space-y-1">
        {PALAR_LOCATIONS.slice(0, 3).map(loc => (
          <div key={loc.id} className="flex justify-between text-stone-300">
            <span>{loc.name}:</span>
            <span className={loc.risk_score > 70 ? 'text-rose-400 font-bold' : 'text-amber-400'}>
              {loc.risk_score}/100 Priority
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
