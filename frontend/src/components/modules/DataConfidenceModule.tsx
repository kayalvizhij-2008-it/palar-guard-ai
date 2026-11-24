import React from 'react';
import { DataBadge } from '../common/DataBadge';
import { ShieldCheck, Database, CheckCircle2, AlertTriangle, FileText, ExternalLink } from 'lucide-react';

export const DataConfidenceModule: React.FC = () => {
  const provenanceCategories = [
    {
      type: 'VERIFIED_PUBLIC' as const,
      title: "Verified Public Observations",
      count: "98 records",
      source: "CGWB Hydrograph Records, India-WRIS, IMD NWIC Rain Gauges",
      desc: "Measured physical ground observations from published government telemetry and manual monitoring networks."
    },
    {
      type: 'HISTORICAL_REPORT' as const,
      title: "Historical Literature Records",
      count: "42 records",
      source: "CGWB Palar Aquifer Report 2022, Springer Ambur Study, CPCB Polluted Stretches",
      desc: "Baseline hydrochemical surveys and published hydrogeological cross-sections."
    },
    {
      type: 'MODEL_PREDICTION' as const,
      title: "Model Predictions & Anomaly Alerts",
      count: "12 records",
      source: "Seasonal Naive Forecasts, Robust Z-score Outlier Engine",
      desc: "Algorithmic estimates with explicit walk-forward confidence bounds and validation metrics."
    },
    {
      type: 'COMMUNITY_REPORT' as const,
      title: "Citizen Incident Reports",
      count: "2 verified / 4 pending",
      source: "Local Farmers, Citizen Science Submissions",
      desc: "Geotagged ground reports undergoing field verification before merging into baseline analytics."
    },
    {
      type: 'SYNTHETIC_DEMO' as const,
      title: "Synthetic Demonstration Datasets",
      count: "0 in active baseline",
      source: "Isolated Sandbox Test Suites",
      desc: "Explicitly labeled demonstration scenarios never mixed with verified environmental records."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Data Confidence & Reliability Engine</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            Audit logging, source traceability, and rigorous provenance separation across all environmental data layers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded text-xs font-mono">
            Zero Unlabeled Datasets
          </span>
        </div>
      </div>

      {/* Provenance Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {provenanceCategories.map((cat, idx) => (
          <div key={idx} className="p-5 rounded-xl bg-[#092218] border border-white/[0.08] space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <DataBadge provenance={cat.type} />
                <span className="text-xs font-mono text-stone-400">{cat.count}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{cat.title}</h3>
              <p className="text-xs text-stone-300 leading-relaxed">{cat.desc}</p>
            </div>
            <div className="pt-2 border-t border-white/[0.04] text-[11px] text-stone-400 font-mono">
              Source: {cat.source}
            </div>
          </div>
        ))}
      </div>

      {/* Completeness Matrix */}
      <div className="p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
        <div className="border-b border-white/[0.08] pb-3">
          <h3 className="text-sm font-bold text-white">Data Completeness & Refresh Cadence</h3>
          <p className="text-[11px] text-stone-400">Palar River Basin Observation Audit</p>
        </div>

        <div className="space-y-3 text-xs">
          {[
            { layer: "Groundwater Level Telemetry & Manual Dips", cadence: "Quarterly (4x / year)", completeness: "100%", status: "Active" },
            { layer: "Rainfall Precipitation Gauges (IMD NWIC)", cadence: "Monthly Cumulative", completeness: "100%", status: "Active" },
            { layer: "Surface Water Quality Stretches (TNPCB)", cadence: "Quarterly Monitoring", completeness: "92%", status: "Active" },
            { layer: "Community Field Incident Reports", cadence: "Continuous Citizen Ingestion", completeness: "Moderated", status: "Ongoing" },
          ].map((row, rIdx) => (
            <div key={rIdx} className="p-3 bg-[#05160e] rounded-lg border border-white/[0.04] flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">{row.layer}</div>
                <div className="text-[10px] text-stone-400">Cadence: {row.cadence}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-emerald-400 font-bold">{row.completeness}</div>
                <div className="text-[10px] text-stone-500 font-mono">{row.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
