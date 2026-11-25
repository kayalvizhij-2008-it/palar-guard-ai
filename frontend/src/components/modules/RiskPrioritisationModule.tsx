import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { LocationData, WaterQualityPoint } from '../../types';
import { Reveal } from '../motion/motion';
import { Target, Sliders, RefreshCw, AlertCircle } from 'lucide-react';

export const RiskPrioritisationModule: React.FC = () => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [waterQuality, setWaterQuality] = useState<WaterQualityPoint[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const [preset, setPreset] = useState<'standard' | 'drought' | 'pollution'>('standard');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [locs, wq] = await Promise.all([apiService.getLocations(), apiService.getWaterQuality()]);
      setLocations(locs);
      setWaterQuality(wq);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load MCDA priority ranking.', 'முன்னுரிமைத் தரவரிசையை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const weights =
    preset === 'drought'
      ? { gw: 50, wq: 20, rain: 15, rec: 10, conf: 5 }
      : preset === 'pollution'
      ? { gw: 20, wq: 55, rain: 10, rec: 10, conf: 5 }
      : { gw: 30, wq: 35, rain: 15, rec: 10, conf: 10 };

  const ranked = useMemo(() => {
    return locations
      .map((loc) => {
        const wq = waterQuality.find((w) => w.location_id === loc.id);
        const wqScore = wq
          ? Math.min(100, Math.round((wq.tds_mg_l / 2000) * 50 + (wq.chromium_mg_l / 0.1) * 50))
          : Math.round(loc.risk_score * 0.8);
        const gwScore = Math.min(100, Math.round(loc.risk_score * 0.95));
        const rainScore = 52;
        const recScore = 90;
        const confScore = loc.confidence_level === 'High' ? 88 : 68;
        const composite = Number(
          (
            (gwScore * weights.gw +
              wqScore * weights.wq +
              rainScore * weights.rain +
              recScore * weights.rec +
              confScore * weights.conf) /
            100
          ).toFixed(1)
        );
        return { loc, wqScore, gwScore, rainScore, recScore, confScore, composite };
      })
      .sort((a, b) => b.composite - a.composite);
  }, [locations, waterQuality, weights]);

  const activeEntry = ranked.find((r) => r.loc.id === selectedStationId) || ranked[0] || null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-[#171224] via-[#1c1528] to-[#1a1319] border border-violet-500/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-amber-300">
              <Target className="w-3.5 h-3.5" />
              {L('DECISION INTELLIGENCE · MCDA RANKING', 'முடிவெடுப்பு நுண்ணறிவு · தரவரிசை')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#fcfbf7] tracking-tight">
            {L('Geospatial Risk Prioritisation Engine', 'புவிசார் இடர் முன்னுரிமை இயந்திரம்')}
          </h2>
          <p className="text-xs text-slate-300">
            {L(
              'Inspectable weighted scoring ranking river reaches for field triage across drought and contamination policies.',
              'வறட்சி மற்றும் மாசுக் கொள்கைகளின் கீழ் கள ஆய்வுக்கான நதிப் பகுதிகளின் வெளிப்படையான தரவரிசை.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          className="px-3 py-1.5 rounded-xl bg-violet-950/80 border border-violet-500/35 text-xs text-violet-200 inline-flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{L('Recalculate', 'மறுகணக்கிடு')}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {errorMsg}
          </span>
          <button type="button" onClick={loadData} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {/* Ranked Leaderboard + Criterion Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Reveal kind="left" className="lg:col-span-5">
          <div className="rounded-2xl bg-[#13111c]/95 border border-violet-500/20 p-5 space-y-3 h-full">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-[#fcfbf7]">
                {L('Ranked Priority Leaderboard', 'முன்னுரிமைத் தரவரிசை')}
              </h3>
              <span className="text-[11px] font-mono text-amber-300">{ranked.length} {L('Reaches', 'பகுதிகள்')}</span>
            </div>
            <div className="space-y-2">
              {ranked.map((entry, idx) => (
                <button
                  key={entry.loc.id}
                  type="button"
                  onClick={() => setSelectedStationId(entry.loc.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between gap-3 ${
                    activeEntry?.loc.id === entry.loc.id
                      ? 'bg-violet-950/60 border-amber-400/50 text-white'
                      : 'bg-[#0b0a12] border-white/[0.06] text-slate-300 hover:border-violet-400/35'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-amber-300 tabular-nums">#{idx + 1}</span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">{entry.loc.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {entry.loc.district} · {entry.loc.confidence_level}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold tabular-nums ${
                      entry.composite >= 70
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/35'
                        : entry.composite >= 50
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-500/35'
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/35'
                    }`}
                  >
                    {entry.composite}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal kind="right" className="lg:col-span-7">
          <div className="rounded-2xl bg-[#13111c]/95 border border-amber-500/20 p-5 space-y-4 h-full">
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#0b0a12] rounded-xl border border-white/[0.08]">
              <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>{L('Weight Policy Preset:', 'எடை கொள்கை:')}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setPreset('standard')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    preset === 'standard' ? 'bg-violet-600 text-white font-semibold' : 'text-slate-300 bg-white/5 hover:text-white'
                  }`}
                >
                  {L('Balanced (30/35/15)', 'சமநிலை')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('drought')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    preset === 'drought' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-300 bg-white/5 hover:text-white'
                  }`}
                >
                  {L('Dry Season (50% GW)', 'வறட்சி கவனம்')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('pollution')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    preset === 'pollution' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-300 bg-white/5 hover:text-white'
                  }`}
                >
                  {L('Quality Focus (55% WQ)', 'தரம் கவனம்')}
                </button>
              </div>
            </div>

            {activeEntry && (
              <>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#fcfbf7]">{activeEntry.loc.name}</h3>
                    <p className="text-[11px] text-slate-400">
                      {activeEntry.loc.district} · {activeEntry.loc.basin_zone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">{L('MCDA Composite', 'மொத்த மதிப்பெண்')}</span>
                    <span className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
                      {activeEntry.composite} / 100
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { name: L('Groundwater Stress', 'நிலத்தடி நீர் அழுத்தம்'), weight: weights.gw, score: activeEntry.gwScore, bar: 'bg-teal-400' },
                    { name: L('Water Quality Exceedance', 'நீர் தர மாறுபாடு'), weight: weights.wq, score: activeEntry.wqScore, bar: 'bg-rose-400' },
                    { name: L('Rainfall & Recharge Deficit', 'மழை பற்றாக்குறை'), weight: weights.rain, score: activeEntry.rainScore, bar: 'bg-cyan-400' },
                    { name: L('Observation Recency', 'தரவு புதுமை'), weight: weights.rec, score: activeEntry.recScore, bar: 'bg-violet-400' },
                    { name: L('Data Confidence Rating', 'தரவு நம்பகத்தன்மை'), weight: weights.conf, score: activeEntry.confScore, bar: 'bg-amber-400' },
                  ].map((c) => (
                    <div key={c.name} className="p-3 bg-[#0b0a12] rounded-xl border border-white/[0.05] space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#fcfbf7]">{c.name}</span>
                        <span className="font-mono text-slate-300 tabular-nums">
                          {c.score}/100 ({L('Weight', 'எடை')} {c.weight}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${c.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
};
