import React, { useState } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Compass,
  Droplets,
  CloudRain,
  AlertTriangle,
  Users,
  ShieldCheck,
  FileSearch,
  Award,
  CheckCircle2,
  Activity,
  LineChart,
  GraduationCap,
  ShieldAlert,
  Building2,
  Cpu,
  Sparkles,
  FileText,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { ScrollEarthJourney } from '../hero/ScrollEarthJourney';
import { VerticalFallingTimeline } from '../landing/VerticalFallingTimeline';
import { HowToUseSection } from '../landing/HowToUseSection';
import { DigitalTwinMap } from './DigitalTwinMap';
import { DataBadge } from '../common/DataBadge';
import { Reveal, FlipCard } from '../motion/motion';

interface LandingPageProps {
  onExplore: (module?: string) => void;
  onOpenPresentation?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExplore, onOpenPresentation }) => {
  const { lang, setLang, setMode } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);
  const [activeStage, setActiveStage] = useState<number>(0);

  const workflowStages = [
    {
      step: '01',
      name: L('OBSERVE', 'கண்காணி'),
      title: L('Basin-Wide Hydrological & Quality Data Ingestion', 'வடிநில அளவிலான நீர் & தரத் தரவு ஒருங்கிணைப்பு'),
      desc: L(
        'Aggregate CGWB observation well depths, IMD catchment rainfall records, and TNPCB water quality profiles across seven baseline river stations.',
        'மத்திய நிலத்தடி நீர் வாரியம் (CGWB), இந்திய வானிலை ஆய்வு மையம் (IMD) மற்றும் TNPCB நீர் தரப் பதிவுகளை ஏழு நிலையங்களில் ஒருங்கிணைக்கிறது.'
      ),
      metric: L('7 Baseline Stations', '7 அடிப்படை நிலையங்கள்'),
      provenance: 'VERIFIED_PUBLIC' as const,
      target: 'groundwater',
    },
    {
      step: '02',
      name: L('ANALYSE', 'பகுப்பாய்'),
      title: L('Seasonal Drawdown & Chemical Compliance Profiling', 'பருவகால நீர்மட்ட குறைவு & இரசாயன தரப் பகுப்பாய்வு'),
      desc: L(
        'Evaluate seasonal depth changes (mbgl) and benchmark TDS, EC, pH, BOD, DO, and Total Chromium against BIS 10500 and CPCB Class C thresholds.',
        'நிலத்தடி நீர் ஆழ மாற்றங்களையும் TDS, EC, pH, BOD, DO மற்றும் குரோமியம் அளவுகளையும் BIS 10500 / CPCB தரநிலைகளுடன் ஒப்பிடுகிறது.'
      ),
      metric: L('BIS 10500 / CPCB', 'BIS 10500 / CPCB'),
      provenance: 'HISTORICAL_REPORT' as const,
      target: 'water_quality',
    },
    {
      step: '03',
      name: L('PREDICT', 'கணித்தறி'),
      title: L('Walk-Forward Projections With Uncertainty Bands', 'நிச்சயமற்ற வரம்புகளுடன் கூடிய முன்னோக்கு கணிப்பு'),
      desc: L(
        'Project upcoming seasonal groundwater depth across four quarters with explicit upper and lower confidence intervals and climate deficit scenarios.',
        'அடுத்த நான்கு காலாண்டுகளுக்கான நிலத்தடி நீர்மட்டத்தை மேல் மற்றும் கீழ் நம்பிக்கை வரம்புகளுடன் கணிக்கிறது.'
      ),
      metric: L('4-Quarter Horizon', '4 காலாண்டு கணிப்பு'),
      provenance: 'MODEL_PREDICTION' as const,
      target: 'forecasting',
    },
    {
      step: '04',
      name: L('PRIORITISE', 'முன்னுரிமைபடுத்து'),
      title: L('Explainable Multi-Criteria Risk Ranking', 'விளக்கக்கூடிய பல-அளவுகோல் இடர் தரவரிசை'),
      desc: L(
        'Combine groundwater stress, water quality exceedances, rainfall deficit, recency, and data confidence into an inspectable 0–100 priority index.',
        'நிலத்தடி நீர் அழுத்தம், நீர் தரம், மழை பற்றாக்குறை மற்றும் தரவு நம்பகத்தன்மை ஆகியவற்றை இணைத்து 0–100 இடர் குறியீட்டை உருவாக்குகிறது.'
      ),
      metric: L('Auditable MCDA Weights', 'சரிபார்க்கக்கூடிய எடைகள்'),
      provenance: 'MODEL_PREDICTION' as const,
      target: 'risk_priority',
    },
    {
      step: '05',
      name: L('VERIFY', 'சரிபார்'),
      title: L('Role-Protected Field Triage & Document Evidence', 'பாதுகாக்கப்பட்ட கள ஆய்வு & ஆவணச் சரிபார்ப்பு'),
      desc: L(
        'Statistical departures trigger Kanban field verification checklists and source-grounded Document Intelligence checks rather than automated accusations.',
        'புள்ளிவிவர மாறுபாடுகள் நேரடி கள ஆய்வு சரிபார்ப்பு மற்றும் ஆவண நுண்ணறிவு சோதனைக்கு அனுப்பப்படுகின்றன.'
      ),
      metric: L('RBAC Audit Trail', 'RBAC தணிக்கை பதிவேடு'),
      provenance: 'FIELD_VERIFIED' as const,
      target: 'investigations',
    },
    {
      step: '06',
      name: L('ACT', 'செயல்படுத்து'),
      title: L('Managed Aquifer Recharge & Community Participation', 'நீர் செறிவூட்டல் திட்டமிடல் & மக்கள் பங்களிப்பு'),
      desc: L(
        'Screen alluvial reaches for check dams or eri restoration while enabling citizens to report local water issues in English or Tamil.',
        'தடுப்பணை மற்றும் ஏரி புனரமைப்பு இடங்களை ஆய்வு செய்வதுடன், பொதுமக்கள் தமிழிலும் ஆங்கிலத்திலும் புகார் அளிக்க உதவுகிறது.'
      ),
      metric: L('Bilingual Action Loop', 'இருமொழி செயல்பாடு'),
      provenance: 'COMMUNITY_REPORT' as const,
      target: 'recharge',
    },
  ];

  const capabilities = [
    {
      id: 'groundwater',
      icon: Droplets,
      accent: 'text-teal-400 border-teal-500/30 bg-teal-950/75 hover:border-teal-400/50',
      provenance: 'VERIFIED_PUBLIC' as const,
      title: L('1. Groundwater Intelligence', '1. நிலத்தடி நீர் நுண்ணறிவு'),
      desc: L(
        'Multi-year quarterly hydrographs from CGWB national hydrograph network wells tracking water table depth and seasonal recharge amplitude.',
        'CGWB கண்காணிப்புக் கிணறுகளின் நீர்மட்ட ஆழம் மற்றும் பருவகால நீர் மீட்சி அளவுகளின் நேரடிப் பகுப்பாய்வு.'
      ),
    },
    {
      id: 'rainfall',
      icon: CloudRain,
      accent: 'text-cyan-400 border-cyan-500/30 bg-cyan-950/75 hover:border-cyan-400/50',
      provenance: 'VERIFIED_PUBLIC' as const,
      title: L('2. Rainfall Response Analysis', '2. மழைப்பொழிவுப் பகுப்பாய்வு'),
      desc: L(
        'Catchment-wide precipitation series contrasting Southwest vs. Northeast monsoon rainfall and aquifer infiltration windows.',
        'வடகிழக்கு மற்றும் தென்மேற்குப் பருவமழைப் பங்களிப்புகளையும் நீர் ஊடுருவல் காலங்களையும் ஒப்பிடுகிறது.'
      ),
    },
    {
      id: 'water_quality',
      icon: Activity,
      accent: 'text-amber-400 border-amber-500/30 bg-amber-950/75 hover:border-amber-400/50',
      provenance: 'HISTORICAL_REPORT' as const,
      title: L('3. Water Quality Surveillance', '3. நீர் தரக் கண்காணிப்பு'),
      desc: L(
        'Laboratory parameter benchmarks across Total Chromium, TDS, EC, BOD, and Dissolved Oxygen with robust outlier screening.',
        'குரோமியம், TDS, EC, BOD மற்றும் கரைந்த ஆக்ஸிஜன் அளவுகளை BIS 10500 / CPCB வரம்புகளுடன் ஒப்பிடுகிறது.'
      ),
    },
    {
      id: 'forecasting',
      icon: LineChart,
      accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/75 hover:border-emerald-400/50',
      provenance: 'MODEL_PREDICTION' as const,
      title: L('4. Walk-Forward Projections', '4. முன்னோக்கு கணிப்புகள்'),
      desc: L(
        'Quarterly water table scenario projections under normal, deficit, and surplus monsoon conditions with explicit confidence bounds.',
        'இயல்பு, பற்றாக்குறை மற்றும் மிகை மழைச் சூழல்களில் அடுத்த நான்கு காலாண்டுகளுக்கான நீர்மட்டக் கணிப்புகள்.'
      ),
    },
    {
      id: 'risk_priority',
      icon: Compass,
      accent: 'text-violet-400 border-violet-500/30 bg-violet-950/75 hover:border-violet-400/50',
      provenance: 'MODEL_PREDICTION' as const,
      title: L('5. Geospatial Risk Prioritisation', '5. புவிசார் இடர் முன்னுரிமை'),
      desc: L(
        'Transparent MCDA 0–100 priority rankings helping field officers focus inspection capacity on critical reaches first.',
        'மிக அதிக அபாயம் உள்ள நதிப் பகுதிகளுக்கு முதலில் கள ஆய்வுக் குழுக்களை அனுப்ப உதவும் 0–100 தரவரிசை.'
      ),
    },
    {
      id: 'documents',
      icon: ShieldCheck,
      accent: 'text-[#d9c27a] border-[#d9c27a]/30 bg-[#1a170c]/80 hover:border-[#d9c27a]/60',
      provenance: 'VERIFIED_PUBLIC' as const,
      title: L('6. Document Intelligence & Audit', '6. ஆவண நுண்ணறிவு & தணிக்கை'),
      desc: L(
        'Source-grounded extraction across PDF, DOCX, CSV, XLSX, and TXT reports alongside full provenance classification and audit logs.',
        'PDF, DOCX, CSV, XLSX மற்றும் TXT அறிக்கைகளில் இருந்து பக்க/வரி ஆதாரங்களுடன் தகவல்களைப் பிரித்தெடுத்தல்.'
      ),
    },
  ];

  const stakeholders = [
    {
      icon: Users,
      color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30',
      role: L('Role: Community / விவசாயி', 'பங்கு: பொதுமக்கள் / விவசாயி'),
      title: L('Farmers & Local Residents', 'விவசாயிகள் & பொதுமக்கள்'),
      desc: L(
        'Check neighbourhood well depth in plain language, follow monsoon updates, and report water concerns in Tamil or English.',
        'தங்கள் ஊர் கிணற்று நீர்மட்டம் மற்றும் குடிநீர் பாதுகாப்பை எளிய தமிழில் அறிந்து புகார் அளிக்கலாம்.'
      ),
    },
    {
      icon: GraduationCap,
      color: 'text-cyan-400 bg-cyan-950/80 border-cyan-500/30',
      role: L('Role: Researcher / ஆய்வாளர்', 'பங்கு: ஆராய்ச்சியாளர்'),
      title: L('Environmental Researchers', 'சுற்றுச்சூழல் ஆய்வாளர்கள்'),
      desc: L(
        'Analyze multi-year hydrographs, benchmark chemical parameters, inspect walk-forward forecasts, and export CSV dossiers.',
        'பல ஆண்டு நிலத்தடி நீர் வரைபடங்கள், வேதியியல் அளவுகள் மற்றும் கணிப்பு மாதிரிகளை ஆய்வு செய்யலாம்.'
      ),
    },
    {
      icon: ShieldAlert,
      color: 'text-amber-400 bg-amber-950/80 border-amber-500/30',
      role: L('Role: Field Investigator', 'பங்கு: கள அதிகாரி'),
      title: L('Field Officers & Inspectors', 'கள ஆய்வு அதிகாரிகள்'),
      desc: L(
        'Triage statistical outlier tickets, verify community incident coordinates on-site, and record laboratory verification notes.',
        'புள்ளிவிவர மாறுபாடுகளையும் மக்கள் புகார்களையும் களத்தில் சரிபார்த்து ஆய்வக முடிவுகளைப் பதிவு செய்யலாம்.'
      ),
    },
    {
      icon: Building2,
      color: 'text-teal-400 bg-teal-950/80 border-teal-500/30',
      role: L('Role: Water Authority', 'பங்கு: நீர்வளத்துறை'),
      title: L('Basin & Municipal Authorities', 'நீர்வள & நகராட்சி அமைப்புகள்'),
      desc: L(
        'Evaluate check-dam and eri desiltation suitability across the 17,810 km² catchment and track priority interventions.',
        'தடுப்பணை மற்றும் ஏரி தூர்வாருதல் தகுதியை மதிப்பிட்டு முன்னுரிமைப் பகுதிகளில் திட்டமிடலாம்.'
      ),
    },
    {
      icon: Compass,
      color: 'text-emerald-300 bg-emerald-950/80 border-emerald-500/30',
      role: L('Role: Watershed NGO', 'பங்கு: தன்னார்வக் குழுக்கள்'),
      title: L('Basin Watch NGOs', 'நதிப் பாதுகாப்புக் குழுக்கள்'),
      desc: L(
        'Monitor public water advisories, mobilize village tank restoration, and engage citizens with evidence-backed metrics.',
        'பொது நீர் எச்சரிக்கைகளைப் பகிர்ந்து கிராம ஏரிப் புனரமைப்புப் பணிகளை ஒருங்கிணைக்கலாம்.'
      ),
    },
    {
      icon: Cpu,
      color: 'text-violet-300 bg-violet-950/80 border-violet-500/30',
      role: L('Role: Administrator', 'பங்கு: கணினி நிர்வாகி'),
      title: L('System Administrators', 'தள நிர்வாகிகள்'),
      desc: L(
        'Enforce JWT authentication and role permissions, audit system health, and review moderation and document logs.',
        'பங்கு அடிப்படையிலான பாதுகாப்பு (RBAC), கணினி ஆரோக்கியம் மற்றும் தணிக்கைப் பதிவேடுகளை நிர்வகிக்கலாம்.'
      ),
    },
  ];

  const provenanceTiers = [
    {
      tier: 'TIER 1',
      provenance: 'VERIFIED_PUBLIC' as const,
      border: 'border-emerald-500/30',
      accent: 'text-emerald-400',
      title: L('Verified Public Observation', 'சரிபார்க்கப்பட்ட பொதுப் பதிவு'),
      desc: L(
        'Observations ingested from government monitoring agencies: CGWB hydrographs, IMD catchment rainfall, and TNPCB water quality series.',
        'மத்திய நிலத்தடி நீர் வாரியம் (CGWB), இந்திய வானிலை ஆய்வு மையம் (IMD) மற்றும் TNPCB பதிவுகள்.'
      ),
    },
    {
      tier: 'TIER 2',
      provenance: 'HISTORICAL_REPORT' as const,
      border: 'border-cyan-500/30',
      accent: 'text-cyan-400',
      title: L('Historical Published Benchmark', 'வரலாற்று ஆய்வறிக்கை'),
      desc: L(
        'Peer-reviewed hydrogeological monographs and CPCB polluted-stretch reference benchmarks.',
        'அங்கீகரிக்கப்பட்ட அறிவியல் ஆய்வுகள் மற்றும் CPCB நதி மாசுப் பகுதி ஆவணங்கள்.'
      ),
    },
    {
      tier: 'TIER 3',
      provenance: 'MODEL_PREDICTION' as const,
      border: 'border-violet-500/30',
      accent: 'text-violet-400',
      title: L('Statistical Model Forecast', 'புள்ளிவிவரக் கணிப்பு'),
      desc: L(
        'Walk-forward seasonal projections and Robust Z-score outlier flags labeled explicitly with confidence bounds.',
        'நம்பிக்கை வரம்புகளுடன் கூடிய கணிப்புகளும் புள்ளிவிவர மாறுபாட்டுக் குறியீடுகளும்.'
      ),
    },
    {
      tier: 'TIER 4',
      provenance: 'COMMUNITY_REPORT' as const,
      border: 'border-amber-500/30',
      accent: 'text-amber-400',
      title: L('Community Incident Report', 'மக்கள் புகார் பதிவு'),
      desc: L(
        'Citizen-submitted observations undergoing field triage, with account privacy protected.',
        'பொதுமக்கள் அளிக்கும் புகார்கள் — தனிப்பட்ட தகவல்கள் பாதுகாக்கப்பட்டு கள சோதனைக்கு அனுப்பப்படும்.'
      ),
    },
    {
      tier: 'TIER 5',
      provenance: 'FIELD_VERIFIED' as const,
      border: 'border-teal-500/30',
      accent: 'text-teal-400',
      title: L('Field-Verified Inspection', 'களச் சரிபார்க்கப்பட்ட தரவு'),
      desc: L(
        'Logged field verification records with investigator checklists, sample status updates, and audit timestamps.',
        'கள ஆய்வு அதிகாரிகளின் சரிபார்ப்புப் பட்டியல் மற்றும் மாதிரி சோதனை விவரங்கள்.'
      ),
    },
    {
      tier: 'TIER 6',
      provenance: 'SYNTHETIC_DEMO' as const,
      border: 'border-stone-500/30',
      accent: 'text-stone-300',
      title: L('Synthetic Demo Safeguard', 'மாதிரி தரவுப் பாதுகாப்பு'),
      desc: L(
        'Test/demo fixtures are strictly separated and labeled — never disguised as genuine Palar Basin measurements.',
        'சோதனை மாதிரித் தரவுகள் எப்போதும் தனித்து அடையாளமிடப்படும்; உண்மை அளவீடுகளுடன் கலக்கப்படாது.'
      ),
    },
  ];

  const handleLaunchDemo = (demoMode: 'simple' | 'expert', demoLang: 'en' | 'ta', targetModule: string) => {
    setMode(demoMode);
    setLang(demoLang);
    onExplore(targetModule);
  };

  return (
    <div className="bg-transparent text-[#fcfbf7] overflow-x-clip selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ============================================================ */}
      {/* 1. CINEMATIC SCROLL-DRIVEN EARTH JOURNEY                     */}
      {/* ============================================================ */}
      <ScrollEarthJourney onExplore={onExplore} />

      {/* ============================================================ */}
      {/* 2. EDITORIAL INTRODUCTION & 6-STAGE PIPELINE                 */}
      {/* ============================================================ */}
      <section id="editorial" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-transparent">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full palar-surface-glass border border-emerald-500/35 text-xs font-mono text-emerald-300">
              {L('PALAR BASIN ENVIRONMENTAL INTELLIGENCE · TAMIL NADU', 'அறிவியல் முன்னறிவிப்பு & நதிப் பாதுகாப்பு')}
            </div>

            <h2 className="font-serif text-4xl sm:text-6xl font-semibold text-[#fcfbf7] tracking-tight leading-[1.08]">
              {lang === 'ta' ? (
                <>
                  நீரை அறிவோம். <span className="text-emerald-400">நாளைய தலைமுறையை காப்போம்.</span>
                </>
              ) : (
                <>
                  Understanding Water. <span className="text-emerald-400">Protecting Tomorrow.</span>
                </>
              )}
            </h2>

            <p className="text-sm sm:text-base text-[#c3d0c8] max-w-3xl mx-auto leading-relaxed">
              {L(
                'Built by Kayalvizhi J, Harini S, and Aarthi L at Chennai Institute of Technology, PALAR GUARD AI unifies groundwater, rainfall, water quality, document extraction, and citizen stewardship across the 17,810 km² Palar catchment.',
                'சென்னை இன்ஸ்டிடியூட் ஆஃப் டெக்னாலஜி குழுவினரால் உருவாக்கப்பட்ட பாலாறு காப்பாளர் AI, 17,810 ச.கி.மீ பாலாறு வடிநிலத்தின் நிலத்தடி நீர், மழைப்பொழிவு, நீர் தரம் மற்றும் மக்கள் புகார்களை ஒரே வெளிப்படையான தளத்தில் இணைக்கிறது.'
              )}
            </p>

            {/* 6-Stage Workflow Pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
              {workflowStages.map((stage, idx, arr) => (
                <React.Fragment key={stage.step}>
                  <button
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
                      activeStage === idx
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold'
                        : 'palar-surface-glass border-white/10 text-stone-300 hover:border-emerald-500/40'
                    }`}
                  >
                    <span className="text-[10px] text-[#d9c27a]">{stage.step}</span>
                    <span>{stage.name}</span>
                  </button>
                  {idx < arr.length - 1 && <span className="text-stone-500 select-none">→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Active Stage Banner */}
          <div className="p-6 sm:p-8 rounded-2xl palar-surface-glass border border-emerald-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-forest-md">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-[#d9c27a]">
                  {workflowStages[activeStage].step} · {workflowStages[activeStage].name}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#fcfbf7]">{workflowStages[activeStage].title}</h3>
              <p className="text-xs sm:text-sm text-[#b9c6be] leading-relaxed">{workflowStages[activeStage].desc}</p>
            </div>

            <div className="shrink-0 w-full md:w-64 p-5 rounded-xl bg-[#04100b]/80 border border-white/10 text-center space-y-3">
              <div className="text-[11px] font-mono uppercase text-[#8f9e95]">
                {L('Operational Scope', 'செயல்பாட்டு வரம்பு')}
              </div>
              <div className="text-lg font-bold text-emerald-300 tabular-nums">
                {workflowStages[activeStage].metric}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('expert');
                  onExplore(workflowStages[activeStage].target);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{L('Inspect in Console', 'பகுதியைத் திற')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 3 Core Basin Vulnerability Flip Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Reveal kind="fall" delay={0}>
              <FlipCard
                className="h-52"
                label={L('Groundwater stress card — flip for methodology', 'நிலத்தடி நீர் அழுத்த அட்டை — வழிமுறை பார்க்க திருப்பவும்')}
                frontClassName="border-teal-500/25 palar-surface-teal"
                backClassName="border-teal-400/50 bg-[#082628]/95"
                front={
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-mono text-teal-300">
                        <Droplets className="w-4 h-4" />
                        {L('GROUNDWATER STRESS', 'நிலத்தடி நீர் அழுத்தம்')}
                      </span>
                    </div>
                    <p className="text-xs text-[#c3d0c8] leading-relaxed">
                      {L(
                        'Tracks seasonal pre-monsoon drawdown vs post-monsoon recharge across CGWB monitoring stations.',
                        'CGWB கண்காணிப்பு நிலையங்களில் கோடைகால நீர்மட்ட வீழ்ச்சி மற்றும் பருவமழை மீளுருவாக்கத்தைக் கண்காணிக்கிறது.'
                      )}
                    </p>
                    <div className="text-[10px] font-mono text-[#d9c27a]">
                      {L('Hover or press Enter for methodology →', 'விவரங்களுக்கு மேல் நகர்த்தவும் →')}
                    </div>
                  </div>
                }
                back={
                  <div className="h-full flex flex-col justify-between">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-teal-300">
                      {L('Method & Provenance', 'முறை & ஆதாரம்')}
                    </div>
                    <p className="text-xs text-[#fcfbf7] leading-relaxed">
                      {L(
                        'Quarterly depth-to-water (mbgl) measurements compared against seasonal Q2 summer minima and Q4 recovery across Ranipet, Vellore, and Ambur.',
                        'ராணிப்பேட்டை, வேலூர் மற்றும் ஆம்பூர் நிலையங்களின் காலாண்டு ஆழ அளவீடுகள் பருவகால மீட்சியுடன் ஒப்பிடப்படுகின்றன.'
                      )}
                    </p>
                    <span className="text-[10px] font-mono text-teal-300">
                      {L('Source: CGWB Observation Network', 'ஆதாரம்: மத்திய நிலத்தடி நீர் வாரியம்')}
                    </span>
                  </div>
                }
              />
            </Reveal>

            <Reveal kind="fall" delay={0.07}>
              <FlipCard
                className="h-52"
                label={L('Monsoon concentration card — flip for recharge details', 'பருவமழைச் செறிவு அட்டை — விவரங்களுக்கு திருப்பவும்')}
                frontClassName="border-cyan-500/25 palar-surface-glass"
                backClassName="border-cyan-400/50 bg-[#08232d]/95"
                front={
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                        <CloudRain className="w-4 h-4" />
                        {L('MONSOON CONCENTRATION', 'பருவமழைச் செறிவு')}
                      </span>
                    </div>
                    <p className="text-xs text-[#c3d0c8] leading-relaxed">
                      {L(
                        'Separates Northeast and Southwest monsoon contributions to evaluate percolation and check-dam siting.',
                        'வடகிழக்கு மற்றும் தென்மேற்கு பருவமழைப் பங்களிப்புகளைப் பிரித்து நீர் செறிவூட்டல் வாய்ப்புகளை மதிப்பிடுகிறது.'
                      )}
                    </p>
                    <div className="text-[10px] font-mono text-[#d9c27a]">
                      {L('Hover or press Enter for hydrology context →', 'நீரியல் விவரங்களுக்கு அழுத்தவும் →')}
                    </div>
                  </div>
                }
                back={
                  <div className="h-full flex flex-col justify-between">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-300">
                      {L('Hydrological Context', 'நீரியல் சூழல்')}
                    </div>
                    <p className="text-xs text-[#fcfbf7] leading-relaxed">
                      {L(
                        'Northeast monsoon storms (Oct–Dec) supply the main recharge pulse into Palar river-bed alluvium and interconnected village eris.',
                        'வடகிழக்குப் பருவமழை (அக்–டிச) பாலாறு மணல் படுகைக்கும் ஏரித் தொடர்களுக்கும் முக்கிய நீர் ஆதாரமாகும்.'
                      )}
                    </p>
                    <span className="text-[10px] font-mono text-cyan-300">
                      {L('Source: IMD NWIC Rainfall Normals', 'ஆதாரம்: IMD மழைப்பொழிவுத் தரவு')}
                    </span>
                  </div>
                }
              />
            </Reveal>

            <Reveal kind="fall" delay={0.14}>
              <FlipCard
                className="h-52"
                label={L('Statistical screening card — flip for ethics protocol', 'புள்ளிவிவர ஆய்வு அட்டை — நெறிமுறை பார்க்க திருப்பவும்')}
                frontClassName="border-rose-500/25 palar-surface-amber"
                backClassName="border-amber-400/50 bg-[#221314]/95"
                front={
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-xs font-mono text-rose-300">
                        <AlertTriangle className="w-4 h-4" />
                        {L('STATISTICAL SCREENING', 'புள்ளிவிவர ஆய்வு')}
                      </span>
                    </div>
                    <p className="text-xs text-[#c3d0c8] leading-relaxed">
                      {L(
                        'Flags chemical outliers as investigation priorities requiring duplicate lab verification—never unverified claims.',
                        'இரசாயன அளவு மாறுபாடுகளை ஆய்வகச் சரிபார்ப்புக்கான முன்னுரிமைகளாக மட்டுமே குறிக்கிறது.'
                      )}
                    </p>
                    <div className="text-[10px] font-mono text-[#d9c27a]">
                      {L('Hover or press Enter for verification rule →', 'சரிபார்ப்பு விதியைப் பார்க்க →')}
                    </div>
                  </div>
                }
                back={
                  <div className="h-full flex flex-col justify-between">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
                      {L('Scientific Integrity Rule', 'அறிவியல் நேர்மை விதி')}
                    </div>
                    <p className="text-xs text-[#fcfbf7] leading-relaxed">
                      {L(
                        'Robust Z-score & IQR flags only trigger Kanban field verification; official contamination rulings require accredited TNPCB assay.',
                        'Z-மதிப்பு மாறுபாடுகள் கள ஆய்வை மட்டுமே தொடங்கும்; அதிகாரப்பூர்வ மாசு உறுதிப்படுத்தலுக்கு ஆய்வகப் பரிசோதனை அவசியம்.'
                      )}
                    </p>
                    <span className="text-[10px] font-mono text-rose-300">
                      {L('Protocol: Evidence Before Attribution', 'நெறிமுறை: ஆதாரத்திற்குப் பின்னரே முடிவு')}
                    </span>
                  </div>
                }
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SIX INTELLIGENCE DIMENSIONS (RESTORED ORIGINAL BENTO)     */}
      {/* ============================================================ */}
      <section id="capabilities" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-transparent">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full palar-surface-glass border border-teal-500/35 text-xs font-mono text-teal-300">
              {L('SECTION 03 · CORE CAPABILITIES', 'பிரிவு 03 · முக்கியத் திறன்கள்')}
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#fcfbf7] tracking-tight">
              {L('Six Intelligence Dimensions.', 'ஆறு சுற்றுச்சூழல் நுண்ணறிவுப் பரிமாணங்கள்.')}
            </h2>
            <p className="text-sm sm:text-base text-[#b9c6be]">
              {L(
                'Purpose-built modules for environmental analysts, hydrogeologists, field investigators, and communities.',
                'சுற்றுச்சூழல் ஆய்வாளர்கள், நீரியல் வல்லுநர்கள், கள அதிகாரிகள் மற்றும் பொதுமக்களுக்கான சிறப்புப் பிரிவுகள்.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <Reveal key={cap.id} kind="rise" delay={idx * 0.05}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('expert');
                      onExplore(cap.id);
                    }}
                    className={`w-full h-full text-left p-6 rounded-2xl border transition-all space-y-3.5 group ${cap.accent}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/10 group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[#fcfbf7]">{cap.title}</h3>
                    <p className="text-xs text-[#c5d1ca] leading-relaxed">{cap.desc}</p>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. THE EIGHT-STAGE TIMELINE (THE JOURNEY OF PALAR GUARD AI)  */}
      {/* ============================================================ */}
      <VerticalFallingTimeline onExplore={onExplore} />

      {/* ============================================================ */}
      {/* 5. WORKSPACES & LIVE BASIN DIGITAL TWIN PREVIEW              */}
      {/* ============================================================ */}
      <section id="platform-preview" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-transparent">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Reveal kind="left">
              <div className="rounded-2xl border border-emerald-500/30 palar-surface-glass p-7 h-full flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-emerald-300">
                      <Users className="w-4 h-4" />
                      {L('COMMUNITY WORKSPACE', 'மக்கள் பயன்பாட்டுப் பகுதி')}
                    </span>
                    <span className="text-[11px] font-mono text-[#b9c6be]">English & தமிழ்</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#fcfbf7]">
                    {L('Clear Water Guidance & Citizen Reporting', 'எளிய நீர் வழிகாட்டி & மக்கள் புகார் தளம்')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#b9c6be] leading-relaxed">
                    {L(
                      'For residents, farmers, and students: check local water status without dense scientific charts, submit geotagged concerns, track reports, and follow conservation guidance.',
                      'விவசாயிகள், மாணவர்கள் மற்றும் பொதுமக்களுக்காக: சிக்கலான வரைபடங்கள் இன்றி உங்கள் ஊர் நீர் நிலை, குடிநீர் பாதுகாப்பு மற்றும் புகார் நிலையைப் பாருங்கள்.'
                    )}
                  </p>
                  <ul className="space-y-2 text-xs text-[#fcfbf7]">
                    {[
                      L('Water Near You & Understand Your Water', 'உங்கள் பகுதி நீர் நிலை & எளிய விளக்கம்'),
                      L('Report Water Issue & Track Status Updates', 'நீர் பிரச்சனை புகார் & நிலை கண்காணிப்பு'),
                      L('Public Alerts, Community Updates & Conservation Tips', 'பொது எச்சரிக்கைகள் & நீர் சேமிப்பு வழிகாட்டி'),
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('simple');
                    onExplore('dashboard');
                  }}
                  className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs font-semibold transition-colors"
                >
                  {L('Open Community Workspace', 'மக்கள் பலகம் திற')}
                </button>
              </div>
            </Reveal>

            <Reveal kind="right">
              <div className="rounded-2xl border border-[#d9c27a]/35 palar-surface-amber p-7 h-full flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-[#d9c27a]">
                      <Compass className="w-4 h-4" />
                      {L('PROFESSIONAL WORKSPACE', 'தொழில்முறை ஆய்வுப் பகுதி')}
                    </span>
                    <span className="text-[11px] font-mono text-[#b9c6be]">RBAC Enforced</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#fcfbf7]">
                    {L('13 Dedicated Modules & Document Intelligence', '13 சிறப்பு ஆய்வுப் பிரிவுகள் & ஆவண நுண்ணறிவு')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#b9c6be] leading-relaxed">
                    {L(
                      'Distinct GIS mapping, ivory laboratory water quality assays, MCDA ranking, Kanban field verification, watchlists, and document extraction studios.',
                      'புவிசார் வரைபடம், ஆய்வகத் தரப் பகுப்பாய்வு, கான்பன் கள சரிபார்ப்பு மற்றும் ஆவண நுண்ணறிவு ஆகியவை தனித்தனி வடிவமைப்புடன்.'
                    )}
                  </p>
                  <ul className="space-y-2 text-xs text-[#fcfbf7]">
                    {[
                      L('Document Intelligence: PDF, DOCX, CSV, XLSX, TXT extraction & Tamil translation', 'ஆவண நுண்ணறிவு: PDF, DOCX, CSV, XLSX பிரித்தெடுத்தல் & தமிழ் மொழிபெயர்ப்பு'),
                      L('Kanban Field Verification & Role-Protected Audit Console', 'கள ஆய்வு கான்பன் பலகை & தணிக்கை நிர்வாகம்'),
                      L('Saved Location Watchlist, MCDA Ranking & Dossier Export', 'கண்காணிப்பு பட்டியல், இடர் தரவரிசை & அறிக்கை ஏற்றுமதி'),
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <FileSearch className="w-4 h-4 text-[#d9c27a] shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('expert');
                    onExplore('dashboard');
                  }}
                  className="w-full py-3 rounded-xl border border-[#d9c27a]/60 text-[#fcfbf7] hover:bg-[#d9c27a]/10 text-xs font-semibold transition-colors"
                >
                  {L('Open Professional Console', 'தொழில்முறை பலகம் திற')}
                </button>
              </div>
            </Reveal>
          </div>

          {/* Interactive Live Digital Twin Map (natural height, zero clipped overflow) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-teal-300">
                  {L('LIVE GEOSPATIAL EXPLORER', 'நேரடி புவிசார் வரைபடம்')}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#fcfbf7]">
                  {L('Palar Basin Digital Twin (7 Stations)', 'பாலாறு வடிநில டிஜிட்டல் இரட்டை (7 நிலையங்கள்)')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMode('expert');
                  onExplore('digital_twin');
                }}
                className="px-4 py-2 rounded-xl bg-teal-950/80 border border-teal-500/35 text-xs font-medium text-teal-200 hover:bg-teal-900/60 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{L('Open Full Basin Explorer', 'முழு வரைபடம் திற')}</span>
                <Compass className="w-3.5 h-3.5" />
              </button>
            </div>
            <DigitalTwinMap onSelectLocation={() => onExplore('groundwater')} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. BUILT FOR EVERY STAKEHOLDER & TAMIL ACCESSIBILITY         */}
      {/* ============================================================ */}
      <section id="stakeholders" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-transparent">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full palar-surface-glass border border-cyan-500/30 text-xs font-mono text-cyan-300">
              {L('SECTION 05 · BUILT FOR EVERY STAKEHOLDER', 'பிரிவு 05 · அனைத்துப் பயனர்களுக்கும்')}
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#fcfbf7]">
              {L('Across Every Reach of the Palar Basin.', 'பாலாறு வடிநிலத்தின் ஒவ்வொரு பகுதிக்கும்.')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stakeholders.map((st, idx) => {
              const Icon = st.icon;
              return (
                <Reveal key={st.title} kind="fall" delay={idx * 0.04}>
                  <div className="p-6 rounded-2xl palar-surface-glass border border-white/[0.08] hover:border-emerald-500/35 transition-colors space-y-3 h-full flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${st.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-base font-bold text-[#fcfbf7]">{st.title}</h4>
                      <p className="text-xs text-[#b9c6be] leading-relaxed">{st.desc}</p>
                    </div>
                    <div className="pt-2 text-[11px] font-mono text-[#d9c27a] border-t border-white/[0.06]">
                      {st.role}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* Bilingual Tamil AI Highlight Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center pt-2">
            <div className="p-6 sm:p-7 rounded-2xl palar-surface-glass border border-violet-500/25 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-950/80 border border-violet-400/40 flex items-center justify-center text-violet-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#fcfbf7]">
                      {L('PALAR AI — Bilingual Voice & Tamil Companion', 'PALAR AI — உங்கள் தமிழ் நீர் உதவியாளர்')}
                    </h4>
                    <p className="text-[11px] text-[#a4b2a9]">
                      {L('Grounded bilingual Q&A in English & தமிழ்', 'ஆங்கிலம் மற்றும் தமிழில் ஆதாரப்பூர்வமான பதில்கள்')}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-violet-950 text-[10px] font-mono text-violet-200 border border-violet-500/30">
                  தமிழ் / EN
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-black/35 border border-white/[0.06] text-stone-200">
                  <span className="text-emerald-300 font-semibold block mb-1">
                    {L('Sample Tamil Query:', 'மாதிரி தமிழ் கேள்வி:')}
                  </span>
                  "ராணிப்பேட்டை பகுதியில் நிலத்தடி நீர் நிலை எப்படி இருக்கிறது? மழை போதுமானதாக உள்ளதா?"
                </div>
                <div className="p-3.5 rounded-xl bg-[#09241a]/85 border border-emerald-500/30 text-stone-200 space-y-1.5">
                  <span className="text-emerald-300 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {L('Grounded Database Response [VERIFIED_PUBLIC]:', 'தரவுத்தளப் பதில் [VERIFIED_PUBLIC]:')}
                  </span>
                  <p className="leading-relaxed">
                    "ராணிப்பேட்டை கண்காணிப்பு நிலையப் பதிவுகளின்படி கோடைக்கால நீர்மட்டம் ஆழமாக உள்ளது; ஆய்வக சோதனை இல்லாமல் மாசு உறுதிப்படுத்தப்படாது."
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: CheckCircle2,
                  color: 'bg-emerald-950 text-emerald-400',
                  title: L('Full Bilingual Localization', 'முழுமையான தமிழ் & ஆங்கில இடைமுகம்'),
                  desc: L(
                    'All navigation, legends, KPI telemetry, community reporting forms, and Document Intelligence summaries switch seamlessly between English and தமிழ்.',
                    'வரைபடக் குறியீடுகள், எச்சரிக்கைகள், படிவங்கள் மற்றும் ஆவணப் பகுப்பாய்வு அனைத்தும் தமிழ் மற்றும் ஆங்கிலத்தில் இயங்குகின்றன.'
                  ),
                },
                {
                  icon: FileText,
                  color: 'bg-cyan-950 text-cyan-400',
                  title: L('Document Translation to Tamil', 'ஆவணங்களின் தமிழ் விளக்கம்'),
                  desc: L(
                    'Upload technical hydrology CSV/PDF documents and generate plain-language Tamil summaries alongside source citations.',
                    'தொழில்நுட்ப அறிக்கைகளைப் பதிவேற்றி எளிய தமிழில் ஆதாரங்களுடன் கூடிய விளக்கங்களைப் பெறலாம்.'
                  ),
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="p-4 rounded-xl palar-surface-glass border border-white/[0.08] flex items-start gap-3.5">
                    <div className={`p-2 rounded-lg shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#fcfbf7]">{item.title}</h4>
                      <p className="text-xs text-[#b9c6be] mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. ABOUT & DATA METHODOLOGY (PROVENANCE & LIMITATIONS)       */}
      {/* ============================================================ */}
      <section id="trust-data" className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-transparent">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full palar-surface-glass border border-[#d9c27a]/35 text-xs font-mono text-[#d9c27a]">
              {L('SECTION 07 · ABOUT & DATA METHODOLOGY', 'பிரிவு 07 · தரவு வழிமுறை & வெளிப்படைத்தன்மை')}
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#fcfbf7]">
              {L('Every Metric Has an Audit Trail.', 'ஒவ்வொரு அளவீட்டிற்கும் தெளிவான ஆதாரம்.')}
            </h2>
            <p className="text-xs sm:text-sm text-[#b9c6be] leading-relaxed">
              {L(
                'PALAR GUARD AI aligns hydrology dashboards with CGWB groundwater monitoring, IMD rainfall normals, and BIS 10500 / CPCB Class C water-quality criteria. Where live agency telemetry is not linked, interactive views use an illustrative, internally consistent demonstration dataset rather than verified real-time sensor feeds.',
                'PALAR GUARD AI தளத்தின் பகுப்பாய்வுகள் CGWB நிலத்தடி நீர் அளவீடுகள், IMD மழைப்பொழிவு இயல்புகள் மற்றும் BIS 10500 / CPCB தரநிலைகளை அடிப்படையாகக் கொண்டவை. நேரடித் தரவு இணைக்கப்படாத இடங்களில் சீரான மாதிரித் தரவுத்தொகுப்பு விளக்கத்திற்காகப் பயன்படுத்தப்படுகிறது.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {provenanceTiers.map((tItem, idx) => (
              <Reveal key={tItem.tier} kind="rise" delay={idx * 0.04}>
                <div className={`p-5 rounded-2xl palar-surface-glass border ${tItem.border} space-y-2.5 h-full`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${tItem.accent}`}>{tItem.tier}</span>
                    <DataBadge provenance={tItem.provenance} />
                  </div>
                  <h4 className="text-sm font-bold text-[#fcfbf7]">{tItem.title}</h4>
                  <p className="text-xs text-[#b9c6be] leading-relaxed">{tItem.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Bilingual Walkthroughs */}
      <HowToUseSection onLaunchDemo={handleLaunchDemo} />

      {/* ============================================================ */}
      {/* 9. CLOSING CALL TO ACTION                                    */}
      {/* ============================================================ */}
      <section className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 bg-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-6 palar-surface-glass border border-white/10 rounded-3xl p-8 sm:p-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d9c27a]/40 bg-[#061811]/90 px-4 py-1 text-xs font-mono text-[#d9c27a]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{L('CHENNAI INSTITUTE OF TECHNOLOGY · PALAR BASIN INITIATIVE', 'சென்னை இன்ஸ்டிடியூட் ஆஃப் டெக்னாலஜி · பாலாறு வடிநில முயற்சி')}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-semibold text-[#fcfbf7] leading-tight">
            {L('See the Risk. Predict the Change. Protect Every Drop.', 'ஆபத்தை அறிவோம். மாற்றத்தைக் கணிப்போம். ஒவ்வொரு துளியையும் காப்போம்.')}
          </h2>

          <p className="text-sm sm:text-base text-[#b9c6be] max-w-2xl mx-auto">
            {L(
              'Explore the Community Portal in English or Tamil, or open the Professional Console to inspect data provenance, analyze uploaded reports, and track field verification.',
              'தமிழ் அல்லது ஆங்கிலத்தில் மக்கள் பலகத்தைப் பயன்படுத்தவும் அல்லது ஆவண நுண்ணறிவு மற்றும் கள ஆய்வுகளைப் பார்க்க தொழில்முறை பலகத்தைத் திறக்கவும்.'
            )}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setMode('simple');
                onExplore('dashboard');
              }}
              className="px-7 py-3 rounded-full bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors"
            >
              <span>{L('Open Community Workspace', 'மக்கள் பலகம் திற')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('expert');
                onExplore('dashboard');
              }}
              className="px-7 py-3 rounded-full border border-[#d9c27a]/60 text-[#fcfbf7] hover:bg-[#d9c27a]/10 text-xs sm:text-sm font-semibold transition-colors"
            >
              {L('Open Professional Console', 'தொழில்முறை பலகம் திற')}
            </button>

            {onOpenPresentation && (
              <button
                type="button"
                onClick={onOpenPresentation}
                className="px-6 py-3 rounded-full border border-white/15 text-[#c3d0c8] hover:text-[#fcfbf7] text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Award className="w-4 h-4 text-[#d9c27a]" />
                <span>{L('Launch Guided Overview', 'வழிகாட்டுதல் காட்சி')}</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
