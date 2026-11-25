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
import { BasinMap } from '../maps/BasinMap';
import { FlipCard, Reveal } from '../motion/motion';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { GroundwaterPoint, LocationData } from '../../types';
import { Waves, Info, ArrowDownRight, RefreshCw, AlertCircle, Compass } from 'lucide-react';

interface GroundwaterModuleProps {
  initialLocationId?: number;
}

export const GroundwaterModule: React.FC<GroundwaterModuleProps> = ({ initialLocationId = 1 }) => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(initialLocationId);
  const [series, setSeries] = useState<GroundwaterPoint[]>([]);
  const [seasonFilter, setSeasonFilter] = useState<'all' | 'pre' | 'post'>('all');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialLocationId) setSelectedStationId(initialLocationId);
  }, [initialLocationId]);

  const loadStationAndSeries = async (locId: number) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [locs, gw] = await Promise.all([
        locations.length ? Promise.resolve(locations) : apiService.getLocations(),
        apiService.getGroundwaterRecords(locId),
      ]);
      setLocations(locs);
      setSeries(gw);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load CGWB groundwater series.', 'நிலத்தடி நீர் தரவை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStationAndSeries(selectedStationId);
  }, [selectedStationId]);

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedStationId) || locations[0] || null,
    [locations, selectedStationId]
  );

  const filteredSeries = useMemo(() => {
    if (seasonFilter === 'all') return series;
    return series.filter((pt) => {
      const q = pt.period.toUpperCase();
      return seasonFilter === 'pre' ? q.includes('Q1') || q.includes('Q2') : q.includes('Q3') || q.includes('Q4');
    });
  }, [series, seasonFilter]);

  const latestDepth = series.length ? series[series.length - 1].depth_mbgl : null;
  const earliestDepth = series.length ? series[0].depth_mbgl : null;
  const netShift =
    latestDepth !== null && earliestDepth !== null ? Number((latestDepth - earliestDepth).toFixed(2)) : null;

  return (
    <div className="space-y-6">
      {/* Teal & Turquoise Scientific Analytical Laboratory Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#071f24] via-[#09292d] to-[#0a2124] border border-teal-500/25 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-teal-300">
              <Waves className="w-3.5 h-3.5" />
              {L('HYDROGEOLOGICAL INTELLIGENCE', 'நீர்நிலையியல் ஆய்வகம்')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#fcfbf7] tracking-tight">
            {L('Groundwater Quantity & Trend Laboratory', 'நிலத்தடி நீர் அளவு & போக்கு ஆய்வகம்')}
          </h2>
          <p className="text-xs text-slate-300">
            {L(
              'Live CGWB observation well depth (mbgl) comparison across seasonal drawdown and post-monsoon recharge cycles.',
              'CGWB கண்காணிப்புக் கிணறுகளின் கோடைக்கால இறக்கம் மற்றும் பருவமழை மீட்சி ஒப்பீட்டுப் பகுப்பாய்வு.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-[#041417] border border-teal-500/25 p-1 text-xs font-mono">
            {(['all', 'pre', 'post'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSeasonFilter(f)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  seasonFilter === f ? 'bg-teal-500 text-[#03191b] font-semibold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {f === 'all'
                  ? L('All Quarters', 'அனைத்து காலாண்டுகள்')
                  : f === 'pre'
                  ? L('Dry Q1–Q2', 'வறண்ட காலம்')
                  : L('Monsoon Q3–Q4', 'பருவமழைக் காலம்')}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadStationAndSeries(selectedStationId)}
            className="px-3 py-1.5 rounded-xl bg-teal-950/80 border border-teal-500/35 text-xs text-teal-200 inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{L('Reload', 'புதுப்பி')}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {errorMsg}
          </span>
          <button
            type="button"
            onClick={() => loadStationAndSeries(selectedStationId)}
            className="px-3 py-1 rounded bg-rose-600 text-white font-semibold"
          >
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {/* Split Layout: Left Station Selector Rail + Right Hydrograph Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Station Rail */}
        <div className="lg:col-span-3 rounded-2xl bg-[#07181c]/95 border border-teal-500/20 p-3.5 space-y-2.5">
          <div className="text-[11px] font-mono uppercase tracking-wider text-teal-300 px-1">
            {L('Observation Wells', 'கண்காணிப்புக் கிணறுகள்')}
          </div>
          <div className="space-y-1.5">
            {locations.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onClick={() => setSelectedStationId(loc.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl border transition-colors ${
                  selectedStationId === loc.id
                    ? 'bg-teal-950/90 border-teal-400/60 text-white'
                    : 'bg-[#041013] border-white/[0.06] text-slate-300 hover:border-teal-500/30'
                }`}
              >
                <div className="text-xs font-semibold truncate">{loc.name}</div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between mt-0.5">
                  <span>{loc.district}</span>
                  <span className="font-mono text-teal-300 tabular-nums">{loc.risk_score}/100</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Analytical Hydrograph & Flip Summary */}
        <div className="lg:col-span-9 space-y-5">
          <Reveal kind="rise">
            <div className="rounded-2xl bg-[#07181c]/95 border border-teal-500/20 p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#fcfbf7]">
                    {selectedLocation
                      ? `${selectedLocation.name} · ${L('Depth to Water Table (mbgl)', 'நீர்மட்ட ஆழம் (mbgl)')}`
                      : L('Loading station…', 'நிலையம் ஏற்றப்படுகிறது…')}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {L(
                      'Inverted depth axis: lower curves reflect deeper aquifer drawdown.',
                      'தலைகீழ் அச்சு: கீழ்நோக்கிய கோடு ஆழமான நீர்மட்ட இறக்கத்தைக் காட்டுகிறது.'
                    )}
                  </p>
                </div>
                <span className="text-xs font-mono text-teal-300 tabular-nums">
                  {filteredSeries.length} {L('observations', 'அளவீடுகள்')}
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredSeries} margin={{ top: 10, right: 12, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tealDepthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#11363c" vertical={false} />
                    <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} reversed domain={['auto', 'auto']} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#041417', borderColor: 'rgba(20,184,166,0.4)', borderRadius: '10px' }}
                      labelStyle={{ color: '#fcfbf7', fontWeight: 700 }}
                      formatter={(val: any) => [`${val} mbgl`, L('Depth', 'ஆழம்')]}
                    />
                    <Area
                      type="monotone"
                      dataKey="depth_mbgl"
                      stroke="#2dd4bf"
                      strokeWidth={2.5}
                      fill="url(#tealDepthGrad)"
                      dot={{ fill: '#041417', stroke: '#2dd4bf', strokeWidth: 2, r: 3.5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#07181c]/95 border border-teal-500/20 p-4 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">
                {L('Latest Observed Depth', 'சமீபத்திய ஆழம்')}
              </div>
              <div className="text-2xl font-bold font-mono text-teal-300 tabular-nums">
                {latestDepth !== null ? `${latestDepth} mbgl` : '—'}
              </div>
              <div className="text-[11px] text-slate-400">
                {selectedLocation?.basin_zone || 'Palar Aquifer'}
              </div>
            </div>

            <div className="rounded-2xl bg-[#07181c]/95 border border-teal-500/20 p-4 space-y-1">
              <div className="text-[11px] font-mono text-slate-400">
                {L('Period Net Shift', 'கால அளவு மாற்றம்')}
              </div>
              <div className="text-2xl font-bold font-mono text-amber-300 tabular-nums inline-flex items-center gap-1">
                <ArrowDownRight className="w-5 h-5" />
                {netShift !== null ? `${netShift > 0 ? '+' : ''}${netShift} m` : '—'}
              </div>
              <div className="text-[11px] text-slate-400">
                {L('Positive = deeper water table', 'நேர் மதிப்பு = ஆழம் அதிகரிப்பு')}
              </div>
            </div>

            <FlipCard
              className="h-32"
              label={L('Aquifer formation details — flip card', 'நிலத்தடி நீரடுக்கு விவரங்கள் — திருப்பு அட்டை')}
              frontClassName="border-teal-500/25 bg-[#07181c]"
              backClassName="border-teal-400/50 bg-[#0b2a30]"
              front={
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between text-[11px] font-mono text-teal-300">
                    <span>{L('AQUIFER METADATA', 'நீரடுக்கு விவரம்')}</span>
                    <Info className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-xs font-semibold text-[#fcfbf7]">
                    {L('Alluvium over Fractured Gneiss', 'வண்டல் & பிளவுபட்ட நைஸ் பாறை')}
                  </div>
                  <div className="text-[10px] font-mono text-[#d9c27a]">
                    {L('Tap / hover for source note →', 'விவரங்களுக்கு அழுத்தவும் →')}
                  </div>
                </div>
              }
              back={
                <div className="h-full flex flex-col justify-between text-xs text-slate-100">
                  <div className="text-[10px] font-mono text-teal-300 uppercase">
                    {L('Confidence & Source', 'நம்பகத்தன்மை & மூலம்')}
                  </div>
                  <p className="text-[11px] leading-snug">
                    {L(
                      'CGWB Palar observation wells; Q2 marks summer irrigation stress, Q4 captures NE monsoon recharge.',
                      'CGWB கிணறுகள்: Q2 கோடைகால இறக்கத்தையும் Q4 வடகிழக்கு பருவமழை மீட்சியையும் காட்டுகிறது.'
                    )}
                  </p>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Geospatial Distribution */}
      <div className="rounded-2xl bg-[#07181c]/95 border border-teal-500/20 p-4 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-[#fcfbf7] flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400" />
            <span>{L('Observation Well Locations', 'கண்காணிப்புக் கிணறு இடங்கள்')}</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {L('Select any station marker to switch hydrograph', 'நீர் வரைபடத்தை மாற்ற நிலையத்தைத் தேர்ந்தெடுக்கவும்')}
          </span>
        </div>
        <BasinMap
          onSelectStation={(id) => setSelectedStationId(id)}
          initialStationId={selectedStationId}
          heightClass="h-[340px]"
          showLayerControls={false}
        />
      </div>
    </div>
  );
};
