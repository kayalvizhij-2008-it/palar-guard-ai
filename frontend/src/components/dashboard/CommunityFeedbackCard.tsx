import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { MessageSquarePlus, ArrowRight, Sprout, HeartHandshake } from 'lucide-react';

interface CommunityFeedbackCardProps {
  onOpenReportModal?: () => void;
}

export const CommunityFeedbackCard: React.FC<CommunityFeedbackCardProps> = ({
  onOpenReportModal
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-3.5 shadow-xl flex flex-col justify-between h-[210px] relative overflow-hidden group">
      
      {/* Header matching blueprint */}
      <div className="flex items-center justify-between z-10">
        <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
          <MessageSquarePlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('card_feedback_title')}</span>
        </h4>
      </div>

      {/* Main Content: Sapling in Soil Graphic + Description */}
      <div className="flex items-center gap-3 my-1 z-10">
        
        {/* Sapling Sprout Graphic matching screenshot */}
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-t from-[#02140b] via-[#052618] to-[#0a3824] border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-inner overflow-hidden group-hover:scale-105 transition-transform">
          <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none">
            {/* Soil mound */}
            <ellipse cx="24" cy="40" rx="16" ry="5" fill="#3f2e1c" opacity="0.9" />
            <ellipse cx="24" cy="39" rx="12" ry="3" fill="#2d2013" />
            {/* Green Stem */}
            <path d="M24 38 Q24 24 22 14" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
            {/* Left Leaf */}
            <path d="M22 24 C14 22 12 16 18 16 C22 16 23 20 23 24 Z" fill="#34d399" />
            {/* Right Leaf */}
            <path d="M23 18 C31 16 33 10 27 10 C23 10 22 14 22 18 Z" fill="#10b981" />
            {/* Top Sprout Tip */}
            <path d="M22 14 C21 8 25 6 25 10 Z" fill="#6ee7b7" />
          </svg>
        </div>

        {/* Descriptive Text */}
        <div className="min-w-0">
          <p className="text-[11px] text-stone-300 leading-snug line-clamp-3">
            {t('card_feedback_text')}
          </p>
        </div>

      </div>

      {/* Action Button: பதிவு செய் → */}
      <div className="z-10 pt-1">
        <button
          onClick={onOpenReportModal}
          className="w-full py-2 bg-[#10b981] hover:bg-[#059669] text-[#041a11] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 hover:scale-[1.01] transition-all"
        >
          <span>{t('card_feedback_btn')}</span>
        </button>
      </div>

    </div>
  );
};
