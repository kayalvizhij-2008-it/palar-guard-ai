import React from 'react';
import { GROUNDWATER_TIMESERIES, PALAR_LOCATIONS } from '../../data/palarData';

export const GroundwaterLayer: React.FC = () => {
  return (
    <div className="p-3 bg-[#061811]/90 rounded-xl border border-white/10 text-xs space-y-2">
      <div className="font-bold text-cyan-300 font-sans">Groundwater Depletion Layer (mbgl)</div>
      <div className="space-y-1 font-mono text-[11px]">
        {PALAR_LOCATIONS.slice(0, 4).map(loc => {
          const gw = GROUNDWATER_TIMESERIES[loc.id];
          const depth = gw ? gw[gw.length - 1]?.depth_mbgl : 13.5;
          return (
            <div key={loc.id} className="flex justify-between text-stone-300">
              <span>{loc.name}:</span>
              <span className={depth > 14 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {depth} mbgl
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
