import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { RAINFALL_SERIES } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { CloudRain, Droplets, Info, Sun } from 'lucide-react';

export const RainfallModule: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Rainfall & Recharge Intelligence</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            Monthly catchment precipitation vs IMD normal baselines across the Palar River Basin (17,810 km²).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 rounded text-xs font-mono">
            Annual Catchment Mean: 980mm
          </span>
        </div>
      </div>

      {/* Main Bar Chart & Rainfall Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Monthly Precipitation (mm) vs Long-Term Normal</span>
            </h3>
            <span className="text-xs font-mono text-stone-400">IMD NWIC Station Data</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RAINFALL_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#123627" vertical={false} />
                <XAxis dataKey="month" stroke="#889890" fontSize={11} tickLine={false} />
                <YAxis stroke="#889890" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#061811', borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fcfbf7', fontWeight: 'bold' }}
                  formatter={(val: any, name: any) => [`${val} mm`, name === 'rainfall_mm' ? 'Observed Rainfall' : 'Normal Baseline']}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}
                  formatter={(value) => value === 'rainfall_mm' ? 'Observed Rainfall' : '30-Yr Normal Baseline'}
                />
                <Bar dataKey="rainfall_mm" fill="#10b981" radius={[4, 4, 0, 0]} name="rainfall_mm" />
                <Bar dataKey="normal_mm" fill="#2d5242" radius={[4, 4, 0, 0]} name="normal_mm" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.04] text-[11px] text-stone-400 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>Recharge Window Insight:</strong> Over 55% of total annual recharge in the Palar Basin occurs during October-November Northeast Monsoon storms. Infiltration structures must be desilted before October to maximize aquifer recharge.
            </span>
          </div>
        </div>

        {/* Monsoon Breakdown Column */}
        <div className="lg:col-span-4 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Catchment Dynamics</div>
            <h3 className="text-base font-bold text-white mt-0.5">Seasonal Distribution</h3>
            <p className="text-xs text-stone-400">Palar Hydrological Year</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#05160e] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Northeast Monsoon (Oct - Dec)</span>
                <span className="text-emerald-400 font-mono">590 mm (55%)</span>
              </div>
              <p className="text-[11px] text-stone-400">Primary recharge season filling traditional eris, anicuts, and river sand beds.</p>
            </div>

            <div className="p-3 rounded-lg bg-[#05160e] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Southwest Monsoon (Jun - Sep)</span>
                <span className="text-cyan-400 font-mono">401 mm (32%)</span>
              </div>
              <p className="text-[11px] text-stone-400">Secondary storms reducing crop water stress and stabilizing water table.</p>
            </div>

            <div className="p-3 rounded-lg bg-[#05160e] border border-white/[0.06] space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>Dry Pre-Monsoon (Jan - May)</span>
                <span className="text-amber-400 font-mono">60 mm (13%)</span>
              </div>
              <p className="text-[11px] text-stone-400">Critical drawdown period with high evaporation and heavy irrigation pumping.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
