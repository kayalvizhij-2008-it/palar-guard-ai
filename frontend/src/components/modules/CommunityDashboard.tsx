import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS, ANOMALIES_DATA } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { apiService } from '../../services/api';
import { 
  Droplets, AlertTriangle, ShieldCheck, ShieldAlert, MapPin, 
  Send, Upload, CheckCircle2, FileText, Info, 
  ChevronRight, ArrowRight, HeartHandshake, Eye, 
  Clock, HelpCircle, BookOpen, Search, PhoneCall
} from 'lucide-react';

interface CommunityDashboardProps {
  onSwitchToProfessional?: () => void;
  onSelectLocation?: (id: number) => void;
}

interface SubmittedReport {
  id: string;
  category: string;
  location: string;
  date: string;
  status: 'Under Review' | 'Verified' | 'Action Recorded';
  description: string;
  notes?: string;
}

export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({ 
  onSwitchToProfessional,
  onSelectLocation 
}) => {
  const { lang } = useLanguage();
  const [selectedStationId, setSelectedStationId] = useState<number>(1); // Default to Ranipet
  const [activeTab, setActiveTab] = useState<'overview' | 'report' | 'tracker' | 'alerts' | 'learn' | 'updates'>('overview');

  // Reporting Form State
  const [reportCategory, setReportCategory] = useState<string>('Unusual Water Color & Odor');
  const [reportLocationId, setReportLocationId] = useState<number>(1);
  const [reportDescription, setReportDescription] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [photoUploaded, setPhotoUploaded] = useState<boolean>(false);
  const [submittedRefId, setSubmittedRefId] = useState<string | null>(null);

  // Community Reports List
  const [userReports, setUserReports] = useState<SubmittedReport[]>([
    {
      id: 'PLR-2026-COMM-8492',
      category: 'Unusual Water Color & Odor',
      location: 'Ranipet Industrial Corridor',
      date: '2026-11-24',
      status: 'Verified',
      description: 'Yellowish-brown froth observed downstream of industrial drain near check dam.',
      notes: 'Field team dispatched with mobile photometer; sample verified for elevated Chromium.'
    },
    {
      id: 'PLR-2026-COMM-7104',
      category: 'Borewell Dry Spell',
      location: 'Ambur Tannery Cluster',
      date: '2026-11-20',
      status: 'Action Recorded',
      description: 'Agricultural well water table plunged beyond 18 mbgl within 3 weeks.',
      notes: 'Recorded in seasonal drawdown database; recharge shaft feasibility recommended.'
    }
  ]);

  const selectedLoc = PALAR_LOCATIONS.find(l => l.id === selectedStationId) || PALAR_LOCATIONS[0];
  const selectedWq = WATER_QUALITY_STATIONS.find(w => w.location_id === selectedStationId);
  const selectedAlert = ANOMALIES_DATA.find(a => a.location_id === selectedStationId && a.status === 'Open');

  // Handle Citizen Report Submission
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim()) return;

    const loc = PALAR_LOCATIONS.find(l => l.id === reportLocationId) || PALAR_LOCATIONS[0];
    const generatedId = `PLR-2026-COMM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReport: SubmittedReport = {
      id: generatedId,
      category: reportCategory,
      location: loc.name,
      date: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      description: reportDescription,
      notes: 'Submitted to Palar Basin field verification triage queue.'
    };

    setUserReports([newReport, ...userReports]);
    setSubmittedRefId(generatedId);
    setReportDescription('');
    setPhotoUploaded(false);

    // Call backend API
    apiService.submitCommunityReport({
      reporter_name: reporterName || 'Community Citizen',
      location_id: loc.id,
      incident_type: reportCategory,
      description: reportDescription,
      latitude: loc.latitude,
      longitude: loc.longitude
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* 1. Welcome Banner & Mode Awareness */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#042115] via-[#072e1e] to-[#051c12] border border-emerald-500/30 shadow-forest-lg overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-xs font-mono text-emerald-300">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'ta' ? 'உங்கள் நீர். உங்கள் சமூகம். உங்கள் குரல்.' : 'YOUR WATER. YOUR COMMUNITY. YOUR VOICE.'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {lang === 'ta' 
                ? 'உங்கள் பகுதி நீர் நிலவரம் & பாதுகாப்பு' 
                : 'Palar Community Water Intelligence'}
            </h1>

            <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-2xl">
              {lang === 'ta'
                ? 'எளிய மொழியில் பாலாற்று படுகை நிலத்தடி நீர் நிலை, குடிநீர் பாதுகாப்பு மற்றும் உடனடி நீர் பிரச்சனை புகார்கள் பதிவு செய்யும் இடம்.'
                : 'Clear water health insights for farmers, residents, and citizens. Check your local water levels, understand drinking safety, track alerts, and submit water issues with verified triage.'}
            </p>

            {/* 6 Quick Sub-Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'overview'
                    ? 'bg-emerald-500 text-[#061811] shadow-emerald-glow'
                    : 'bg-black/30 hover:bg-black/50 text-stone-200 border border-white/10'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'உள்ளூர் நீர் நிலை' : 'Local Water Info'}</span>
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'report'
                    ? 'bg-emerald-500 text-[#061811] shadow-emerald-glow'
                    : 'bg-black/30 hover:bg-black/50 text-stone-200 border border-white/10'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'ta' ? 'புகார் பதிவு செய்ய' : 'Report a Problem'}</span>
              </button>

              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'tracker'
                    ? 'bg-emerald-500 text-[#061811] shadow-emerald-glow'
                    : 'bg-black/30 hover:bg-black/50 text-stone-200 border border-white/10'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'என் புகார்கள்' : 'My Reports'} ({userReports.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'alerts'
                    ? 'bg-emerald-500 text-[#061811] shadow-emerald-glow'
                    : 'bg-black/30 hover:bg-black/50 text-stone-200 border border-white/10'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'ta' ? 'அவசர எச்சரிக்கைகள்' : 'Alerts'}</span>
              </button>

              <button
                onClick={() => setActiveTab('learn')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'learn'
                    ? 'bg-emerald-500 text-[#061811] shadow-emerald-glow'
                    : 'bg-black/30 hover:bg-black/50 text-stone-200 border border-white/10'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{lang === 'ta' ? 'வழிகாட்டி & சேமிப்பு' : 'Learn'}</span>
              </button>

              <button
                onClick={() => setActiveTab('updates')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'updates'
                    ? 'bg-emerald-500 text-[#061811] shadow-emerald-glow'
                    : 'bg-black/30 hover:bg-black/50 text-stone-200 border border-white/10'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'ta' ? 'கள நடவடிக்கைகள்' : 'Community Updates'}</span>
              </button>
            </div>
          </div>

          {/* Top Right Switcher to Professional Mode (Flex-safe) */}
          {onSwitchToProfessional && (
            <div className="flex-shrink-0 pt-1">
              <button
                onClick={onSwitchToProfessional}
                className="px-4 py-2.5 rounded-xl bg-[#092b1d] hover:bg-[#0c3926] text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-2 shadow-forest-sm transition-colors"
              >
                <span>{lang === 'ta' ? 'தொழில்முறை ஆய்வு பலகம் →' : 'Switch to Professional Workspace →'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* TAB 1: WATER SITUATION NEAR YOU */}
      {/* ============================================================ */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Location Selector Bar */}
          <div className="p-4 rounded-2xl bg-[#061b12] border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="text-xs text-stone-400 font-mono">Select Your District / Reach:</span>
                <div className="text-sm font-bold text-white">{selectedLoc.name} ({selectedLoc.district} District)</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PALAR_LOCATIONS.slice(0, 5).map(loc => {
                const shortLabel = loc.name.replace(' Industrial Corridor', '').replace(' Tannery Cluster', '').replace(' Cantonment', '');
                return (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedStationId(loc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedStationId === loc.id
                        ? 'bg-emerald-600 text-white shadow-forest-sm'
                        : 'bg-[#09251a] hover:bg-[#0c3122] text-stone-300 border border-white/5'
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simple Human-Readable Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Water Table Depth */}
            <div className="p-6 rounded-2xl bg-[#072116] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400">GROUNDWATER DEPTH</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                  CGWB VERIFIED
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {selectedStationId === 1 ? '14.9 m' : '11.8 m'}
                <span className="text-sm font-normal text-stone-300 ml-2">below ground</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {selectedStationId === 1
                  ? 'Deep water table. Local borewells must reach 50+ feet to draw water. Pre-monsoon drop of 0.6m per year.'
                  : 'Moderate water table. Normal recharge response following monsoon rains.'}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{selectedStationId === 1 ? 'Status: Heavy Extraction' : 'Status: Stable Recharge'}</span>
              </div>
            </div>

            {/* 2. Water Quality for Drinking / Daily Use */}
            <div className="p-6 rounded-2xl bg-[#072116] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-amber-400">WATER QUALITY & SAFETY</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30">
                  SURVEILLANCE
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {selectedWq ? `${selectedWq.tds_mg_l} mg/L` : '780 mg/L'}
                <span className="text-sm font-normal text-stone-300 ml-2">TDS Minerals</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {selectedStationId === 1
                  ? 'Elevated minerals and industrial discharges detected. Filter or boil before drinking. Not advised for raw consumption.'
                  : 'Acceptable mineral balance for domestic use. Complies with rural standards.'}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold">
                <span className={`w-2 h-2 rounded-full ${selectedStationId === 1 ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                <span className={selectedStationId === 1 ? 'text-rose-400' : 'text-emerald-400'}>
                  {selectedStationId === 1 ? 'Requires Filtration (TDS > 1500)' : 'Safe for General Use'}
                </span>
              </div>
            </div>

            {/* 3. Monsoon & Rainfall Outlook */}
            <div className="p-6 rounded-2xl bg-[#072116] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400">RAINFALL & RECHARGE</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  IMD MONITORED
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                682 mm
                <span className="text-sm font-normal text-stone-300 ml-2">(+12% above normal)</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                Favorable Northeast monsoon replenishment across the middle basin. Soil moisture saturation supports natural percolation.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-cyan-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>Active Aquifer Replenishment</span>
              </div>
            </div>
          </div>

          {/* Active Local Warning Banner if present */}
          {selectedAlert && (
            <div className="p-5 rounded-2xl bg-amber-950/70 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-900/80 text-amber-300 shrink-0 mt-0.5 sm:mt-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                    COMMUNITY ADVISORY · {selectedLoc.name.toUpperCase()}
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">{selectedAlert.trigger_reason}</h4>
                  <p className="text-xs text-stone-300 mt-1 max-w-2xl">
                    Environmental sensors identified anomalous chemical concentration in nearby drain outflows. Public advised to avoid direct borewell extraction for drinking without reverse-osmosis filtration.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('report')}
                className="shrink-0 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
              >
                Report Related Concern →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 2: REPORT A WATER PROBLEM (CITIZEN REPORTING) */}
      {/* ============================================================ */}
      {activeTab === 'report' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#061d13] border border-white/10 space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold text-white">Report a Water Problem</h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Observed unusual water discoloration, foul tannery smell, sudden borewell failure, or illegal pipe discharge into Palar riverbed? Submit an incident report below. Your report is verified by science and field investigators.
            </p>
          </div>

          {submittedRefId && (
            <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Report Submitted Successfully!</span>
              </div>
              <p className="text-xs text-stone-200">
                Your report has been logged with reference number: <strong className="text-emerald-300 font-mono text-sm">{submittedRefId}</strong>.
                You can track field review updates under the <button onClick={() => setActiveTab('tracker')} className="underline text-emerald-400 font-bold">My Reports</button> tab.
              </p>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-5 max-w-2xl">
            {/* 1. Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">1. Problem Category</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#03110a] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="Unusual Water Color & Odor">Unusual Water Color & Odor (Yellow/Brown/Chemical)</option>
                <option value="Suspected Industrial / Tannery Discharge">Suspected Industrial / Tannery Discharge</option>
                <option value="Sudden Borewell Water Table Depletion">Sudden Borewell Water Table Depletion (Water ran dry)</option>
                <option value="Damaged Check Dam or Sluice Gate">Damaged Check Dam or Sluice Gate</option>
                <option value="Illegal Sand Mining in Riverbed">Illegal Sand Mining in Riverbed</option>
              </select>
            </div>

            {/* 2. Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">2. Nearest Town / Basin Location</label>
              <select
                value={reportLocationId}
                onChange={(e) => setReportLocationId(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-[#03110a] border border-white/10 text-white text-xs font-medium focus:outline-none focus:border-emerald-500"
              >
                {PALAR_LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} — {loc.district} District ({loc.basin_zone})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">3. Problem Details</label>
              <textarea
                rows={4}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe what you observed (time of day, color, smell, affected wells, approximate landmark)..."
                className="w-full p-3 rounded-xl bg-[#03110a] border border-white/10 text-white text-xs font-medium placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* 4. Optional Photo Upload */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">4. Attach Photo (Optional)</label>
              <div 
                onClick={() => setPhotoUploaded(!photoUploaded)}
                className={`p-4 rounded-xl border border-dashed cursor-pointer text-center transition-colors ${
                  photoUploaded 
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' 
                    : 'bg-[#03110a] border-white/20 hover:border-emerald-500/50 text-stone-400'
                }`}
              >
                <Upload className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
                <span className="text-xs font-medium">
                  {photoUploaded ? '✓ Photo selected (palar_water_sample.jpg)' : 'Click to attach photo or field observation snapshot'}
                </span>
              </div>
            </div>

            {/* 5. Reporter Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">Your Name (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Anonymous or Your Name"
                  className="w-full p-2.5 rounded-xl bg-[#03110a] border border-white/10 text-white text-xs placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-300">Phone Number (For verification updates)</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full p-2.5 rounded-xl bg-[#03110a] border border-white/10 text-white text-xs placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#061811] font-bold text-sm shadow-emerald-glow transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Environmental Incident Report</span>
            </button>
          </form>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 3: MY REPORTS TRACKER (WITH VERTICAL STATUS TIMELINE) */}
      {/* ============================================================ */}
      {activeTab === 'tracker' && (
        <div className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold text-white">Track Your Submitted Reports</h2>
            <p className="text-sm text-stone-300">
              Every citizen incident report is tracked with a transparent reference ID, timestamp, and verifiable field audit trail.
            </p>
          </div>

          <div className="space-y-4">
            {userReports.map(rep => {
              const stepIndex = rep.status === 'Verified' ? 3 : rep.status === 'Action Recorded' ? 4 : 2;

              return (
                <div key={rep.id} className="p-6 rounded-2xl bg-[#061d13] border border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{rep.id}</span>
                      <span className="text-stone-500">•</span>
                      <span className="text-xs font-semibold text-white">{rep.location}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      rep.status === 'Verified'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : rep.status === 'Action Recorded'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}>
                      {rep.status}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-emerald-300">{rep.category}</div>
                  <p className="text-xs text-stone-300 leading-relaxed font-normal">{rep.description}</p>

                  {/* Vertical / Horizontal Status Progress Steps */}
                  <div className="pt-2">
                    <div className="text-[11px] font-mono text-stone-400 mb-2">Investigation Lifecycle:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { num: '1', title: 'Submitted' },
                        { num: '2', title: 'Triage' },
                        { num: '3', title: 'Field Verified' },
                        { num: '4', title: 'Action Taken' }
                      ].map((step, idx) => {
                        const isDone = idx < stepIndex;
                        const isCurrent = idx === stepIndex - 1;

                        return (
                          <div 
                            key={step.num}
                            className={`p-2 rounded-lg text-center border text-[11px] transition-all ${
                              isCurrent
                                ? 'bg-[#0a311f] border-emerald-400 text-emerald-300 font-bold'
                                : isDone
                                ? 'bg-black/40 border-emerald-500/30 text-stone-300'
                                : 'bg-black/20 border-white/[0.04] text-stone-600'
                            }`}
                          >
                            <div className="font-mono text-[10px]">{step.num}</div>
                            <div className="truncate">{step.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {rep.notes && (
                    <div className="p-3 rounded-xl bg-[#020b06] border border-white/5 text-xs text-emerald-300 flex items-start gap-2">
                      <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Technical Action:</strong> {rep.notes}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 4: ALERTS (CHRONOLOGICAL NOTIFICATION FEED WITH LAYPERSON EXPLANATIONS) */}
      {/* ============================================================ */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold text-white">Public Water Safety Advisories</h2>
            <p className="text-sm text-stone-300">
              Plain-language notifications from official CPCB, TNPCB, and CGWB monitoring networks across the Palar basin.
            </p>
          </div>

          <div className="space-y-4">
            {/* Alert 1 */}
            <div className="p-6 rounded-2xl bg-[#1f0b09] border border-rose-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-rose-400">HIGH ANOMALY · RANIPET REACH</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs text-stone-400">2026-11-25 09:30 IST</span>
                </div>
                <DataBadge provenance="HISTORICAL_REPORT" />
              </div>

              <h3 className="text-base font-bold text-white">
                Elevated Total Chromium Surge (0.082 mg/L vs 0.05 mg/L Standard)
              </h3>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="text-stone-300">
                  <strong className="text-rose-300">What this means for residents:</strong> Water samples downstream of Ranipet industrial cluster show chemical hardness above the permissible drinking limit. Untreated open well water should not be consumed directly without reverse osmosis (RO) filtration.
                </div>
                <div className="text-emerald-300">
                  <strong className="text-white">Action Underway:</strong> TNPCB field inspection team #Alpha dispatched for duplicate verification sampling.
                </div>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="p-6 rounded-2xl bg-[#1f1609] border border-amber-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="font-mono text-xs font-bold text-amber-400">SEASONAL DRAWDOWN · VANIYAMBADI</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs text-stone-400">2026-11-23 14:15 IST</span>
                </div>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>

              <h3 className="text-base font-bold text-white">
                Pre-Monsoon Water Table Drawdown (15.1 mbgl Depletion)
              </h3>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs">
                <div className="text-stone-300">
                  <strong className="text-amber-300">What this means for farmers:</strong> Shallow open wells in the upper reach have plunged below 15 meters. Micro-irrigation and rotational pumping recommended to prevent borewell motor burning.
                </div>
                <div className="text-emerald-300">
                  <strong className="text-white">Intervention:</strong> Check dam desiltation prioritized at Vaniyambadi weir to retain post-monsoon infiltration.
                </div>
              </div>
            </div>

            {/* Alert 3 */}
            <div className="p-6 rounded-2xl bg-[#071f14] border border-emerald-500/30 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs font-bold text-emerald-400">RECHARGE NOTICE · WALAJAH ALLUVIUM</span>
                  <span className="text-stone-500">•</span>
                  <span className="text-xs text-stone-400">2026-11-21 11:00 IST</span>
                </div>
                <DataBadge provenance="VERIFIED_PUBLIC" />
              </div>

              <h3 className="text-base font-bold text-white">
                Monsoon Infiltration Shafts Ready for Catchment Inflow
              </h3>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-stone-300">
                12 newly completed infiltration shafts in the Walajah-Arcot reach are operational. Local farmers are advised to keep field drainage trenches clear of plastic debris to maximize groundwater recharge.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 5: LEARN & RECHARGE TIPS (BILINGUAL TAMIL & ENGLISH) */}
      {/* ============================================================ */}
      {activeTab === 'learn' && (
        <div className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {lang === 'ta' ? 'மழைநீர் சேகரிப்பு & நிலத்தடி நீர் பெருக்கும் வழிகள்' : 'Rainwater Harvesting & Aquifer Recharge Guide'}
            </h2>
            <p className="text-sm text-stone-300">
              Practical steps for farmers and householders across the Palar basin to protect borewells and recharge groundwater.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-6 rounded-2xl bg-[#061d13] border border-white/10 space-y-3">
              <h3 className="text-base font-bold text-emerald-300">1. Agricultural Farm Recharge Shaft</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                Dig a 3m × 3m percolation pit filled with boulders, gravel, and coarse river sand around dried borewell casing with slotted PVC pipe. Channels monsoon runoff straight into fractured charnockite aquifers.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#061d13] border border-white/10 space-y-3">
              <h3 className="text-base font-bold text-emerald-300">2. Roof-Top Rainwater Storage</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                Connect rooftop gutters through first-flush filters to domestic storage sumps. Every 100 sq. meter roof in Vellore/Ranipet yields ~68,000 liters of pure drinking water per monsoon season.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#061d13] border border-white/10 space-y-3">
              <h3 className="text-base font-bold text-emerald-300">3. Check Dam Desiltation</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                Remove clay silt deposits from check dam upstream reservoirs prior to Southwest monsoon. Restores riverbed hydraulic conductivity from 0.2 m/day to over 4.5 m/day.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#061d13] border border-white/10 space-y-3">
              <h3 className="text-base font-bold text-emerald-300">4. Community Well Water Testing</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                Test borewells twice a year (pre-monsoon in May and post-monsoon in January). Free or subsidized testing available through district TWAD board labs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAB 6: COMMUNITY UPDATES (VERIFIED FIELD ACTION FEED) */}
      {/* ============================================================ */}
      {activeTab === 'updates' && (
        <div className="space-y-6">
          <div className="max-w-2xl space-y-2">
            <h2 className="text-2xl font-bold text-white">Verified Field Action & River Updates</h2>
            <p className="text-sm text-stone-300">
              Transparent log of actions taken by district authorities, researchers, and citizen groups to protect the Palar River Basin.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#061d13] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>ACTION #PLR-ACT-2026-042</span>
                <span>2026-11-24 · Walajah Reach</span>
              </div>
              <h3 className="text-lg font-bold text-white">Walajah Check Dam Silt Removal Completed</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                Excavation teams removed 1,420 m³ of impervious clay sediment from the upstream apron of the Walajah-Arcot check dam. Saturated hydraulic conductivity increased from 0.4 m/day to 4.8 m/day, restoring natural infiltration into unconfined village aquifers.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-stone-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified by Water Resources Department & Team Innovnexa</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#061d13] border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
                <span>ACTION #PLR-ACT-2026-039</span>
                <span>2026-11-22 · Ambur & Vaniyambadi</span>
              </div>
              <h3 className="text-lg font-bold text-white">48 Agricultural Borewell Water Quality Screenings</h3>
              <p className="text-xs text-stone-300 leading-relaxed font-normal">
                Field investigators equipped with portable spectrophotometers completed on-site testing across 48 community wells. All readings recorded into the Palar Guard live telemetry registry. 3 anomalies flagged for secondary laboratory titration.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-mono text-stone-400">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Verified 100% Chain-of-Custody</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
