import React from 'react';
import { RECHARGE_ASSESSMENTS_DATA } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { Layers, CheckCircle2, AlertTriangle, Info, MapPin } from 'lucide-react';

export const RechargeModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Recharge Intervention Intelligence</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            Hydrogeological screening evaluating infiltration capacity, sand alluvium thickness, and slope for targeted aquifer replenishment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded text-xs font-mono">
            4 Evaluated Infiltration Zones
          </span>
        </div>
      </div>

      {/* Mandatory Engineering Protocol Box */}
      <div className="p-4 bg-[#14261d] rounded-xl border border-emerald-500/30 flex items-start gap-3">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-300 leading-relaxed">
          <span className="font-bold text-emerald-300">Engineering Screening Notice: </span>
          Suitability scores represent regional hydrogeological screening based on slope and permeability. They do not substitute for on-site geotechnical bore logging or approved civil engineering design.
        </div>
      </div>

      {/* Recharge Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {RECHARGE_ASSESSMENTS_DATA.map((item) => (
          <div 
            key={item.id}
            className="p-5 rounded-xl bg-[#092218] border border-white/[0.08] hover:border-emerald-500/30 transition-colors space-y-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{item.location_name}</h3>
                <span className="text-xs text-emerald-400 font-mono">{item.status}</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-stone-400 font-mono">Suitability Score</div>
                <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">{item.score} / 100</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 bg-[#05160e] rounded-lg border border-white/[0.04] text-xs font-mono">
              <div>
                <div className="text-[10px] text-stone-400">Soil Type</div>
                <div className="text-stone-200 truncate">{item.soil.split(' ')[0]}</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400">Slope</div>
                <div className="text-stone-200">{item.slope}%</div>
              </div>
              <div>
                <div className="text-[10px] text-stone-400">Storage Head</div>
                <div className="text-stone-200">{item.head_m}m</div>
              </div>
            </div>

            <div className="p-3 bg-[#0c2419] rounded-lg border border-emerald-500/20 space-y-1">
              <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase">Recommended Intervention</div>
              <div className="text-xs text-white font-medium">{item.recommended}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
