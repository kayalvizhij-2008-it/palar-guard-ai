import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TopKPICardsRow } from '../dashboard/TopKPICardsRow';
import { CentralBasinSatelliteMap } from '../dashboard/CentralBasinSatelliteMap';
import { WaterAnalyticsChart } from '../dashboard/WaterAnalyticsChart';
import { PriorityAlertsCard } from '../dashboard/PriorityAlertsCard';
import { GlobeMiniView } from '../dashboard/GlobeMiniView';
import { BasinTerrain3DBlock } from '../dashboard/BasinTerrain3DBlock';
import { VoiceAssistantMini } from '../dashboard/VoiceAssistantMini';
import { CommunityFeedbackCard } from '../dashboard/CommunityFeedbackCard';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS, GROUNDWATER_TIMESERIES } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { 
  Users, GraduationCap, ShieldAlert, Cpu, Compass, 
  Layers, CheckCircle2, AlertTriangle, ArrowRight, 
  Download, Filter, Sliders, Calendar, Sparkles, 
  MapPin, Eye, FileSpreadsheet, ChevronDown, ChevronUp,
  Droplets, CloudRain, FlaskConical, Activity, FileText, Check
} from 'lucide-react';

export type DashboardRole = 'command' | 'farmer' | 'researcher' | 'field_officer' | 'admin';

interface DashboardOverviewProps {
  onSelectModule: (moduleId: string) => void;
  onSelectLocation?: (locId: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  onSelectModule, 
  onSelectLocation 
}) => {
  const { t, lang, mode } = useLanguage();
  const [activeRole, setActiveRole] = useState<DashboardRole>('command');
  const [showTechnicalTable, setShowTechnicalTable] = useState(false);

  // Community / Farmer state
  const [selectedVillageId, setSelectedVillageId] = useState<number>(1);

  // Researcher Filter states (matching reference blueprint image 1)
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [surveyTypeERS, setSurveyTypeERS] = useState<boolean>(true);
  const [surveyTypeGBL, setSurveyTypeGBL] = useState<boolean>(true);
  const [yearRange, setYearRange] = useState<number>(2024);
  const [gradeA, setGradeA] = useState<boolean>(true);
  const [gradeB, setGradeB] = useState<boolean>(true);
  const [gradeC, setGradeC] = useState<boolean>(false);
  const [gradeD, setGradeD] = useState<boolean>(false);

  // Field Officer Investigation Queue
  const [investigationsList, setInvestigationsList] = useState([
    {
      id: 'INV-2026-041',
      title: 'Tannery Effluent Verification at Walajah Bridge',
      location: 'Ranipet / Walajah',
      urgency: 'Critical',
      status: 'In Progress',
      officer: 'S. Ramesh (Sr. Chemist)',
      time: '10 min ago'
    },
    {
      id: 'INV-2026-039',
      title: 'Agricultural Borewell Depletion Cluster Report',
      location: 'Ambur Rural',
      urgency: 'Urgent',
      status: 'Assigned',
      officer: 'K. Priya (Hydrogeologist)',
      time: '1 hour ago'
    },
    {
      id: 'INV-2026-038',
      title: 'Routine Water Quality Monitoring & Heavy Metal Check',
      location: 'Kanchipuram Downstream',
      urgency: 'Routine',
      status: 'Verified',
      officer: 'M. Anand (Field Officer)',
      time: '3 hours ago'
    }
  ]);

  // Selected village object for Farmer view
  const currentVillage = PALAR_LOCATIONS.find(l => l.id === selectedVillageId) || PALAR_LOCATIONS[0];
  const currentVillageWQ = WATER_QUALITY_STATIONS.find(w => w.location_id === currentVillage.id);
  const currentVillageGW = GROUNDWATER_TIMESERIES[currentVillage.id];
  const currentVillageDepth = currentVillageGW ? currentVillageGW[currentVillageGW.length - 1]?.depth_mbgl : 13.5;
  const currentVillageTDS = currentVillageWQ?.tds_mg_l ?? 750;

  return (
    <div className="space-y-4 pb-8 select-none">
      
      {/* ============================================================ */}
      {/* 0. ROLE-SPECIFIC PERSONA SWITCHER BAR */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl bg-[#061e12] border border-white/[0.08]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
            {lang === 'ta' ? 'பயனர் பார்வை நிலை' : 'ACTIVE PERSONA WORKSPACE'}:
          </span>
          <span className="text-xs font-bold text-white">
            {activeRole === 'command' && (lang === 'ta' ? 'ஒருங்கிணைந்த கட்டளை மையம்' : 'Unified Command Center')}
            {activeRole === 'farmer' && (lang === 'ta' ? 'விவசாயி & எளிய மக்கள் முகப்பு' : 'Community & Farmer Workspace')}
            {activeRole === 'researcher' && (lang === 'ta' ? 'ஆய்வாளர் புவிசார் தளம்' : 'Geophysical Researcher Portal')}
            {activeRole === 'field_officer' && (lang === 'ta' ? 'கள அதிகாரி பணிப்பாய்வு' : 'Field Officer Dispatch Queue')}
            {activeRole === 'admin' && (lang === 'ta' ? 'நிறுவன நிர்வாகம்' : 'Institutional Admin Console')}
          </span>
        </div>

        {/* 5 Distinct Persona Role Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-none bg-[#03110a] p-1 rounded-xl border border-white/10 shrink-0">
          {[
            { id: 'command', label: lang === 'ta' ? 'முழு பலகம்' : 'Command View', icon: <Compass className="w-3.5 h-3.5" /> },
            { id: 'farmer', label: lang === 'ta' ? 'விவசாயி' : 'Farmer / Community', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'researcher', label: lang === 'ta' ? 'ஆய்வாளர்' : 'Researcher', icon: <GraduationCap className="w-3.5 h-3.5" /> },
            { id: 'field_officer', label: lang === 'ta' ? 'கள அதிகாரி' : 'Field Officer', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
            { id: 'admin', label: lang === 'ta' ? 'நிர்வாகம்' : 'Admin SaaS', icon: <Cpu className="w-3.5 h-3.5" /> },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setActiveRole(r.id as DashboardRole)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                activeRole === r.id
                  ? 'bg-emerald-600 text-white shadow-forest-sm'
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {r.icon}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. EXECUTIVE / COMMAND CENTER (DEFAULT FULL VIEW) */}
      {/* ============================================================ */}
      {activeRole === 'command' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top 5 KPI Metric Cards Row matching reference blueprint */}
          <TopKPICardsRow
            onRefreshData={() => {}}
            onSelectCard={(cardId) => onSelectModule(cardId)}
          />

          {/* Middle Grid: Central Satellite Map (Left) + Environmental Analytics & Priority Alerts (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (Approx 58% on Desktop): Central Satellite GIS Map */}
            <div className="lg:col-span-7 xl:col-span-7">
              <CentralBasinSatelliteMap
                onSelectStation={(stationId) => {
                  onSelectLocation?.(stationId);
                  onSelectModule('groundwater');
                }}
              />
            </div>

            {/* Right Column (Approx 42% on Desktop): Chart + Alerts */}
            <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4">
              <div className="flex-1">
                <WaterAnalyticsChart />
              </div>
              <div className="flex-1">
                <PriorityAlertsCard
                  onViewAll={() => onSelectModule('anomalies')}
                  onSelectAlert={(alertId) => onSelectModule('anomalies')}
                />
              </div>
            </div>
          </div>

          {/* Bottom Row: 4 Dedicated Interactive Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlobeMiniView onOpenGlobe={() => onSelectModule('digital_twin')} />
            <BasinTerrain3DBlock onOpen3D={() => onSelectModule('digital_twin')} />
            <VoiceAssistantMini onOpenFullAssistant={() => onSelectModule('assistant')} />
            <CommunityFeedbackCard onOpenReportModal={() => onSelectModule('community')} />
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. COMMUNITY / FARMER DASHBOARD (FOCUSED ON SIMPLICITY) */}
      {/* ============================================================ */}
      {activeRole === 'farmer' && (
        <div className="space-y-6 animate-fade-in">
          {/* Village Selector & Status Banner */}
          <div className="p-6 rounded-2xl bg-[#071c12] border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950 text-xs font-mono text-emerald-400 border border-emerald-500/30">
                {lang === 'ta' ? 'எங்கள் கிராம நீர் நிலை அறிக்கை' : 'VILLAGE WATER STATUS DASHBOARD'}
              </div>
              <h3 className="text-xl font-bold text-white">
                {lang === 'ta' ? `${currentVillage.name} பகுதி நீர் விபரம்` : `Water Advisory for ${currentVillage.name} Taluk`}
              </h3>
              <p className="text-xs text-stone-300">
                {lang === 'ta' 
                  ? 'விவசாயிகள் மற்றும் பொதுமக்களுக்கு ஏற்ற எளிய அளவீடுகள்.' 
                  : 'Plain-language groundwater depth, rainfall adequacy, and safe water guidance.'}
              </p>
            </div>

            {/* Location Selector Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-300 font-medium">{lang === 'ta' ? 'கிராமம்:' : 'Village:'}</span>
              <select
                value={selectedVillageId}
                onChange={(e) => setSelectedVillageId(Number(e.target.value))}
                className="px-4 py-2 rounded-xl bg-[#04120c] border border-emerald-500/40 text-xs font-bold text-white focus:outline-none"
              >
                {PALAR_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.district})</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4 Large Touch-Friendly Village Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Groundwater Depth */}
            <div className="p-5 rounded-2xl bg-[#061811] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-300 font-medium">{lang === 'ta' ? 'நிலத்தடி நீர் ஆழம்' : 'Groundwater Depth'}</span>
                <Droplets className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums font-sans">
                {currentVillageDepth.toFixed(1)} <span className="text-sm font-normal text-stone-400">mbgl</span>
              </div>
              <div className="text-xs text-emerald-300 font-medium">
                {lang === 'ta' ? 'கோடைக்காலத்திற்கு ஏற்ற சராசரி நிலை' : 'Normal Seasonal Depth'}
              </div>
            </div>

            {/* Card 2: Rainfall Adequacy */}
            <div className="p-5 rounded-2xl bg-[#061811] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-300 font-medium">{lang === 'ta' ? 'மழைப்பொழிவு' : 'Monsoon Rainfall'}</span>
                <CloudRain className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white tabular-nums font-sans">
                682 <span className="text-sm font-normal text-stone-400">mm</span>
              </div>
              <div className="text-xs text-cyan-300 font-medium">
                {lang === 'ta' ? '↑ +12% இயல்பை விட கூடுதல்' : '↑ +12% Above Average'}
              </div>
            </div>

            {/* Card 3: Water Drinking Safety */}
            <div className="p-5 rounded-2xl bg-[#061811] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-300 font-medium">{lang === 'ta' ? 'குடிநீர் பாதுகாப்பு' : 'Drinking Safety'}</span>
                <FlaskConical className="w-5 h-5 text-amber-400" />
              </div>
              <div className={`text-base font-bold ${currentVillage.risk_score > 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {currentVillage.risk_score > 60 ? (lang === 'ta' ? 'கொதிக்க வைத்து பருகவும்' : 'Boil Before Drinking') : (lang === 'ta' ? 'பாதுகாப்பானது' : 'Safe for Usage')}
              </div>
              <div className="text-xs text-stone-400 font-mono">
                TDS: {currentVillageTDS} mg/L
              </div>
            </div>

            {/* Card 4: Nearby Alerts */}
            <div className="p-5 rounded-2xl bg-[#061811] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-300 font-medium">{lang === 'ta' ? 'பகுதி எச்சரிக்கை' : 'Local Alert'}</span>
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-xs font-bold text-white line-clamp-1">
                {currentVillage.risk_score > 60 ? (lang === 'ta' ? 'கழிவுநீர் கண்காணிப்பு தேவை' : 'Effluent Caution Needed') : (lang === 'ta' ? 'எச்சரிக்கை ஏதுமில்லை' : 'No Critical Alerts')}
              </div>
              <div className="text-xs text-stone-400">
                {lang === 'ta' ? 'அதிகாரப்பூர்வ கண்காணிப்பு' : 'Monitored by TNPCB'}
              </div>
            </div>
          </div>

          {/* Quick Community Action Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => onSelectModule('community')}
              className="p-6 rounded-2xl bg-gradient-to-r from-[#092b1a] to-[#04160d] border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-emerald-400" />
                  <span>{lang === 'ta' ? 'நீர் பிரச்சினை அல்லது கழிவுநீர் புகார் செய்க' : 'Report a Water Problem or Contamination'}</span>
                </h4>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-stone-300">
                {lang === 'ta'
                  ? 'உங்கள் கிணற்றில் நீர் வற்றிவிட்டதா அல்லது நிறம் மாறியுள்ளதா? புகைப்படம் எடுத்து உடனடியாக அதிகாரிகளுக்கு தெரிவிக்கவும்.'
                  : 'Has your well water turned discolored or depleted? Submit an authenticated citizen complaint with tracking ID.'}
              </p>
            </div>

            <div 
              onClick={() => onSelectModule('assistant')}
              className="p-6 rounded-2xl bg-gradient-to-r from-[#09261a] to-[#04160d] border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <span>{lang === 'ta' ? 'PALAR AI-யிடம் தமிழில் கேளுங்கள்' : 'Ask PALAR AI in Tamil or English'}</span>
                </h4>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="text-xs text-stone-300">
                {lang === 'ta'
                  ? 'பேசி பதில்களைப் பெறுங்கள். "எங்கள் ஊரில் அடுத்த மாதம் நீர்மட்டம் எப்படி இருக்கும்?" போன்ற கேள்விகளை கேட்கலாம்.'
                  : 'Voice-enabled AI assistant grounded in authentic basin data. Ask about water levels, rainfall, or recommendations.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. RESEARCHER DASHBOARD (MATCHING IMAGE 1 BLUEPRINT) */}
      {/* ============================================================ */}
      {activeRole === 'researcher' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Bar matching CDCPC Centralized Database blueprint */}
          <div className="p-4 rounded-2xl bg-[#061e12] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans font-bold text-sm tracking-tight text-white">CDCPC · PALAR BASIN</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-400">
                  Centralized Hydrogeological Database
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Harmonized geophysical borewell logs, electrical resistivity surveys (ERS), and water quality time series.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onSelectModule('forecasting')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Run Forecast Model</span>
              </button>
              <button
                onClick={() => onSelectModule('analytics')}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dataset</span>
              </button>
            </div>
          </div>

          {/* 3-Column Researcher Workstation Grid (Filters Left, Satellite Map Center, Metrics Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Rail (3 Cols): Advanced Filters matching Image 1 */}
            <div className="lg:col-span-3 p-4 rounded-2xl bg-[#071c12] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="text-xs font-bold text-white uppercase font-mono flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>FILTERS</span>
                </span>
                <span className="text-[10px] text-emerald-400 cursor-pointer hover:underline">Reset</span>
              </div>

              {/* District Filter */}
              <div className="space-y-1">
                <label className="text-[11px] text-stone-300 font-medium">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#04120c] border border-white/10 text-xs text-white"
                >
                  <option value="all">Palar Catchment (All)</option>
                  <option value="Ranipet">Ranipet District</option>
                  <option value="Vellore">Vellore District</option>
                  <option value="Tirupathur">Tirupathur District</option>
                  <option value="Kanchipuram">Kanchipuram District</option>
                  <option value="Chengalpattu">Chengalpattu District</option>
                </select>
              </div>

              {/* Survey Type Checkboxes */}
              <div className="space-y-2">
                <label className="text-[11px] text-stone-300 font-medium">Survey Type</label>
                <label className="flex items-center gap-2 text-xs text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={surveyTypeERS}
                    onChange={(e) => setSurveyTypeERS(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span>Electrical Resistivity Survey (ERS)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={surveyTypeGBL}
                    onChange={(e) => setSurveyTypeGBL(e.target.checked)}
                    className="rounded accent-emerald-500"
                  />
                  <span>Geophysical Borewell Logging (GBL)</span>
                </label>
              </div>

              {/* Year Slider */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                <div className="flex justify-between text-[11px] text-stone-300">
                  <span>Year Range</span>
                  <span className="font-mono text-emerald-400 font-bold">{yearRange}</span>
                </div>
                <input
                  type="range"
                  min={1980}
                  max={2026}
                  value={yearRange}
                  onChange={(e) => setYearRange(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-stone-500">
                  <span>1980</span>
                  <span>2026</span>
                </div>
              </div>

              {/* Completeness Grade Checkboxes matching CDCPC blueprint */}
              <div className="space-y-2 pt-2 border-t border-white/[0.06]">
                <label className="text-[11px] text-stone-300 font-medium">Completeness Grade</label>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 text-xs text-emerald-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gradeA}
                      onChange={(e) => setGradeA(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <span>Grade A High (≥ 90%)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-cyan-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gradeB}
                      onChange={(e) => setGradeB(e.target.checked)}
                      className="accent-cyan-500"
                    />
                    <span>Grade B Good (70% - 89%)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gradeC}
                      onChange={(e) => setGradeC(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span>Grade C Moderate (40% - 69%)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-rose-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gradeD}
                      onChange={(e) => setGradeD(e.target.checked)}
                      className="accent-rose-500"
                    />
                    <span>Grade D Low (&lt; 40%)</span>
                  </label>
                </div>
              </div>

              {/* Bottom Mini Metrics */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/[0.06] space-y-1">
                <div className="text-xl font-bold font-sans text-emerald-400 tabular-nums">1000+</div>
                <div className="text-[10px] text-stone-400 uppercase font-mono">Data Locations Mapped</div>
              </div>
            </div>

            {/* Center Map (6 Cols): Satellite Map */}
            <div className="lg:col-span-6">
              <CentralBasinSatelliteMap
                onSelectStation={(stationId) => {
                  onSelectLocation?.(stationId);
                  onSelectModule('groundwater');
                }}
              />
            </div>

            {/* Right Rail (3 Cols): Dataset Overview & Location Progress Bars */}
            <div className="lg:col-span-3 p-4 rounded-2xl bg-[#071c12] border border-white/[0.08] space-y-4">
              {/* Dataset Overview */}
              <div className="space-y-2 pb-3 border-b border-white/[0.06]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Dataset Overview</span>
                <div className="text-2xl font-black text-white font-sans tabular-nums">1000+</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-black/30">
                    <div className="text-emerald-400 font-bold font-mono">620+</div>
                    <div className="text-[10px] text-stone-400">ERS Locations</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30">
                    <div className="text-cyan-400 font-bold font-mono">480+</div>
                    <div className="text-[10px] text-stone-400">GBL Wells</div>
                  </div>
                </div>
              </div>

              {/* Location Summary Bars */}
              <div className="space-y-2.5 pb-3 border-b border-white/[0.06]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Location Summary</span>
                {[
                  { name: 'Ranipet Sector', count: '165+', width: '85%', color: 'bg-emerald-500' },
                  { name: 'Vellore Basin', count: '120+', width: '70%', color: 'bg-cyan-500' },
                  { name: 'Kanchipuram', count: '110+', width: '65%', color: 'bg-emerald-500' },
                  { name: 'Chengalpattu', count: '95+', width: '55%', color: 'bg-amber-500' },
                ].map(loc => (
                  <div key={loc.name} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-200">
                      <span>{loc.name}</span>
                      <span className="font-mono text-stone-400">{loc.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                      <div className={`h-full ${loc.color} rounded-full`} style={{ width: loc.width }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Interpretations Available */}
              <div className="p-3 rounded-xl bg-[#04120c] border border-white/[0.06] space-y-1">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Interpretations</span>
                <div className="text-lg font-bold text-white">750+ Available</div>
                <p className="text-[10px] text-stone-400 leading-tight">
                  Includes 2D/3D stratigraphic models, hydrogeochemical facies, and walk-forward projection envelopes.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom 4 Researcher Trust Pillars matching Image 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'Trusted Data', desc: 'Quality checked & validated datasets from 1980 onwards.' },
              { title: 'Multi-Source Integration', desc: 'ERS, Borewell Logging & Supporting Hydrogeology.' },
              { title: 'Precise & Actionable', desc: 'High-resolution insights for better groundwater decisions.' },
              { title: 'Secure & Accessible', desc: 'Centralized, secure & always available research portal.' },
            ].map(p => (
              <div key={p.title} className="p-3.5 rounded-xl bg-[#061811] border border-white/[0.08] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-white">{p.title}</h5>
                  <p className="text-[10px] text-stone-400 leading-snug mt-0.5">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. FIELD OFFICER DASHBOARD (MATCHING IMAGE 2 BLUEPRINT) */}
      {/* ============================================================ */}
      {activeRole === 'field_officer' && (
        <div className="space-y-4 animate-fade-in">
          {/* Top Operational Metrics matching VITA Territorial blueprint */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-[#071c12] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Monitored Zones</span>
              <div className="text-2xl font-black text-white font-sans mt-1">18 Zones</div>
              <span className="text-[10px] text-emerald-400">100% Palar Coverage</span>
            </div>
            <div className="p-4 rounded-xl bg-[#071c12] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Active Investigations</span>
              <div className="text-2xl font-black text-amber-400 font-sans mt-1">12 Active</div>
              <span className="text-[10px] text-amber-300">4 Critical Tickets</span>
            </div>
            <div className="p-4 rounded-xl bg-[#071c12] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Citizen Reports</span>
              <div className="text-2xl font-black text-white font-sans mt-1">356 Filed</div>
              <span className="text-[10px] text-cyan-400">89% Verified</span>
            </div>
            <div className="p-4 rounded-xl bg-[#071c12] border border-white/[0.08]">
              <span className="text-[10px] font-mono text-stone-400 uppercase">Field Response SLA</span>
              <div className="text-2xl font-black text-emerald-400 font-sans mt-1">&lt; 24 Hrs</div>
              <span className="text-[10px] text-stone-400">Rapid Triage Protocol</span>
            </div>
          </div>

          {/* Assigned Investigations Queue & Field Verification Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column (7 Cols): Assigned Field Queue */}
            <div className="lg:col-span-7 p-5 rounded-2xl bg-[#071c12] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-emerald-400" />
                    <span>PRIORITY FIELD INVESTIGATION QUEUE</span>
                  </h3>
                  <p className="text-xs text-stone-400">Assigned verification tasks requiring on-site grab samples.</p>
                </div>
                <button 
                  onClick={() => onSelectModule('investigations')}
                  className="text-xs text-emerald-400 font-bold hover:underline"
                >
                  View All Investigations →
                </button>
              </div>

              <div className="space-y-2.5">
                {investigationsList.map(inv => (
                  <div key={inv.id} className="p-3.5 rounded-xl bg-[#04120c] border border-white/[0.06] hover:border-emerald-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-400">{inv.id}</span>
                        <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          inv.urgency === 'Critical' ? 'bg-red-950 text-red-300 border border-red-500/40' : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                        }`}>
                          {inv.urgency}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{inv.time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{inv.title}</h4>
                      <p className="text-[11px] text-stone-400">Location: {inv.location} · Assigned: {inv.officer}</p>
                    </div>

                    <button 
                      onClick={() => onSelectModule('investigations')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shrink-0 transition-colors"
                    >
                      Open Ticket
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column (5 Cols): Rapid Field Verification Checklist */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-[#071c12] border border-white/[0.08] space-y-4">
              <div className="pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ON-SITE VERIFICATION CHECKLIST</span>
                </h3>
                <p className="text-xs text-stone-400">Field inspector protocol for authenticating anomalies.</p>
              </div>

              <div className="space-y-2.5 text-xs text-stone-200">
                <div className="p-2.5 rounded-xl bg-[#04120c] flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Record GPS coordinates and photograph sample well</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#04120c] flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Measure on-site field parameters (pH, EC, Water Level)</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#04120c] flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Collect duplicate 1-liter grab sample in acid-washed bottle</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#04120c] flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dispatch to accredited laboratory for Total Cr ICP-MS check</span>
                </div>
              </div>

              <button
                onClick={() => onSelectModule('investigations')}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-200 font-semibold text-xs border border-white/10 transition-colors"
              >
                Log New Field Inspection Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. ADMINISTRATOR / INSTITUTIONAL SAAS DASHBOARD */}
      {/* ============================================================ */}
      {activeRole === 'admin' && (
        <div className="space-y-4 animate-fade-in">
          {/* Multi-Tenant SaaS Workspace Header */}
          <div className="p-5 rounded-2xl bg-[#071c12] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-900 text-xs font-mono text-stone-300 border border-stone-700 mb-1">
                MULTI-TENANT ENTERPRISE ARCHITECTURE
              </div>
              <h3 className="text-lg font-bold text-white">Institutional Administration Console</h3>
              <p className="text-xs text-stone-400">
                Manage organizational workspaces, role-based access permissions, and automated data ingestion pipelines.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-300 font-medium">Active Organization:</span>
              <select className="px-3 py-1.5 rounded-xl bg-[#04120c] border border-white/10 text-xs text-white">
                <option>Tamil Nadu Water Resources Dept (WRD)</option>
                <option>CIT Environmental Research Lab</option>
                <option>Palar River Basin Watch (NGO)</option>
                <option>Ranipet Farmers Water Federation</option>
              </select>
            </div>
          </div>

          {/* Ingestion Pipelines & System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#061811] border border-white/[0.08] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">CGWB Groundwater Gateway</span>
                <span className="text-emerald-400 font-mono text-[10px]">LIVE 200 OK</span>
              </div>
              <div className="text-xs text-stone-400 font-mono">
                Latency: 142ms · Ingestion: 7 Stations
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#061811] border border-white/[0.08] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">IMD NWIC Rainfall API</span>
                <span className="text-emerald-400 font-mono text-[10px]">LIVE 200 OK</span>
              </div>
              <div className="text-xs text-stone-400 font-mono">
                Latency: 188ms · Ingestion: Daily Synoptic
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#061811] border border-white/[0.08] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-white">Immutable Audit Trail</span>
                <span className="text-cyan-400 font-mono text-[10px]">ENFORCED</span>
              </div>
              <div className="text-xs text-stone-400 font-mono">
                1,420 events recorded · 0 tampering
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => onSelectModule('admin_audit')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
            >
              Open Full Administration Console →
            </button>
          </div>
        </div>
      )}

      {/* 4. Expert Mode Technical Breakdown Drawer (Available when Expert Mode is active or toggled) */}
      {mode === 'expert' && (
        <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4 shadow-xl">
          <div 
            onClick={() => setShowTechnicalTable(!showTechnicalTable)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide">
                {lang === 'ta' ? 'அறிவியல் கண்காணிப்பு நிலையங்கள் - முழு புள்ளிவிவரங்கள்' : 'Scientific Baseline Telemetry Stations - Complete Data Matrix'}
              </h3>
              <DataBadge provenance="VERIFIED_PUBLIC" />
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-400 group-hover:text-emerald-400 transition-colors">
              <span>{showTechnicalTable ? (lang === 'ta' ? 'மறைக்க' : 'Collapse') : (lang === 'ta' ? 'காட்டுக' : 'Expand')}</span>
              {showTechnicalTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {showTechnicalTable && (
            <div className="mt-3 overflow-x-auto pt-2 border-t border-white/[0.06] animate-in fade-in">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-400 border-b border-white/[0.06] text-[11px] font-mono">
                    <th className="py-2 font-medium">{lang === 'ta' ? 'நிலையம்' : 'Station'}</th>
                    <th className="py-2 font-medium">{lang === 'ta' ? 'மாவட்டம்' : 'District'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'நிலத்தடி நீர் (mbgl)' : 'GW Depth (mbgl)'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'TDS (mg/L)' : 'TDS (mg/L)'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'குரோமியம் Cr⁶⁺ (ppm)' : 'Chromium (ppm)'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'ஆபத்து குறியீடு' : 'Risk Score'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'நடவடிக்கை' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {PALAR_LOCATIONS.map((loc) => {
                    const wq = WATER_QUALITY_STATIONS.find(w => w.location_id === loc.id);
                    const gw = GROUNDWATER_TIMESERIES[loc.id];
                    const depth = gw ? gw[gw.length - 1]?.depth_mbgl : 13.5;
                    const tds = wq?.tds_mg_l ?? 750;
                    const chromium = wq?.chromium_mg_l ?? 0.02;

                    return (
                      <tr key={loc.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-bold text-white">{loc.name}</td>
                        <td className="py-2.5 text-stone-300">{loc.district}</td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-white">{depth}</td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-white">{tds}</td>
                        <td className={`py-2.5 text-right font-mono tabular-nums ${chromium > 0.05 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                          {chromium}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums">
                          <span className={loc.risk_score > 70 ? 'text-red-400 font-bold' : 'text-amber-400 font-medium'}>
                            {loc.risk_score} / 100
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => onSelectModule('groundwater')}
                            className="px-2.5 py-1 bg-white/5 hover:bg-emerald-600/30 text-stone-200 hover:text-emerald-200 rounded text-[11px] font-medium transition-colors"
                          >
                            {lang === 'ta' ? 'வரைபடம்' : 'Hydrograph'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
