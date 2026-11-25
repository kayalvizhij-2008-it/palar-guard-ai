import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, Droplets, CloudRain, Activity, LineChart, 
  ShieldCheck, ShieldAlert, CheckCircle2, ChevronRight, 
  MapPin, Layers, FileText, Check, AlertTriangle, ArrowUpRight,
  TrendingDown, Sparkles
} from 'lucide-react';
import { DataBadge } from '../common/DataBadge';
import { useLanguage } from '../../context/LanguageContext';
import { PALAR_LOCATIONS } from '../../data/palarData';

interface VerticalFallingTimelineProps {
  onExplore: (module?: string) => void;
}

export const VerticalFallingTimeline: React.FC<VerticalFallingTimelineProps> = ({ onExplore }) => {
  const { lang } = useLanguage();
  const [activeNodes, setActiveNodes] = useState<number[]>([0]);
  const [selectedStation, setSelectedStation] = useState<number>(0);
  const [activeDataTab, setActiveDataTab] = useState<'groundwater' | 'rainfall' | 'quality'>('groundwater');
  const [selectedAction, setSelectedAction] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Monitor visibility of milestone cards to illuminate central progress line and trigger fall-in animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const indexAttr = entry.target.getAttribute('data-node-idx');
            if (indexAttr !== null) {
              const nodeIdx = parseInt(indexAttr, 10);
              setActiveNodes((prev) => Array.from(new Set([...prev, nodeIdx])));
            }
          }
        });
      },
      { threshold: 0.25, rootMargin: '0px 0px -10% 0px' }
    );

    const cards = document.querySelectorAll('.timeline-falling-card');
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const stations = [
    { name: "Ranipet", lat: 12.9279, lng: 79.3330, depth: "14.8 mbgl", status: "Critical Stress", role: "Industrial Corridor" },
    { name: "Ambur", lat: 12.7904, lng: 78.7164, depth: "14.2 mbgl", status: "High Stress", role: "Tannery Hub" },
    { name: "Vaniyambadi", lat: 12.6825, lng: 78.6180, depth: "15.1 mbgl", status: "Critical Depletion", role: "Upper Basin" },
    { name: "Vellore", lat: 12.9165, lng: 79.1325, depth: "12.8 mbgl", status: "Moderate", role: "Central Valley" },
    { name: "Walajah", lat: 12.9833, lng: 79.3667, depth: "11.6 mbgl", status: "Alluvial Reach", role: "Irrigation Belt" },
    { name: "Kanchipuram", lat: 12.8342, lng: 79.7036, depth: "9.8 mbgl", status: "Stable", role: "Lower Plains" },
    { name: "Chengalpattu", lat: 12.6841, lng: 79.9836, depth: "7.4 mbgl", status: "Estuary Buffer", role: "Coastal Delta" }
  ];

  const interventions = [
    { title: "Infiltration Shafts", zone: "Ranipet Alluvium", suitability: 88, rechargeRate: "+320 m³/day", cost: "Low", status: "High Priority" },
    { title: "Check Dam Desiltation", zone: "Walajah-Arcot Reach", suitability: 84, rechargeRate: "+540 m³/day", cost: "Medium", status: "Approved" },
    { title: "Traditional Eri Restoration", zone: "Kanchipuram Tanks", suitability: 79, rechargeRate: "+410 m³/day", cost: "Community", status: "Ready" },
    { title: "Farm Percolation Ponds", zone: "Upper Vaniyambadi", suitability: 76, rechargeRate: "+210 m³/day", cost: "Micro", status: "Active" }
  ];

  return (
    <section ref={timelineRef} className="relative py-28 px-4 sm:px-6 lg:px-8 bg-[#020905] border-b border-white/[0.08] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-950/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[500px] h-[500px] bg-cyan-950/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto space-y-20">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {lang === 'ta' ? 'அறிவியல் பணிப்பாய்வு · கண்காணிப்பு முதல் தீர்வு வரை' : 'VERTICAL INTELLIGENCE SPUR · 6 STAGES'}
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {lang === 'ta' ? (
              <>
                கண்காணிப்பு முதல் <br />
                <span className="text-emerald-400">களத் தீர்வுகள் வரை.</span>
              </>
            ) : (
              <>
                FROM OBSERVATION <br />
                <span className="text-emerald-400">TO ACTION.</span>
              </>
            )}
          </h2>
          
          <p className="text-base text-stone-300 leading-relaxed font-normal">
            {lang === 'ta'
              ? 'பாலாற்று படுகையின் 17,810 ச.கி.மீ பரப்பளவில் சுற்றுச்சூழல் தரவுகள் எவ்வாறு செயலாக்கப்பட்டு கொள்கை மற்றும் களத் தீர்வுகளாக மாறுகின்றன என்பதை படிப்படியாக காண்க.'
              : 'Explore the continuous journey of environmental intelligence across the Palar River Basin—from raw observation well telemetry to explainable risk prioritization and targeted aquifer recharge.'}
          </p>
        </div>

        {/* Vertical Timeline Structure */}
        <div className="relative max-w-5xl mx-auto">
          {/* Central Vertical Glowing Line */}
          <div className="absolute left-6 md:left-1/2 top-4 bottom-8 w-1 -translate-x-1/2 bg-[#092b1a] rounded-full pointer-events-none">
            {/* Illuminated Progress Line */}
            <div 
              className="w-full bg-gradient-to-b from-emerald-400 via-teal-400 to-cyan-500 rounded-full transition-all duration-700 shadow-emerald-glow"
              style={{ height: `${Math.min(100, ((activeNodes.length) / 6) * 100)}%` }}
            />
          </div>

          <div className="space-y-16 sm:space-y-24">

            {/* ======================================================== */}
            {/* CARD 01 — OBSERVE: Mini-Map of 7 Baseline Stations */}
            {/* ======================================================== */}
            <div 
              data-node-idx="0"
              className={`timeline-falling-card relative flex flex-col md:flex-row items-center gap-8 md:gap-14 transition-all duration-700 ${
                activeNodes.includes(0) ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
              }`}
            >
              {/* Central Glowing Node Marker */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#020b06] border-2 border-emerald-400 flex items-center justify-center z-20 shadow-emerald-glow">
                <div className={`w-3 h-3 rounded-full ${activeNodes.includes(0) ? 'bg-emerald-400 animate-ping' : 'bg-emerald-600'}`} />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              {/* Left Column / Mobile Offset */}
              <div className="w-full md:w-1/2 pl-16 md:pl-0 md:pr-12 md:text-right space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
                  <span>STAGE 01</span>
                  <span>·</span>
                  <span>OBSERVE</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Baseline Telemetry Harvesting</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Aggregating 7 baseline river stations across 17,810 km² catchment. Continuous telemetry from CGWB national hydrograph network and IMD NWIC automated weather stations.
                </p>
                <div className="pt-2 flex items-center md:justify-end gap-3 text-xs font-mono text-stone-400">
                  <span className="text-emerald-400 font-bold">17,810 km² Catchment</span>
                  <span>·</span>
                  <DataBadge provenance="VERIFIED_PUBLIC" />
                </div>
              </div>

              {/* Right Column: Distinct Mini-Map Component */}
              <div className="w-full md:w-1/2 pl-16 md:pl-12">
                <div className="p-5 rounded-2xl bg-[#061e12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-4 shadow-forest-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">7 Basin Stations (CGWB / IMD)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/20">
                      LIVE INGESTION
                    </span>
                  </div>

                  {/* Interactive Mini Station Map Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    {stations.slice(0, 4).map((st, i) => (
                      <button
                        key={st.name}
                        onClick={() => setSelectedStation(i)}
                        className={`p-2.5 rounded-xl text-left border transition-all ${
                          selectedStation === i 
                            ? 'bg-[#0a2e1d] border-emerald-400 text-white' 
                            : 'bg-[#031109] border-white/[0.06] text-stone-400 hover:border-emerald-500/30'
                        }`}
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{st.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">{st.depth}</span>
                        </div>
                        <div className="text-[10px] text-stone-400 truncate mt-0.5">{st.role}</div>
                      </button>
                    ))}
                  </div>

                  {/* Active Station Detail Box */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-xs space-y-1">
                    <div className="flex justify-between text-stone-400 font-mono text-[11px]">
                      <span>Coord: {stations[selectedStation].lat}°N, {stations[selectedStation].lng}°E</span>
                      <span className="text-amber-400 font-semibold">{stations[selectedStation].status}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onExplore('digital_twin')}
                    className="w-full py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View All 7 Stations on Geospatial Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* CARD 02 — ANALYSE: Layered Data Stack Visualization */}
            {/* ======================================================== */}
            <div 
              data-node-idx="1"
              className={`timeline-falling-card relative flex flex-col md:flex-row-reverse items-center gap-8 md:gap-14 transition-all duration-700 ${
                activeNodes.includes(1) ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
              }`}
            >
              {/* Central Glowing Node Marker */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#020b06] border-2 border-cyan-400 flex items-center justify-center z-20 shadow-emerald-glow">
                <div className={`w-3 h-3 rounded-full ${activeNodes.includes(1) ? 'bg-cyan-400 animate-ping' : 'bg-cyan-600'}`} />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400" />
              </div>

              {/* Right Column (Text on Right on Desktop) */}
              <div className="w-full md:w-1/2 pl-16 md:pl-12 space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-500/30 text-[11px] font-mono font-bold text-cyan-400">
                  <span>STAGE 02</span>
                  <span>·</span>
                  <span>ANALYSE</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Multi-Strata Hydrogeochemical Profiling</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Cross-indexing multi-year seasonal water-table decline against monsoon recharge spikes and chemical ionic concentration. Revealing systemic groundwater deficits across unconfined charnockite alluvium.
                </p>
                <div className="pt-2 flex items-center gap-3 text-xs font-mono text-stone-400">
                  <span className="text-cyan-400 font-bold">14.9 mbgl Mean Drawdown</span>
                  <span>·</span>
                  <DataBadge provenance="HISTORICAL_REPORT" />
                </div>
              </div>

              {/* Left Column: Distinct Layered Data Stack Component */}
              <div className="w-full md:w-1/2 pl-16 md:pl-0 md:pr-12">
                <div className="p-5 rounded-2xl bg-[#061e12] border border-white/[0.08] hover:border-cyan-500/40 transition-all space-y-4 shadow-forest-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">Cross-Indexed Analytical Layers</span>
                    </div>
                    {/* Layer Toggles */}
                    <div className="flex rounded-lg bg-black/50 p-0.5 border border-white/[0.08] text-[10px] font-mono">
                      <button 
                        onClick={() => setActiveDataTab('groundwater')}
                        className={`px-2 py-0.5 rounded ${activeDataTab === 'groundwater' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400'}`}
                      >
                        Water
                      </button>
                      <button 
                        onClick={() => setActiveDataTab('rainfall')}
                        className={`px-2 py-0.5 rounded ${activeDataTab === 'rainfall' ? 'bg-cyan-600 text-white font-bold' : 'text-stone-400'}`}
                      >
                        Rain
                      </button>
                      <button 
                        onClick={() => setActiveDataTab('quality')}
                        className={`px-2 py-0.5 rounded ${activeDataTab === 'quality' ? 'bg-amber-600 text-white font-bold' : 'text-stone-400'}`}
                      >
                        Ions
                      </button>
                    </div>
                  </div>

                  {/* 3 Visual Strata Bars */}
                  <div className="space-y-2.5">
                    {/* Layer 1: Groundwater Depletion */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeDataTab === 'groundwater' ? 'bg-[#09291b] border-emerald-500/50' : 'bg-black/30 border-white/[0.04]'
                    }`}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-stone-200">Pre-Monsoon Aquifer Depletion</span>
                        <span className="font-mono text-emerald-400 font-bold">-0.6 m / year</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 w-[74%]" />
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                        <span>CGWB National Wells</span>
                        <span>14.9 mbgl Mean</span>
                      </div>
                    </div>

                    {/* Layer 2: Rainfall Concentration */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeDataTab === 'rainfall' ? 'bg-[#092529] border-cyan-500/50' : 'bg-black/30 border-white/[0.04]'
                    }`}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-stone-200">Monsoon Rainfall Intensity</span>
                        <span className="font-mono text-cyan-400 font-bold">55% NE Storms</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 w-[62%]" />
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                        <span>IMD NWIC Catchment</span>
                        <span>682 mm Annual</span>
                      </div>
                    </div>

                    {/* Layer 3: Ionic Chemical Stress */}
                    <div className={`p-3 rounded-xl border transition-all ${
                      activeDataTab === 'quality' ? 'bg-[#291b09] border-amber-500/50' : 'bg-black/30 border-white/[0.04]'
                    }`}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold text-stone-200">Total Chromium / TDS Surges</span>
                        <span className="font-mono text-amber-400 font-bold">0.082 mg/L</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-red-500 w-[86%]" />
                      </div>
                      <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                        <span>CPCB Priority-V Limit 0.05 mg/L</span>
                        <span className="text-red-400">+64% Exceedance</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onExplore('groundwater')}
                    className="w-full py-2 bg-cyan-700/80 hover:bg-cyan-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Layered Basin Analytics</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* CARD 03 — PREDICT: Walk-Forward Uncertainty Cone */}
            {/* ======================================================== */}
            <div 
              data-node-idx="2"
              className={`timeline-falling-card relative flex flex-col md:flex-row items-center gap-8 md:gap-14 transition-all duration-700 ${
                activeNodes.includes(2) ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
              }`}
            >
              {/* Central Glowing Node Marker */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#020b06] border-2 border-emerald-400 flex items-center justify-center z-20 shadow-emerald-glow">
                <div className={`w-3 h-3 rounded-full ${activeNodes.includes(2) ? 'bg-emerald-400 animate-ping' : 'bg-emerald-600'}`} />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              {/* Left Column / Mobile Offset */}
              <div className="w-full md:w-1/2 pl-16 md:pl-0 md:pr-12 md:text-right space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
                  <span>STAGE 03</span>
                  <span>·</span>
                  <span>PREDICT</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Explainable 4-Quarter Projections</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Seasonal walk-forward statistical forecasting projecting water table depression 4 quarters in advance. Featuring empirical 90% confidence uncertainty envelopes to avoid overconfidence.
                </p>
                <div className="pt-2 flex items-center md:justify-end gap-3 text-xs font-mono text-stone-400">
                  <span className="text-emerald-400 font-bold">17.0 ± 1.2 mbgl Forecast</span>
                  <span>·</span>
                  <DataBadge provenance="MODEL_PREDICTION" />
                </div>
              </div>

              {/* Right Column: Distinct Uncertainty Cone Chart Component */}
              <div className="w-full md:w-1/2 pl-16 md:pl-12">
                <div className="p-5 rounded-2xl bg-[#061e12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-4 shadow-forest-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <LineChart className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">Seasonal Forecast Cone (90% CI)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      ±1.2m UNCERTAINTY
                    </span>
                  </div>

                  {/* SVG Forecast Graph with expanding uncertainty cone */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] space-y-2">
                    <div className="relative h-28 w-full">
                      <svg className="w-full h-full" viewBox="0 0 320 100" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="coneGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
                          </linearGradient>
                        </defs>
                        {/* Shaded 90% Confidence Uncertainty Cone */}
                        <polygon 
                          points="140,55 200,45 260,35 310,25 310,85 260,75 200,68 140,55" 
                          fill="url(#coneGrad)" 
                        />
                        {/* Historical Baseline Line */}
                        <path 
                          d="M 10,75 Q 70,68 140,55" 
                          fill="none" 
                          stroke="#6ee7b7" 
                          strokeWidth="2.5" 
                        />
                        {/* Projected Forecast Center Line */}
                        <path 
                          d="M 140,55 Q 220,53 310,50" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="2.5" 
                          strokeDasharray="4 4"
                        />
                        {/* Upper Bound Line */}
                        <path 
                          d="M 140,55 Q 220,40 310,25" 
                          fill="none" 
                          stroke="#34d399" 
                          strokeWidth="1" 
                          strokeOpacity="0.6"
                        />
                        {/* Lower Bound Line */}
                        <path 
                          d="M 140,55 Q 220,68 310,85" 
                          fill="none" 
                          stroke="#34d399" 
                          strokeWidth="1" 
                          strokeOpacity="0.6"
                        />
                        {/* Points */}
                        <circle cx="10" cy="75" r="3.5" fill="#10b981" />
                        <circle cx="140" cy="55" r="4" fill="#34d399" stroke="#020905" strokeWidth="2" />
                        <circle cx="310" cy="50" r="4" fill="#fbbf24" stroke="#020905" strokeWidth="2" />
                      </svg>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-stone-400 border-t border-white/[0.04] pt-2">
                      <span>Historical Baseline (14.9m)</span>
                      <span className="text-emerald-400 font-bold">Q4 Projected: 17.0 mbgl</span>
                      <span className="text-amber-400">Range: 15.8 – 18.2m</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onExplore('forecasting')}
                    className="w-full py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Run Seasonal Walk-Forward Simulation</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* CARD 04 — PRIORITISE: MCDA Risk Matrix Miniature */}
            {/* ======================================================== */}
            <div 
              data-node-idx="3"
              className={`timeline-falling-card relative flex flex-col md:flex-row-reverse items-center gap-8 md:gap-14 transition-all duration-700 ${
                activeNodes.includes(3) ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
              }`}
            >
              {/* Central Glowing Node Marker */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#020b06] border-2 border-amber-400 flex items-center justify-center z-20 shadow-emerald-glow">
                <div className={`w-3 h-3 rounded-full ${activeNodes.includes(3) ? 'bg-amber-400 animate-ping' : 'bg-amber-600'}`} />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-amber-400" />
              </div>

              {/* Right Column (Text on Right on Desktop) */}
              <div className="w-full md:w-1/2 pl-16 md:pl-12 space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-amber-950/70 border border-amber-500/30 text-[11px] font-mono font-bold text-amber-400">
                  <span>STAGE 04</span>
                  <span>·</span>
                  <span>PRIORITISE</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Multi-Criteria Decision Analysis (MCDA)</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Synthesizing groundwater drawdown, ionic exceedance, and rainfall deficit with objective mathematical weights. Ranipet ranked #1 with composite risk score of 78.5/100.
                </p>
                <div className="pt-2 flex items-center gap-3 text-xs font-mono text-stone-400">
                  <span className="text-amber-400 font-bold">Ranipet: 78.5 / 100 Risk</span>
                  <span>·</span>
                  <DataBadge provenance="MODEL_PREDICTION" />
                </div>
              </div>

              {/* Left Column: Distinct MCDA Weight Matrix Component */}
              <div className="w-full md:w-1/2 pl-16 md:pl-0 md:pr-12">
                <div className="p-5 rounded-2xl bg-[#061e12] border border-white/[0.08] hover:border-amber-500/40 transition-all space-y-4 shadow-forest-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-950 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Compass className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">Priority Matrix (CPCB Corridors)</span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/30">
                      RANK #1 CRITICAL
                    </span>
                  </div>

                  {/* Weight Matrix Breakdown */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-300">Groundwater Stress (30%)</span>
                      <span className="font-mono text-white font-bold">82 / 100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-800">
                      <div className="h-full bg-amber-400 rounded-full w-[82%]" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-300">Water Quality Surges (35%)</span>
                      <span className="font-mono text-red-400 font-bold">88 / 100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-800">
                      <div className="h-full bg-red-400 rounded-full w-[88%]" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-300">Monsoon Deficit (15%)</span>
                      <span className="font-mono text-cyan-400 font-bold">64 / 100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-800">
                      <div className="h-full bg-cyan-400 rounded-full w-[64%]" />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-stone-300">Data Reliability & Provenance (20%)</span>
                      <span className="font-mono text-emerald-400 font-bold">95 / 100</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-800">
                      <div className="h-full bg-emerald-400 rounded-full w-[95%]" />
                    </div>
                  </div>

                  {/* Summary Rank Banner */}
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between text-xs">
                    <span className="text-stone-300 font-semibold">Ranipet Priority Score:</span>
                    <span className="text-amber-300 font-mono font-bold text-base">78.5 / 100</span>
                  </div>

                  <button
                    onClick={() => onExplore('risk_priority')}
                    className="w-full py-2 bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Basin Priority Ranking</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* CARD 05 — VERIFY: Field Dossier & Robust MAD Z-Score */}
            {/* ======================================================== */}
            <div 
              data-node-idx="4"
              className={`timeline-falling-card relative flex flex-col md:flex-row items-center gap-8 md:gap-14 transition-all duration-700 ${
                activeNodes.includes(4) ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
              }`}
            >
              {/* Central Glowing Node Marker */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#020b06] border-2 border-teal-400 flex items-center justify-center z-20 shadow-emerald-glow">
                <div className={`w-3 h-3 rounded-full ${activeNodes.includes(4) ? 'bg-teal-400 animate-ping' : 'bg-teal-600'}`} />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-teal-400" />
              </div>

              {/* Left Column / Mobile Offset */}
              <div className="w-full md:w-1/2 pl-16 md:pl-0 md:pr-12 md:text-right space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-teal-950/70 border border-teal-500/30 text-[11px] font-mono font-bold text-teal-400">
                  <span>STAGE 05</span>
                  <span>·</span>
                  <span>VERIFY</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Rigorous Provenance & Anomaly Triage</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Screening parameter spikes using Median Absolute Deviation (MAD) Robust Z-scores. Flagging chemical surges for field verification teams without unverified public accusations.
                </p>
                <div className="pt-2 flex items-center md:justify-end gap-3 text-xs font-mono text-stone-400">
                  <span className="text-teal-400 font-bold">Robust MAD Z = 3.84</span>
                  <span>·</span>
                  <DataBadge provenance="VERIFIED_PUBLIC" />
                </div>
              </div>

              {/* Right Column: Distinct Field Dossier Component */}
              <div className="w-full md:w-1/2 pl-16 md:pl-12">
                <div className="p-5 rounded-2xl bg-[#061e12] border border-white/[0.08] hover:border-teal-500/40 transition-all space-y-4 shadow-forest-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-950 border border-teal-500/30 flex items-center justify-center text-teal-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">Field Investigation Dossier</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      CHAIN-OF-CUSTODY
                    </span>
                  </div>

                  {/* Dossier Body with Embossed Stamp */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-2.5 relative overflow-hidden">
                    {/* Embossed Watermark Stamp */}
                    <div className="absolute right-2 -bottom-2 border-2 border-emerald-500/40 text-emerald-400/40 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase rotate-[-12deg] pointer-events-none">
                      VERIFIED PUBLIC
                    </div>

                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="text-stone-400">Incident Ticket:</span>
                      <span className="font-mono text-white">#TN-PLR-2024-884</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="text-stone-400">Officer In-Charge:</span>
                      <span className="text-emerald-300">Team Alpha (K. Selvan)</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="text-stone-400">Methodology:</span>
                      <span className="font-mono text-stone-200">MAD Robust Z-Score</span>
                    </div>
                    <div className="flex justify-between text-xs text-stone-300">
                      <span className="text-stone-400">Duplicate Assay:</span>
                      <span className="text-teal-300 font-semibold">100% Chain-of-Custody</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onExplore('investigation')}
                    className="w-full py-2 bg-teal-700/80 hover:bg-teal-600 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Inspect Investigation Kanban Board</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* CARD 06 — ACT: Managed Aquifer Recharge (MAR) Selector */}
            {/* ======================================================== */}
            <div 
              data-node-idx="5"
              className={`timeline-falling-card relative flex flex-col md:flex-row-reverse items-center gap-8 md:gap-14 transition-all duration-700 ${
                activeNodes.includes(5) ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'
              }`}
            >
              {/* Central Glowing Node Marker */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#020b06] border-2 border-emerald-400 flex items-center justify-center z-20 shadow-emerald-glow">
                <div className={`w-3 h-3 rounded-full ${activeNodes.includes(5) ? 'bg-emerald-400 animate-ping' : 'bg-emerald-600'}`} />
                <div className="absolute w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              {/* Right Column (Text on Right on Desktop) */}
              <div className="w-full md:w-1/2 pl-16 md:pl-12 space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-400">
                  <span>STAGE 06</span>
                  <span>·</span>
                  <span>ACT</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Targeted Managed Aquifer Recharge (MAR)</h3>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Translating hydrological vulnerability into engineering decisions. Identifying optimal alluvium sites for check dams, infiltration shafts, and traditional tank desiltation.
                </p>
                <div className="pt-2 flex items-center gap-3 text-xs font-mono text-stone-400">
                  <span className="text-emerald-400 font-bold">88% Siting Suitability</span>
                  <span>·</span>
                  <DataBadge provenance="VERIFIED_PUBLIC" />
                </div>
              </div>

              {/* Left Column: Distinct Action Intervention Selector Component */}
              <div className="w-full md:w-1/2 pl-16 md:pl-0 md:pr-12">
                <div className="p-5 rounded-2xl bg-[#061e12] border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-4 shadow-forest-lg">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Droplets className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">MAR Intervention Siting Engine</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                      DECISION SUPPORT
                    </span>
                  </div>

                  {/* Siting Options List */}
                  <div className="space-y-2">
                    {interventions.map((item, idx) => (
                      <div 
                        key={item.title}
                        onClick={() => setSelectedAction(idx)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                          selectedAction === idx 
                            ? 'bg-[#0a3320] border-emerald-400 text-white' 
                            : 'bg-black/30 border-white/[0.05] text-stone-400 hover:border-emerald-500/30'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white">{item.title}</span>
                          <span className="font-mono text-emerald-400 font-bold">{item.suitability}% Siting</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                          <span>{item.zone}</span>
                          <span className="text-emerald-300">{item.rechargeRate}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onExplore('recharge')}
                    className="w-full py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Launch Recharge Intervention Planner</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Call to Action within Timeline */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#041d11] via-[#072c1c] to-[#041d11] border border-emerald-500/30 text-center max-w-4xl mx-auto space-y-4 shadow-forest-lg">
          <h3 className="text-2xl font-bold text-white">
            Ready to explore the real basin intelligence platform?
          </h3>
          <p className="text-xs text-stone-300 max-w-xl mx-auto">
            Switch between public community reporting and high-precision environmental analytics across all 16 dedicated modules.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onExplore('dashboard')}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-emerald-glow flex items-center gap-2 transition-all"
            >
              <span>Explore Platform Workspace</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExplore('community')}
              className="px-6 py-2.5 bg-[#03140a] hover:bg-[#062413] text-emerald-300 font-semibold text-xs rounded-xl border border-emerald-500/40 flex items-center gap-2 transition-all"
            >
              <span>Open Community Access (தமிழ்)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
