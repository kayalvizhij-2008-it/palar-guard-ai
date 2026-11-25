import React, { useState } from 'react';
import { Users, Compass, FileSearch, ClipboardList, Droplets, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface HowToUseSectionProps {
  onLaunchDemo: (mode: 'simple' | 'expert', lang: 'en' | 'ta', targetModule: string) => void;
}

type DemoKey = 'community_en' | 'community_ta' | 'pro_en' | 'pro_ta';

interface DemoGuide {
  id: DemoKey;
  tabLabel: string;
  mode: 'simple' | 'expert';
  lang: 'en' | 'ta';
  audience: string;
  title: string;
  intro: string;
  steps: { title: string; detail: string; targetModule: string; cta: string }[];
}

const DEMO_GUIDES: DemoGuide[] = [
  {
    id: 'community_en',
    tabLabel: 'Community Demo — English',
    mode: 'simple',
    lang: 'en',
    audience: 'Residents, Farmers & Students',
    title: 'How to Check Local Water & Report an Issue (English)',
    intro:
      'Designed in plain language with zero overwhelming charts. Check water near your taluk, read drinking safety guidance, and track community reports.',
    steps: [
      {
        title: '1. Check Water Near You',
        detail: 'Open the Community Workspace and select your district/town (e.g., Ranipet, Ambur, Vellore, Walajapet, Kanchipuram) to view water depth and TDS safety guidance.',
        targetModule: 'dashboard',
        cta: 'Open Water Near You',
      },
      {
        title: '2. Report a Water Problem',
        detail: 'Use "Report Water Issue" to describe well depletion, discoloration, or odor. Sign in to attach your account and track status updates.',
        targetModule: 'community',
        cta: 'Go to Report Form',
      },
      {
        title: '3. Track Your Reports & Read Alerts',
        detail: 'View your submitted reports under "My Reports" and read plain-language public advisories and conservation tips.',
        targetModule: 'dashboard',
        cta: 'View Community Alerts',
      },
    ],
  },
  {
    id: 'community_ta',
    tabLabel: 'Community Demo — தமிழ்',
    mode: 'simple',
    lang: 'ta',
    audience: 'பொதுமக்கள், விவசாயிகள் & மாணவர்கள்',
    title: 'உங்கள் பகுதி நீர் நிலையைப் பார்க்கவும் புகார் செய்யவும் (தமிழ்)',
    intro:
      'சிக்கலான அறிவியல் வரைபடங்கள் இல்லாமல் எளிய தமிழில் உங்கள் ஊரின் நிலத்தடி நீர் ஆழம், குடிநீர் பாதுகாப்பு மற்றும் புகார் நிலையைப் பார்க்கலாம்.',
    steps: [
      {
        title: '1. உங்கள் பகுதி நீர் நிலவரம்',
        detail: 'மக்கள் பலகத்தில் உங்கள் ஊர் அல்லது மாவட்டத்தைத் தேர்ந்தெடுத்து நிலத்தடி நீர் ஆழம் மற்றும் குடிநீர் பாதுகாப்பு குறிப்புகளைப் பாருங்கள்.',
        targetModule: 'dashboard',
        cta: 'நீர் நிலவரம் பார்க்க',
      },
      {
        title: '2. நீர் பிரச்சனை புகார் பதிவு செய்யவும்',
        detail: 'கிணறு வற்றுதல், நீர் நிறமாற்றம் அல்லது துர்நாற்றம் இருந்தால் "புகார் பதிவு" பகுதியில் எளிய படிவத்தின் மூலம் தெரிவிக்கவும்.',
        targetModule: 'community',
        cta: 'புகார் படிவம் திற',
      },
      {
        title: '3. PALAR AI-யிடம் தமிழில் கேட்கவும்',
        detail: 'உங்கள் பகுதி நீர் தரம் மற்றும் மழைநீர் சேகரிப்பு முறைகள் பற்றி தமிழ் AI உதவியாளரிடம் நேரடியாகக் கேள்வி கேட்கலாம்.',
        targetModule: 'assistant',
        cta: 'தமிழ் AI உதவியாளர்',
      },
    ],
  },
  {
    id: 'pro_en',
    tabLabel: 'Professional Demo — English',
    mode: 'expert',
    lang: 'en',
    audience: 'Hydrologists, Analysts, Field Officers & Admins',
    title: 'How to Run Hydrological & Document Workflows (English)',
    intro:
      'Access the 13-module Professional Workspace with GIS layers, statistical anomaly screening, Kanban field verification, Document Intelligence, and RBAC.',
    steps: [
      {
        title: '1. Explore GIS Layers & Hydrographs',
        detail: 'Inspect the Basin Explorer map, switch to Groundwater Stress or Water Quality laboratory view, and add stations to your Monitoring Watchlist.',
        targetModule: 'digital_twin',
        cta: 'Open Basin Explorer',
      },
      {
        title: '2. Upload & Analyse Reports in Document Intelligence',
        detail: 'Sign in and upload PDF, DOCX, CSV, XLSX, or TXT reports. Extract text/tables, run 12 task presets, compare two documents, and export Markdown/JSON.',
        targetModule: 'documents',
        cta: 'Open Document Studio',
      },
      {
        title: '3. Triage Anomalies & Field Kanban',
        detail: 'Inspect Robust Z-score outliers in Pollution Risk, rank stations in Risk Prioritisation, and update assigned tickets on the Field Verification Kanban board.',
        targetModule: 'investigations',
        cta: 'Open Field Kanban',
      },
    ],
  },
  {
    id: 'pro_ta',
    tabLabel: 'Professional Demo — தமிழ்',
    mode: 'expert',
    lang: 'ta',
    audience: 'நீரியல் ஆய்வாளர்கள், கள அதிகாரிகள் & நிர்வாகிகள்',
    title: 'தொழில்முறை ஆய்வு & ஆவண நுண்ணறிவு வழிகாட்டி (தமிழ்)',
    intro:
      'புவிசார் வரைபடம், நீர் தர ஆய்வகம், புள்ளிவிவர அபாயக் கண்டறிதல், கள ஆய்வு கான்பன் பலகை மற்றும் ஆவண நுண்ணறிவு ஆகியவற்றை தமிழிலும் பயன்படுத்தலாம்.',
    steps: [
      {
        title: '1. புவிசார் வரைபடம் & நிலத்தடி நீர் பகுப்பாய்வு',
        detail: 'வடிநில ஆய்வகத்தில் நிலையங்களைத் தேர்ந்தெடுத்து காலவரிசை நீர்மட்ட மாறுபாடுகள் மற்றும் கண்காணிப்புப் பட்டியலைப் பார்க்கவும்.',
        targetModule: 'groundwater',
        cta: 'நிலத்தடி நீர் பகுப்பாய்வு',
      },
      {
        title: '2. ஆவண நுண்ணறிவு (Document Intelligence)',
        detail: 'PDF, DOCX, CSV, XLSX கோப்புகளைப் பதிவேற்றி அட்டவணைகளைப் பிரித்தெடுத்து, தமிழ் விளக்கம் மற்றும் கள சரிபார்ப்புப் பட்டியலைப் பெறுங்கள்.',
        targetModule: 'documents',
        cta: 'ஆவண நுண்ணறிவு திற',
      },
      {
        title: '3. கள ஆய்வு கான்பன் & அபாய முன்னுரிமை',
        detail: 'MCDA இடர் தரவரிசையை ஆராய்ந்து, கள ஆய்வுப் பணிகளின் நிலையை பாதுகாப்பான உள்நுழைவுடன் புதுப்பிக்கவும்.',
        targetModule: 'risk_priority',
        cta: 'இடர் முன்னுரிமை திற',
      },
    ],
  },
];

export const HowToUseSection: React.FC<HowToUseSectionProps> = ({ onLaunchDemo }) => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);
  const [activeId, setActiveId] = useState<DemoKey>(lang === 'ta' ? 'community_ta' : 'community_en');

  const activeGuide = DEMO_GUIDES.find((g) => g.id === activeId) || DEMO_GUIDES[0];

  return (
    <section
      id="how-to-use"
      className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent border-b border-white/[0.08]"
    >
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="text-center max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-mono uppercase tracking-[0.26em] text-[#d9c27a]">
            {L('BILINGUAL INTERACTIVE WALKTHROUGHS', 'இருமொழி செயல்முறை வழிகாட்டி')}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#fcfbf7] tracking-tight">
            HOW TO USE PALAR GUARD AI
          </h2>
          {lang === 'ta' && (
            <p className="text-base font-semibold text-emerald-400">
              பாலாறு காப்பாளர் AI தளத்தைப் பயன்படுத்தும் முறை
            </p>
          )}
          <p className="text-sm sm:text-base text-[#a4b2a9]">
            {L(
              'Select your workspace and preferred language below to step through real features.',
              'உங்கள் பயன்பாட்டுப் பகுதி மற்றும் மொழியைத் தேர்ந்தெடுத்து நேரடி அம்சங்களைப் பயன்படுத்திப் பாருங்கள்.'
            )}
          </p>
        </header>

        {/* 4 Required Demo Selector Tabs */}
        <div
          role="tablist"
          aria-label="Platform Walkthrough Demos"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {DEMO_GUIDES.map((guide) => {
            const selected = guide.id === activeId;
            return (
              <button
                key={guide.id}
                role="tab"
                type="button"
                aria-selected={selected}
                onClick={() => setActiveId(guide.id)}
                className={`p-4 rounded-xl border text-left transition-colors ${
                  selected
                    ? 'bg-[#0b291c] border-[#10b981] text-[#fcfbf7]'
                    : 'bg-[#061811] border-white/10 text-[#a4b2a9] hover:border-white/25 hover:text-[#fcfbf7]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-[#d9c27a]">
                  <span>{guide.mode === 'simple' ? 'COMMUNITY' : 'PROFESSIONAL'}</span>
                  <span>{guide.lang === 'ta' ? 'தமிழ்' : 'EN'}</span>
                </div>
                <div className="mt-1.5 text-sm font-semibold">{guide.tabLabel}</div>
              </button>
            );
          })}
        </div>

        {/* Active Guide Card */}
        <div className="rounded-2xl border border-white/10 bg-[#081b13] p-6 sm:p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400">
                {activeGuide.mode === 'simple' ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <Compass className="w-4 h-4" />
                )}
                <span>{activeGuide.audience}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">{activeGuide.title}</h3>
              <p className="text-sm text-[#a4b2a9] leading-relaxed">{activeGuide.intro}</p>
            </div>

            <button
              type="button"
              onClick={() => onLaunchDemo(activeGuide.mode, activeGuide.lang, activeGuide.steps[0].targetModule)}
              className="shrink-0 px-5 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <span>
                {activeGuide.lang === 'ta' ? 'இந்த டெமோவைத் தொடங்கு' : 'Launch This Workspace'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {activeGuide.steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-white/[0.08] bg-[#05140d] p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#d9c27a]">
                    <span>0{i + 1}</span>
                    {i === 0 ? (
                      <Droplets className="w-4 h-4 text-[#10b981]" />
                    ) : i === 1 ? (
                      <FileSearch className="w-4 h-4 text-[#0891b2]" />
                    ) : (
                      <ClipboardList className="w-4 h-4 text-[#d97706]" />
                    )}
                  </div>
                  <h4 className="text-base font-semibold text-[#fcfbf7]">{step.title}</h4>
                  <p className="text-xs text-[#a4b2a9] leading-relaxed">{step.detail}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onLaunchDemo(activeGuide.mode, activeGuide.lang, step.targetModule)}
                  className="w-full py-2.5 px-3 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-medium text-emerald-300 flex items-center justify-between transition-colors"
                >
                  <span>{step.cta}</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
