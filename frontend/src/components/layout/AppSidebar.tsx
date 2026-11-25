import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import {
  Home,
  Compass,
  Droplets,
  CloudRain,
  FlaskConical,
  AlertTriangle,
  Target,
  ShieldCheck,
  Users,
  ClipboardList,
  Layers,
  Bot,
  FileText,
  FileSearch,
  Bell,
  Settings,
  TrendingUp,
} from 'lucide-react';

interface AppSidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string, locationId?: number, overrideMode?: 'simple' | 'expert') => void;
  onBackToLanding: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentModule,
  onSelectModule,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { t, lang, mode, setMode } = useLanguage();
  const { role } = useAuth();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const communityMenuItems = [
    { id: 'dashboard', label: L('Water Near You', 'உங்கள் பகுதி நீர்'), icon: <Home className="w-4 h-4 shrink-0" /> },
    { id: 'community_report', label: L('Report Water Issue', 'புகார் பதிவு'), icon: <AlertTriangle className="w-4 h-4 shrink-0" /> },
    { id: 'community_understand', label: L('Understand Your Water', 'நீரைப் புரிந்துகொள்க'), icon: <Droplets className="w-4 h-4 shrink-0" /> },
    { id: 'community_my_reports', label: L('My Reports', 'என் புகார்கள்'), icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: 'community_alerts', label: L('Alerts', 'எச்சரிக்கைகள்'), icon: <Bell className="w-4 h-4 shrink-0" /> },
    { id: 'community_updates', label: L('Community Updates', 'மக்கள் செய்திகள்'), icon: <Users className="w-4 h-4 shrink-0" /> },
    { id: 'community_tips', label: L('Conservation Tips', 'நீர் சேமிப்பு'), icon: <Layers className="w-4 h-4 shrink-0" /> },
    { id: 'assistant', label: L('PALAR AI Helper', 'PALAR AI உதவியாளர்'), icon: <Bot className="w-4 h-4 shrink-0" /> },
  ];

  const professionalMenuItems = [
    { id: 'dashboard', label: t('overview'), icon: <Home className="w-4 h-4 shrink-0" /> },
    { id: 'digital_twin', label: t('digital_twin'), icon: <Compass className="w-4 h-4 shrink-0" /> },
    { id: 'groundwater', label: t('groundwater'), icon: <Droplets className="w-4 h-4 shrink-0" /> },
    { id: 'forecasting', label: t('forecasting'), icon: <TrendingUp className="w-4 h-4 shrink-0" /> },
    { id: 'water_quality', label: t('water_quality'), icon: <FlaskConical className="w-4 h-4 shrink-0" /> },
    { id: 'rainfall', label: t('rainfall'), icon: <CloudRain className="w-4 h-4 shrink-0" /> },
    { id: 'anomalies', label: t('anomalies'), icon: <AlertTriangle className="w-4 h-4 shrink-0" /> },
    { id: 'risk_priority', label: t('risk_priority'), icon: <Target className="w-4 h-4 shrink-0" /> },
    { id: 'investigations', label: t('investigations'), icon: <ClipboardList className="w-4 h-4 shrink-0" /> },
    { id: 'analytics', label: t('analytics'), icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: 'documents', label: t('documents'), icon: <FileSearch className="w-4 h-4 shrink-0" /> },
    { id: 'assistant', label: t('assistant'), icon: <Bot className="w-4 h-4 shrink-0" /> },
    { id: 'monitoring', label: t('monitoring'), icon: <Bell className="w-4 h-4 shrink-0" /> },
    { id: 'recharge', label: t('recharge'), icon: <Layers className="w-4 h-4 shrink-0" /> },
    { id: 'confidence', label: t('confidence'), icon: <ShieldCheck className="w-4 h-4 shrink-0" /> },
    { id: 'community', label: t('community'), icon: <Users className="w-4 h-4 shrink-0" /> },
    ...(role === 'Administrator'
      ? [{ id: 'admin_audit', label: t('admin_audit'), icon: <Settings className="w-4 h-4 shrink-0" /> }]
      : [{ id: 'role_access', label: t('role_access'), icon: <Settings className="w-4 h-4 shrink-0" /> }]),
  ];

  const menuItems = mode === 'simple' ? communityMenuItems : professionalMenuItems;

  const sidebarContent = (
    <aside className="w-64 bg-[#051811] border-r border-white/[0.08] flex flex-col h-full select-none shrink-0">
      <div className="px-3 pt-3 pb-2 border-b border-white/[0.06] flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#d9c27a]">
          {mode === 'simple'
            ? L('COMMUNITY WORKSPACE', 'மக்கள் பயன்பாட்டுப் பகுதி')
            : L('PROFESSIONAL CONSOLE', 'தொழில்முறை ஆய்வுப் பகுதி')}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectModule(item.id);
                onCloseMobile?.();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left ${
                isActive
                  ? 'bg-[#10b981] text-[#041a11] font-semibold'
                  : 'text-stone-300 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <span className={isActive ? 'text-[#041a11]' : 'text-stone-400'}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-3 px-1 border-t border-white/[0.06]">
          {mode === 'simple' ? (
            <button
              type="button"
              onClick={() => {
                onSelectModule('dashboard', undefined, 'expert');
                onCloseMobile?.();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-[#09281d] hover:bg-[#0d3728] border border-[#d9c27a]/35 text-[#fcfbf7] text-xs font-medium transition-colors"
            >
              {L('Open Professional Console →', 'தொழில்முறை பலகம் →')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onSelectModule('dashboard', undefined, 'simple');
                onCloseMobile?.();
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium transition-colors"
            >
              {L('← Switch to Community Portal', '← மக்கள் பலகத்திற்கு மாறு')}
            </button>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-white/[0.06] bg-[#03110b] text-center">
        <div className="text-xs font-semibold text-emerald-200">{t('sidebar_banner_title')}</div>
        <div className="text-[10px] text-stone-400 mt-0.5">{t('sidebar_banner_subtitle')}</div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Fixed Rail */}
      <div className="hidden lg:block h-full">{sidebarContent}</div>

      {/* Mobile / Tablet Slide-over Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[900] flex pt-16">
          <div className="fixed inset-0 bg-black/70" onClick={onCloseMobile} />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
