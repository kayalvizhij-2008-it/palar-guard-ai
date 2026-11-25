import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  BookOpen,
  Layers,
  LineChart,
  Sliders,
  ShieldCheck,
  Droplets,
  Users,
  ChevronRight,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface VerticalFallingTimelineProps {
  onExplore: (module?: string) => void;
}

const BASIN_CORRIDOR = [
  { name: 'Vaniyambadi', ta: 'வாணியம்பாடி', zone: 'Upper Basin', district: 'Tirupathur', coords: '12.68°N, 78.62°E' },
  { name: 'Ambur', ta: 'ஆம்பூர்', zone: 'Upper Basin', district: 'Tirupathur', coords: '12.79°N, 78.72°E' },
  { name: 'Vellore', ta: 'வேலூர்', zone: 'Central Basin', district: 'Vellore', coords: '12.92°N, 79.13°E' },
  { name: 'Ranipet', ta: 'ராணிப்பேட்டை', zone: 'Middle Basin', district: 'Ranipet', coords: '12.93°N, 79.33°E' },
  { name: 'Walajapet', ta: 'வாலாஜாபேட்டை', zone: 'Middle Basin', district: 'Ranipet', coords: '12.93°N, 79.38°E' },
  { name: 'Kanchipuram', ta: 'காஞ்சிபுரம்', zone: 'Lower Basin', district: 'Kanchipuram', coords: '12.83°N, 79.70°E' },
  { name: 'Chengalpattu', ta: 'செங்கல்பட்டு', zone: 'Coastal Reach', district: 'Chengalpattu', coords: '12.68°N, 79.98°E' },
];

const RECHARGE_OPTIONS = [
  {
    name: 'Percolation Tanks & Check Dams',
    ta: 'கசிவுநீர் குட்டைகள் & தடுப்பணைகள்',
    reach: 'Walajapet Alluvium',
    soil: 'Coarse river sand & gravel',
    notes: 'Captures short-duration Northeast monsoon runoff where alluvial thickness allows infiltration.',
  },
  {
    name: 'Traditional Eri Desiltation',
    ta: 'பாரம்பரிய ஏரிகள் தூர்வாருதல்',
    reach: 'Kanchipuram Tank Cascade',
    soil: 'Fine sand & silt cascade',
    notes: 'Restores storage capacity in interconnected village tank networks.',
  },
  {
    name: 'Isolated Infiltration Shafts',
    ta: 'தனிமைப்படுத்தப்பட்ட ஊடுருவல் கிணறுகள்',
    reach: 'Upper Basin Tributaries',
    soil: 'Weathered gneiss / alluvium',
    notes: 'Requires pre-filtration and separation from industrial runoff corridors.',
  },
];

export const VerticalFallingTimeline: React.FC<VerticalFallingTimelineProps> = ({ onExplore }) => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [linePct, setLinePct] = useState<number>(12);
  const [revealedSet, setRevealedSet] = useState<number[]>([0]);
  const [selectedCorridorIdx, setSelectedCorridorIdx] = useState<number>(3);
  const [dataLayerTab, setDataLayerTab] = useState<'gw' | 'rain' | 'wq'>('gw');
  const [selectedRechargeIdx, setSelectedRechargeIdx] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateScrollTimeline = () => {
      const root = sectionRef.current;
      if (!root) return;

      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const anchorY = vh * 0.48;
      // Reversible scroll progress along vertical spine
      const rawPct = ((anchorY - rect.top) / Math.max(1, rect.height - vh * 0.35)) * 100;
      setLinePct(Math.max(6, Math.min(100, Math.round(rawPct))));

      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-milestone-idx]'));
      let closestIdx = 0;
      let minDist = Infinity;
      const nextVisible: number[] = [];

      cards.forEach((el) => {
        const idx = Number(el.getAttribute('data-milestone-idx'));
        if (Number.isNaN(idx)) return;
        const cRect = el.getBoundingClientRect();
        const center = cRect.top + cRect.height * 0.35;
        const dist = Math.abs(center - anchorY);
        if (dist < minDist) {
          minDist = dist;
          closestIdx = idx;
        }
        // Reversible visibility: milestones above or inside viewport reveal; milestones scrolled back below the fold reset cleanly on upward scroll
        if (cRect.top < vh * 0.88) {
          nextVisible.push(idx);
        }
      });

      setActiveIdx(closestIdx);
      setRevealedSet(nextVisible.length ? nextVisible : [0]);
    };

    updateScrollTimeline();
    window.addEventListener('scroll', updateScrollTimeline, { passive: true });
    window.addEventListener('resize', updateScrollTimeline, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScrollTimeline);
      window.removeEventListener('resize', updateScrollTimeline);
    };
  }, []);

  const MILESTONE_SLUGS = [
    '01 — THE CHALLENGE',
    '02 — THE RESEARCH',
    '03 — THE OBSERVATION',
    '04 — THE INTELLIGENCE',
    '05 — THE PRIORITISATION',
    '06 — THE VERIFICATION',
    '07 — THE ACTION',
    '08 — THE FUTURE',
  ];

  const cardMotion = (idx: number) => {
    const isVisible = revealedSet.includes(idx);
    const tilt = idx % 2 === 0 ? '-rotate-[1.25deg]' : 'rotate-[1.25deg]';
    const isCurrent = idx === activeIdx;
    return isVisible
      ? `opacity-100 translate-y-0 rotate-0 scale-100 ${isCurrent ? 'ring-1 ring-[#d9c27a]/35 rounded-2xl' : ''}`
      : `opacity-0 -translate-y-7 ${tilt} scale-[0.985]`;
  };

  return (
    <section
      id="journey-story"
      ref={sectionRef}
      className="relative py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-transparent border-b border-white/[0.08] overflow-x-clip [perspective:1100px]"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Exact Required Section Heading + Reversible Sticky Progress Pill */}
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-mono uppercase tracking-[0.26em] text-[#d9c27a]">
            {L('01 — 08 · FROM FIELD CHALLENGE TO OPEN STEWARDSHIP', '01 — 08 · கள சவாலிலிருந்து திறந்த நீர் பாதுகாப்பு வரை')}
          </p>
          <h2 className="font-serif text-3xl sm:text-5xl font-semibold tracking-tight text-[#fcfbf7]">
            THE JOURNEY OF PALAR GUARD AI
          </h2>
          {lang === 'ta' && (
            <p className="text-lg font-semibold text-emerald-400">
              பாலாறு காப்பாளர் AI — எட்டு நிலைப் பயணம்
            </p>
          )}
          <p className="text-sm sm:text-base text-[#a4b2a9] leading-relaxed">
            {L(
              'Eight distinct stages showing why the Palar River Basin needs transparent environmental intelligence, how the methodology works, and what tools exist today.',
              'பாலாறு வடிநிலத்திற்கு வெளிப்படையான சுற்றுச்சூழல் நுண்ணறிவு ஏன் தேவை, அறிவியல் முறை எவ்வாறு செயல்படுகிறது, இன்று உள்ள கருவிகள் எவை என்பதை விளக்கும் எட்டு நிலைகள்.'
            )}
          </p>
          <div className="inline-flex items-center gap-3 rounded-full border border-[#d9c27a]/30 bg-[#061811]/90 px-4 py-1.5 text-[11px] font-mono text-[#fcfbf7]">
            <span className="text-[#d9c27a] tabular-nums">
              {String(activeIdx + 1).padStart(2, '0')} / 08
            </span>
            <span className="text-white/25">|</span>
            <span>{MILESTONE_SLUGS[activeIdx]}</span>
            <span className="text-emerald-400 tabular-nums">{linePct}%</span>
          </div>
        </header>

        {/* Vertical Timeline Spine */}
        <div className="relative">
          {/* Connecting vertical track (left-aligned on mobile, centered on md+) */}
          <div
            aria-hidden="true"
            className="absolute left-5 md:left-1/2 top-2 bottom-2 w-px -translate-x-1/2 bg-white/10 pointer-events-none"
          >
            <div
              className="w-full bg-gradient-to-b from-[#d9c27a] via-[#10b981] to-[#0891b2] transition-all duration-300"
              style={{ height: `${linePct}%` }}
            />
          </div>

          <div className="space-y-16 md:space-y-24">
            {/* =================================================================== */}
            {/* 01 — THE CHALLENGE (Map-led corridor selector)                      */}
            {/* =================================================================== */}
            <article
              data-milestone-idx="0"
              className={`relative flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-12 transition-all duration-500 ${cardMotion(0)}`}
            >
              <div className="absolute left-5 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#061811] border border-[#d9c27a] flex items-center justify-center font-mono text-[11px] font-semibold text-[#d9c27a] tabular-nums">
                01
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 md:text-right space-y-3">
                <div className="text-5xl sm:text-6xl font-serif font-semibold text-white/15 tabular-nums select-none leading-none">
                  01
                </div>
                <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#d9c27a]">
                  01 — THE CHALLENGE
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">
                  {L('Uneven Water Stress Across Five Basin Districts', 'ஐந்து மாவட்டங்களில் சமமற்ற நீர் அழுத்தம்')}
                </h3>
                <p className="text-sm text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Across Tirupathur, Vellore, Ranipet, Kanchipuram, and Chengalpattu, seasonal borewell drawdown and industrial corridor pressures vary sharply between upper hard-rock reaches and lower alluvial plains.',
                    'திருப்பத்தூர், வேலூர், ராணிப்பேட்டை, காஞ்சிபுரம் மற்றும் செங்கல்பட்டு பகுதிகளில் கோடைகால நீர்மட்ட வீழ்ச்சியும் இரசாயன அழுத்தமும் இடத்திற்கு இடம் மாறுபடுகின்றன.'
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-12 min-w-0">
                <div className="rounded-2xl border border-white/10 bg-[#0b1f17] p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                    <span className="flex items-center gap-2 text-xs font-mono text-[#fcfbf7]">
                      <MapPin className="w-4 h-4 text-[#10b981] shrink-0" />
                      {L('Basin Reach Selector (West → Coast)', 'வடிநிலப் பகுதி (மேற்கு → கடலோரம்)')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {BASIN_CORRIDOR.map((st, idx) => (
                      <button
                        key={st.name}
                        type="button"
                        onClick={() => setSelectedCorridorIdx(idx)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          selectedCorridorIdx === idx
                            ? 'bg-[#10b981] text-[#041a11] font-semibold'
                            : 'bg-[#061811] text-[#a4b2a9] border border-white/10 hover:text-white'
                        }`}
                      >
                        {lang === 'ta' ? st.ta : st.name}
                      </button>
                    ))}
                  </div>
                  <div className="rounded-xl bg-[#061811] border border-white/[0.08] p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="font-semibold text-[#fcfbf7]">
                        {lang === 'ta' ? BASIN_CORRIDOR[selectedCorridorIdx].ta : BASIN_CORRIDOR[selectedCorridorIdx].name}
                      </div>
                      <div className="text-[#85928a]">
                        {BASIN_CORRIDOR[selectedCorridorIdx].district} · {BASIN_CORRIDOR[selectedCorridorIdx].zone}
                      </div>
                    </div>
                    <div className="font-mono text-[#d9c27a] tabular-nums">
                      {BASIN_CORRIDOR[selectedCorridorIdx].coords}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* =================================================================== */}
            {/* 02 — THE RESEARCH (Text-led editorial literature block)             */}
            {/* =================================================================== */}
            <article
              data-milestone-idx="1"
              className={`relative flex flex-col md:flex-row-reverse items-stretch md:items-center gap-6 md:gap-12 transition-all duration-500 ${cardMotion(1)}`}
            >
              <div className="absolute left-5 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#061811] border border-[#d9c27a] flex items-center justify-center font-mono text-[11px] font-semibold text-[#d9c27a] tabular-nums">
                02
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-12 space-y-3">
                <div className="text-5xl sm:text-6xl font-serif font-semibold text-white/15 tabular-nums select-none leading-none">
                  02
                </div>
                <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#d9c27a]">
                  02 — THE RESEARCH
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">
                  {L('Grounding in Hydrogeology & Public Standards', 'நிலத்தடி நீரியல் & அரசு தரநிலைகளில் அடித்தளம்')}
                </h3>
                <p className="text-sm text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Before writing software, the Chennai Institute of Technology team mapped CGWB aquifer bulletins, CPCB polluted river stretch classifications, and BIS 10500:2012 drinking-water thresholds for the 17,810 km² catchment.',
                    'மென்பொருள் உருவாக்கத்திற்கு முன், சென்னை இன்ஸ்டிடியூட் ஆஃப் டெக்னாலஜி குழு CGWB நீர்நிலை அறிக்கைகள், CPCB நதிப் பகுப்பாய்வு மற்றும் BIS 10500:2012 தரநிலைகளை ஆய்வு செய்தது.'
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 min-w-0">
                <blockquote className="rounded-2xl border-l-2 border-[#d9c27a] bg-[#091c14] p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-[#d9c27a]">
                      <BookOpen className="w-4 h-4" />
                      {L('REFERENCE STANDARDS BENCHMARK', 'அதிகாரப்பூர்வ தரநிலை அளவுகோல்')}
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-[#061811] border border-white/[0.06]">
                      <dt className="text-[#85928a]">BIS 10500 Chromium</dt>
                      <dd className="mt-1 font-mono text-sm font-semibold text-[#fcfbf7] tabular-nums">&lt; 0.05 mg/L</dd>
                    </div>
                    <div className="p-3 rounded-lg bg-[#061811] border border-white/[0.06]">
                      <dt className="text-[#85928a]">BIS Acceptable TDS</dt>
                      <dd className="mt-1 font-mono text-sm font-semibold text-[#fcfbf7] tabular-nums">&lt; 500 mg/L</dd>
                    </div>
                    <div className="p-3 rounded-lg bg-[#061811] border border-white/[0.06]">
                      <dt className="text-[#85928a]">CPCB Class C DO</dt>
                      <dd className="mt-1 font-mono text-sm font-semibold text-[#fcfbf7] tabular-nums">&gt; 5.0 mg/L</dd>
                    </div>
                    <div className="p-3 rounded-lg bg-[#061811] border border-white/[0.06]">
                      <dt className="text-[#85928a]">Catchment Area</dt>
                      <dd className="mt-1 font-mono text-sm font-semibold text-[#fcfbf7] tabular-nums">17,810 km²</dd>
                    </div>
                  </dl>
                </blockquote>
              </div>
            </article>

            {/* =================================================================== */}
            {/* 03 — THE OBSERVATION (Data-led multi-layer inspector)               */}
            {/* =================================================================== */}
            <article
              data-milestone-idx="2"
              className={`relative flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-12 transition-all duration-500 ${cardMotion(2)}`}
            >
              <div className="absolute left-5 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#061811] border border-[#d9c27a] flex items-center justify-center font-mono text-[11px] font-semibold text-[#d9c27a] tabular-nums">
                03
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 md:text-right space-y-3">
                <div className="text-5xl sm:text-6xl font-serif font-semibold text-white/15 tabular-nums select-none leading-none">
                  03
                </div>
                <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#d9c27a]">
                  03 — THE OBSERVATION
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">
                  {L('Unifying Quantity, Monsoon & Quality Records', 'நீர்மட்டம், மழை & நீர் தரப் பதிவுகளை இணைத்தல்')}
                </h3>
                <p className="text-sm text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Structured ingestion separates public observation records, historical reports, and citizen submissions with explicit provenance tags across seven baseline stations.',
                    'ஏழு அடிப்படைக் கண்காணிப்பு நிலையங்களில் அரசுப் பதிவுகள், வரலாற்று அறிக்கைகள் மற்றும் மக்கள் புகார்கள் தனித்தனி நம்பகத்தன்மை குறியீடுகளுடன் சேமிக்கப்படுகின்றன.'
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-12 min-w-0">
                <div className="rounded-2xl border border-white/10 bg-[#0b1f17] p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-[#fcfbf7]">
                      <Layers className="w-4 h-4 text-[#0891b2]" />
                      {L('Observation Strata', 'தரவு அடுக்குகள்')}
                    </span>
                    <div className="flex rounded-lg bg-[#061811] p-0.5 border border-white/10 text-[11px] font-mono">
                      {[
                        { id: 'gw', label: L('Groundwater', 'நிலத்தடி நீர்') },
                        { id: 'rain', label: L('Rainfall', 'மழை') },
                        { id: 'wq', label: L('Quality', 'தரம்') },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setDataLayerTab(tab.id as 'gw' | 'rain' | 'wq')}
                          className={`px-2.5 py-1 rounded transition-colors ${
                            dataLayerTab === tab.id ? 'bg-[#10b981] text-[#041a11] font-semibold' : 'text-[#a4b2a9]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {dataLayerTab === 'gw' && (
                    <div className="p-4 rounded-xl bg-[#061811] border border-white/[0.06] space-y-1.5 text-xs">
                      <div className="font-semibold text-[#fcfbf7]">{L('Quarterly Depth-to-Water (mbgl)', 'காலாண்டு நீர்மட்ட ஆழம் (mbgl)')}</div>
                      <p className="text-[#a4b2a9]">
                        {L('91 quarterly records across 7 stations (2023-Q1 to 2026-Q1) tracking pre-monsoon depletion vs Q4 recharge.', '7 நிலையங்களில் 91 காலாண்டு பதிவுகள் (2023-Q1 முதல் 2026-Q1 வரை) பருவகால ஏற்ற இறக்கங்களை அளவிடுகின்றன.')}
                      </p>
                    </div>
                  )}
                  {dataLayerTab === 'rain' && (
                    <div className="p-4 rounded-xl bg-[#061811] border border-white/[0.06] space-y-1.5 text-xs">
                      <div className="font-semibold text-[#fcfbf7]">{L('Monthly Catchment Precipitation', 'மாதாந்திர மழைப்பொழிவு')}</div>
                      <p className="text-[#a4b2a9]">
                        {L('Northeast (Oct–Dec) vs Southwest (Jun–Sep) deviation percentages benchmarked against 30-year normals.', 'வடகிழக்கு மற்றும் தென்மேற்கு பருவமழை அளவுகள் நீண்டகால சராசரியுடன் ஒப்பிடப்படுகின்றன.')}
                      </p>
                    </div>
                  )}
                  {dataLayerTab === 'wq' && (
                    <div className="p-4 rounded-xl bg-[#061811] border border-white/[0.06] space-y-1.5 text-xs">
                      <div className="font-semibold text-[#fcfbf7]">{L('Hydrochemical Surveillance', 'இரசாயன நீர் தர கண்காணிப்பு')}</div>
                      <p className="text-[#a4b2a9]">
                        {L('pH, TDS, EC, Total Chromium, BOD, and Dissolved Oxygen compared against BIS 10500 and CPCB Class C limits.', 'pH, TDS, EC, குரோமியம், BOD மற்றும் கரைந்த ஆக்ஸிஜன் அளவுகள் BIS/CPCB வரம்புகளுடன் சரிபார்க்கப்படுகின்றன.')}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onExplore('groundwater')}
                    className="text-xs font-medium text-[#10b981] hover:underline inline-flex items-center gap-1"
                  >
                    <span>{L('Open Groundwater & Quality Explorer', 'தரவு ஆய்வகத்தைத் திற')}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>

            {/* =================================================================== */}
            {/* 04 — THE INTELLIGENCE (Chart-led uncertainty cone & MAD)            */}
            {/* =================================================================== */}
            <article
              data-milestone-idx="3"
              className={`relative flex flex-col md:flex-row-reverse items-stretch md:items-center gap-6 md:gap-12 transition-all duration-500 ${cardMotion(3)}`}
            >
              <div className="absolute left-5 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#061811] border border-[#d9c27a] flex items-center justify-center font-mono text-[11px] font-semibold text-[#d9c27a] tabular-nums">
                04
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-12 space-y-3">
                <div className="text-5xl sm:text-6xl font-serif font-semibold text-white/15 tabular-nums select-none leading-none">
                  04
                </div>
                <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#d9c27a]">
                  04 — THE INTELLIGENCE
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">
                  {L('Explainable Forecasting & Robust Outlier Screening', 'விளக்கக்கூடிய கணிப்பு & வலுவான மாறுபாடு கண்டறிதல்')}
                </h3>
                <p className="text-sm text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Seasonal forecasts report explicit uncertainty intervals instead of single-point guesses, while Median Absolute Deviation (MAD) prevents extreme spikes from masking moderate anomalies.',
                    'ஒற்றை மதிப்புகளுக்குப் பதிலாக நிச்சயமற்ற இடைவெளிகளுடன் கூடிய கணிப்புகளும், தீவிர மாறுபாடுகளால் பாதிக்கப்படாத MAD புள்ளிவிவர முறையும் பயன்படுத்தப்படுகின்றன.'
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 min-w-0">
                <div className="rounded-2xl border border-white/10 bg-[#0b1f17] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-[#fcfbf7]">
                      <LineChart className="w-4 h-4 text-[#10b981]" />
                      {L('Walk-Forward Confidence Envelope', 'நம்பிக்கை இடைவெளி வரைபடம்')}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#061811] p-3 border border-white/[0.06]">
                    <svg viewBox="0 0 320 96" className="w-full h-24" aria-label="Illustrative seasonal forecast uncertainty cone">
                      <polygon points="145,52 205,43 260,33 308,24 308,82 260,72 205,64 145,52" fill="rgba(16,185,129,0.16)" />
                      <path d="M 12,72 Q 75,64 145,52" fill="none" stroke="#8fd9c0" strokeWidth="2.2" />
                      <path d="M 145,52 Q 225,50 308,48" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" />
                      <circle cx="145" cy="52" r="3.5" fill="#d9c27a" />
                      <circle cx="308" cy="48" r="3.5" fill="#10b981" />
                    </svg>
                    <div className="flex justify-between text-[10px] font-mono text-[#85928a] pt-1">
                      <span>{L('Observed Series', 'பதிவு செய்யப்பட்ட தரவு')}</span>
                      <span>{L('Projected + Uncertainty Band (Illustrative)', 'கணிப்பு + நிச்சயமற்ற வரம்பு')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* =================================================================== */}
            {/* 05 — THE PRIORITISATION (Weighted MCDA matrix)                      */}
            {/* =================================================================== */}
            <article
              data-milestone-idx="4"
              className={`relative flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-12 transition-all duration-500 ${cardMotion(4)}`}
            >
              <div className="absolute left-5 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#061811] border border-[#d9c27a] flex items-center justify-center font-mono text-[11px] font-semibold text-[#d9c27a] tabular-nums">
                05
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 md:text-right space-y-3">
                <div className="text-5xl sm:text-6xl font-serif font-semibold text-white/15 tabular-nums select-none leading-none">
                  05
                </div>
                <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#d9c27a]">
                  05 — THE PRIORITISATION
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">
                  {L('Transparent Multi-Criteria Risk Weights', 'வெளிப்படையான பல-அளவுகோல் இடர் எடைகள்')}
                </h3>
                <p className="text-sm text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Analysts can inspect and adjust policy weights—balancing groundwater stress, water quality exceedances, rainfall deficit, recency, and data confidence—so every rank is auditable.',
                    'நிலத்தடி நீர் அழுத்தம், நீர் தரம், மழை பற்றாக்குறை, தரவு புதுப்பிப்பு மற்றும் நம்பகத்தன்மை ஆகியவற்றின் எடைகளை ஆய்வாளர்கள் சரிசெய்து முன்னுரிமைப் பட்டியலை ஆராயலாம்.'
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-12 min-w-0">
                <div className="rounded-2xl border border-white/10 bg-[#0b1f17] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-[#fcfbf7]">
                      <Sliders className="w-4 h-4 text-[#d97706]" />
                      {L('MCDA Weight Distribution', 'MCDA எடைப் பகிர்வு')}
                    </span>
                    <span className="font-mono text-[11px] text-[#85928a]">Σ = 100%</span>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {[
                      { label: L('Water Quality Exceedance', 'நீர் தர மீறல்'), pct: 35, color: 'bg-[#e11d48]' },
                      { label: L('Groundwater Stress', 'நிலத்தடி நீர் அழுத்தம்'), pct: 30, color: 'bg-[#d97706]' },
                      { label: L('Rainfall & Recharge Deficit', 'மழைப் பற்றாக்குறை'), pct: 15, color: 'bg-[#0891b2]' },
                      { label: L('Observation Recency & Confidence', 'புதுப்பிப்பு & நம்பகத்தன்மை'), pct: 20, color: 'bg-[#10b981]' },
                    ].map((row) => (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between text-[#fcfbf7]">
                          <span>{row.label}</span>
                          <span className="font-mono tabular-nums text-[#a4b2a9]">{row.pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#061811] overflow-hidden">
                          <div className={`h-full ${row.color}`} style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* =================================================================== */}
            {/* 06 — THE VERIFICATION (Protocol-led chain-of-custody checklist)     */}
            {/* =================================================================== */}
            <article
              data-milestone-idx="5"
              className={`relative flex flex-col md:flex-row-reverse items-stretch md:items-center gap-6 md:gap-12 transition-all duration-500 ${cardMotion(5)}`}
            >
              <div className="absolute left-5 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#061811] border border-[#d9c27a] flex items-center justify-center font-mono text-[11px] font-semibold text-[#d9c27a] tabular-nums">
                06
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-12 space-y-3">
                <div className="text-5xl sm:text-6xl font-serif font-semibold text-white/15 tabular-nums select-none leading-none">
                  06
                </div>
                <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#d9c27a]">
                  06 — THE VERIFICATION
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">
                  {L('Anomalies Trigger Field Checks — Never Unverified Accusations', 'புள்ளிவிவர எச்சரிக்கைகள் கள ஆய்வுக்கு மட்டுமே — சான்றின்றி குற்றச்சாட்டு இல்லை')}
                </h3>
                <p className="text-sm text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Statistical outliers and citizen reports route into a role-protected Kanban verification workflow with duplicate sampling checklists and tamper-evident audit logs.',
                    'புள்ளிவிவர மாறுபாடுகள் மற்றும் மக்கள் புகார்கள் கள ஆய்வு சரிபார்ப்பு பட்டியல் மற்றும் தணிக்கை பதிவேட்டுடன் கூடிய பணிப்பாய்விற்கு அனுப்பப்படுகின்றன.'
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 min-w-0">
                <div className="rounded-2xl border border-amber-500/25 bg-[#0b1f17] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-amber-300">
                      <ShieldCheck className="w-4 h-4" />
                      {L('Field Verification Protocol', 'கள சரிபார்ப்பு நெறிமுறை')}
                    </span>
                    <AlertTriangle className="w-4 h-4 text-[#d97706]" />
                  </div>
                  <ul className="space-y-2 text-xs text-[#fcfbf7]">
                    {[
                      L('Cross-check sensor reading with calibrated field meter', 'கள அளவுகோலுடன் சென்சார் அளவீட்டை சரிபார்த்தல்'),
                      L('Collect duplicate 1L grab samples for accredited lab assay', 'அங்கீகரிக்கப்பட்ட ஆய்வக பரிசோதனைக்கு இரட்டை மாதிரி சேகரிப்பு'),
                      L('Verify GPS coordinates and document upstream conditions', 'GPS ஆயத்தொலைவுகள் & நீரோட்ட நிலைமைகளைப் பதிவு செய்தல்'),
                    ].map((step) => (
                      <li key={step} className="flex items-start gap-2 rounded-lg bg-[#061811] p-2.5 border border-white/[0.06]">
                        <CheckSquare className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>

            {/* =================================================================== */}
            {/* 07 — THE ACTION (Intervention-led MAR site selector)                */}
            {/* =================================================================== */}
            <article
              data-milestone-idx="6"
              className={`relative flex flex-col md:flex-row items-stretch md:items-center gap-6 md:gap-12 transition-all duration-500 ${cardMotion(6)}`}
            >
              <div className="absolute left-5 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#061811] border border-[#d9c27a] flex items-center justify-center font-mono text-[11px] font-semibold text-[#d9c27a] tabular-nums">
                07
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 md:text-right space-y-3">
                <div className="text-5xl sm:text-6xl font-serif font-semibold text-white/15 tabular-nums select-none leading-none">
                  07
                </div>
                <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#d9c27a]">
                  07 — THE ACTION
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">
                  {L('Siting Managed Aquifer Recharge Safely', 'பாதுகாப்பான நிலத்தடி நீர் செறிவூட்டல் திட்டமிடல்')}
                </h3>
                <p className="text-sm text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Preliminary hydrogeological screening identifies permeable alluvial reaches for check dams and traditional eri restoration—while flagging contaminated zones to prevent polluted recharge.',
                    'மண் ஊடுருவும் திறன் அடிப்படையில் தடுப்பணைகள் மற்றும் ஏரி புனரமைப்பு இடங்களைத் தேர்ந்தெடுத்து, மாசுபட்ட பகுதிகளில் கவனமாகத் தவிர்க்கிறது.'
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-12 min-w-0">
                <div className="rounded-2xl border border-white/10 bg-[#0b1f17] p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 text-xs font-mono text-[#fcfbf7]">
                      <Droplets className="w-4 h-4 text-[#10b981]" />
                      {L('Preliminary MAR Options', 'முதற்கட்ட நீர் செறிவூட்டல் தேர்வுகள்')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {RECHARGE_OPTIONS.map((opt, idx) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setSelectedRechargeIdx(idx)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          selectedRechargeIdx === idx
                            ? 'bg-[#09291b] border-[#10b981]/60'
                            : 'bg-[#061811] border-white/[0.06] hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#fcfbf7]">
                          <span>{lang === 'ta' ? opt.ta : opt.name}</span>
                          <span className="font-mono text-[10px] text-[#d9c27a]">{opt.reach}</span>
                        </div>
                        {selectedRechargeIdx === idx && (
                          <p className="mt-1.5 text-xs text-[#a4b2a9] leading-relaxed">{opt.notes}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            {/* =================================================================== */}
            {/* 08 — THE FUTURE (Vision-led stewardship roadmap — honest future)    */}
            {/* =================================================================== */}
            <article
              data-milestone-idx="7"
              className={`relative flex flex-col md:flex-row-reverse items-stretch md:items-center gap-6 md:gap-12 transition-all duration-500 ${cardMotion(7)}`}
            >
              <div className="absolute left-5 md:left-1/2 top-4 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 z-10 w-8 h-8 rounded-full bg-[#061811] border border-[#d9c27a] flex items-center justify-center font-mono text-[11px] font-semibold text-[#d9c27a] tabular-nums">
                08
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-12 space-y-3">
                <div className="text-5xl sm:text-6xl font-serif font-semibold text-white/15 tabular-nums select-none leading-none">
                  08
                </div>
                <div className="text-xs font-mono tracking-[0.2em] uppercase text-[#d9c27a]">
                  08 — THE FUTURE
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#fcfbf7]">
                  {L('Towards Shared Basin Stewardship in English & Tamil', 'தமிழ் மற்றும் ஆங்கிலத்தில் கூட்டு வடிநிலப் பாதுகாப்பு நோக்கி')}
                </h3>
                <p className="text-sm text-[#a4b2a9] leading-relaxed">
                  {L(
                    'Our goal is long-term collaboration between residents, researchers, and district agencies—expanding verified telemetry coverage, official basin GIS boundaries, and transparent public reporting.',
                    'பொதுமக்கள், ஆய்வாளர்கள் மற்றும் மாவட்ட அமைப்புகளிடையே நீண்டகால ஒத்துழைப்பை உருவாக்கி, சரிபார்க்கப்பட்ட கண்காணிப்பையும் வெளிப்படையான அறிக்கைகளையும் விரிவுபடுத்துவதே எங்கள் இலக்கு.'
                  )}
                </p>
              </div>

              <div className="w-full md:w-1/2 pl-14 md:pl-0 md:pr-12 min-w-0">
                <div className="rounded-2xl border border-[#d9c27a]/30 bg-[#0b1f17] p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#d9c27a]">
                    <Users className="w-4 h-4" />
                    <span>{L('PLANNED ROADMAP (NOT YET DEPLOYED AT SCALE)', 'திட்டமிடப்பட்ட எதிர்காலப் பாதை')}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-[#061811] border border-white/[0.06]">
                      <div className="font-semibold text-[#fcfbf7]">{L('Official GeoJSON Ingestion', 'அதிகாரப்பூர்வ GeoJSON இணைப்பு')}</div>
                      <p className="mt-1 text-[#85928a]">{L('Plug in CWC / WRIS watershed shapefiles without synthetic approximations.', 'அரசு நீர்வள எல்லைக் கோப்புகளை நேரடியாக இணைத்தல்.')}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-[#061811] border border-white/[0.06]">
                      <div className="font-semibold text-[#fcfbf7]">{L('Live Sensor Connectors', 'நேரடி சென்சார் இணைப்புகள்')}</div>
                      <p className="mt-1 text-[#85928a]">{L('Integrate automated piezometer telemetry once institutional feeds are authorized.', 'அனுமதிக்கப்பட்ட தானியங்கி சென்சார் தரவுகளை இணைத்தல்.')}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => onExplore('community_portal')}
                      className="px-4 py-2 rounded-lg bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs font-semibold transition-colors"
                    >
                      {L('Open Community Portal', 'மக்கள் பலகம் திற')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onExplore('dashboard')}
                      className="px-4 py-2 rounded-lg border border-white/15 text-[#fcfbf7] hover:bg-white/5 text-xs font-medium transition-colors"
                    >
                      {L('Open Professional Console', 'தொழில்முறை பலகம் திற')}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
};
