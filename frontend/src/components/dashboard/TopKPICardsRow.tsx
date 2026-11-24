import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Droplet, Waves, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface TopKPICardsRowProps {
  onRefreshData?: () => void;
  onSelectCard?: (cardId: string) => void;
}

export const TopKPICardsRow: React.FC<TopKPICardsRowProps> = ({
  onRefreshData,
  onSelectCard
}) => {
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('10:24 AM');

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsRefreshing(false);
      onRefreshData?.();
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 select-none">
      
      {/* 1. Rainfall KPI Card */}
      <div 
        onClick={() => onSelectCard?.('rainfall')}
        className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer shadow-lg flex items-center gap-3.5 group"
      >
        <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <Droplet className="w-6 h-6 text-cyan-400 fill-cyan-400/30" />
        </div>
        <div className="min-w-0">
          <span className="text-xs text-stone-300 font-medium block truncate">
            {t('kpi_rainfall_title')}
          </span>
          <div className="text-xl font-black text-white font-mono tracking-tight my-0.5">
            682 mm
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block truncate">
            {t('kpi_rainfall_sub')}
          </span>
        </div>
      </div>

      {/* 2. Groundwater KPI Card */}
      <div 
        onClick={() => onSelectCard?.('groundwater')}
        className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer shadow-lg flex items-center gap-3.5 group"
      >
        <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <Waves className="w-6 h-6 text-cyan-400" />
        </div>
        <div className="min-w-0">
          <span className="text-xs text-stone-300 font-medium block truncate">
            {t('kpi_groundwater_title')}
          </span>
          <div className="text-xl font-black text-white font-mono tracking-tight my-0.5">
            76%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block truncate">
            {t('kpi_groundwater_sub')}
          </span>
        </div>
      </div>

      {/* 3. Risk Level KPI Card (Alert Crimson styling from blueprint) */}
      <div 
        onClick={() => onSelectCard?.('risk_priority')}
        className="rounded-2xl bg-[#140b0d] border border-red-500/40 p-4 hover:border-red-400 transition-all duration-200 cursor-pointer shadow-lg shadow-red-950/30 flex items-center gap-3.5 group"
      >
        <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <AlertTriangle className="w-6 h-6 text-red-400 fill-red-400/20" />
        </div>
        <div className="min-w-0">
          <span className="text-xs text-stone-300 font-medium block truncate">
            {t('kpi_risk_title')}
          </span>
          <div className="text-xl font-black text-amber-300 tracking-tight my-0.5 truncate">
            {t('kpi_risk_val')}
          </div>
          <span className="text-[11px] text-amber-400/90 font-medium block truncate">
            {t('kpi_risk_sub')}
          </span>
        </div>
      </div>

      {/* 4. Overall Reliability KPI Card */}
      <div 
        onClick={() => onSelectCard?.('confidence')}
        className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer shadow-lg flex items-center gap-3.5 group"
      >
        <div className="w-12 h-12 rounded-xl bg-emerald-950/70 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="min-w-0">
          <span className="text-xs text-stone-300 font-medium block truncate">
            {t('kpi_reliability_title')}
          </span>
          <div className="text-xl font-black text-white font-mono tracking-tight my-0.5">
            95%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block truncate">
            {t('kpi_reliability_sub')}
          </span>
        </div>
      </div>

      {/* 5. Direct / Live Data KPI Card */}
      <div 
        onClick={() => onSelectCard?.('digital_twin')}
        className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer shadow-lg flex items-center justify-between gap-3 group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="absolute w-5 h-5 rounded-full bg-emerald-500/30 animate-ping"></span>
          </div>
          <div className="min-w-0">
            <span className="text-xs text-stone-300 font-medium block truncate">
              {t('kpi_live_data_title')}
            </span>
            <div className="text-xl font-black text-white font-mono tracking-tight my-0.5">
              {lastUpdated}
            </div>
            <span className="text-[10.5px] text-stone-400 block truncate">
              {t('kpi_live_data_sub')}
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className={`p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-stone-300 hover:text-white transition-all shrink-0 ${
            isRefreshing ? 'animate-spin text-emerald-400' : ''
          }`}
          title="Refresh live basin telemetry"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
