import React from 'react';
import { PALAR_LOCATIONS } from '../../data/palarData';

export interface StationMarkerProps {
  onSelectStation: (stationId: number) => void;
  selectedStationId?: number;
}

export const MonitoringStationMarkers: React.FC<StationMarkerProps> = ({
  onSelectStation,
  selectedStationId
}) => {
  return (
    <div className="space-y-2">
      {PALAR_LOCATIONS.map((loc) => {
        const isSelected = selectedStationId === loc.id;
        const isCritical = loc.risk_score > 70;
        return (
          <div
            key={loc.id}
            onClick={() => onSelectStation(loc.id)}
            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
              isSelected 
                ? 'bg-emerald-950/80 border-emerald-400 shadow-sm' 
                : 'bg-[#05170f] border-white/5 hover:border-emerald-500/30'
            }`}
          >
            <div>
              <div className="font-bold text-white font-sans">{loc.name}</div>
              <div className="text-[10px] text-stone-400 font-mono">{loc.district}</div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isCritical ? 'bg-red-950 text-red-300' : 'bg-emerald-950 text-emerald-300'
            }`}>
              {loc.risk_score}/100
            </span>
          </div>
        );
      })}
    </div>
  );
};
