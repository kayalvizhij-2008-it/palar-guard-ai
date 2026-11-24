import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Droplet, Globe, Menu, X, Shield, ArrowRight, User as UserIcon, Award } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onOpenPresentation?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth, onOpenPresentation }) => {
  const { lang, setLang, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'problem', label: 'Challenge' },
    { id: 'solution', label: 'Solution' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'digital-twin-preview', label: 'Digital Twin' },
    { id: 'modules-preview', label: 'Platform' },
    { id: 'data-sources', label: 'Data Sources' },
    { id: 'team', label: 'Team CIT' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#061811]/90 backdrop-blur-md border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Tag */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-[#073625] flex items-center justify-center border border-emerald-400/30 shadow-emerald-glow group-hover:scale-105 transition-transform duration-200">
            <Droplet className="w-5 h-5 text-emerald-200 fill-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-base tracking-tight text-ivory">PALAR GUARD AI</span>
              <span className="px-1.5 py-0.2 bg-emerald-950/80 border border-emerald-500/30 text-[9px] font-mono text-emerald-400 rounded">DEEPTECH</span>
            </div>
            <p className="text-[10px] text-stone-400 font-mono hidden sm:block">Environmental Intelligence & Water-Risk Platform</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-stone-300">
          {navLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="hover:text-emerald-300 transition-colors py-1"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Hackathon Presentation Mode Button */}
          {onOpenPresentation && (
            <button
              onClick={onOpenPresentation}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/60 text-xs font-mono text-emerald-300 transition-colors shadow-forest-sm"
              title="Launch 5-7 Min Jury Presentation Walkthrough (Press 'P')"
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pitch Mode</span>
            </button>
          )}

          {/* Tamil / English Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0c241a] border border-white/[0.08] hover:border-emerald-500/30 text-xs font-mono text-emerald-300 transition-colors"
            title="Switch Language (English / தமிழ்)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* User / Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-ivory text-xs font-semibold shadow-forest-sm transition-colors"
              >
                <span>Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div 
                onClick={() => onNavigate('role_access')}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg bg-[#0c241a] border border-white/[0.08] hover:border-emerald-500/30"
                title={`Role: ${user?.role}`}
              >
                <div className="w-7 h-7 rounded-full bg-emerald-900/80 border border-emerald-400/40 flex items-center justify-center text-xs font-bold text-emerald-200">
                  {user?.full_name?.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white transition-colors"
              >
                {t('sign_in')}
              </button>
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-ivory text-xs font-semibold shadow-forest-sm transition-colors"
              >
                {t('explore_platform')}
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071d14] border-b border-white/10 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium text-stone-300">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded bg-white/[0.03] hover:text-emerald-300"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button
              onClick={() => { onNavigate('dashboard'); setMobileMenuOpen(false); }}
              className="flex-1 py-2 bg-emerald-600 text-ivory text-xs font-semibold rounded-lg text-center"
            >
              Open Platform Console
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
