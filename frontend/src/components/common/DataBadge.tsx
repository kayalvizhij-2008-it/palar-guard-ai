import React from 'react';
import { ProvenanceType } from '../../types';
import { ShieldCheck, BookOpen, Users, Cpu, AlertTriangle } from 'lucide-react';

interface DataBadgeProps {
  provenance: ProvenanceType;
  sourceText?: string;
  showIcon?: boolean;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ provenance, sourceText, showIcon = true }) => {
  const getBadgeConfig = () => {
    switch (provenance) {
      case 'VERIFIED_PUBLIC':
        return {
          label: 'VERIFIED PUBLIC',
          color: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30',
          icon: <ShieldCheck className="w-3 h-3 text-emerald-400 inline mr-1" />,
          desc: 'Direct observation from official government records (CGWB/WRIS/IMD)'
        };
      case 'HISTORICAL_REPORT':
        return {
          label: 'HISTORICAL REPORT',
          color: 'bg-teal-950/80 text-teal-300 border-teal-500/30',
          icon: <BookOpen className="w-3 h-3 text-teal-300 inline mr-1" />,
          desc: 'Extracted from published hydrogeological surveys & academic peer-reviewed records'
        };
      case 'COMMUNITY_REPORT':
        return {
          label: 'COMMUNITY REPORT',
          color: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
          icon: <Users className="w-3 h-3 text-amber-300 inline mr-1" />,
          desc: 'Citizen-reported observation undergoing moderation & field verification'
        };
      case 'MODEL_PREDICTION':
        return {
          label: 'MODEL PREDICTION',
          color: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30',
          icon: <Cpu className="w-3 h-3 text-cyan-300 inline mr-1" />,
          desc: 'Time-series projection or statistical anomaly score with confidence bounds'
        };
      case 'FIELD_VERIFIED':
        return {
          label: 'FIELD VERIFIED',
          color: 'bg-emerald-950/90 text-emerald-300 border-emerald-400/50',
          icon: <ShieldCheck className="w-3 h-3 text-emerald-400 inline mr-1" />,
          desc: 'Authenticated by on-site field investigation team with GPS & sample metadata'
        };
      case 'SYNTHETIC_DEMO':
      default:
        return {
          label: 'SYNTHETIC DEMO',
          color: 'bg-stone-900/90 text-stone-300 border-stone-600/40',
          icon: <AlertTriangle className="w-3 h-3 text-amber-400 inline mr-1" />,
          desc: 'SYNTHETIC DEMONSTRATION DATA — NOT A REAL ENVIRONMENTAL MEASUREMENT'
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span 
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono tracking-wide border ${config.color}`}
      title={sourceText || config.desc}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};
