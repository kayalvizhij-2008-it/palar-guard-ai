import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, LogIn, LogOut, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onToggleMobileMenu?: () => void;
  mobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onToggleMobileMenu,
  mobileMenuOpen = false,
}) => {
  const { lang, setLang, mode, setMode, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isLanding = currentView === 'landing';

  return (
    <header className="sticky top-0 z-50 bg-[#061811]/95 backdrop-blur-md border-b border-white/[0.08] w-full">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Drawer Button + Brand */}
        <div className="flex items-center gap-2 min-w-0">
          {!isLanding && onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              aria-label={mobileMenuOpen ? 'Close sidebar' : 'Open sidebar'}
              className="lg:hidden p-2 rounded-lg border border-white/10 text-stone-200 hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left min-w-0 focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0b3324] flex items-center justify-center border border-emerald-400/40 shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-300 fill-emerald-300" aria-hidden="true">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="font-sans font-semibold text-[11px] min-[400px]:text-xs sm:text-base tracking-tight text-[#fcfbf7] whitespace-nowrap block">
                PALAR GUARD AI
              </span>
              <span className="text-[10px] text-[#a4b2a9] hidden xl:block truncate max-w-xs">
                {t('tagline')}
              </span>
            </div>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate(isLanding ? 'dashboard' : 'landing')}
            className="px-2 sm:px-3 py-1 rounded-full bg-[#082419] border border-white/10 hover:border-emerald-500/40 text-[11px] sm:text-xs font-medium text-emerald-300 transition-colors whitespace-nowrap"
          >
            {isLanding
              ? lang === 'ta'
                ? 'பலகம்'
                : 'Console'
              : lang === 'ta'
              ? 'முகப்பு'
              : 'Home'}
          </button>

          {/* Community vs Professional Workspace Switcher */}
          <div className="hidden sm:flex items-center bg-[#072116] p-0.5 rounded-full border border-white/[0.08]">
            <button
              type="button"
              onClick={() => {
                setMode('simple');
                if (!isLanding) onNavigate('dashboard');
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                mode === 'simple' ? 'bg-[#10b981] text-[#041a11] font-semibold' : 'text-stone-300 hover:text-white'
              }`}
            >
              {t('simple_mode')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('expert');
                if (!isLanding) onNavigate('dashboard');
              }}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                mode === 'expert' ? 'bg-[#d9c27a] text-[#041a11] font-semibold' : 'text-stone-300 hover:text-white'
              }`}
            >
              {t('expert_mode')}
            </button>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center bg-[#072116] p-0.5 rounded-full border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2 sm:px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                lang === 'en' ? 'bg-[#10b981] text-[#041a11] font-semibold' : 'text-stone-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('ta')}
              className={`px-2 sm:px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors ${
                lang === 'ta' ? 'bg-[#10b981] text-[#041a11] font-semibold' : 'text-stone-300 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          {/* Auth Status Pill */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-[#082419] border border-emerald-500/35 text-xs text-[#fcfbf7]"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden md:inline max-w-[110px] truncate">{user.full_name}</span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#081d14] p-3 shadow-2xl z-50 space-y-2 text-xs">
                  <div className="border-b border-white/[0.08] pb-2">
                    <div className="font-semibold text-white truncate">{user.full_name}</div>
                    <div className="text-[11px] text-stone-400 truncate">{user.email}</div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-0.5">{user.role}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNavigate('role_access');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-white/5 text-stone-200"
                  >
                    {t('role_access')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-rose-950/60 text-rose-300 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('sign_out')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              aria-label={t('sign_in')}
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-[11px] sm:text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden min-[420px]:inline">{t('sign_in')}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
