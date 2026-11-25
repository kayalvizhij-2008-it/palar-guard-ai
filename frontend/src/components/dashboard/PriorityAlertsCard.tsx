import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import { ANOMALIES_DATA } from '../../data/palarData';
import { AnomalyAlertItem } from '../../types';
import { AlertTriangle, Clock } from 'lucide-react';

interface PriorityAlertsCardProps {
  onSelectAlert?: (alertId: string) => void;
  onViewAll?: () => void;
}

export const PriorityAlertsCard: React.FC<PriorityAlertsCardProps> = ({
  onSelectAlert,
  onViewAll,
}) => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<AnomalyAlertItem[]>(ANOMALIES_DATA);

  useEffect(() => {
    let active = true;
    apiService
      .getAnomalies()
      .then((list) => {
        if (active && list.length > 0) setAlerts(list);
      })
      .catch(() => {
        // Fallback already populated from ANOMALIES_DATA
      });
    return () => {
      active = false;
    };
  }, []);

  const topAlerts = alerts.slice(0, 3).map((a) => {
    const sev = (a.severity || 'Medium').toLowerCase();
    const isCritical = sev === 'critical';
    return {
      id: `alert-${a.id}`,
      title: `${a.location_name}: ${a.parameter}`,
      time: `Z = ${a.z_score} · ${a.status}`,
      iconColor: isCritical ? 'text-rose-400' : 'text-amber-400',
      bgColor: isCritical
        ? 'hover:bg-rose-950/30 border-rose-500/20'
        : 'hover:bg-amber-950/30 border-amber-500/20',
    };
  });

  return (
    <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4.5 shadow-xl flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 fill-rose-500/20" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            {t('priority_alerts_title')}
          </h3>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs text-stone-300 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium group"
        >
          <span>{t('view_all_alerts')}</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {topAlerts.map((al) => (
          <div
            key={al.id}
            onClick={() => onSelectAlert?.(al.id)}
            className={`p-3 rounded-xl bg-[#03150d] border transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 group ${al.bgColor}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertTriangle className={`w-4 h-4 shrink-0 ${al.iconColor}`} />
              <p className="text-xs font-semibold text-stone-200 group-hover:text-white truncate">
                {al.title}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-stone-400 font-mono tabular-nums">
              <Clock className="w-3 h-3 text-stone-500" />
              <span>{al.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
