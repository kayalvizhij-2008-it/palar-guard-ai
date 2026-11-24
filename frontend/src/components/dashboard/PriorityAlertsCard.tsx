import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AlertTriangle, ChevronRight, Clock } from 'lucide-react';

interface PriorityAlertsCardProps {
  onSelectAlert?: (alertId: string) => void;
  onViewAll?: () => void;
}

export const PriorityAlertsCard: React.FC<PriorityAlertsCardProps> = ({
  onSelectAlert,
  onViewAll
}) => {
  const { t } = useLanguage();

  const alerts = [
    {
      id: 'alert-1',
      title: t('alert_1_title'),
      time: t('alert_1_time'),
      severity: 'critical',
      iconColor: 'text-red-500',
      bgColor: 'hover:bg-red-950/30 border-red-500/20'
    },
    {
      id: 'alert-2',
      title: t('alert_2_title'),
      time: t('alert_2_time'),
      severity: 'high',
      iconColor: 'text-amber-500',
      bgColor: 'hover:bg-amber-950/30 border-amber-500/20'
    },
    {
      id: 'alert-3',
      title: t('alert_3_title'),
      time: t('alert_3_time'),
      severity: 'moderate',
      iconColor: 'text-amber-500',
      bgColor: 'hover:bg-amber-950/20 border-white/[0.06]'
    }
  ];

  return (
    <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4.5 shadow-xl flex flex-col justify-between">
      {/* Header matching reference blueprint */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 fill-red-500/20" />
          <h3 className="text-sm font-bold text-white tracking-wide">
            {t('priority_alerts_title')}
          </h3>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs text-stone-300 hover:text-emerald-300 transition-colors flex items-center gap-1 font-medium group"
        >
          <span>{t('view_all_alerts')}</span>
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-2.5">
        {alerts.map((al) => (
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

            <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-stone-400 font-mono">
              <Clock className="w-3 h-3 text-stone-500" />
              <span>{al.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
