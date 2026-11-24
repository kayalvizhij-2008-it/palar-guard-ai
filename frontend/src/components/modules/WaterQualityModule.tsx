import React, { useState } from 'react';
import { WATER_QUALITY_STATIONS } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { FlaskConical, ShieldAlert, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const WaterQualityModule: React.FC = () => {
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const selectedStation = WATER_QUALITY_STATIONS.find(s => s.location_id === selectedStationId) || WATER_QUALITY_STATIONS[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Water Quality Intelligence</h2>
            <DataBadge provenance="HISTORICAL_REPORT" />
          </div>
          <p className="text-xs text-stone-300">
            Hydrochemical surveillance across industrial tannery stretches and agrarian reaches of the Palar River.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="wq-station" className="text-xs font-mono text-stone-400">Station:</label>
          <select
            id="wq-station"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[#061811] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
          >
            {WATER_QUALITY_STATIONS.map(st => (
              <option key={st.location_id} value={st.location_id}>{st.location_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Parameter Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl bg-[#092218] border border-white/[0.08] space-y-1">
          <div className="text-[10px] text-stone-400 font-mono">pH Value</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">{selectedStation.ph}</div>
          <div className="text-[10px] text-stone-400">BIS: 6.5 - 8.5</div>
        </div>

        <div className="p-4 rounded-xl bg-[#092218] border border-white/[0.08] space-y-1">
          <div className="text-[10px] text-stone-400 font-mono">TDS (Total Solids)</div>
          <div className={`text-xl font-bold font-mono tabular-nums ${selectedStation.tds_mg_l > 1500 ? 'text-red-400' : 'text-white'}`}>
            {selectedStation.tds_mg_l} <span className="text-[10px] font-normal text-stone-400">mg/L</span>
          </div>
          <div className="text-[10px] text-stone-400">BIS Limit: &lt;500</div>
        </div>

        <div className="p-4 rounded-xl bg-[#092218] border border-white/[0.08] space-y-1">
          <div className="text-[10px] text-stone-400 font-mono">Conductivity (EC)</div>
          <div className={`text-xl font-bold font-mono tabular-nums ${selectedStation.ec_us_cm > 2500 ? 'text-red-400' : 'text-white'}`}>
            {selectedStation.ec_us_cm} <span className="text-[10px] font-normal text-stone-400">µS/cm</span>
          </div>
          <div className="text-[10px] text-stone-400">CPCB Normal: &lt;1500</div>
        </div>

        <div className="p-4 rounded-xl bg-[#092218] border border-white/[0.08] space-y-1">
          <div className="text-[10px] text-stone-400 font-mono">Total Chromium</div>
          <div className={`text-xl font-bold font-mono tabular-nums ${selectedStation.chromium_mg_l > 0.05 ? 'text-red-400' : 'text-emerald-400'}`}>
            {selectedStation.chromium_mg_l} <span className="text-[10px] font-normal text-stone-400">mg/L</span>
          </div>
          <div className="text-[10px] text-stone-400">BIS Limit: &lt;0.05</div>
        </div>

        <div className="p-4 rounded-xl bg-[#092218] border border-white/[0.08] space-y-1">
          <div className="text-[10px] text-stone-400 font-mono">BOD (Biochemical)</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {selectedStation.bod_mg_l} <span className="text-[10px] font-normal text-stone-400">mg/L</span>
          </div>
          <div className="text-[10px] text-stone-400">CPCB Limit: &lt;3.0</div>
        </div>

        <div className="p-4 rounded-xl bg-[#092218] border border-white/[0.08] space-y-1">
          <div className="text-[10px] text-stone-400 font-mono">Dissolved Oxygen</div>
          <div className="text-xl font-bold font-mono text-white tabular-nums">
            {selectedStation.do_mg_l} <span className="text-[10px] font-normal text-stone-400">mg/L</span>
          </div>
          <div className="text-[10px] text-stone-400">CPCB Min: &gt;5.0</div>
        </div>
      </div>

      {/* Comparison Table Across All 7 Basin Stations */}
      <div className="p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Comparative Water Quality Matrix (Palar Basin)</h3>
            <p className="text-[11px] text-stone-400">Reference: CPCB Polluted Stretches Report & TNPCB Observations</p>
          </div>
          <DataBadge provenance="HISTORICAL_REPORT" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-stone-400 border-b border-white/[0.06] text-[11px] font-mono">
                <th className="py-2.5 font-medium">Station Location</th>
                <th className="py-2.5 font-medium text-right">pH</th>
                <th className="py-2.5 font-medium text-right">TDS (mg/L)</th>
                <th className="py-2.5 font-medium text-right">EC (µS/cm)</th>
                <th className="py-2.5 font-medium text-right">Chromium (mg/L)</th>
                <th className="py-2.5 font-medium text-right">BOD (mg/L)</th>
                <th className="py-2.5 font-medium text-center">Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {WATER_QUALITY_STATIONS.map((station) => (
                <tr 
                  key={station.location_id}
                  className={`hover:bg-white/[0.02] transition-colors ${station.location_id === selectedStationId ? 'bg-emerald-950/30' : ''}`}
                >
                  <td className="py-3 font-semibold text-white">{station.location_name}</td>
                  <td className="py-3 text-right font-mono tabular-nums">{station.ph}</td>
                  <td className={`py-3 text-right font-mono tabular-nums ${station.tds_mg_l > 1500 ? 'text-red-400 font-bold' : 'text-stone-300'}`}>
                    {station.tds_mg_l}
                  </td>
                  <td className={`py-3 text-right font-mono tabular-nums ${station.ec_us_cm > 2500 ? 'text-red-400 font-bold' : 'text-stone-300'}`}>
                    {station.ec_us_cm}
                  </td>
                  <td className={`py-3 text-right font-mono tabular-nums ${station.chromium_mg_l > 0.05 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                    {station.chromium_mg_l}
                  </td>
                  <td className="py-3 text-right font-mono tabular-nums">{station.bod_mg_l}</td>
                  <td className="py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                      station.status === 'Critical' ? 'bg-red-950/80 text-red-300 border border-red-500/40' :
                      station.status === 'Elevated' ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {station.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.04] text-[11px] text-stone-400 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Scientific Integrity Guidance:</strong> Drinking water limits (BIS 10500) are benchmark comparisons. River water is not expected to meet untreated drinking standards directly; however, Chromium levels above 0.05 mg/L in surface drains represent industrial discharge concerns that require on-site laboratory verification.
          </span>
        </div>
      </div>
    </div>
  );
};
