import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { BasinHero3D } from '../hero/BasinHero3D';
import { DigitalTwinMap } from './DigitalTwinMap';
import { DataBadge } from '../common/DataBadge';
import { 
  ArrowRight, ShieldCheck, Droplets, AlertTriangle, Layers, 
  Search, Eye, Activity, Database, CheckCircle2, FileText, 
  Users, MapPin, Compass, ExternalLink, ChevronRight, Cpu
} from 'lucide-react';

interface LandingPageProps {
  onExplore: (module?: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onExplore }) => {
  const { t } = useLanguage();
  const [demoStep, setDemoStep] = useState<number>(0);

  const demoWorkflowSteps = [
    { title: "1. Open Digital Twin", desc: "Access the Palar River Catchment spatial map showing 7 key monitoring stations.", target: "digital_twin" },
    { title: "2. Inspect Station Profile", desc: "Select Ranipet Industrial Corridor to review historical hydrographs and TDS indices.", target: "groundwater" },
    { title: "3. Detect Quality Outlier", desc: "Automated statistical detector flags Chromium surge at 0.082 mg/L (Z-score 3.84).", target: "anomalies" },
    { title: "4. Walk-Forward Forecast", desc: "Seasonal baseline models project pre-monsoon drawdown with explicit uncertainty bounds.", target: "forecasting" },
    { title: "5. Multi-Criteria Risk", desc: "Prioritise Ranipet with explainable risk score 78.5 / 100 based on water stress + quality.", target: "risk_priority" },
    { title: "6. Dispatch Investigation", desc: "Field Team Alpha assigned to verify sensor calibration and collect physical ground samples.", target: "investigations" },
  ];

  return (
    <div className="bg-[#061811] text-[#f4f7f5] overflow-hidden">
      {/* SECTION 2 — CINEMATIC HERO */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0c2e21] border border-emerald-500/30 text-xs font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ENVIRONMENTAL INTELLIGENCE PLATFORM
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-ivory leading-[1.12]">
              Understand Water Risks <br />
              <span className="text-emerald-400">Before They Become</span> <br />
              Water Crises.
            </h1>

            <p className="text-base sm:text-lg text-stone-300 max-w-xl font-normal leading-relaxed">
              An AI-powered environmental decision platform combining groundwater insights, water-quality observations, rainfall intelligence, and geospatial risk prediction across the Palar River Basin, Tamil Nadu.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onExplore('dashboard')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-ivory font-semibold text-sm shadow-forest-md hover:shadow-emerald-glow transition-all flex items-center gap-2"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#workflow"
                className="px-6 py-3 rounded-xl bg-[#0d261c] hover:bg-[#123627] text-stone-200 border border-white/[0.08] hover:border-emerald-500/30 text-sm font-medium transition-colors"
              >
                Discover How It Works
              </a>
            </div>

            {/* Micro Metrics Strip */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-white/[0.08] text-left">
              <div>
                <div className="text-2xl font-bold font-sans text-ivory tabular-nums">17,810 km²</div>
                <div className="text-xs text-stone-400 font-mono">Basin Catchment</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-sans text-emerald-400 tabular-nums">7 Key Stations</div>
                <div className="text-xs text-stone-400 font-mono">Continuous Baseline</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-sans text-amber-400 tabular-nums">100% Provenance</div>
                <div className="text-xs text-stone-400 font-mono">Zero Fabricated Data</div>
              </div>
            </div>
          </div>

          {/* Right Interactive 3D Earth / Digital Twin Visual */}
          <div className="lg:col-span-5">
            <BasinHero3D />
          </div>
        </div>
      </section>

      {/* SECTION 3 — ENVIRONMENTAL CHALLENGE */}
      <section id="problem" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#071d14]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">The Problem</h4>
            <h2 className="text-3xl font-extrabold text-ivory tracking-tight">
              Water Risks Are Connected. Environmental Intelligence Should Be Too.
            </h2>
            <p className="text-sm text-stone-300">
              The Palar River Basin faces complex hydrological interdependencies where extraction, seasonal drought, and industrial discharge collide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Droplets className="w-5 h-5 text-emerald-400" />,
                title: "Groundwater Stress",
                desc: "Increasing extraction rates across upper alluvium aquifers cause rapid drawdowns during summer dry periods."
              },
              {
                icon: <Database className="w-5 h-5 text-cyan-400" />,
                title: "Fragmented Water Data",
                desc: "Water level, precipitation, and effluent quality observations exist in isolated silos across multiple agencies."
              },
              {
                icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
                title: "Delayed Risk Identification",
                desc: "Chemical contamination spikes and sudden drawdown trends are often noticed long after damage to local wells has occurred."
              },
              {
                icon: <Eye className="w-5 h-5 text-stone-300" />,
                title: "Limited Decision Visibility",
                desc: "Local communities and decision-makers lack an integrated, location-specific spatial system to prioritize ground interventions."
              }
            ].map((card, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-xl bg-[#092419] border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/20 flex items-center justify-center">
                    {card.icon}
                  </div>
                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                  <p className="text-xs text-stone-300 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 & 5 — OUR SOLUTION & 6-STAGE WORKFLOW */}
      <section id="workflow" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#061811]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Our Architecture</h4>
            <h2 className="text-3xl font-extrabold text-ivory tracking-tight">
              One Intelligence Platform. A Connected View of Water Risk.
            </h2>
            <p className="text-sm text-stone-300">
              Transforming raw hydrological records into structured, location-based intelligence across six verifiable stages.
            </p>
          </div>

          {/* 6-Stage Workflow Rail */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { step: "01", name: "OBSERVE", desc: "Aggregate verified groundwater, rainfall, and water quality observations." },
              { step: "02", name: "ANALYSE", desc: "Compute seasonal baselines, drawdown rates, and ionic concentration ratios." },
              { step: "03", name: "PREDICT", desc: "Project near-term water levels with walk-forward confidence intervals." },
              { step: "04", name: "PRIORITISE", desc: "Rank stations by multi-criteria risk urgency using explainable MCDA weights." },
              { step: "05", name: "VERIFY", desc: "Audit data provenance, inspect source confidence, and flag anomalies." },
              { step: "06", name: "ACT", desc: "Dispatch field verification teams and target recharge intervention zones." },
            ].map((stage, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl bg-[#092218] border border-emerald-500/20 relative flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-400 mb-2">{stage.step}</div>
                  <h3 className="text-sm font-bold text-white tracking-wide mb-1.5">{stage.name}</h3>
                  <p className="text-[11px] text-stone-400 leading-normal">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — DIGITAL TWIN PREVIEW */}
      <section id="digital-twin-preview" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#071f16]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">Geospatial Intelligence</h4>
              <h2 className="text-3xl font-extrabold text-ivory tracking-tight">Interactive Palar Basin Digital Twin</h2>
              <p className="text-sm text-stone-300 max-w-xl mt-1">
                Explore real geographical coordinates from Vaniyambadi in the upper catchment through Ranipet to the coastal discharge reach.
              </p>
            </div>
            <button
              onClick={() => onExplore('digital_twin')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-ivory text-xs font-semibold rounded-lg self-start md:self-auto flex items-center gap-1.5 transition-colors"
            >
              <span>Full Screen Map</span>
              <Compass className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-[500px]">
            <DigitalTwinMap onSelectLocation={() => onExplore('groundwater')} />
          </div>
        </div>
      </section>

      {/* SECTION 7 — PLATFORM MODULES (Bento Grid) */}
      <section id="modules-preview" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#061811]">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Core Capabilities</h4>
            <h2 className="text-3xl font-extrabold text-ivory tracking-tight">
              16 Integrated Environmental Decision Modules
            </h2>
            <p className="text-sm text-stone-300">
              Each module delivers targeted insights for environmental analysts, authorities, and researchers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Groundwater Card */}
            <div 
              onClick={() => onExplore('groundwater')}
              className="p-6 rounded-2xl bg-[#0a261b] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                  <Droplets className="w-5 h-5" />
                </div>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
              <h3 className="text-lg font-bold text-white">Groundwater Stress Intelligence</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Quarterly hydrographs from CGWB observation wells tracking depth-to-water (mbgl) trends, historical drawdown rates, and seasonal fluctuations.
              </p>
            </div>

            {/* Water Quality Card */}
            <div 
              onClick={() => onExplore('water_quality')}
              className="p-6 rounded-2xl bg-[#0a261b] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-teal-950 border border-teal-500/30 text-teal-400">
                  <Activity className="w-5 h-5" />
                </div>
                <DataBadge provenance="HISTORICAL_REPORT" />
              </div>
              <h3 className="text-lg font-bold text-white">Water Quality & Anomaly Detection</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Surveillance of Total Chromium, TDS, EC, BOD, and Dissolved Oxygen across industrial tannery corridors with automated Z-score outlier alerts.
              </p>
            </div>

            {/* Risk Prioritisation Card */}
            <div 
              onClick={() => onExplore('risk_priority')}
              className="p-6 rounded-2xl bg-[#0a261b] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-amber-950 border border-amber-500/30 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <DataBadge provenance="MODEL_PREDICTION" />
              </div>
              <h3 className="text-lg font-bold text-white">Geospatial Risk Prioritisation</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Explainable Multi-Criteria Decision Analysis ranking river stretches from 0 to 100 to guide prioritized field inspection dispatch.
              </p>
            </div>

            {/* Community Water Reporting */}
            <div 
              onClick={() => onExplore('community')}
              className="p-6 rounded-2xl bg-[#0a261b] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                  <Users className="w-5 h-5" />
                </div>
                <DataBadge provenance="COMMUNITY_REPORT" />
              </div>
              <h3 className="text-lg font-bold text-white">Community Incident Reporting</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Citizen science reporting for dried wells, unusual effluent discoloration, and foaming with moderation workflows and geotagging.
              </p>
            </div>

            {/* Recharge Intervention Intelligence */}
            <div 
              onClick={() => onExplore('recharge')}
              className="p-6 rounded-2xl bg-[#0a261b] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                  <Layers className="w-5 h-5" />
                </div>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
              <h3 className="text-lg font-bold text-white">Recharge Interventions</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Hydrogeological suitability assessment recommending check dams, percolation tanks, and traditional eri desiltation across suitable alluvium.
              </p>
            </div>

            {/* PALAR AI Assistant */}
            <div 
              onClick={() => onExplore('assistant')}
              className="p-6 rounded-2xl bg-[#0a261b] border border-white/[0.08] hover:border-emerald-500/40 cursor-pointer transition-all space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>
              <h3 className="text-lg font-bold text-white">PALAR AI Grounded Assistant</h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Grounded conversational intelligence retrieving station observations, explaining risk scores, and citing exact dates and scientific publications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10 — DATA SOURCES */}
      <section id="data-sources" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#071e15]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Traceable Provenance</h4>
            <h2 className="text-3xl font-extrabold text-ivory tracking-tight">Verified Public Reference Sources</h2>
            <p className="text-sm text-stone-300">
              PALAR GUARD AI relies on published, verified scientific benchmarks and government observation networks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                org: "Central Ground Water Board (CGWB)",
                title: "Aquifer Mapping & Management in Palar Basin",
                url: "https://cgwb.gov.in/sites/default/files/2022-11/aqm_palar_final.pdf",
                type: "Groundwater Levels & Transmissivity"
              },
              {
                org: "India-WRIS",
                title: "Water Resources Information System of India",
                url: "https://indiawris.gov.in/",
                type: "National Hydrograph Records"
              },
              {
                org: "India Meteorological Department (IMD)",
                title: "National Water Informatics Centre (NWIC)",
                url: "https://nwdp.nwic.gov.in/hi/organization/imd",
                type: "Catchment Precipitation Series"
              },
              {
                org: "Tamil Nadu Pollution Control Board (TNPCB)",
                title: "Water Quality Monitoring Programme",
                url: "https://tnpcb.gov.in/water-quality.php",
                type: "River Water Quality Records"
              },
              {
                org: "Central Pollution Control Board (CPCB)",
                title: "Polluted River Stretches in India",
                url: "https://www.cpcb.nic.in/wqm/RS-criteria-status.pdf",
                type: "Restoration Priority Criteria"
              },
              {
                org: "Springer Research Literature",
                title: "Hydrogeochemistry & Chromium in Palar River",
                url: "https://link.springer.com/article/10.1007/s11356-016-7639-4",
                type: "Peer-Reviewed Scientific Context"
              }
            ].map((source, sIdx) => (
              <a
                key={sIdx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#092218] border border-white/[0.08] hover:border-emerald-500/30 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1">
                    <span>{source.type}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">{source.org}</h4>
                  <p className="text-xs text-stone-400 mt-1">{source.title}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11 — INTERACTIVE WALKTHROUGH DEMONSTRATION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#061811]">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">Interactive Walkthrough</h4>
            <h2 className="text-3xl font-extrabold text-ivory tracking-tight">Step-by-Step Incident Response Flow</h2>
            <p className="text-sm text-stone-300">
              Experience how PALAR GUARD AI turns an environmental anomaly into actionable field triage.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0a261b] border border-emerald-500/30 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-xs font-mono text-emerald-400">STEP {demoStep + 1} OF {demoWorkflowSteps.length}</span>
              <span className="text-xs text-stone-400">Demonstration Workflow</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white mb-2">{demoWorkflowSteps[demoStep].title}</h3>
              <p className="text-sm text-stone-300 leading-relaxed mb-4">{demoWorkflowSteps[demoStep].desc}</p>
              
              <button
                onClick={() => onExplore(demoWorkflowSteps[demoStep].target)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Jump to this Module</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                onClick={() => setDemoStep(Math.max(0, demoStep - 1))}
                disabled={demoStep === 0}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-stone-300 disabled:opacity-40 transition-colors"
              >
                Previous Step
              </button>
              <div className="flex gap-1.5">
                {demoWorkflowSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setDemoStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === demoStep ? 'w-6 bg-emerald-400' : 'bg-white/20'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setDemoStep(Math.min(demoWorkflowSteps.length - 1, demoStep + 1))}
                disabled={demoStep === demoWorkflowSteps.length - 1}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white disabled:opacity-40 transition-colors"
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12 — ABOUT THE TEAM (CIT) */}
      <section id="team" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/[0.08] bg-[#071d14]">
        <div className="max-w-4xl mx-auto space-y-10 text-center">
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">The Innovators</h4>
            <h2 className="text-3xl font-extrabold text-ivory tracking-tight">Project Team & Institution</h2>
            <p className="text-sm text-stone-300">
              Engineered for national hackathons, academic review, and real-world deployment by Chennai Institute of Technology.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0a261c] border border-emerald-500/40 space-y-3 relative overflow-hidden">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-lg font-extrabold text-emerald-200">
                KJ
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kayalvizhi J</h3>
                <div className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 text-[11px] font-mono border border-emerald-500/30">
                  Founder & Project Lead
                </div>
              </div>
              <p className="text-xs text-stone-400">Chennai Institute of Technology</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#092218] border border-white/[0.08] space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#112d20] border-2 border-stone-500 flex items-center justify-center text-lg font-bold text-stone-200">
                HS
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Harini S</h3>
                <div className="inline-block mt-1 px-2 py-0.5 rounded bg-white/5 text-stone-300 text-[11px] font-mono">
                  Team Member
                </div>
              </div>
              <p className="text-xs text-stone-400">Chennai Institute of Technology</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#092218] border border-white/[0.08] space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#112d20] border-2 border-stone-500 flex items-center justify-center text-lg font-bold text-stone-200">
                AL
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Aarthi L</h3>
                <div className="inline-block mt-1 px-2 py-0.5 rounded bg-white/5 text-stone-300 text-[11px] font-mono">
                  Team Member
                </div>
              </div>
              <p className="text-xs text-stone-400">Chennai Institute of Technology</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13 — CALL TO ACTION */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-[#04100b] to-[#061811]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ivory tracking-tight">
            Every Drop Deserves Better Intelligence.
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-xl mx-auto">
            Discover how explainable environmental data can support smarter, faster, and more equitable water decisions across the Palar River Basin.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onExplore('dashboard')}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-ivory font-bold text-sm shadow-forest-lg hover:shadow-emerald-glow transition-all inline-flex items-center gap-2"
            >
              <span>Explore PALAR GUARD AI Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
