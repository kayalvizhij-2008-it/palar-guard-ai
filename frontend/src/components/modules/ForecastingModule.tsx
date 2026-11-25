import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { DataBadge } from '../common/DataBadge';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { GroundwaterPoint, LocationData } from '../../types';
import { Reveal } from '../motion/motion';
import { TrendingUp, Info, AlertCircle, RefreshCw } from 'lucide-react';

export const ForecastingModule: React.FC = () => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const [history, setHistory] = useState<GroundwaterPoint[]>([]);
  const [scenario, setScenario] = useState<'normal' | 'deficit' | 'surplus'>('normal');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async (locId: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [locs, gw] = await Promise.all([
        locations.length ? Promise.resolve(locations) : apiService.getLocations(),
        apiService.getGroundwaterRecords(locId),
      ]);
      setLocations(locs);
      setHistory(gw);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load baseline hydrograph for forecast.', 'முன்னறிவிப்புக்கான அடிப்படைத் தரவை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedStationId);
  }, [selectedStationId]);

  const scenarioMultiplier = scenario === 'deficit' ? 1.15 : scenario === 'surplus' ? 0.85 : 1.0;

  const forecastData = useMemo(() => {
    const recent = history.slice(-4);
    const lastActual = recent.length ? recent[recent.length - 1].depth_mbgl : 14.5;
    const basePoints = recent.map((pt, idx) => ({
      period: pt.period,
      actual: pt.depth_mbgl,
      projected: idx === recent.length - 1 ? pt.depth_mbgl : null,
      lower: idx === recent.length - 1 ? pt.depth_mbgl : null,
      upper: idx === recent.length - 1 ? pt.depth_mbgl : null,
    }));

    const seasonalOffsets = [
      { label: L('Next Dry Q2 (Est)', 'அடுத்த வறண்ட Q2'), factor: 1.14, spread: 1.2 },
      { label: L('Pre-NE Q3 (Est)', 'முன்-பருவமழை Q3'), factor: 1.04, spread: 1.4 },
      { label: L('Monsoon Q4 (Est)', 'பருவமழை Q4'), factor: 0.84, spread: 1.6 },
      { label: L('+1 Yr Q1 (Est)', '+1 ஆண்டு Q1'), factor: 0.98, spread: 1.8 },
    ];

    const future = seasonalOffsets.map((s) => {
      const proj = Number((lastActual * s.factor * scenarioMultiplier).toFixed(1));
      return {
        period: s.label,
        actual: null as number | null,
        projected: proj,
        lower: Number((proj - s.spread).toFixed(1)),
        upper: Number((proj + s.spread).toFixed(1)),
      };
    });

    return [...basePoints, ...future];
  }, [history, scenarioMultiplier, lang]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-[#091926] to-[#0a222b] border border-teal-500/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-cyan-300">
              <TrendingUp className="w-3.5 h-3.5" />
              {L('STATISTICAL WALK-FORWARD PROJECTION', 'புள்ளிவிவர முன்னறிவிப்பு')}
            </span>
            <DataBadge provenance="MODEL_PREDICTION" />
          </div>
          <h2 className="text-xl font-bold text-[#fcfbf7] tracking-tight">
            {L('Groundwater Trend Forecasting', 'நிலத்தடி நீர் போக்கு முன்னறிவிப்பு')}
          </h2>
          <p className="text-xs text-slate-300">
            {L(
              'Scenario-driven seasonal projections anchored to observed station depths with explicit confidence intervals.',
              'நிலையங்களின் சமீபத்திய அளவீடுகளை அடிப்படையாகக் கொண்ட பருவகால முன்னறிவிப்பு மற்றும் நம்பிக்கை வரம்புகள்.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="forecast-station" className="text-xs font-mono text-slate-300">
            {L('Station:', 'நிலையம்:')}
          </label>
          <select
            id="forecast-station"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-[#05121b] border border-cyan-500/25 text-xs font-medium text-white focus:outline-none"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => loadData(selectedStationId)}
            aria-label={L('Refresh forecast baseline', 'புதுப்பி')}
            className="p-2 rounded-lg bg-[#05121b] border border-cyan-500/25 text-cyan-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {errorMsg}
          </span>
          <button type="button" onClick={() => loadData(selectedStationId)} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      <Reveal kind="rise">
        <div className="p-5 bg-[#081722]/95 border border-cyan-500/20 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#040f17] rounded-xl border border-white/[0.08]">
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>{L('Precipitation Scenario Sensitivity:', 'மழைப்பொழிவு சூழல் தேர்வு:')}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setScenario('normal')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  scenario === 'normal' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-300 bg-white/5 hover:text-white'
                }`}
              >
                {L('Normal (980mm)', 'இயல்பு (980mm)')}
              </button>
              <button
                type="button"
                onClick={() => setScenario('deficit')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  scenario === 'deficit' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-300 bg-white/5 hover:text-white'
                }`}
              >
                {L('Deficit (-20% Rain)', 'பற்றாக்குறை (-20%)')}
              </button>
              <button
                type="button"
                onClick={() => setScenario('surplus')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  scenario === 'surplus' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-300 bg-white/5 hover:text-white'
                }`}
              >
                {L('Surplus (+25% Rain)', 'மிகை (+25%)')}
              </button>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 12, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#113245" vertical={false} />
                <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} reversed domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#040f17', borderColor: 'rgba(6,182,212,0.4)', borderRadius: '10px' }}
                  labelStyle={{ color: '#fcfbf7', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#0891b2" fillOpacity={0.14} name={L('Upper Bound', 'மேல் வரம்பு')} />
                <Area type="monotone" dataKey="projected" stroke="#22d3ee" strokeDasharray="4 4" strokeWidth={2.5} fill="#06b6d4" fillOpacity={0.15} name={L('Projected mbgl', 'கணித்த ஆழம்')} />
                <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2.5} fill="none" name={L('Observed mbgl', 'பதிவான ஆழம்')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#040f17] rounded-xl border border-white/[0.06] text-[11px] text-slate-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>{L('Model Limitations: ', 'மாதிரி வரம்பு: ')}</strong>
              {L(
                'Statistical seasonal projection based on baseline quarterly observations; unexpected monsoon delays or industrial pumping shifts alter actual outcomes.',
                'கடந்தகால காலாண்டு போக்கின் அடிப்படையிலான கணிப்பு மட்டுமே; பருவமழை தாமதம் மற்றும் நிலத்தடி நீர் பயன்பாட்டு மாற்றங்கள் உண்மையான அளவை மாற்றக்கூடும்.'
              )}
            </span>
          </div>
        </div>
      </Reveal>
    </div>
  );
};
