import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Compass, Droplets, CloudRain, FlaskConical, 
  AlertTriangle, Target, ShieldCheck, Users, ClipboardList, 
  Layers, Bot, FileText, Settings, ArrowLeft, Landmark
} from 'lucide-react';

interface AppSidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  onBackToLanding: () => void;
  onOpenPresentation?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ 
  currentModule, 
  onSelectModule, 
  onBackToLanding,
}) => {
  const { t, lang } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('overview'), icon: <Home className="w-4 h-4 shrink-0" /> },
    { id: 'digital_twin', label: t('digital_twin'), icon: <Compass className="w-4 h-4 shrink-0" /> },
    { id: 'groundwater', label: t('groundwater'), icon: <Droplets className="w-4 h-4 shrink-0" /> },
    { id: 'rainfall', label: t('rainfall'), icon: <CloudRain className="w-4 h-4 shrink-0" /> },
    { id: 'water_quality', label: t('water_quality'), icon: <FlaskConical className="w-4 h-4 shrink-0" /> },
    { id: 'anomalies', label: t('anomalies'), icon: <AlertTriangle className="w-4 h-4 shrink-0" /> },
    { id: 'risk_priority', label: t('risk_priority'), icon: <Target className="w-4 h-4 shrink-0" /> },
    { id: 'confidence', label: t('confidence'), icon: <ShieldCheck className="w-4 h-4 shrink-0" /> },
    { id: 'community', label: t('community'), icon: <Users className="w-4 h-4 shrink-0" /> },
    { id: 'investigations', label: t('investigations'), icon: <ClipboardList className="w-4 h-4 shrink-0" /> },
    { id: 'recharge', label: t('recharge'), icon: <Layers className="w-4 h-4 shrink-0" /> },
    { id: 'assistant', label: t('assistant'), icon: <Bot className="w-4 h-4 shrink-0" /> },
    { id: 'analytics', label: t('analytics'), icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: 'admin_audit', label: t('admin_audit'), icon: <Settings className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <aside className="w-60 md:w-64 bg-[#051811] border-r border-white/[0.08] flex flex-col h-full select-none shrink-0 transition-all duration-300">
      {/* Navigation Modules List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 scrollbar-thin scrollbar-thumb-emerald-900/40">
        {menuItems.map((item) => {
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group text-left ${
                isActive
                  ? 'bg-[#10b981] text-[#041a11] font-semibold shadow-lg shadow-emerald-950/40'
                  : 'text-stone-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className={`${isActive ? 'text-[#041a11]' : 'text-stone-400 group-hover:text-emerald-400'} transition-colors`}>
                {item.icon}
              </span>
              <span className="truncate tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Scenic Banner (Temple & River) matching reference image */}
      <div className="p-3 border-t border-white/[0.06] bg-[#03110b]">
        <div className="relative rounded-xl overflow-hidden p-3 border border-emerald-500/20 bg-gradient-to-t from-[#021008] via-[#052216] to-[#041a11] shadow-inner text-center">
          <div className="flex justify-center mb-1.5 opacity-80">
            <div className="relative w-full h-12 flex items-center justify-center">
              {/* Temple Gopuram Silhouette & River Waves SVG */}
              <svg viewBox="0 0 160 50" className="w-full h-full text-emerald-400/50" fill="none">
                {/* Temple Gopuram */}
                <path d="M80 5 L85 14 L75 14 Z" fill="currentColor" opacity="0.8" />
                <path d="M74 14 L86 14 L88 24 L72 24 Z" fill="currentColor" opacity="0.7" />
                <path d="M70 24 L90 24 L93 35 L67 35 Z" fill="currentColor" opacity="0.6" />
                <rect x="76" y="27" width="8" height="8" rx="1" fill="#03110b" />
                {/* River waves */}
                <path d="M10 40 Q45 35 80 40 T150 40" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
                <path d="M5 45 Q40 41 80 45 T155 45" stroke="#34d399" strokeWidth="1" opacity="0.8" />
              </svg>
            </div>
          </div>
          <div className="text-[12px] font-bold text-emerald-200 tracking-tight leading-snug">
            {t('sidebar_banner_title')}
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5 font-medium">
            {t('sidebar_banner_subtitle')}
          </div>
        </div>
      </div>
    </aside>
  );
};
