import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import { Droplet, Waves, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Reveal } from '../motion/motion';

interface TopKPICardsRowProps {
  onRefreshData?: () => void;
  onSelectCard?: (cardId: string) => void;
  refreshTrigger?: number;
}

export const TopKPICardsRow: React.FC<TopKPICardsRowProps> = ({
  onRefreshData,
  onSelectCard,
  refreshTrigger = 0,
}) => {
  const { t, lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [summary, setSummary] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadSummary = async () => {
    setErrorMsg(null);
    try {
      const data = await apiService.getAnalyticsSummary();
      setSummary(data);
      onRefreshData?.();
    } catch (err: any) {
      setErrorMsg(err?.message || L('Backend API unavailable', 'சேவையகம் இணைக்கப்படவில்லை'));
    }
  };

  useEffect(() => {
    loadSummary();
  }, [refreshTrigger]);

  if (errorMsg && !summary) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-950/50 p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-rose-200">
        <span>{errorMsg}</span>
        <button
          type="button"
          onClick={loadSummary}
          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-semibold"
        >
          {L('Retry Summary', 'மீண்டும் முயற்சி')}
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      <Reveal kind="fall" delay={0}>
        <button
          type="button"
          onClick={() => onSelectCard?.('digital_twin')}
          className="w-full h-full text-left rounded-2xl bg-[#071821]/90 border border-cyan-500/20 p-4 hover:border-cyan-400/50 transition-colors flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-500/35 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-300 block truncate">
              {L('Monitored Stations', 'கண்காணிப்பு நிலையங்கள்')}
            </span>
            <div className="text-xl font-semibold text-white font-mono tabular-nums">
              {summary ? summary.monitored_stations : '—'}
            </div>
            <span className="text-[11px] text-cyan-300 block truncate">{t('kpi_rainfall_sub')}</span>
          </div>
        </button>
      </Reveal>

      <Reveal kind="fall" delay={0.06}>
        <button
          type="button"
          onClick={() => onSelectCard?.('groundwater')}
          className="w-full h-full text-left rounded-2xl bg-[#071d1c]/90 border border-teal-500/20 p-4 hover:border-teal-400/50 transition-colors flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-teal-950/80 border border-teal-500/35 flex items-center justify-center shrink-0">
            <Waves className="w-5 h-5 text-teal-400" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-300 block truncate">{t('kpi_groundwater_title')}</span>
            <div className="text-xl font-semibold text-white font-mono tabular-nums">
              {summary ? `${summary.basin_average_gw_mbgl} mbgl` : '—'}
            </div>
            <span className="text-[11px] text-teal-300 block truncate">{t('kpi_groundwater_sub')}</span>
          </div>
        </button>
      </Reveal>

      <Reveal kind="fall" delay={0.12}>
        <button
          type="button"
          onClick={() => onSelectCard?.('risk_priority')}
          className="w-full h-full text-left rounded-2xl bg-[#191012]/90 border border-rose-500/30 p-4 hover:border-rose-400/60 transition-colors flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-300 block truncate">{t('kpi_risk_title')}</span>
            <div className="text-xl font-semibold text-amber-300 font-mono tabular-nums">
              {summary?.highest_risk_station ? `${summary.highest_risk_station.risk_score}/100` : '—'}
            </div>
            <span className="text-[11px] text-amber-300/90 block truncate">
              {summary?.highest_risk_station?.name || t('kpi_risk_sub')}
            </span>
          </div>
        </button>
      </Reveal>

      <Reveal kind="fall" delay={0.18}>
        <button
          type="button"
          onClick={() => onSelectCard?.('anomalies')}
          className="w-full h-full text-left rounded-2xl bg-[#141320]/90 border border-violet-500/25 p-4 hover:border-violet-400/50 transition-colors flex items-center gap-3.5"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-950/80 border border-violet-500/40 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-violet-300" />
          </div>
          <div className="min-w-0">
            <span className="text-xs text-slate-300 block truncate">
              {L('Open Anomalies', 'திறந்த எச்சரிக்கைகள்')}
            </span>
            <div className="text-xl font-semibold text-white font-mono tabular-nums">
              {summary ? summary.active_anomalies : '—'}
            </div>
            <span className="text-[11px] text-violet-300 block truncate">
              {summary
                ? `${summary.groundwater_observations_count} GW · ${summary.water_quality_observations_count} WQ`
                : t('kpi_reliability_sub')}
            </span>
          </div>
        </button>
      </Reveal>
    </div>
  );
};
