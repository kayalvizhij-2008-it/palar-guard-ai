import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PALAR_LOCATIONS, GROUNDWATER_TIMESERIES } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { Droplets, Info, TrendingDown, ArrowDownRight, Compass } from 'lucide-react';
import { BasinMap } from '../maps/BasinMap';

interface GroundwaterModuleProps {
  initialLocationId?: number;
}

export const GroundwaterModule: React.FC<GroundwaterModuleProps> = ({ initialLocationId = 1 }) => {
  const [selectedStationId, setSelectedStationId] = useState<number>(initialLocationId);

  // Sync if initialLocationId changes
  React.useEffect(() => {
    if (initialLocationId) setSelectedStationId(initialLocationId);
  }, [initialLocationId]);

  const selectedLocation = PALAR_LOCATIONS.find(l => l.id === selectedStationId) || PALAR_LOCATIONS[0];
  const chartData = GROUNDWATER_TIMESERIES[selectedStationId] || GROUNDWATER_TIMESERIES[1];

  return (
    <div className="space-y-6">
      {/* Header & Station Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Groundwater Stress Intelligence</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            Multi-year quarterly hydrographs from Central Ground Water Board (CGWB) observation wells across Palar aquifers.
          </p>
        </div>

        {/* Station Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="station-select" className="text-xs font-mono text-stone-400">Station:</label>
          <select
            id="station-select"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[#061811] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
          >
            {PALAR_LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hydrograph Chart & Station Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart Column */}
        <div className="lg:col-span-8 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Depth to Water Level (mbgl)</span>
                <span className="text-[11px] font-mono font-normal text-stone-400">• Higher value indicates deeper/depleted water table</span>
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400">2023 - 2026 Timeline</span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#123627" vertical={false} />
                <XAxis dataKey="period" stroke="#889890" fontSize={11} tickLine={false} />
                <YAxis stroke="#889890" fontSize={11} tickLine={false} reversed={true} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#061811', borderColor: 'rgba(16, 185, 129, 0.3)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fcfbf7', fontWeight: 'bold' }}
                  itemStyle={{ color: '#10b981' }}
                  formatter={(val: any) => [`${val} mbgl`, 'Water Depth']}
                />
                <Line
                  type="monotone"
                  dataKey="depth_mbgl"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#061811', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.04] text-[11px] text-stone-400 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Hydrogeological Note:</strong> Seasonal post-monsoon recharge is visible during Q4 (November-December) following Northeast monsoon precipitation. Summer extraction typically reaches peak depth in Q2 (May-June).
            </span>
          </div>
        </div>

        {/* Station Metadata & Key Indicators */}
        <div className="lg:col-span-4 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-5">
          <div className="border-b border-white/[0.08] pb-3">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Station Profile</div>
            <h3 className="text-base font-bold text-white mt-0.5">{selectedLocation.name}</h3>
            <p className="text-xs text-stone-400">{selectedLocation.district} District • {selectedLocation.basin_zone}</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-[#05160e] border border-white/[0.06] flex items-center justify-between">
              <div>
                <div className="text-[10px] text-stone-400">Current Depth (2026-Q1)</div>
                <div className="text-xl font-bold text-white font-mono tabular-nums">
                  {chartData[chartData.length - 1]?.depth_mbgl || 14.9} <span className="text-xs text-stone-400 font-normal">mbgl</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-stone-400">Quarterly Trend</div>
                <div className="text-xs font-bold text-amber-400 font-mono flex items-center justify-end gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>-0.6 m/yr</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#05160e] border border-white/[0.06] space-y-1.5">
              <div className="text-[10px] text-stone-400">Primary Aquifer Formation</div>
              <div className="text-xs text-stone-200 font-medium">Alluvium underlain by Weathered & Fractured Gneiss</div>
              <div className="text-[10px] text-emerald-400 font-mono">Specific Yield: 0.12 • Transmissivity: 450 m²/day</div>
            </div>

            <div className="p-3 rounded-lg bg-[#05160e] border border-white/[0.06] space-y-1">
              <div className="text-[10px] text-stone-400">Data Source Traceability</div>
              <div className="text-xs text-stone-300">CGWB Palar Aquifer Master Management Plan</div>
              <div className="pt-1">
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Geospatial Well Distribution Map */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Palar Aquifer Observation Well Distribution</span>
          </h3>
          <span className="text-xs font-mono text-stone-400">Click any well on the map to switch hydrograph</span>
        </div>
        <BasinMap 
          onSelectStation={(id) => setSelectedStationId(id)}
          initialStationId={selectedStationId}
          heightClass="h-[360px]"
          showLayerControls={false}
        />
      </div>
    </div>
  );
};
