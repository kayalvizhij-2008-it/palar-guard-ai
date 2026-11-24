import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, Bell, Droplets, Check, X, 
  ChevronDown, ExternalLink, ShieldAlert, Sparkles, Filter
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onOpenPresentation?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  currentView, 
  onNavigate, 
  onOpenAuth, 
  onOpenPresentation,
  searchQuery = '',
  onSearchChange
}) => {
  const { lang, setLang, mode, setMode, t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const notificationsList = [
    { id: 1, title: t('alert_1_title'), time: t('alert_1_time'), type: 'danger' },
    { id: 2, title: t('alert_2_title'), time: t('alert_2_time'), type: 'warning' },
    { id: 3, title: t('alert_3_title'), time: t('alert_3_time'), type: 'warning' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#061811] border-b border-white/[0.08] select-none">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity */}
        <div 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-[#063322] flex items-center justify-center border border-emerald-400/40 shadow-emerald-glow group-hover:scale-105 transition-transform duration-200">
            {/* Elegant Leaf + Water droplet SVG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-200 fill-emerald-300" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-black text-base tracking-tight text-white">PALAR GUARD AI</span>
            </div>
            <p className="text-[11px] text-stone-300 font-normal hidden sm:block tracking-normal">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-9 pr-4 py-2 bg-[#09251a] border border-white/[0.1] rounded-full text-xs text-stone-200 placeholder-stone-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>

        {/* Right Controls: Mode, Language Switcher, Notifications, User Profile */}
        <div className="flex items-center gap-3 shrink-0">

          {/* Landing / Dashboard Switcher */}
          <button
            onClick={() => onNavigate(currentView === 'landing' ? 'dashboard' : 'landing')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#082419] border border-white/[0.08] hover:border-emerald-500/40 text-xs font-semibold text-emerald-300 transition-colors"
          >
            <span>{currentView === 'landing' ? (lang === 'ta' ? 'கண்காணிப்பு பலகம் →' : 'Command Console →') : (lang === 'ta' ? '← 3D முகப்பு' : '← 3D Story Hero')}</span>
          </button>
          
          {/* Simple vs Expert Mode Pill */}
          <div className="hidden lg:flex items-center bg-[#072116] p-0.5 rounded-full border border-white/[0.08]">
            <button
              onClick={() => setMode('simple')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
                mode === 'simple'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              {t('simple_mode')}
            </button>
            <button
              onClick={() => setMode('expert')}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-all ${
                mode === 'expert'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              {t('expert_mode')}
            </button>
          </div>

          {/* Tamil / English Pill Toggle (Exactly matching the reference image) */}
          <div className="flex items-center bg-[#072116] p-0.5 rounded-full border border-white/[0.08]">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                lang === 'en'
                  ? 'bg-[#10b981] text-[#041a11] shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang('ta')}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                lang === 'ta'
                  ? 'bg-[#10b981] text-[#041a11] shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Notification Bell with Badge '3' */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-full bg-[#082419] border border-white/[0.08] hover:border-emerald-500/40 text-stone-300 hover:text-white transition-colors"
              title={t('notifications')}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg border border-[#061811]">
                3
              </span>
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[#09251a] border border-white/[0.1] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] mb-2">
                  <span className="text-xs font-bold text-white">{t('notifications')}</span>
                  <span className="text-[10px] text-emerald-400 cursor-pointer hover:underline">{t('mark_all_read')}</span>
                </div>
                <div className="space-y-2">
                  {notificationsList.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        onNavigate('anomalies');
                        setNotificationsOpen(false);
                      }}
                      className="p-2 rounded-xl bg-black/20 hover:bg-emerald-950/40 border border-white/[0.04] cursor-pointer transition-colors"
                    >
                      <div className="text-xs font-semibold text-stone-200">{item.title}</div>
                      <div className="text-[10px] text-stone-400 mt-1 flex items-center justify-between">
                        <span>{item.time}</span>
                        <span className="text-red-400 font-mono">PRIORITY</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill: Dr. Kayalvizhi / அறிவியல் குழு */}
          <div 
            onClick={() => onNavigate('role_access')}
            className="flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-[#082419] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all"
          >
            {/* User Portrait */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-700 to-emerald-400 p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-[#041a11] flex items-center justify-center overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80" 
                  alt="Dr. Kayalvizhi" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] font-bold text-emerald-300">KJ</span>
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight">Dr. Kayalvizhi</div>
              <div className="text-[10px] text-emerald-400/90 font-medium leading-tight">{t('science_team')}</div>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
};
