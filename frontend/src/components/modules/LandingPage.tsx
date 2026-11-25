import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CinematicHeroSequence } from '../hero/CinematicHeroSequence';
import { DigitalTwinMap } from './DigitalTwinMap';
import { DataBadge } from '../common/DataBadge';
import { BokehParticleGalaxy } from '../effects/BokehParticleGalaxy';
import { 
  ArrowRight, ShieldCheck, ShieldAlert, Droplets, AlertTriangle, Layers, 
  Search, Eye, Activity, Database, CheckCircle2, FileText, 
  Users, MapPin, Compass, ExternalLink, ChevronRight, Cpu, 
  LineChart, CloudRain, Award, BookOpen, GraduationCap, Building2, Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onExplore: (module?: string) => void;
  onOpenPresentation?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExplore, onOpenPresentation }) => {
  const { t, lang } = useLanguage();
  const [activeStage, setActiveStage] = useState<number>(0);

  const workflowStages = [
    {
      step: "01",
      name: lang === 'ta' ? "கண்காணி" : "OBSERVE",
      title: lang === 'ta' ? "படுகை அளவிலான விரிவான தரவு சேகரிப்பு" : "Comprehensive Basin Data Harvesting",
      desc: lang === 'ta' ? "மத்திய நிலத்தடி நீர் வாரியம் (CGWB) கிணறுகள், இந்திய வானிலை ஆய்வு மையம் (IMD) மழைப் பதிவுகள் மற்றும் TNPCB நீர் தரக் கண்காணிப்பு தரவுகளை ஒருங்கிணைத்தல்." : "Aggregate quarterly groundwater hydrographs from CGWB observation wells, IMD NWIC precipitation series, and TNPCB water-quality surveillance records.",
      metric: lang === 'ta' ? "7 அடிப்படைக் கண்காணிப்பு நிலையங்கள்" : "7 Baseline Stations",
      provenance: "VERIFIED_PUBLIC" as const
    },
    {
      step: "02",
      name: lang === 'ta' ? "பகுப்பாய்" : "ANALYSE",
      title: lang === 'ta' ? "பருவகால நீர்மட்ட குறைவு & இரசாயன அழுத்த பகுப்பாய்வு" : "Seasonal Drawdown & Ionic Stress Profiling",
      desc: lang === 'ta' ? "ஆண்டுதோறும் குறையும் நீர் மட்டம் (மீட்டர்/ஆண்டு) மற்றும் BIS 10500 / CPCB வழிகாட்டுதல்களின்படி குரோமியம் மற்றும் TDS அளவுகளை மதிப்பிடுதல்." : "Compute multi-year moving averages, rate of water-table depletion (m/year), and cross-index Total Chromium and TDS against BIS 10500 and CPCB Class C standards.",
      metric: lang === 'ta' ? "14.9 mbgl சராசரி ஆழம்" : "14.9 mbgl Mean Depth",
      provenance: "HISTORICAL_REPORT" as const
    },
    {
      step: "03",
      name: lang === 'ta' ? "கணித்தறி" : "PREDICT",
      title: lang === 'ta' ? "முன்னோக்கு நிலத்தடி நீர்மட்ட கணிப்பு மாதிரிகள்" : "Walk-Forward Water Table Projections",
      desc: lang === 'ta' ? "அடுத்த 4 காலாண்டுகளுக்கான கோடைகால நீர்மட்ட குறைவை 90% அறிவியல் துல்லியத்துடன் முன்கூட்டியே கணித்தல்." : "Seasonal baseline models project pre-monsoon drawdown across 4 upcoming quarters with empirical 90% confidence uncertainty intervals.",
      metric: lang === 'ta' ? "17.0 mbgl கணிக்கப்பட்ட ஆழம்" : "17.0 mbgl Projected (±1.2m)",
      provenance: "MODEL_PREDICTION" as const
    },
    {
      step: "04",
      name: lang === 'ta' ? "முன்னுரிமைபடுத்து" : "PRIORITISE",
      title: lang === 'ta' ? "விளக்கக்கூடிய பல-அளவுகோல் இடர் தரவரிசை" : "Explainable Multi-Criteria Risk Ranking",
      desc: lang === 'ta' ? "நிலத்தடி நீர் அழுத்தம் (30%), நீர் தரம் (35%), மழைப்பொழிவு பற்றாக்குறை (15%) மற்றும் நம்பகத்தன்மை (10%) ஆகியவற்றை இணைத்து 0–100 குறியீடாக கணக்கிடுதல்." : "Synthesize groundwater stress (30%), water quality (35%), rainfall deficit (15%), observation recency (10%), and data confidence (10%) into an objective 0–100 index.",
      metric: lang === 'ta' ? "ராணிப்பேட்டை முதலிடம் (78.5/100)" : "Ranipet #1 (78.5/100)",
      provenance: "MODEL_PREDICTION" as const
    },
    {
      step: "05",
      name: lang === 'ta' ? "சரிபார்" : "VERIFY",
      title: lang === 'ta' ? "கள ஆய்வு & புள்ளிவிவர இடர் சரிபார்ப்பு" : "Rigorous Provenance & Anomaly Triage",
      desc: lang === 'ta' ? "Median Absolute Deviation (MAD) வலுவான Z-மதிப்புகளைக் கொண்டு கள ஆய்வுக்கு முன்னுரிமை அளித்து ஆய்வு செய்தல்." : "Screen parameters using Median Absolute Deviation (MAD) Robust Z-scores to flag chemical surges for field verification rather than unverified legal accusations.",
      metric: "Robust Z = 3.84",
      provenance: "MODEL_PREDICTION" as const
    },
    {
      step: "06",
      name: lang === 'ta' ? "செயல்படுத்து" : "ACT",
      title: lang === 'ta' ? "கள ஆய்வு & நிலத்தடி நீர் மறுசுழற்சி தீர்வுகள்" : "Field Investigation & Managed Aquifer Recharge",
      desc: lang === 'ta' ? "கள ஆய்வுக் குழுக்களை அனுப்புதல், தடுப்பணைகள், ஊடுருவல் கிணறுகள் மற்றும் பாரம்பரிய ஏரிகளை தூர்வாரும் இடங்களை அடையாளம் காணுதல்." : "Dispatch field inspection teams with duplicate sample checklists while identifying optimal alluvium zones for check dams, percolation tanks, and traditional eri desiltation.",
      metric: lang === 'ta' ? "ஆய்வுக் குழு அனுப்பப்பட்டது" : "Team Alpha Dispatched",
      provenance: "VERIFIED_PUBLIC" as const
    }
  ];

  const journeyMilestones = [
    {
      num: "01",
      phase: "THE PROBLEM",
      title: lang === 'ta' ? "கடும் நிலத்தடி நீர் வீழ்ச்சி & இரசாயன அழுத்தம்" : "Acute Groundwater Depletion & Industrial Stress",
      period: "Field Observations 2020–2022",
      desc: lang === 'ta' 
        ? "ராணிப்பேட்டை, ஆம்பூர் மற்றும் வாணியம்பாடியில் கடுமையான கோடை காலங்களில் நீர்மட்டம் 14.9 மீட்டருக்கும் ஆழமாக குறைந்து, கிணறுகள் வறண்டு போவது கண்டறியப்பட்டது."
        : "Field reconnaissance across Ranipet, Ambur, and Vaniyambadi revealed pre-monsoon water tables plunging deeper than 14.9 mbgl, causing dry borewells and acute ionic stress in domestic supplies.",
      badge: "GROUND REALITY",
      metric: "14.9 mbgl Drawdown"
    },
    {
      num: "02",
      phase: "RESEARCH",
      title: lang === 'ta' ? "பாலாற்று படுகை ஹைட்ரோஜியோலஜி ஆய்வு" : "Palar River Basin Hydrogeological Research",
      period: "Scientific Literature & Archives",
      desc: lang === 'ta'
        ? "17,810 ச.கி.மீ நீர்ப்பிடிப்பு பகுதி, சார்னோகைட் பாறை அமைப்புகள் மற்றும் CPCB முன்னுரிமை-V நதிப் பகுதிகள் குறித்த விரிவான அறிவியல் ஆய்வு."
        : "Comprehensive investigation of the 17,810 km² catchment area, weathered charnockite fissured aquifers, and CPCB Priority-V polluted river stretches published in hydrogeochemical bulletins.",
      badge: "VERIFIED ARCHIVES",
      metric: "17,810 km² Catchment"
    },
    {
      num: "03",
      phase: "OBSERVATION",
      title: lang === 'ta' ? "பல மூலத் தரவு ஒருங்கிணைப்பு" : "Multi-Source Telemetry Integration",
      period: "Data Infrastructure",
      desc: lang === 'ta'
        ? "மத்திய நிலத்தடி நீர் வாரியம் (CGWB) கிணறு தரவுகள், IMD மழைப்பொழிவு பதிவுகள் மற்றும் TNPCB நீர் தர பகுப்பாய்வுகளை ஒரே அமைப்பில் இணைத்தல்."
        : "Automated ingestion pipeline unifying quarterly CGWB observation well hydrographs, IMD NWIC precipitation series, and TNPCB ionic surveillance assays across 7 baseline river stations.",
      badge: "LIVE INGESTION",
      metric: "7 Baseline Stations"
    },
    {
      num: "04",
      phase: "INTELLIGENCE",
      title: lang === 'ta' ? "முன்னோக்கு கணிப்பு & வலுவான புள்ளிவிவர மாதிரிகள்" : "Walk-Forward Forecasting & Robust MAD Screening",
      period: "AI & ML Architecture",
      desc: lang === 'ta'
        ? "90% நம்பிக்கை இடைவெளியுடன் 4 காலாண்டுகளுக்கான நீர்மட்ட கணிப்பு மற்றும் Median Absolute Deviation கொண்டு துல்லியமான மாறுபாடுகளைக் கண்டறிதல்."
        : "Built explainable walk-forward seasonal models with ±1.2m empirical confidence intervals and Median Absolute Deviation (MAD) robust Z-score screening to avoid skew from pollution surges.",
      badge: "ALGORITHMIC CORE",
      metric: "MAD Z-Score = 3.84"
    },
    {
      num: "05",
      phase: "PRIORITISATION",
      title: lang === 'ta' ? "விளக்கக்கூடிய பல-அளவுகோல் இடர் தரவரிசை" : "Multi-Criteria Decision Prioritisation",
      period: "MCDA Framework",
      desc: lang === 'ta'
        ? "நீர்மட்ட அழுத்தம், நீர் தரம், மழை பற்றாக்குறை ஆகிய 5 காரணிகளை கொண்டு 0–100 இடர் மதிப்பெண் வழங்கி கள ஆய்வுக்கு முன்னுரிமை அளித்தல்."
        : "Engineered objective weighted index synthesizing groundwater stress (30%), water quality (35%), and rainfall deficits (15%) to rank stretches; Ranipet prioritized at 78.5/100.",
      badge: "DECISION SUPPORT",
      metric: "Rank #1: Ranipet 78.5"
    },
    {
      num: "06",
      phase: "VERIFICATION",
      title: lang === 'ta' ? "கள ஆய்வு & சான்று சரிபார்ப்பு பணிப்பாய்வு" : "Field Verification & Evidence Workflows",
      period: "Operational Protocol",
      desc: lang === 'ta'
        ? "கள ஆய்வாளர்களுக்கு பணி ஒதுக்கீடு, இரட்டை மாதிரி சேகரிப்பு மற்றும் மாற்ற முடியாத தணிக்கை பதிவேடு மூலம் நம்பகத்தன்மையை உறுதி செய்தல்."
        : "Integrated dispatcher assigning field inspection checklists, mobile spectrophotometer duplicate sampling, and immutable audit logs to verify anomalies before public advisories.",
      badge: "AUDITABLE INTEGRITY",
      metric: "100% Provenance Badges"
    },
    {
      num: "07",
      phase: "ACTION",
      title: lang === 'ta' ? "மறுசுழற்சி & தடுப்பணை திட்டமிடல்" : "Managed Aquifer Recharge (MAR) Interventions",
      period: "Engineering Decision Siting",
      desc: lang === 'ta'
        ? "மழைநீரை பூமிக்குள் செலுத்தும் தடுப்பணைகள், செறிவூட்டும் கிணறுகள் மற்றும் ஊடுருவல் குளங்களுக்கான இடம் தேர்வு செய்யும் வழிகாட்டி."
        : "Site suitability scoring based on soil permeability, hydraulic gradient, and aquifer storage, directing check dams and infiltration shafts to maximize post-monsoon water replenishment.",
      badge: "GROUND ACTION",
      metric: "84% Suitability Score"
    },
    {
      num: "08",
      phase: "THE FUTURE",
      title: lang === 'ta' ? "மக்கள் பங்களிப்பு & எதிர்கால நதி பாதுகாப்பு" : "Decentralized Public Participation & Scalable Future",
      period: "2026 & Beyond",
      desc: lang === 'ta'
        ? "விவசாயிகள் மற்றும் பொதுமக்கள் நேரடியாக நீர் பிரச்சனைகளை பதிவு செய்யும் மக்கள் பலகம் மற்றும் தமிழ் வழிகாட்டி மூலம் பாலாற்றை மீட்டெடுக்கும் கூட்டு முயற்சி."
        : "Empowering basin communities through Community Access portal, bilingual educational resources, and transparent environmental intelligence to protect every drop.",
      badge: "CITIZEN STEWARDSHIP",
      metric: "Palar Basin Protected"
    }
  ];

  return (
    <div className="bg-[#020905] text-[#f4f7f5] overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* ============================================================ */}
      {/* 1. CINEMATIC 6-SCENE FULL-SCREEN ANIMATED HERO */}
      {/* ============================================================ */}
      <CinematicHeroSequence 
        onExplore={onExplore}
        onOpenPresentation={onOpenPresentation}
      />

      {/* ============================================================ */}
      {/* SECTION 1 — THE CHALLENGE */}
      {/* ============================================================ */}
      <section id="challenge" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#04120a]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {lang === 'ta' ? 'பிரிவு 01 · நீர்வள பாதிப்புகள்' : 'SECTION 01 · HYDROLOGICAL VULNERABILITY'}
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {lang === 'ta' ? (
                <>
                  நீர் இடர்கள் மாறுகின்றன. <br />
                  <span className="text-[#2ad58b]">நுண்ணறிவு மேம்பட வேண்டும்.</span>
                </>
              ) : (
                <>
                  Water risks are changing. <br />
                  <span className="text-[#2ad58b]">Intelligence must evolve.</span>
                </>
              )}
            </h2>
            <p className="text-base text-stone-300 leading-relaxed font-normal">
              {lang === 'ta'
                ? 'பாலாறு நதிப்படுகை (17,810 ச.கி.மீ) தமிழ்நாட்டின் முக்கிய விவசாயம், குடிநீர் மற்றும் தொழிற்துறை தேவைகளை பூர்த்தி செய்கிறது. கோடை வறட்சி, தீவிர நிலத்தடி நீர் உறிஞ்சுதல் மற்றும் தொழிற்சாலை கழிவுகளால் ஏற்படும் அழுத்தங்களை எதிர்கொள்ள முன்கூட்டிய துல்லிய நுண்ணறிவு அவசியமாகிறது.'
                : 'The Palar River Basin (17,810 km²) sustains critical agriculture, municipal water supplies, and industrial hubs across Tamil Nadu. Unprecedented pressure from seasonal drought, heavy alluvium extraction, and effluent discharge demands predictive, location-specific intelligence.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Groundwater Stress Card */}
            <div className="p-8 rounded-2xl bg-[#071d13] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/90 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Severe Groundwater Drawdown</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                CGWB long-term monitoring records show water levels in Ranipet and Ambur regularly plunging below 14.9 mbgl in summer months. Over-extraction from shallow unconfined alluvium rapidly depletes community and agricultural borewells.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-400 border-t border-white/[0.06]">
                <span>Rate: -0.6 m / year</span>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
            </div>

            {/* Changing Rainfall Patterns Card */}
            <div className="p-8 rounded-2xl bg-[#071d13] border border-white/[0.08] hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <CloudRain className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Monsoon Concentration & Deficit</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                The Palar Catchment receives 980 mm of annual rainfall, with over 55% crammed into short, high-intensity storms during the October–November Northeast Monsoon. High surface runoff limits natural infiltration without dedicated artificial recharge structures.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-400 border-t border-white/[0.06]">
                <span>NE Monsoon: 55%</span>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
            </div>

            {/* Water Quality & Chemical Anomaly Card */}
            <div className="p-8 rounded-2xl bg-[#071d13] border border-white/[0.08] hover:border-red-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-950/90 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Water Quality & Chemical Stress</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Industrial tannery effluent historical discharges across the Vaniyambadi–Ranipet stretch cause elevated Total Dissolved Solids (&gt;1850 mg/L) and Total Chromium surges (&gt;0.05 mg/L limit), classified as CPCB Priority-V restoration corridor.
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-stone-400 border-t border-white/[0.06]">
                <span>CPCB Priority-V</span>
                <DataBadge provenance="HISTORICAL_REPORT" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 2 — OUR INTELLIGENCE (6-STAGE WORKFLOW) */}
      {/* ============================================================ */}
      <section id="intelligence" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#020d07]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              SECTION 02 · SYSTEM ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              One Basin. <span className="text-[#2ad58b]">Connected Intelligence.</span>
            </h2>
            <p className="text-base text-stone-300">
              Transforming fragmented records into structured, verifiable, and explainable decision intelligence across six interconnected stages.
            </p>
          </div>

          {/* 6 Stage Interactive Rail */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {workflowStages.map((stage, sIdx) => {
              const isSelected = activeStage === sIdx;
              return (
                <div
                  key={sIdx}
                  onClick={() => setActiveStage(sIdx)}
                  className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between text-left ${
                    isSelected 
                      ? 'bg-[#0a2f1e] border-2 border-[#2ad58b] shadow-emerald-glow' 
                      : 'bg-[#05170e] border border-white/[0.08] hover:border-emerald-500/30'
                  }`}
                >
                  <div>
                    <div className="text-xs font-mono font-bold text-emerald-400 mb-1">{stage.step}</div>
                    <h4 className="text-sm font-bold text-white tracking-wide">{stage.name}</h4>
                  </div>
                  <div className="mt-4 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>{stage.metric}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Stage Deep-Dive Card */}
          <div className="p-8 rounded-2xl bg-[#061e12] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-8 shadow-forest-lg">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400">STAGE {workflowStages[activeStage].step}</span>
                <span className="text-stone-500">·</span>
                <span className="text-xs font-mono uppercase text-stone-300">{workflowStages[activeStage].name}</span>
                <DataBadge provenance={workflowStages[activeStage].provenance} />
              </div>
              <h3 className="text-2xl font-bold text-white">{workflowStages[activeStage].title}</h3>
              <p className="text-sm text-stone-300 leading-relaxed">{workflowStages[activeStage].desc}</p>
            </div>

            <div className="shrink-0 p-6 rounded-xl bg-[#020b06] border border-white/10 text-center min-w-[220px]">
              <div className="text-xs font-mono text-stone-400 mb-1">Key Operational Output</div>
              <div className="text-xl font-extrabold text-emerald-400 font-sans tabular-nums mb-3">
                {workflowStages[activeStage].metric}
              </div>
              <button
                onClick={() => onExplore('dashboard')}
                className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect in Console</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 3 — OUR CAPABILITIES (6 BENTO FEATURES) */}
      {/* ============================================================ */}
      <section id="capabilities" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#04120a]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              SECTION 03 · CORE CAPABILITIES
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Six Intelligence Dimensions.
            </h2>
            <p className="text-base text-stone-300">
              Built for environmental analysts, hydrogeologists, field investigators, and policy makers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Groundwater Intelligence */}
            <div 
              onClick={() => onExplore('groundwater')}
              className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Droplets className="w-5 h-5" />
                </div>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                1. Groundwater Intelligence
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Multi-year quarterly hydrographs from CGWB national hydrograph network wells tracking water table elevation, seasonal recharge amplitude, and specific yield dynamics.
              </p>
            </div>

            {/* 2. Rainfall Response Analysis */}
            <div 
              onClick={() => onExplore('rainfall')}
              className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-cyan-500/40 cursor-pointer transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-cyan-950/90 border border-cyan-500/30 text-cyan-400 group-hover:scale-105 transition-transform">
                  <CloudRain className="w-5 h-5" />
                </div>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                2. Rainfall Response Analysis
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Catchment-wide precipitation series analyzing Southwest vs. Northeast monsoon rainfall, departure from normal benchmarks, and rainfall-to-groundwater infiltration lags.
              </p>
            </div>

            {/* 3. Water Quality Anomaly Detection */}
            <div 
              onClick={() => onExplore('water_quality')}
              className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-amber-500/40 cursor-pointer transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-950/90 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <DataBadge provenance="HISTORICAL_REPORT" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                3. Water Quality Anomaly Detection
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Surveillance of Total Chromium, TDS, Electrical Conductivity, BOD, and Dissolved Oxygen with Median Absolute Deviation (MAD) robust statistical outlier flagging.
              </p>
            </div>

            {/* 4. AI Risk Prediction */}
            <div 
              onClick={() => onExplore('forecasting')}
              className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 group-hover:scale-105 transition-transform">
                  <LineChart className="w-5 h-5" />
                </div>
                <DataBadge provenance="MODEL_PREDICTION" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                4. AI Risk Prediction
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Walk-forward seasonal forecast models projecting water-table depression across 4 quarters with backtested validation errors and explicit ±1.2m confidence intervals.
              </p>
            </div>

            {/* 5. Geospatial Risk Prioritisation */}
            <div 
              onClick={() => onExplore('risk_priority')}
              className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-amber-500/40 cursor-pointer transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-amber-950/90 border border-amber-500/30 text-amber-400 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <DataBadge provenance="MODEL_PREDICTION" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                5. Geospatial Risk Prioritisation
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Multi-Criteria Decision Analysis (MCDA) generating transparent 0–100 risk ranks to dispatch field resources to highest urgency stretches first.
              </p>
            </div>

            {/* 6. Evidence Verification & Confidence */}
            <div 
              onClick={() => onExplore('confidence')}
              className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-teal-500/40 cursor-pointer transition-all space-y-4 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-teal-950/90 border border-teal-500/30 text-teal-400 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                6. Evidence Verification & Provenance
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Every measurement is traceable to official CGWB, CPCB, or peer-reviewed literature benchmarks with complete audit logs and zero synthetic fabrication in verified metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 4 — EXPLORE THE PLATFORM (REAL INTERACTIVE PREVIEW) */}
      {/* ============================================================ */}
      <section id="platform-preview" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#020d07]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-2">
                SECTION 04 · LIVE CONSOLE PREVIEW
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
                Palar Basin Digital Twin
              </h2>
              <p className="text-sm text-stone-300 max-w-xl mt-1">
                Explore real geographic coordinates across 7 continuous stations from Vaniyambadi in the upper basin to Chengalpattu at the Bay of Bengal estuary.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onExplore('digital_twin')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-forest-sm flex items-center gap-2 transition-all"
              >
                <span>Full Screen Digital Twin</span>
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="h-[520px]">
            <DigitalTwinMap onSelectLocation={() => onExplore('groundwater')} />
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 5 — WHO USES PALAR GUARD AI */}
      {/* ============================================================ */}
      <section id="stakeholders" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#04120a]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              SECTION 05 · WHO USES THE PLATFORM
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Built for Every Stakeholder <br />
              <span className="text-[#2ad58b]">Across the River Basin.</span>
            </h2>
            <p className="text-base text-stone-300">
              From local farmers facing dry borewells to environmental researchers, field inspectors, and state water authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Farmers and Residents */}
            <div className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Farmers & Local Residents</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Check local water table depths in their village, track seasonal monsoon rainfall, report well depletion or discolored discharge in Tamil, and get plain-language recommendations.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-400 border-t border-white/[0.06]">
                Role: Community / விவசாயி
              </div>
            </div>

            {/* 2. Environmental Researchers */}
            <div className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Environmental Researchers</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Analyze multi-year CGWB groundwater hydrographs, compute depletion rates, run walk-forward seasonal forecasts, inspect geochemical parameters, and export research-ready datasets.
              </p>
              <div className="pt-2 text-[11px] font-mono text-cyan-400 border-t border-white/[0.06]">
                Role: Researcher / ஆய்வாளர்
              </div>
            </div>

            {/* 3. Field Officers & Inspectors */}
            <div className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Field Officers & Inspectors</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Receive prioritized inspection tickets, review citizen incident reports, verify anomalies on-site with GPS coordinates, upload water sample evidence, and update investigation logs.
              </p>
              <div className="pt-2 text-[11px] font-mono text-amber-400 border-t border-white/[0.06]">
                Role: Field Investigator / கள அதிகாரி
              </div>
            </div>

            {/* 4. Watershed & Basin Authorities */}
            <div className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Water Resource Authorities</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Prioritize high-risk reaches (e.g. Ranipet CPCB Priority-V corridor), evaluate recharge suitability scores for check dams and percolation tanks, and download executive policy dossiers.
              </p>
              <div className="pt-2 text-[11px] font-mono text-teal-400 border-t border-white/[0.06]">
                Role: Institutional / நீர்வளத்துறை
              </div>
            </div>

            {/* 5. Community Water Groups & NGOs */}
            <div className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Compass className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Basin Watch NGOs</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Monitor community water quality alerts, organize desiltation campaigns for traditional eri irrigation tanks, and hold transparent evidence-backed dialogues with stakeholders.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-400 border-t border-white/[0.06]">
                Role: NGO / சமூகக் குழுக்கள்
              </div>
            </div>

            {/* 6. Platform Administrators */}
            <div className="p-6 rounded-2xl bg-[#071c12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-stone-300">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">System Administrators</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Manage role-based access control (RBAC), multi-tenant institutional workspaces, verify ingestion pipelines from CGWB/IMD/TNPCB, and inspect immutable system audit logs.
              </p>
              <div className="pt-2 text-[11px] font-mono text-stone-400 border-t border-white/[0.06]">
                Role: Administrator / கணினி நிர்வாகி
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — TAMIL ACCESSIBILITY & AI ASSISTANT */}
      {/* ============================================================ */}
      <section id="tamil-accessibility" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#020d07]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              SECTION 06 · முதல்நிலை தமிழ் இடைமுகம்
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              First-Class Tamil Accessibility. <br />
              <span className="text-[#2ad58b]">அனைவருக்கும் புரியும் தமிழ் AI.</span>
            </h2>
            <p className="text-base text-stone-300">
              Environmental intelligence shouldn't be gated behind complex English technical jargon. PALAR GUARD AI provides seamless bilingual navigation and conversational Tamil speech support.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Interactive Tamil Voice Showcase */}
            <div className="p-8 rounded-2xl bg-[#061e12] border border-emerald-500/30 space-y-6 shadow-forest-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">PALAR AI — உங்கள் நீர் உதவியாளர்</h4>
                    <p className="text-[11px] text-stone-400">Grounded Bilingual Voice Copilot</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  தமிழ் / English
                </span>
              </div>

              {/* Sample Dialog Bubbles */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-stone-300">
                  <span className="text-emerald-400 font-bold block mb-1">பயனர் கேள்வி:</span>
                  "ராணிப்பேட்டை பகுதியில் நிலத்தடி நீர் நிலை எப்படி இருக்கிறது? மழை போதுமானதாக உள்ளதா?"
                </div>

                <div className="p-4 rounded-xl bg-[#092b1a] border border-emerald-500/40 text-xs text-stone-200 space-y-2">
                  <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PALAR AI பதில் [VERIFIED PUBLIC]:</span>
                  </span>
                  <p className="leading-relaxed">
                    "வணக்கம். ராணிப்பேட்டை பகுதியில் தற்போதைய நிலத்தடி நீர்மட்டம் 14.8 mbgl ஆழத்தில் உள்ளது. கடந்த வடகிழக்கு பருவமழையில் 682 மி.மீ (+12%) பதிவாகியுள்ளது. எனினும், முந்தைய அதிகப்படியான உறிஞ்சுதலால் நீர்மட்டம் தொடர்ந்து கண்காணிக்கப்பட வேண்டும்."
                  </p>
                  <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-stone-400 border-t border-white/[0.08]">
                    <span>ஆதாரம்: CGWB & IMD NWIC 2024</span>
                    <button 
                      onClick={() => onExplore('assistant')}
                      className="text-emerald-400 hover:underline font-bold"
                    >
                      AI உதவியாளருடன் பேசுக →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Key Tamil Accessibility Pillars */}
            <div className="space-y-4">
              <div className="p-5 rounded-xl bg-[#071c12] border border-white/[0.08] flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">முழுமையான தமிழ் மொழிபெயர்ப்பு</h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    வரைபடக் குறியீடுகள், வரைபடப் புள்ளிகள், எச்சரிக்கைகள், படிவங்கள், மற்றும் பகுப்பாய்வு அறிக்கைகள் அனைத்தும் எளிய மற்றும் அதிகாரப்பூர்வ தமிழில் வழங்கப்படுகின்றன.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#071c12] border border-white/[0.08] flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400 shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">குரல் வழி உள்ளீடு & ஒலி வெளியீடு (STT & TTS)</h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    விவசாயிகள் மற்றும் பொதுமக்கள் தட்டச்சு செய்ய வேண்டிய அவசியமின்றி, தமிழில் குரல் மூலமாக கேள்விகளை கேட்கலாம் மற்றும் ஒலி வடிவில் பதில்களைப் பெறலாம்.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-[#071c12] border border-white/[0.08] flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-amber-950 text-amber-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">தமிழ் மக்கள் புகார் பதிவு</h4>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    ஆற்றங்கரையில் நீர் மாசுபாடு அல்லது கிணற்று நீர் வற்றுதல் குறித்த புகார்களை எளிமையாக தமிழில் பதிவு செய்து கண்காணிப்பு எண் பெறலாம்.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 6 — THE JOURNEY BEHIND PALAR GUARD AI (TIMELINE) */}
      {/* ============================================================ */}
      <section id="journey" className="relative py-28 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#020905] overflow-hidden">
        {/* Bokeh Particle Galaxy Atmosphere */}
        <BokehParticleGalaxy 
          opacity={0.45} 
          speedMultiplier={0.7} 
          className="absolute inset-0 z-0 pointer-events-none" 
        />

        <div className="relative z-10 max-w-6xl mx-auto space-y-20">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              SECTION 06 · PROJECT & SCIENTIFIC MILESTONES
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              {lang === 'ta' ? 'பாலாறு காப்பாளர் AI: உருவான கதை' : 'The Journey Behind PALAR GUARD AI'}
            </h2>
            <p className="text-base text-stone-300">
              {lang === 'ta'
                ? 'பாலாற்று படுகையின் கள எதார்த்தங்களில் தொடங்கி, AI-ஆற்றல் கொண்ட நதி படுகை சுற்றுச்சூழல் நுண்ணறிவு தளம் உருவான பயணம்.'
                : 'From groundwater field realities across Tamil Nadu to an explainable, public-participation environmental intelligence decision platform.'}
            </p>
          </div>

          {/* Connected Scroll-Driven Timeline Spine */}
          <div className="relative">
            {/* Central Vertical Glowing Line */}
            <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 w-0.5 -translate-x-1/2 bg-gradient-to-b from-emerald-500 via-emerald-400/50 to-[#04120c] pointer-events-none" />

            <div className="space-y-12">
              {journeyMilestones.map((milestone, idx) => {
                const isEven = idx % 2 === 0;

                return (
                  <div 
                    key={milestone.num}
                    className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-12 ${
                      isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'
                    }`}
                  >
                    {/* Timeline Node Ring */}
                    <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-20 w-8 h-8 rounded-full bg-[#03110a] border-2 border-emerald-400 flex items-center justify-center shadow-emerald-glow shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    {/* Content Card */}
                    <div className={`w-full sm:w-1/2 pl-12 sm:pl-0 ${isEven ? 'sm:pr-12 text-left' : 'sm:pl-12 text-left'}`}>
                      <div className="p-6 sm:p-7 rounded-2xl bg-[#061e13]/90 backdrop-blur-md border border-white/[0.08] hover:border-emerald-500/40 transition-all shadow-forest-md space-y-3 group hover:scale-[1.01]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
                            {milestone.num} · {milestone.phase}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            {milestone.badge}
                          </span>
                        </div>

                        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {milestone.title}
                        </h3>

                        <div className="text-[11px] font-mono text-stone-400">
                          {milestone.period}
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed">
                          {milestone.desc}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-xs font-mono border-t border-white/5">
                          <span className="text-stone-400">Key Milestone Outcome:</span>
                          <span className="font-bold text-emerald-400">{milestone.metric}</span>
                        </div>
                      </div>
                    </div>

                    {/* Symmetrical Desktop Layout Balance Spacer */}
                    <div className="hidden sm:block sm:w-1/2" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 7 — TRUST, DATA PROVENANCE & SCIENTIFIC INTEGRITY */}
      {/* ============================================================ */}
      <section id="trust-data" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#04120a]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              SECTION 07 · SCIENTIFIC PROVENANCE & TRANSPARENCY
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Every Metric Has an Audit Trail. <br />
              <span className="text-[#2ad58b]">Zero Fabricated Data.</span>
            </h2>
            <p className="text-base text-stone-300">
              PALAR GUARD AI strictly enforces scientific data ethics. We explicitly classify every number on the platform into clear provenance tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#071c12] border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">TIER 1</span>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
              <h4 className="text-base font-bold text-white">Verified Public Observation</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Directly ingested from official government monitoring networks: Central Ground Water Board (CGWB), India Meteorological Department (IMD), and Tamil Nadu Pollution Control Board (TNPCB).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#071c12] border border-cyan-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">TIER 2</span>
                <DataBadge provenance="HISTORICAL_REPORT" />
              </div>
              <h4 className="text-base font-bold text-white">Historical Published Benchmark</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Peer-reviewed academic surveys, long-term basin monographs, and CPCB River Restoration reports (e.g. CPCB Priority-V restoration corridor documentation).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#071c12] border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400">TIER 3</span>
                <DataBadge provenance="MODEL_PREDICTION" />
              </div>
              <h4 className="text-base font-bold text-white">Statistical Model Forecast</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Walk-forward seasonal projections with explicit 90% confidence uncertainty bands (e.g. ±1.2m). Clearly separated from observed measurements and never represented as ground truth.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#071c12] border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">TIER 4</span>
                <DataBadge provenance="COMMUNITY_REPORT" />
              </div>
              <h4 className="text-base font-bold text-white">Community Incident Report</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Citizen-submitted observations undergoing field investigation triage. Privacy-protected with sensitive personal information redacted from public views.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#071c12] border border-teal-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-teal-400">TIER 5</span>
                <DataBadge provenance="FIELD_VERIFIED" />
              </div>
              <h4 className="text-base font-bold text-white">Field-Verified Ground Truth</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                On-site field inspection records with authenticated GPS coordinates, duplicate laboratory sample analyses, and inspector credentials.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#071c12] border border-stone-600/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-stone-400">TIER 6</span>
                <DataBadge provenance="SYNTHETIC_DEMO" />
              </div>
              <h4 className="text-base font-bold text-white">Synthetic Demo Data</h4>
              <p className="text-xs text-stone-300 leading-relaxed">
                Explicitly labeled scenario testing data for unmonitored test stretches. Clearly tagged with: "SYNTHETIC DEMONSTRATION DATA — NOT A REAL ENVIRONMENTAL MEASUREMENT".
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 8 — PLATFORM ACCESS & INSTITUTIONAL SERVICES (BUSINESS MODEL) */}
      {/* ============================================================ */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#020d07]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
              SECTION 08 · PLATFORM ACCESS & INSTITUTIONAL SERVICES
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Sustainable Institutional <br />
              <span className="text-[#2ad58b]">Environmental SaaS Model.</span>
            </h2>
            <p className="text-base text-stone-300">
              Proposed service plans designed for public transparency, ethical research support, and long-term platform viability. All citizen reporting remains 100% free and open.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan 1: Community & Open Tier */}
            <div className="p-8 rounded-2xl bg-[#071c12] border border-white/[0.08] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-xs font-mono text-emerald-400 border border-emerald-500/30">
                  PUBLIC GOOD TIER
                </div>
                <h3 className="text-xl font-bold text-white">Community & Citizen Access</h3>
                <div className="text-3xl font-extrabold text-emerald-400 font-sans">
                  Free Forever
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  For residents, farmers, and grassroots citizen groups across the Palar Catchment.
                </p>
                <ul className="space-y-2.5 text-xs text-stone-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>View village groundwater levels</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Submit bilingual water concern reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Interactive Tamil AI Voice Copilot</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Public health & water quality alerts</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onExplore('dashboard')}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
              >
                Access Public Console
              </button>
            </div>

            {/* Plan 2: Research & Academic Tier */}
            <div className="p-8 rounded-2xl bg-[#09271a] border-2 border-[#2ad58b] space-y-6 flex flex-col justify-between shadow-emerald-glow relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#2ad58b] text-[#061811] text-[10px] font-bold font-mono uppercase">
                Proposed Academic Plan
              </div>
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-950 text-xs font-mono text-emerald-400 border border-emerald-500/30">
                  RESEARCH INSTITUTIONS
                </div>
                <h3 className="text-xl font-bold text-white">Research & Modeling Suite</h3>
                <div className="text-3xl font-extrabold text-white font-sans">
                  ₹15,000 <span className="text-xs font-normal text-stone-400">/ lab / month (proposed)</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  For university environmental departments, hydrology researchers, and water policy institutes.
                </p>
                <ul className="space-y-2.5 text-xs text-stone-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>All Community features included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Full historical hydrograph series (1980–2024)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Walk-forward forecast modeling sandbox</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Robust Z-Score Anomaly algorithms</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>CSV / GeoJSON dataset batch export</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onExplore('groundwater')}
                className="w-full py-3 rounded-xl bg-[#2ad58b] hover:bg-[#25be7c] text-[#061811] font-bold text-xs shadow-emerald-glow transition-all"
              >
                Explore Research Capabilities
              </button>
            </div>

            {/* Plan 3: Institutional & Regulatory Tier */}
            <div className="p-8 rounded-2xl bg-[#071c12] border border-white/[0.08] space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-cyan-950 text-xs font-mono text-cyan-400 border border-cyan-500/30">
                  STATE & BASIN AUTHORITIES
                </div>
                <h3 className="text-xl font-bold text-white">Institutional Enterprise</h3>
                <div className="text-3xl font-extrabold text-white font-sans">
                  Custom Contract <span className="text-xs font-normal text-stone-400">(proposed)</span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  For state water resources departments, pollution control boards, and district collectors.
                </p>
                <ul className="space-y-2.5 text-xs text-stone-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Multi-tenant organizational workspaces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Field investigation dispatch & triage queue</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Automated executive PDF dossier generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Dedicated SLA & on-premise data connectors</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Role-based access & immutable audit trails</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onExplore('admin_audit')}
                className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
              >
                Inspect Administration Console
              </button>
            </div>
          </div>

          {/* Ethical Safeguards Banner */}
          <div className="p-5 rounded-2xl bg-[#04160e] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div className="text-xs text-stone-300">
                <span className="font-bold text-white block">ETHICAL BUSINESS SAFEGUARDS:</span>
                We never charge vulnerable citizens for reporting water risks, never sell private user telemetry, and keep open public hydrological records strictly transparent.
              </div>
            </div>
            <div className="text-xs font-mono text-emerald-400 font-bold shrink-0">
              100% ETHICAL CLIMATE-TECH
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* SECTION 9 — FINAL CTA */}
      {/* ============================================================ */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-[#010603] to-[#04120a] border-t border-white/[0.08] overflow-hidden">
        {/* Bokeh Particle Galaxy Atmosphere */}
        <BokehParticleGalaxy 
          opacity={0.6} 
          speedMultiplier={0.7} 
          className="absolute inset-0 z-0 pointer-events-none" 
        />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400/40 text-xs font-mono text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            READY FOR NATIONAL EVALUATION
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Protecting water starts with <br />
            <span className="text-[#2ad58b]">seeing the risk.</span>
          </h2>

          <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto font-normal">
            Join environmental analysts, researchers, and authorities using explainable AI to protect every drop in the Palar River Basin.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onExplore('dashboard')}
              className="px-8 py-4 rounded-full bg-[#2ad58b] hover:bg-[#25be7c] text-[#061811] font-bold text-sm shadow-emerald-glow transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <span>EXPLORE PALAR GUARD AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenPresentation && (
              <button
                onClick={onOpenPresentation}
                className="px-7 py-4 rounded-full bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 hover:border-emerald-500/40 text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Launch Jury Pitch Walkthrough</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
