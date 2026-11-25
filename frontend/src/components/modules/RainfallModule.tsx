import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Reveal } from '../motion/motion';
import { CloudRain, Info, RefreshCw, AlertCircle } from 'lucide-react';

interface RainfallPoint {
  month: string;
  rainfall_mm: number;
  normal_mm: number;
}

export const RainfallModule: React.FC = () => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [series, setSeries] = useState<RainfallPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadRainfall = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getRainfall();
      setSeries(data);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load IMD rainfall observations.', 'மழைப்பொழிவுத் தரவை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRainfall();
  }, []);

  const totalObserved = Math.round(series.reduce((acc, r) => acc + (r.rainfall_mm || 0), 0));
  const totalNormal = Math.round(series.reduce((acc, r) => acc + (r.normal_mm || 0), 0));
  const departurePct =
    totalNormal > 0 ? Number((((totalObserved - totalNormal) / totalNormal) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-6">
      {/* Deep Hydrological Cyan & Aqua Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#071822] via-[#092231] to-[#081a24] border border-cyan-500/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-cyan-300">
              <CloudRain className="w-3.5 h-3.5" />
              {L('HYDROLOGICAL CATCHMENT PRECIPITATION', 'நீரியல் நுண்ணறிவு · மழைப்பொழிவு')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#fcfbf7] tracking-tight">
            {L('Rainfall & Monsoon Recharge Analysis', 'மழைப்பொழிவு & நீர் செறிவூட்டல் பகுப்பாய்வு')}
          </h2>
          <p className="text-xs text-slate-300">
            {L(
              'Monthly catchment precipitation vs IMD normal baselines across the Palar River Basin (17,810 km²).',
              'பாலாறு வடிநிலத்தில் மாதாந்திர மழைப்பொழிவு மற்றும் IMD இயல்புநிலை ஒப்பீடு (17,810 ச.கி.மீ).'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-cyan-950/90 border border-cyan-500/35 text-cyan-200 rounded-xl text-xs font-mono tabular-nums">
            {L('Annual Sum:', 'ஆண்டு மொத்தம்:')} {totalObserved || '—'} mm ({departurePct >= 0 ? '+' : ''}{departurePct}%)
          </span>
          <button
            type="button"
            onClick={loadRainfall}
            aria-label={L('Reload rainfall series', 'மழைத் தரவைப் புதுப்பி')}
            className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/35 text-cyan-200 hover:bg-cyan-900/60"
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
          <button type="button" onClick={loadRainfall} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {/* Dual Analytical Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Reveal kind="left" className="lg:col-span-8">
          <div className="p-5 bg-[#071620]/95 border border-cyan-500/20 rounded-2xl space-y-4 h-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-[#fcfbf7]">
                {L('Monthly Precipitation (mm) vs Long-Term Normal', 'மாதாந்திர மழைப்பொழிவு (மி.மீ) எதிர் நீண்டகால இயல்பு')}
              </h3>
              <span className="text-xs font-mono text-cyan-300">
                {L('IMD NWIC Station Feed', 'IMD NWIC நிலையத் தரவு')}
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#103247" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#05121b', borderColor: 'rgba(6,182,212,0.45)', borderRadius: '10px' }}
                    labelStyle={{ color: '#fcfbf7', fontWeight: 700 }}
                    formatter={(val: any, name: any) => [
                      `${val} mm`,
                      name === 'rainfall_mm' ? L('Observed Rainfall', 'பதிவான மழை') : L('Normal Baseline', 'இயல்புநிலை'),
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}
                    formatter={(value) =>
                      value === 'rainfall_mm' ? L('Observed Rainfall', 'பதிவான மழை') : L('30-Yr Normal Baseline', '30-ஆண்டு இயல்பு')
                    }
                  />
                  <Bar dataKey="rainfall_mm" fill="#06b6d4" radius={[4, 4, 0, 0]} name="rainfall_mm" />
                  <Bar dataKey="normal_mm" fill="#1e4960" radius={[4, 4, 0, 0]} name="normal_mm" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-[#041018] rounded-xl border border-cyan-500/15 text-[11px] text-slate-300 leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>{L('Recharge Window Insight: ', 'நீர் செறிவூட்டல் குறிப்பு: ')}</strong>
                {L(
                  'Over half of annual Palar aquifer recharge concentrates during Oct–Dec Northeast Monsoon storms; tank chains and check dams rely on pre-October desiltation.',
                  'பாலாறு நிலத்தடி நீர் மீளுருவாக்கத்தின் பெரும்பகுதி அக்–டிச வடகிழக்குப் பருவமழையில் நிகழ்கிறது; ஏரிகள் மற்றும் தடுப்பணைகள் அக்டோபருக்கு முன் தூர்வாரப்பட வேண்டும்.'
                )}
              </span>
            </div>
          </div>
        </Reveal>

        <Reveal kind="right" className="lg:col-span-4">
          <div className="p-5 bg-[#071620]/95 border border-cyan-500/20 rounded-2xl space-y-4 h-full">
            <div className="border-b border-cyan-500/15 pb-3">
              <div className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
                {L('Catchment Hydrology', 'நீர்ப்பிடிப்புப் பங்கீடு')}
              </div>
              <h3 className="text-base font-bold text-[#fcfbf7] mt-0.5">
                {L('Seasonal Distribution', 'பருவகால மழைப் பகிர்வு')}
              </h3>
              <p className="text-xs text-slate-400">
                {L('Palar Hydrological Year', 'பாலாறு நீரியல் ஆண்டு')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#041018] border border-cyan-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{L('Northeast Monsoon (Oct–Dec)', 'வடகிழக்கு பருவமழை (அக்–டிச)')}</span>
                  <span className="text-cyan-300 font-mono tabular-nums">55%</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {L(
                    'Primary pulse filling traditional eris, anicuts, and coarse sand beds.',
                    'பாரம்பரிய ஏரிகள், தடுப்பணைகள் மற்றும் மணல் படுகைகளை நிரப்பும் முதன்மைக் காலம்.'
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#041018] border border-teal-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{L('Southwest Monsoon (Jun–Sep)', 'தென்மேற்கு பருவமழை (ஜூன்–செப்)')}</span>
                  <span className="text-teal-300 font-mono tabular-nums">32%</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {L(
                    'Supports upper catchment moisture and moderates kharif pumping.',
                    'மேல் வடிநில ஈரப்பதத்தைத் தக்கவைத்து கோடை அழுத்தத்தைக் குறைக்கிறது.'
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#041018] border border-amber-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{L('Dry Pre-Monsoon (Jan–May)', 'வறண்ட காலம் (ஜன–மே)')}</span>
                  <span className="text-amber-300 font-mono tabular-nums">13%</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {L(
                    'High evapotranspiration and agricultural extraction drive Q2 drawdown.',
                    'அதிக ஆவியாதல் மற்றும் பாசனப் பயன்பாட்டால் நீர்மட்டம் இறங்கும் காலம்.'
                  )}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
};
