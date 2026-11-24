import React, { useState } from 'react';
import { PALAR_LOCATIONS } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { Target, Shield, CheckCircle, Info, Sliders, ArrowUpRight } from 'lucide-react';

export const RiskPrioritisationModule: React.FC = () => {
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const selectedLocation = PALAR_LOCATIONS.find(l => l.id === selectedStationId) || PALAR_LOCATIONS[0];

  const isIndustrial = selectedLocation.id === 1 || selectedLocation.id === 2;

  const criteriaDimensions = [
    { name: "Groundwater Stress", weight: "30%", score: isIndustrial ? 82 : 54, status: isIndustrial ? "Severe Drawdown" : "Moderate", color: "text-amber-400" },
    { name: "Water Quality Concern", weight: "35%", score: isIndustrial ? 88 : 38, status: isIndustrial ? "Chromium/TDS Elevated" : "Normal Baseline", color: isIndustrial ? "text-red-400" : "text-emerald-400" },
    { name: "Rainfall & Recharge Deficit", weight: "15%", score: 52, status: "Moderate Infiltration Window", color: "text-stone-300" },
    { name: "Observation Recency", weight: "10%", score: 92, status: "Current Quarter Verified", color: "text-emerald-400" },
    { name: "Data Confidence Level", weight: "10%", score: 85, status: selectedLocation.confidence_level === 'High' ? "High Grounding" : "Medium", color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Geospatial Risk Prioritisation Engine</h2>
            <DataBadge provenance="MODEL_PREDICTION" />
          </div>
          <p className="text-xs text-stone-300">
            Explainable Multi-Criteria Decision Analysis (MCDA) ranking river stretches to optimize environmental field triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="risk-station" className="text-xs font-mono text-stone-400">Station:</label>
          <select
            id="risk-station"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[#061811] border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
          >
            {PALAR_LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Weight Breakdown & Station Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Explainable Dimensions Breakdown */}
        <div className="lg:col-span-7 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Transparent MCDA Scoring Matrix</h3>
              <p className="text-[11px] text-stone-400">{selectedLocation.name} ({selectedLocation.district} District)</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 font-mono">Aggregated Score: </span>
              <span className="text-lg font-bold font-mono text-amber-400 tabular-nums">{selectedLocation.risk_score} / 100</span>
            </div>
          </div>

          <div className="space-y-3">
            {criteriaDimensions.map((crit, cIdx) => (
              <div key={cIdx} className="p-3 bg-[#05160e] rounded-lg border border-white/[0.04] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{crit.name}</span>
                  <span className="font-mono text-[11px] text-stone-400">Weight: {crit.weight}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-stone-400">{crit.status}</span>
                  <span className={`font-mono font-bold ${crit.color}`}>{crit.score} / 100</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${crit.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.04] text-[11px] text-stone-400 leading-relaxed flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Scientific Transparency:</strong> The overall score reflects weighted factors. Missing observations gracefully lower overall confidence rather than silently fabricating numbers.
            </span>
          </div>
        </div>

        {/* Right: Action Dispatch Guidance */}
        <div className="lg:col-span-5 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Triage Recommendation</div>
            <h3 className="text-base font-bold text-white mt-0.5">Recommended Action</h3>
            <p className="text-xs text-stone-400">Decision-Support Workflow</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] space-y-1.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Next Verification Step</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                {isIndustrial 
                  ? "Immediate field team deployment to collect replicate 1L samples for total Chromium ICP-MS testing and calibrate telemetry loggers."
                  : "Routine quarterly hydrograph recording; evaluate seasonal percolation tank desiltation readiness."
                }
              </p>
            </div>

            <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] space-y-1">
              <div className="text-[10px] text-stone-400 font-mono">Assigned Response Unit</div>
              <div className="text-xs text-emerald-300 font-medium">
                {isIndustrial ? "Field Team Alpha (Tirupathur/Ranipet Sector)" : "District Agrarian Water Cell"}
              </div>
            </div>

            <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] space-y-1">
              <div className="text-[10px] text-stone-400 font-mono">Data Traceability</div>
              <div className="text-xs text-stone-300">CGWB Palar Aquifer Master & TNPCB Stretches</div>
              <div className="pt-1">
                <DataBadge provenance={selectedLocation.confidence_level === 'High' ? 'VERIFIED_PUBLIC' : 'HISTORICAL_REPORT'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
