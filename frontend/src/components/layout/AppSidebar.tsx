import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, Droplets, LineChart, CloudRain, FlaskConical, 
  AlertTriangle, Target, ShieldCheck, Users, ClipboardList, 
  Layers, Bot, FileText, UserCheck, Settings, Home, ArrowLeft
} from 'lucide-react';

interface AppSidebarProps {
  currentModule: string;
  onSelectModule: (moduleId: string) => void;
  onBackToLanding: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ currentModule, onSelectModule, onBackToLanding }) => {
  const { t } = useLanguage();
  const { user, role } = useAuth();

  const navigationSections = [
    {
      title: "Geospatial & Twin",
      items: [
        { id: 'dashboard', label: t('overview'), icon: <Home className="w-4 h-4" /> },
        { id: 'digital_twin', label: t('digital_twin'), icon: <Compass className="w-4 h-4" /> },
      ]
    },
    {
      title: "Environmental Analytics",
      items: [
        { id: 'groundwater', label: t('groundwater'), icon: <Droplets className="w-4 h-4" /> },
        { id: 'forecasting', label: t('forecasting'), icon: <LineChart className="w-4 h-4" /> },
        { id: 'rainfall', label: t('rainfall'), icon: <CloudRain className="w-4 h-4" /> },
        { id: 'water_quality', label: t('water_quality'), icon: <FlaskConical className="w-4 h-4" /> },
      ]
    },
    {
      title: "Risk & Response",
      items: [
        { id: 'anomalies', label: t('anomalies'), icon: <AlertTriangle className="w-4 h-4" /> },
        { id: 'risk_priority', label: t('risk_priority'), icon: <Target className="w-4 h-4" /> },
        { id: 'investigations', label: t('investigations'), icon: <ClipboardList className="w-4 h-4" /> },
        { id: 'recharge', label: t('recharge'), icon: <Layers className="w-4 h-4" /> },
      ]
    },
    {
      title: "Community & Intelligence",
      items: [
        { id: 'community', label: t('community'), icon: <Users className="w-4 h-4" /> },
        { id: 'assistant', label: t('assistant'), icon: <Bot className="w-4 h-4" /> },
        { id: 'confidence', label: t('confidence'), icon: <ShieldCheck className="w-4 h-4" /> },
        { id: 'analytics', label: t('analytics'), icon: <FileText className="w-4 h-4" /> },
      ]
    },
    {
      title: "System & Governance",
      items: [
        { id: 'role_access', label: t('role_access'), icon: <UserCheck className="w-4 h-4" /> },
        { id: 'admin_audit', label: t('admin_audit'), icon: <Settings className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#05150e] border-r border-white/[0.08] flex flex-col h-screen select-none shrink-0">
      {/* Top Console Header */}
      <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-ivory tracking-tight">PALAR CONSOLE</span>
            <p className="text-[10px] text-stone-400 font-mono">16 Integrated Modules</p>
          </div>
        </div>
        <button
          onClick={onBackToLanding}
          className="p-1.5 rounded-md hover:bg-white/5 text-stone-400 hover:text-white"
          title="Back to Landing Page"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Modules List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navigationSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <h5 className="px-3 text-[10px] font-mono uppercase tracking-wider text-stone-400 font-semibold mb-1">
              {sec.title}
            </h5>
            {sec.items.map((item) => {
              const isActive = currentModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectModule(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive 
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30' 
                      : 'text-stone-300 hover:bg-white/[0.04] hover:text-ivory'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-stone-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* User Status Bar */}
      <div className="p-3 bg-[#030d08] border-t border-white/[0.08] flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300 shrink-0">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="truncate">
            <div className="text-xs font-medium text-white truncate">{user?.full_name || 'Guest User'}</div>
            <div className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {role}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
