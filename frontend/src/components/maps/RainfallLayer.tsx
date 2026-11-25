import React from 'react';

export const RainfallLayer: React.FC = () => {
  return (
    <div className="p-3 bg-[#061811]/90 rounded-xl border border-white/10 text-xs space-y-1.5 font-mono">
      <div className="font-bold text-blue-300 font-sans">Monsoon Rainfall Distribution (mm)</div>
      <div className="text-[11px] text-stone-300 space-y-1">
        <div className="flex justify-between">
          <span>Upper Catchment (Vaniyambadi):</span>
          <span className="text-white font-bold">590 mm</span>
        </div>
        <div className="flex justify-between">
          <span>Middle Basin (Ranipet/Vellore):</span>
          <span className="text-emerald-400 font-bold">682 mm (+12%)</span>
        </div>
        <div className="flex justify-between">
          <span>Coastal Estuary (Sadras):</span>
          <span className="text-cyan-400 font-bold">810 mm</span>
        </div>
      </div>
    </div>
  );
};
