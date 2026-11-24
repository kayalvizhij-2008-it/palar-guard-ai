import React, { useState } from 'react';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { FileText, Download, Printer, CheckCircle2, Filter } from 'lucide-react';

export const AnalyticsReportingModule: React.FC = () => {
  const [selectedStation, setSelectedStation] = useState<string>("All Stations");
  const [reportType, setReportType] = useState<string>("Executive Environmental Dossier");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportCSV = () => {
    // Generate actual CSV content
    const headers = "Location ID,Station Name,District,Basin Zone,Risk Score,Confidence Level\n";
    const rows = PALAR_LOCATIONS.map(l => 
      `${l.id},"${l.name}","${l.district}","${l.basin_zone}",${l.risk_score},"${l.confidence_level}"`
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `PALAR_GUARD_AI_Data_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Analytics & Dossier Reporting Centre</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            Export structured CSV datasets and generate publication-ready environmental dossiers for authorities and academic review.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#0d2a1e] hover:bg-[#123828] text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-forest-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Raw CSV</span>
          </button>
          <button
            onClick={handlePrintDossier}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-forest-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>CSV dataset downloaded successfully to your local machine!</span>
        </div>
      )}

      {/* Printable Executive Dossier Preview */}
      <div className="p-8 bg-[#092218] border border-white/[0.08] rounded-2xl space-y-6 print:bg-white print:text-black">
        {/* Document Header */}
        <div className="border-b border-white/10 pb-5 flex items-start justify-between">
          <div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">EXECUTIVE ENVIRONMENTAL INTELLIGENCE DOSSIER</div>
            <h1 className="text-2xl font-extrabold text-white mt-1">Palar River Basin Hydrological Audit</h1>
            <p className="text-xs text-stone-400 mt-1">Tamil Nadu, India • Generated: {new Date().toLocaleDateString()} • System ID: PG-2026-AUDIT</p>
          </div>
          <div className="text-right">
            <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold">
              OFFICIAL BENCHMARK
            </span>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="space-y-3 text-xs leading-relaxed text-stone-200">
          <h3 className="text-sm font-bold text-emerald-300">1. Executive Summary & Basin Status</h3>
          <p>
            The Palar River Catchment (17,810 km²) demonstrates critical spatial variance between upper industrial tannery clusters (Ambur, Vaniyambadi, Ranipet) and agrarian recharge reaches (Walajapet, Kanchipuram). Basin-wide groundwater depth averages 13.2 mbgl, reflecting a 0.6 m/yr accelerated pre-monsoon drawdown.
          </p>
          <p>
            Statistical anomaly surveillance identified a Critical Total Chromium outlier (0.082 mg/L, Z-score 3.84) in the Ranipet industrial reach, prompting dispatch of field verification units.
          </p>
        </div>

        {/* Station Audit Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-emerald-300">2. Baseline Monitoring Station Summary</h3>
          <table className="w-full text-left text-xs border border-white/10">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 font-mono text-[11px] text-stone-300">
                <th className="p-2.5">Station Name</th>
                <th className="p-2.5">Basin Zone</th>
                <th className="p-2.5 text-right">Risk (0-100)</th>
                <th className="p-2.5 text-right">TDS (mg/L)</th>
                <th className="p-2.5 text-right">Chromium (mg/L)</th>
                <th className="p-2.5 text-center">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-mono text-[11px]">
              {WATER_QUALITY_STATIONS.map((st) => {
                const loc = PALAR_LOCATIONS.find(l => l.id === st.location_id);
                return (
                  <tr key={st.location_id} className="hover:bg-white/[0.02]">
                    <td className="p-2.5 font-sans font-bold text-white">{st.location_name}</td>
                    <td className="p-2.5 text-stone-300">{loc?.basin_zone}</td>
                    <td className="p-2.5 text-right text-amber-400 font-bold">{loc?.risk_score}</td>
                    <td className="p-2.5 text-right text-stone-300">{st.tds_mg_l}</td>
                    <td className={`p-2.5 text-right ${st.chromium_mg_l > 0.05 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                      {st.chromium_mg_l}
                    </td>
                    <td className="p-2.5 text-center">
                      <DataBadge provenance={st.provenance} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Limitations and Methodology Statement */}
        <div className="p-4 bg-[#05160e] rounded-xl border border-white/[0.06] space-y-2 text-xs">
          <h4 className="font-bold text-white">3. Methodological Limitations & Provenance Notice</h4>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            Data synthesized from Central Ground Water Board (CGWB) observation wells, CPCB river stretch criteria, and India Meteorological Department precipitation series. Point monitoring records represent localized bore profiles and should not be extrapolated across unverified geological boundaries without on-ground geoelectric resistivity surveys.
          </p>
        </div>

        {/* Signoff Strip */}
        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-stone-400 font-mono">
          <div>Report prepared by: <strong>Kayalvizhi J (Founder & Project Lead)</strong></div>
          <div>Chennai Institute of Technology</div>
        </div>
      </div>
    </div>
  );
};
