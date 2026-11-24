import React from 'react';
import { MetricCard } from '../common/MetricCard';
import { DataBadge } from '../common/DataBadge';
import { PALAR_LOCATIONS, ANOMALIES_DATA, INVESTIGATIONS_DATA, COMMUNITY_REPORTS_DATA } from '../../data/palarData';
import { 
  Droplets, AlertTriangle, ShieldCheck, ClipboardList, 
  ArrowUpRight, Compass, Users, MapPin, Eye, CheckCircle2
} from 'lucide-react';

interface DashboardOverviewProps {
  onSelectModule: (moduleId: string) => void;
  onSelectLocation?: (locId: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onSelectModule, onSelectLocation }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Palar Basin Environmental Intelligence Console</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            Real-time status across 7 continuous baseline stations in Vellore, Ranipet, Tirupathur, Kanchipuram, and Chengalpattu.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onSelectModule('digital_twin')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-ivory text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-forest-sm transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Open Basin Digital Twin</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards (Unslop & UI UX Pro Max compliant) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Basin Groundwater Mean"
          value="13.2"
          unit="mbgl"
          comparison="Drawdown +0.6m vs seasonal mean"
          comparisonType="negative"
          provenance="VERIFIED_PUBLIC"
          icon={<Droplets className="w-4 h-4 text-emerald-400" />}
        />
        <MetricCard
          label="Active Chemical Anomalies"
          value={ANOMALIES_DATA.filter(a => a.status === 'Open').length}
          unit="locations"
          comparison="1 Critical alert at Ranipet Sluice"
          comparisonType="negative"
          provenance="MODEL_PREDICTION"
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
        <MetricCard
          label="Dispatched Investigations"
          value={INVESTIGATIONS_DATA.length}
          unit="active"
          comparison="Field sampling in progress"
          comparisonType="neutral"
          provenance="VERIFIED_PUBLIC"
          icon={<ClipboardList className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          label="Citizen Water Reports"
          value={COMMUNITY_REPORTS_DATA.length}
          unit="reports"
          comparison="2 verified community complaints"
          comparisonType="positive"
          provenance="COMMUNITY_REPORT"
          icon={<Users className="w-4 h-4 text-stone-300" />}
        />
      </div>

      {/* Main Grid: Station Risk Prioritisation & Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monitored Station Prioritisation */}
        <div className="lg:col-span-8 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Monitored Station Risk Priorities
                <DataBadge provenance="MODEL_PREDICTION" />
              </h3>
              <p className="text-[11px] text-stone-400">Ranked by Multi-Criteria Decision Score (MCDA 0-100)</p>
            </div>
            <button
              onClick={() => onSelectModule('risk_priority')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              <span>Explain Weights</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-stone-400 border-b border-white/[0.06] text-[11px] font-mono">
                  <th className="py-2 font-medium">Station Location</th>
                  <th className="py-2 font-medium">Basin Zone</th>
                  <th className="py-2 font-medium text-right">Risk Score</th>
                  <th className="py-2 font-medium text-center">Confidence</th>
                  <th className="py-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {PALAR_LOCATIONS.map((loc) => {
                  let badgeColor = 'text-emerald-400';
                  if (loc.risk_score > 70) badgeColor = 'text-red-400 font-bold';
                  else if (loc.risk_score > 50) badgeColor = 'text-amber-400 font-semibold';

                  return (
                    <tr key={loc.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3">
                        <div className="font-semibold text-white">{loc.name}</div>
                        <div className="text-[10px] text-stone-400">{loc.district} District</div>
                      </td>
                      <td className="py-3 text-stone-300 font-mono text-[11px]">{loc.basin_zone}</td>
                      <td className="py-3 text-right font-mono tabular-nums">
                        <span className={badgeColor}>{loc.risk_score} / 100</span>
                      </td>
                      <td className="py-3 text-center">
                        <DataBadge provenance={loc.confidence_level === 'High' ? 'VERIFIED_PUBLIC' : 'HISTORICAL_REPORT'} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => onSelectModule('groundwater')}
                          className="px-2.5 py-1 bg-white/5 hover:bg-emerald-600/30 text-stone-200 hover:text-emerald-200 rounded text-[11px] font-medium transition-colors"
                        >
                          Hydrograph
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Anomaly Alerts & Triage */}
        <div className="lg:col-span-4 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Active Anomaly Feed</span>
            </h3>
            <button
              onClick={() => onSelectModule('anomalies')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {ANOMALIES_DATA.map((alert) => (
              <div 
                key={alert.id}
                className="p-3 rounded-lg bg-[#05160e] border border-white/[0.06] hover:border-emerald-500/30 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-white truncate max-w-[170px]">{alert.location_name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-500/30">
                    {alert.severity}
                  </span>
                </div>
                <div className="text-xs text-amber-300 font-medium">{alert.parameter}</div>
                <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{alert.trigger_reason}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                  <span>Z-Score: {alert.z_score}</span>
                  <span className="text-emerald-400 font-semibold">{alert.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onSelectModule('investigations')}
              className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold transition-colors"
            >
              Manage Field Investigations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
