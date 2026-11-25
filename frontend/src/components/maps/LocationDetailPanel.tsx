import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DataBadge } from '../common/DataBadge';
import { 
  X, Droplets, CloudRain, FlaskConical, AlertTriangle, 
  MapPin, ShieldCheck, ArrowRight, ExternalLink 
} from 'lucide-react';

export interface StationDetailData {
  station_id: number;
  name: string;
  district: string;
  state: string;
  basin_zone: string;
  coordinates: { latitude: number; longitude: number };
  risk_priority: {
    score: number;
    category: string;
    confidence: string;
  };
  groundwater?: {
    current_depth_mbgl: number;
    trend_rate_m_yr: number;
    observation_date: string;
    source: string;
    provenance: any;
  };
  water_quality?: {
    tds_mg_l: number;
    total_chromium_mg_l: number;
    ph: number;
    ec_us_cm: number;
    source: string;
    compliance_status: string;
  };
  rainfall?: {
    annual_mean_mm: number;
    normal_mm: number;
    deviation_pct: number;
  };
  recharge_suitability?: {
    score: number;
    recommended_structure: string;
    soil: string;
  };
  active_alerts?: Array<{
    id: number;
    parameter: string;
    severity: string;
    status: string;
    z_score: number;
    trigger_reason: string;
  }>;
}

interface LocationDetailPanelProps {
  station: StationDetailData | null;
  onClose: () => void;
  onNavigateToAnalysis?: (stationId: number) => void;
}

export const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({
  station,
  onClose,
  onNavigateToAnalysis
}) => {
  const { lang } = useLanguage();

  if (!station) return null;

  return (
    <div className="absolute top-4 right-4 z-[1000] w-80 sm:w-96 max-h-[90%] overflow-y-auto scrollbar-thin bg-[#061811]/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-5 shadow-2xl shadow-black/80 space-y-4 animate-fade-in pointer-events-auto">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5" />
            <span>{station.basin_zone} · {station.district}</span>
          </div>
          <h3 className="text-lg font-bold text-white font-sans mt-0.5">{station.name}</h3>
          <div className="text-[10px] font-mono text-stone-400">
            {station.coordinates.latitude.toFixed(4)}°N, {station.coordinates.longitude.toFixed(4)}°E
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Risk Score Pill */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
        <div>
          <div className="text-[10px] font-mono text-stone-400 uppercase">Risk Priority Index</div>
          <div className="text-xl font-black font-sans text-white">
            {station.risk_priority.score} <span className="text-xs text-stone-500 font-normal">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            station.risk_priority.score > 70 
              ? 'bg-rose-950 text-rose-300 border border-rose-500/40' 
              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
          }`}>
            {station.risk_priority.category}
          </span>
          <div className="text-[9px] font-mono text-stone-400 mt-1">{station.risk_priority.confidence} Confidence</div>
        </div>
      </div>

      {/* Groundwater Metrics */}
      {station.groundwater && (
        <div className="p-3.5 rounded-2xl bg-[#082216] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Droplets className="w-4 h-4 text-emerald-400" />
              <span>Groundwater Hydrograph</span>
            </div>
            <DataBadge provenance={station.groundwater.provenance || 'VERIFIED_PUBLIC'} />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-black/30">
              <span className="text-[10px] text-stone-400 block font-mono">Depth-to-Water</span>
              <span className="text-sm font-bold text-white font-sans tabular-nums">
                {station.groundwater.current_depth_mbgl} mbgl
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/30">
              <span className="text-[10px] text-stone-400 block font-mono">Secular Trend</span>
              <span className="text-sm font-bold text-amber-400 font-sans tabular-nums">
                {station.groundwater.trend_rate_m_yr > 0 ? `+${station.groundwater.trend_rate_m_yr}` : station.groundwater.trend_rate_m_yr} m/yr
              </span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-stone-400">
            Source: {station.groundwater.source} ({station.groundwater.observation_date})
          </div>
        </div>
      )}

      {/* Water Quality Profile */}
      {station.water_quality && (
        <div className="p-3.5 rounded-2xl bg-[#082216] border border-white/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Chemical & Heavy Metals</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              station.water_quality.compliance_status === 'Compliant'
                ? 'bg-emerald-950 text-emerald-300'
                : 'bg-rose-950 text-rose-300'
            }`}>
              {station.water_quality.compliance_status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-black/30">
              <span className="text-[10px] text-stone-400 block font-mono">TDS</span>
              <span className="text-xs font-bold text-white tabular-nums">{station.water_quality.tds_mg_l} mg/L</span>
            </div>
            <div className="p-2 rounded-xl bg-black/30">
              <span className="text-[10px] text-stone-400 block font-mono">Total Cr</span>
              <span className={`text-xs font-bold tabular-nums ${
                station.water_quality.total_chromium_mg_l > 0.05 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {station.water_quality.total_chromium_mg_l} mg/L
              </span>
            </div>
            <div className="p-2 rounded-xl bg-black/30">
              <span className="text-[10px] text-stone-400 block font-mono">pH</span>
              <span className="text-xs font-bold text-white tabular-nums">{station.water_quality.ph}</span>
            </div>
          </div>
          <div className="text-[9px] font-mono text-stone-400">
            Source: {station.water_quality.source}
          </div>
        </div>
      )}

      {/* Active Anomalies if any */}
      {station.active_alerts && station.active_alerts.length > 0 && (
        <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Active Outlier Alert ({station.active_alerts.length})</span>
          </div>
          {station.active_alerts.map((al, idx) => (
            <div key={idx} className="text-xs text-stone-300 space-y-1">
              <div className="font-semibold text-rose-200">{al.parameter} (Z={al.z_score})</div>
              <div className="text-[10px] text-stone-400">{al.trigger_reason}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recharge Suitability */}
      {station.recharge_suitability && (
        <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs space-y-1">
          <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
            MAR Artificial Recharge Suitability: {station.recharge_suitability.score}/100
          </div>
          <div className="text-stone-300 text-[11px]">
            {station.recharge_suitability.recommended_structure} ({station.recharge_suitability.soil})
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex items-center gap-2">
        {onNavigateToAnalysis && (
          <button
            onClick={() => onNavigateToAnalysis(station.station_id)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <span>{lang === 'ta' ? 'ஆய்வு பணிப்பாய்வு இயக்கு' : 'Run Drawdown Analysis'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
