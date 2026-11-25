import React, { useEffect, useState } from 'react';
import { DataBadge } from '../common/DataBadge';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { FlipCard, Reveal } from '../motion/motion';
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const DataConfidenceModule: React.FC = () => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [summary, setSummary] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSummary = async () => {
    setErrorMsg(null);
    try {
      const res = await apiService.getAnalyticsSummary();
      setSummary(res);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load confidence metrics.', 'நம்பகத்தன்மை தரவை ஏற்ற முடியவில்லை.'));
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const provenanceCategories = [
    {
      type: 'VERIFIED_PUBLIC' as const,
      title: L('Verified Public Observations', 'சரிபார்க்கப்பட்ட பொதுப் பதிவுகள்'),
      count: summary ? `${summary.groundwater_observations_count} GW` : '—',
      source: L('CGWB Hydrographs & IMD Rain Gauges', 'CGWB & IMD மழை அளவீடுகள்'),
      desc: L(
        'Physical ground observations measured by government telemetry networks.',
        'அரசு கண்காணிப்பு நிலையங்களில் நேரடியாக அளவிடப்பட்ட நிலத்தடி நீர் & மழைத் தரவு.'
      ),
    },
    {
      type: 'HISTORICAL_REPORT' as const,
      title: L('Historical Literature Records', 'வரலாற்று ஆய்வறிக்கை பதிவுகள்'),
      count: summary ? `${summary.water_quality_observations_count} WQ` : '—',
      source: L('CPCB & TNPCB Baseline Assays', 'CPCB & TNPCB அடிப்படை ஆய்வுகள்'),
      desc: L(
        'Published hydrochemical surveys and baseline basin cross-sections.',
        'அங்கீகரிக்கப்பட்ட நீர் வேதியியல் மற்றும் வடிநில ஆய்வுப் பதிவுகள்.'
      ),
    },
    {
      type: 'MODEL_PREDICTION' as const,
      title: L('Model Estimates & Anomalies', 'கணிப்பு & புள்ளிவிவர மாறுபாடுகள்'),
      count: summary ? `${summary.active_anomalies} ${L('Open', 'திறந்தவை')}` : '—',
      source: L('Seasonal Projections & Robust Z-Score Engine', 'பருவகால கணிப்பு & Z-மதிப்பு இயந்திரம்'),
      desc: L(
        'Statistical estimates and outlier triggers displayed with explicit confidence limits.',
        'நம்பிக்கை வரம்புகளுடன் கூடிய புள்ளிவிவரக் கணிப்புகள்.'
      ),
    },
    {
      type: 'COMMUNITY_REPORT' as const,
      title: L('Citizen Incident Reports', 'மக்கள் புகார் பதிவுகள்'),
      count: summary ? `${summary.community_reports_count} ${L('Reports', 'புகார்கள்')}` : '—',
      source: L('Moderated Community Pipeline', 'மக்கள் அறிக்கை வழித்தடம்'),
      desc: L(
        'Geotagged resident submissions reviewed before field dispatch.',
        'கள ஆய்வுக்கு முன் சரிபார்க்கப்படும் பொதுமக்கள் புகார்கள்.'
      ),
    },
    {
      type: 'SYNTHETIC_DEMO' as const,
      title: L('Synthetic Demo Safeguard', 'மாதிரி தரவுப் பாதுகாப்பு'),
      count: L('0 mixed in baseline', '0 அடிப்படை தரவில்'),
      source: L('Isolated Demo Mode Only', 'தனிமைப்படுத்தப்பட்ட மாதிரி மட்டும்'),
      desc: L(
        'Demonstration scenarios are strictly separated and labeled; never disguised as live basin observations.',
        'மாதிரி தரவுகள் எப்போதும் தெளிவாகப் பிரித்து காட்டப்படும்.'
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-[#111715]/95 border border-stone-500/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {L('PROVENANCE GOVERNANCE · SLATE AUDIT', 'ஆதார நம்பகத்தன்மை தணிக்கை')}
            </span>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <h2 className="text-xl font-bold text-[#fcfbf7]">
            {L('Data Confidence & Reliability Engine', 'தரவு நம்பகத்தன்மை & தணிக்கை இயந்திரம்')}
          </h2>
          <p className="text-xs text-stone-300">
            {L(
              'Strict provenance separation across verified measurements, historical surveys, statistical forecasts, and citizen observations.',
              'உண்மை அளவீடுகள், வரலாற்று ஆய்வுகள், கணிப்புகள் மற்றும் மக்கள் புகார்களுக்கிடையேயான தெளிவான பிரிப்பு.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={loadSummary}
          className="px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-600/40 text-xs text-stone-200 inline-flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{L('Refresh Audit', 'புதுப்பி')}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {errorMsg}
          </span>
          <button type="button" onClick={loadSummary} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {provenanceCategories.map((cat, idx) => (
          <Reveal key={cat.type} kind="fall" delay={idx * 0.05}>
            <FlipCard
              className="h-44"
              label={`${cat.title} — ${L('flip for source details', 'மூல விவரங்களுக்குத் திருப்பவும்')}`}
              frontClassName="border-stone-500/25 bg-[#121816]"
              backClassName="border-[#d9c27a]/40 bg-[#171e1b]"
              front={
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <DataBadge provenance={cat.type} />
                    <span className="text-xs font-mono text-[#d9c27a] tabular-nums">{cat.count}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#fcfbf7]">{cat.title}</h3>
                  <div className="text-[11px] font-mono text-stone-400">
                    {L('Flip card for trace & source →', 'ஆதாரத்திற்கு அட்டையைத் திருப்பவும் →')}
                  </div>
                </div>
              }
              back={
                <div className="h-full flex flex-col justify-between">
                  <div className="text-[10px] font-mono uppercase text-emerald-300">{cat.title}</div>
                  <p className="text-xs text-stone-200 leading-relaxed">{cat.desc}</p>
                  <div className="text-[10px] font-mono text-stone-400 truncate">
                    {L('Source:', 'ஆதாரம்:')} {cat.source}
                  </div>
                </div>
              }
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
};
