import React, { ReactNode } from 'react';
import { DataBadge } from './DataBadge';
import { ProvenanceType } from '../../types';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  comparison?: string;
  comparisonType?: 'positive' | 'negative' | 'neutral';
  provenance?: ProvenanceType;
  icon?: ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  comparison,
  comparisonType = 'neutral',
  provenance = 'VERIFIED_PUBLIC',
  icon
}) => {
  const getComparisonColor = () => {
    if (comparisonType === 'positive') return 'text-emerald-400';
    if (comparisonType === 'negative') return 'text-amber-400';
    return 'text-stone-400';
  };

  return (
    <div className="bg-[#0f241a] border border-white/[0.08] hover:border-emerald-500/30 transition-colors duration-200 rounded-xl p-5 shadow-forest-sm flex flex-col justify-between">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-stone-300 font-medium tracking-wide">{label}</span>
        {icon && <div className="text-emerald-400/80 p-1.5 bg-emerald-950/60 rounded-lg border border-emerald-500/20">{icon}</div>}
      </div>

      <div className="mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-sans text-ivory tracking-tight tabular-nums">{value}</span>
          {unit && <span className="text-xs text-stone-400 font-mono">{unit}</span>}
        </div>
        {comparison && (
          <p className={`text-xs mt-1 font-mono ${getComparisonColor()}`}>
            {comparison}
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-white/[0.04]">
        <DataBadge provenance={provenance} />
      </div>
    </div>
  );
};
