import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { HeartHandshake, Briefcase, ArrowRight, X, ShieldCheck, Droplets, Activity } from 'lucide-react';

interface ExperienceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'simple' | 'expert') => void;
}

export const ExperienceModeModal: React.FC<ExperienceModeModalProps> = ({
  isOpen,
  onClose,
  onSelectMode
}) => {
  const { lang, setMode } = useLanguage();

  if (!isOpen) return null;

  const handleChoose = (m: 'simple' | 'expert') => {
    setMode(m);
    onSelectMode(m);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#061811] border border-emerald-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400/40 text-xs font-mono text-emerald-300">
            <Droplets className="w-3.5 h-3.5 text-emerald-400" />
            <span>PALAR GUARD AI · WORKSPACE SELECTION</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === 'ta'
              ? 'நீங்கள் தளத்தை எவ்வாறு பயன்படுத்த விரும்புகிறீர்கள்?'
              : 'How would you like to use PALAR GUARD AI?'}
          </h2>

          <p className="text-xs sm:text-sm text-stone-300">
            {lang === 'ta'
              ? 'உங்கள் தேவைக்கேற்ப எளிய மக்கள் பயன்பாடு அல்லது முழுமையான அறிவியல் பகுப்பாய்வு பலகையைத் தேர்ந்தெடுக்கவும்.'
              : 'Choose the workspace tailored to your needs. You can switch between views anytime without losing your session.'}
          </p>
        </div>

        {/* The Two Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Option 1: Community Access */}
          <div
            onClick={() => handleChoose('simple')}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#072518] to-[#04160e] border border-emerald-500/30 hover:border-emerald-400 cursor-pointer transition-all hover:scale-[1.02] shadow-forest-md flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 flex items-center justify-center text-emerald-300 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  OPTION 01 · CITIZENS & FARMERS
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {lang === 'ta' ? 'மக்களுக்கான பலகம்' : 'Community Access'}
                </h3>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {lang === 'ta'
                  ? 'விவசாயிகள், குடியிருப்பாளர்கள் மற்றும் மாணவர்களுக்கானது. எளிய மொழியில் நீர் நிலை, குடிநீர் பாதுகாப்பு மற்றும் எளிய பிரச்சனை பதிவு.'
                  : 'For residents, farmers, students, and community members. Simple plain language, local water levels, drinking safety guides, and fast incident reporting.'}
              </p>

              <ul className="space-y-1.5 text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Local groundwater status in plain words</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>2-minute water problem reporting form</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Drinking water safety & recharge tips</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-forest-sm transition-colors mt-2">
              <span>{lang === 'ta' ? 'மக்களுக்கான பலகத்தைத் திறக்க' : 'Enter Community Access'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Option 2: Professional Workspace */}
          <div
            onClick={() => handleChoose('expert')}
            className="p-6 rounded-2xl bg-gradient-to-br from-[#072518] to-[#04160e] border border-cyan-500/30 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.02] shadow-forest-md flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-105 transition-transform">
                <Briefcase className="w-6 h-6" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  OPTION 02 · HYDROLOGISTS & TEAMS
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {lang === 'ta' ? 'தொழில்முறை ஆய்வு பலகம்' : 'Professional Workspace'}
                </h3>
              </div>

              <p className="text-xs text-stone-300 leading-relaxed">
                {lang === 'ta'
                  ? 'ஆராய்ச்சியாளர்கள், சுற்றுச்சூழல் அதிகாரிகள், கள ஆய்வாளர்கள் மற்றும் கொள்கை வகுப்பாளர்களுக்கான முழுமையான பகுப்பாய்வு தளம்.'
                  : 'For researchers, environmental officers, hydrologists, administrators, and field teams. Advanced analytics, basin monitoring, evidence triage, and decision-support tools.'}
              </p>

              <ul className="space-y-1.5 text-xs text-stone-300">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>16 dedicated modules & GIS maps</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Hydrographs, forecasts & robust Z-scores</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>Multi-criteria risk ranking & dossiers</span>
                </li>
              </ul>
            </div>

            <button className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-forest-sm transition-colors mt-2">
              <span>{lang === 'ta' ? 'தொழில்முறை பலகத்திற்குள் நுழைக' : 'Enter Professional Workspace'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer info note */}
        <div className="text-center text-[11px] text-stone-400 font-mono pt-1">
          ✓ Switch anytime using the top navigation pill · Zero data loss
        </div>
      </div>
    </div>
  );
};
