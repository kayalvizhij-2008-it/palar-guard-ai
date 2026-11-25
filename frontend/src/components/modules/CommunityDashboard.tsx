import React, { useEffect, useState } from 'react';
import {
  Droplets,
  AlertTriangle,
  MapPin,
  Send,
  CheckCircle2,
  FileText,
  BookOpen,
  HeartHandshake,
  ShieldAlert,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS, ANOMALIES_DATA, COMMUNITY_REPORTS_DATA } from '../../data/palarData';
import { AnomalyAlertItem, CommunityReportItem, GroundwaterPoint, LocationData, WaterQualityPoint } from '../../types';

interface CommunityDashboardProps {
  onSwitchToProfessional?: () => void;
  onSelectLocation?: (id: number) => void;
  initialTab?: CommunityTab;
}

export type CommunityTab = 'near_you' | 'report' | 'understand' | 'my_reports' | 'alerts' | 'updates' | 'tips';

export const CommunityDashboard: React.FC<CommunityDashboardProps> = ({
  onSwitchToProfessional,
  initialTab = 'near_you',
}) => {
  const { lang } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [activeTab, setActiveTab] = useState<CommunityTab>(initialTab);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [qualityRows, setQualityRows] = useState<WaterQualityPoint[]>([]);
  const [gwRows, setGwRows] = useState<GroundwaterPoint[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlertItem[]>([]);
  const [reports, setReports] = useState<CommunityReportItem[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(1);

  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Report form
  const [reportCategory, setReportCategory] = useState('Well Depletion');
  const [reportLocationId, setReportLocationId] = useState<number>(1);
  const [reportDescription, setReportDescription] = useState('');
  const [reporterName, setReporterName] = useState(user?.full_name || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadCommunityData = async () => {
    setLoading(true);
    setApiError(null);
    setIsDemoMode(false);
    try {
      const [locs, wq, anoms, reps] = await Promise.all([
        apiService.getLocations(),
        apiService.getWaterQuality(),
        apiService.getAnomalies(),
        isAuthenticated ? apiService.getMyCommunityReports() : apiService.getCommunityReports(),
      ]);
      setLocations(locs);
      setQualityRows(wq);
      setAnomalies(anoms);
      setReports(reps);
      if (locs.length > 0) {
        const gw = await apiService.getGroundwaterRecords(selectedStationId || locs[0].id);
        setGwRows(gw);
      }
    } catch (err: any) {
      setApiError(
        err?.message ||
          L(
            'Unable to connect to PALAR GUARD AI backend server.',
            'PALAR GUARD AI சேவையகத்துடன் இணைக்க முடியவில்லை.'
          )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, [isAuthenticated, selectedStationId]);

  const enableExplicitDemo = () => {
    setIsDemoMode(true);
    setApiError(null);
    setLocations(PALAR_LOCATIONS);
    setQualityRows(WATER_QUALITY_STATIONS);
    setAnomalies(ANOMALIES_DATA);
    setReports(COMMUNITY_REPORTS_DATA);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportDescription.trim().length < 5) {
      setApiError(L('Please enter at least 5 characters describing the issue.', 'குறைந்தது 5 எழுத்துகளில் விவரத்தை உள்ளிடவும்.'));
      return;
    }
    setSubmitting(true);
    setApiError(null);
    setSubmitMessage(null);
    try {
      const loc = locations.find((l) => l.id === reportLocationId);
      const created = await apiService.submitCommunityReport({
        reporter_name: reporterName.trim() || user?.full_name || 'Community Citizen',
        location_id: reportLocationId,
        category: reportCategory,
        description: reportDescription.trim(),
        latitude: loc?.latitude,
        longitude: loc?.longitude,
      });
      setReports((prev) => [created, ...prev]);
      setReportDescription('');
      setSubmitMessage(
        L(
          `Report #${created.id} submitted with status "${created.status}".`,
          `புகார் #${created.id} "${created.status}" நிலையில் பதிவு செய்யப்பட்டது.`
        )
      );
    } catch (err: any) {
      setApiError(err?.message || L('Could not submit report to backend.', 'புகாரைப் பதிவு செய்ய முடியவில்லை.'));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLoc = locations.find((l) => l.id === selectedStationId) || locations[0];
  const selectedWq = qualityRows.find((w) => w.location_id === selectedStationId);
  const latestGw = gwRows[gwRows.length - 1];
  const localAlerts = anomalies.filter((a) => a.location_id === selectedStationId && a.status !== 'Dismissed');

  const tabs: { id: CommunityTab; label: string }[] = [
    { id: 'near_you', label: L('Water Near You', 'உங்கள் பகுதி நீர்') },
    { id: 'report', label: L('Report Water Issue', 'புகார் பதிவு') },
    { id: 'understand', label: L('Understand Your Water', 'நீரைப் புரிந்துகொள்க') },
    { id: 'my_reports', label: L('My Reports', 'என் புகார்கள்') },
    { id: 'alerts', label: L('Alerts', 'எச்சரிக்கைகள்') },
    { id: 'updates', label: L('Community Updates', 'மக்கள் செய்திகள்') },
    { id: 'tips', label: L('Conservation Tips', 'நீர் சேமிப்பு') },
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="rounded-2xl border border-emerald-500/25 bg-[#081f15] p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#10b981]">
            <HeartHandshake className="w-4 h-4" />
            <span>{L('COMMUNITY WATER PORTAL · SIMPLE & ACCESSIBLE', 'மக்கள் நீர் பலகம் · எளிய தமிழ் & ஆங்கிலம்')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#fcfbf7]">
            {L('Your Neighbourhood Water Guide', 'உங்கள் பகுதி நீர் வழிகாட்டி')}
          </h1>
          <p className="text-xs sm:text-sm text-[#a4b2a9] leading-relaxed">
            {L(
              'Check local borewell depth and drinking-water safety in plain language, report problems directly, and follow conservation guidance.',
              'உங்கள் பகுதி கிணற்று நீர் ஆழம் மற்றும் குடிநீர் பாதுகாப்பை எளிய மொழியில் பார்த்து, நீர் பிரச்சனைகளை உடனடியாகப் புகார் செய்யுங்கள்.'
            )}
          </p>
        </div>

        {onSwitchToProfessional && (
          <button
            type="button"
            onClick={onSwitchToProfessional}
            className="self-start lg:self-center shrink-0 px-4 py-2.5 rounded-xl bg-[#05140d] hover:bg-[#0d2d1f] border border-[#d9c27a]/40 text-xs font-medium text-[#fcfbf7] transition-colors"
          >
            {L('Switch to Professional Workspace →', 'தொழில்முறை பலகத்திற்கு மாறு →')}
          </button>
        )}
      </div>

      {/* Explicit Demo Data Disclosure */}
      {isDemoMode && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-950/50 p-3.5 text-xs text-amber-200 flex flex-wrap items-center justify-between gap-3">
          <span>
            <strong>SYNTHETIC DEMONSTRATION DATA — NOT A REAL ENVIRONMENTAL MEASUREMENT.</strong>{' '}
            {L('Showing offline sample records because the backend API is unreachable.', 'சேவையகம் இணைக்கப்படாததால் மாதிரி டெமோ தரவு காட்டப்படுகிறது.')}
          </span>
          <button
            type="button"
            onClick={loadCommunityData}
            className="px-3 py-1 rounded bg-amber-500 text-black font-semibold inline-flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{L('Reconnect API', 'மீண்டும் இணை')}</span>
          </button>
        </div>
      )}

      {/* Clear Error & Retry Banner */}
      {apiError && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-4 text-xs text-rose-200 flex flex-wrap items-center justify-between gap-3">
          <span>{apiError}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadCommunityData}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold"
            >
              {L('Retry Connection', 'மீண்டும் முயற்சி')}
            </button>
            <button
              type="button"
              onClick={enableExplicitDemo}
              className="px-3 py-1.5 rounded-lg border border-amber-400/50 text-amber-200 hover:bg-amber-950/50"
            >
              {L('Load Synthetic Demo Data', 'மாதிரி டெமோ தரவைக் காட்டு')}
            </button>
          </div>
        </div>
      )}

      {/* Sub-navigation Tabs */}
      <nav aria-label={L('Community sections', 'மக்கள் பகுதிகள்')} className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#10b981] text-[#041a11] font-semibold'
                : 'bg-[#081b13] text-[#a4b2a9] border border-white/10 hover:text-[#fcfbf7]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* 1. WATER NEAR YOU */}
      {activeTab === 'near_you' && (
        <div className="space-y-5">
          {loading ? (
            <div className="p-8 rounded-2xl bg-[#081b13] border border-white/10 text-xs text-[#a4b2a9]">
              {L('Loading local basin observations...', 'உங்கள் பகுதி நீர் விவரங்கள் ஏற்றப்படுகின்றன...')}
            </div>
          ) : selectedLoc ? (
            <>
              <div className="rounded-2xl border border-white/10 bg-[#081b13] p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-[#10b981]" />
                  <div>
                    <div className="text-[11px] font-mono text-[#85928a]">{L('SELECT YOUR AREA', 'உங்கள் பகுதியைத் தேர்ந்தெடுக்கவும்')}</div>
                    <div className="text-base font-semibold text-[#fcfbf7]">
                      {selectedLoc.name} · {selectedLoc.district}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {locations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setSelectedStationId(loc.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        selectedStationId === loc.id
                          ? 'bg-[#10b981] text-[#041a11] font-semibold'
                          : 'bg-[#05140d] text-[#a4b2a9] border border-white/10 hover:text-white'
                      }`}
                    >
                      {loc.district} ({loc.name.split(' ')[0]})
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-2xl border border-white/10 bg-[#081b13] p-6 space-y-3">
                  <div className="text-xs font-mono text-[#10b981]">{L('WELL WATER DEPTH', 'கிணற்று நீர் ஆழம்')}</div>
                  <div className="text-3xl font-semibold text-[#fcfbf7] tabular-nums">
                    {latestGw ? `${latestGw.depth_mbgl} m` : '—'}
                  </div>
                  <p className="text-xs text-[#a4b2a9] leading-relaxed">
                    {latestGw && latestGw.depth_mbgl > 14
                      ? L('Water lies deep below ground. Plan irrigation carefully before summer.', 'நிலத்தடி நீர் ஆழத்தில் உள்ளது. கோடைகாலத்தில் சிக்கனமாகப் பயன்படுத்தவும்.')
                      : L('Moderate water table depth for this reach.', 'இந்தப் பகுதியில் நிலத்தடி நீர் மிதமான ஆழத்தில் உள்ளது.')}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#081b13] p-6 space-y-3">
                  <div className="text-xs font-mono text-[#d9c27a]">{L('DRINKING WATER SAFETY', 'குடிநீர் பாதுகாப்பு')}</div>
                  <div className="text-xl font-semibold text-[#fcfbf7]">
                    {selectedWq && (selectedWq.chromium_mg_l > 0.05 || selectedWq.tds_mg_l > 1500)
                      ? L('Filter / RO Required', 'வடிகட்டி / RO அவசியம்')
                      : L('Within Permissible Range', 'அனுமதிக்கப்பட்ட வரம்பிற்குள்')}
                  </div>
                  <p className="text-xs text-[#a4b2a9] leading-relaxed tabular-nums">
                    {selectedWq
                      ? L(
                          `Dissolved minerals (TDS): ${selectedWq.tds_mg_l} mg/L. Chromium: ${selectedWq.chromium_mg_l} mg/L.`,
                          `கரைந்த உப்புகள் (TDS): ${selectedWq.tds_mg_l} mg/L. குரோமியம்: ${selectedWq.chromium_mg_l} mg/L.`
                        )
                      : L('No recent laboratory water-quality record loaded.', 'சமீபத்திய நீர் தரப் பதிவு இல்லை.')}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#081b13] p-6 space-y-3">
                  <div className="text-xs font-mono text-[#0891b2]">{L('LOCAL ADVISORIES', 'உள்ளூர் எச்சரிக்கைகள்')}</div>
                  <div className="text-xl font-semibold text-[#fcfbf7] tabular-nums">
                    {localAlerts.length} {L('Active Notice(s)', 'எச்சரிக்கை(கள்)')}
                  </div>
                  <p className="text-xs text-[#a4b2a9] leading-relaxed">
                    {localAlerts[0]
                      ? localAlerts[0].trigger_reason
                      : L('No open anomaly alerts currently logged for this station.', 'தற்போது இந்த நிலையத்தில் திறந்த எச்சரிக்கைகள் இல்லை.')}
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* 2. REPORT WATER ISSUE */}
      {activeTab === 'report' && (
        <div className="rounded-2xl border border-white/10 bg-[#081b13] p-6 sm:p-8 max-w-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-[#fcfbf7]">
              {L('Report a Water Issue', 'நீர் பிரச்சனையைப் புகார் செய்யவும்')}
            </h2>
            <p className="text-xs text-[#a4b2a9]">
              {L(
                'Describe dried borewells, discolored river water, or chemical odors. Reports are saved to the database for triage.',
                'கிணறு வற்றுதல், நீர் நிறமாற்றம் அல்லது துர்நாற்றம் குறித்துப் புகார் அளிக்கவும்.'
              )}
            </p>
          </div>

          {submitMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{submitMessage}</span>
            </div>
          )}

          <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#a4b2a9] mb-1">{L('Issue Category', 'பிரச்சனை வகை')}</label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#05140d] border border-white/10 text-[#fcfbf7]"
              >
                <option value="Well Depletion">{L('Well / Borewell Depletion', 'கிணறு / ஆழ்துளை கிணறு வற்றுதல்')}</option>
                <option value="Effluent Discoloration">{L('Water Discoloration', 'நீர் நிறமாற்றம்')}</option>
                <option value="Odor/Foaming">{L('Chemical Odor / Foaming', 'துர்நாற்றம் / நுரை')}</option>
                <option value="Sand Mining">{L('Riverbed Disturbance / Sand Mining', 'ஆற்றுப்படுகை பாதிப்பு')}</option>
              </select>
            </div>

            <div>
              <label className="block text-[#a4b2a9] mb-1">{L('Nearest Palar Station', 'அருகிலுள்ள பகுதி')}</label>
              <select
                value={reportLocationId}
                onChange={(e) => setReportLocationId(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-[#05140d] border border-white/10 text-[#fcfbf7]"
              >
                {(locations.length ? locations : PALAR_LOCATIONS).map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} — {loc.district}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#a4b2a9] mb-1">{L('Your Name (Optional)', 'உங்கள் பெயர் (விருப்பம்)')}</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder={L('Anonymous Citizen', 'பொதுமக்கள்')}
                className="w-full p-2.5 rounded-xl bg-[#05140d] border border-white/10 text-[#fcfbf7]"
              />
            </div>

            <div>
              <label className="block text-[#a4b2a9] mb-1">{L('What did you observe?', 'நீங்கள் கண்ட விவரம்')}</label>
              <textarea
                rows={4}
                required
                minLength={5}
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder={L('Describe landmark, color, odor, or well depth...', 'அடையாளம், நிறம், மணம் அல்லது கிணற்று ஆழம் குறித்து எழுதுங்கள்...')}
                className="w-full p-2.5 rounded-xl bg-[#05140d] border border-white/10 text-[#fcfbf7]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-[#041a11] font-semibold inline-flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? L('Submitting...', 'அனுப்புகிறது...') : L('Submit Report', 'புகார் சமர்ப்பி')}</span>
            </button>
          </form>
        </div>
      )}

      {/* 3. UNDERSTAND YOUR WATER */}
      {activeTab === 'understand' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              term: L('Depth to Water (mbgl)', 'நிலத்தடி நீர் ஆழம் (mbgl)'),
              meaning: L(
                'Meters Below Ground Level measures how deep water sits underground. Higher numbers mean the water table has dropped further.',
                'நில மட்டத்திலிருந்து எத்தனை மீட்டர் ஆழத்தில் நீர் உள்ளது என்பதைக் குறிக்கிறது. எண் அதிகமானால் நீர் மட்டம் கீழே இறங்கியுள்ளது.'
              ),
            },
            {
              term: L('Total Dissolved Solids (TDS)', 'கரைந்த மொத்த திடப்பொருட்கள் (TDS)'),
              meaning: L(
                'Measures dissolved salts and minerals in mg/L. Below 500 mg/L is ideal for drinking; above 1500 mg/L tastes salty and requires RO treatment.',
                'நீரில் கரைந்துள்ள உப்புகள் மற்றும் தாதுக்களின் அளவு. 500 mg/L-க்கு கீழ் குடிநீருக்கு நல்லது; 1500 mg/L-க்கு மேல் RO சுத்திகரிப்பு தேவை.'
              ),
            },
            {
              term: L('Total Chromium', 'மொத்த குரோமியம்'),
              meaning: L(
                'A heavy metal linked to industrial effluent. BIS 10500 sets a strict limit of 0.05 mg/L for drinking water.',
                'தொழிற்சாலை கழிவுகளுடன் தொடர்புடைய கன உலோகம். குடிநீரில் 0.05 mg/L-க்கு மிகாமல் இருக்க வேண்டும்.'
              ),
            },
            {
              term: L('pH Balance', 'pH சமநிலை'),
              meaning: L(
                'Shows acidity or alkalinity on a 0–14 scale. Safe drinking water sits between 6.5 and 8.5.',
                'நீரின் அமில/காரத் தன்மையைக் காட்டுகிறது. பாதுகாப்பான குடிநீருக்கு 6.5 முதல் 8.5 வரை இருக்க வேண்டும்.'
              ),
            },
          ].map((card) => (
            <div key={card.term} className="rounded-2xl border border-white/10 bg-[#081b13] p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#10b981]">
                <HelpCircle className="w-4 h-4" />
                <span>{card.term}</span>
              </div>
              <p className="text-xs text-[#a4b2a9] leading-relaxed">{card.meaning}</p>
            </div>
          ))}
        </div>
      )}

      {/* 4. MY REPORTS */}
      {activeTab === 'my_reports' && (
        <div className="space-y-4">
          <div className="text-xs text-[#a4b2a9]">
            {isAuthenticated
              ? L('Showing reports linked to your signed-in account.', 'உங்கள் கணக்கில் பதிவு செய்யப்பட்ட புகார்கள்:')
              : L('Showing public community reports. Sign in to filter specifically to your own submissions.', 'பொது மக்கள் புகார்கள் காட்டப்படுகின்றன. உங்கள் புகார்களை மட்டும் பார்க்க உள்நுழையவும்.')}
          </div>
          {reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#081b13] p-8 text-center text-xs text-[#85928a]">
              {L('No community reports found.', 'புகார்கள் எதுவும் இல்லை.')}
            </div>
          ) : (
            reports.map((rep) => (
              <div key={rep.id} className="rounded-2xl border border-white/10 bg-[#081b13] p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-4 h-4 text-[#10b981]" />
                    <span className="font-mono text-[#d9c27a]">#{rep.id}</span>
                    <span className="font-semibold text-[#fcfbf7]">{rep.title}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#05140d] border border-emerald-500/30 text-emerald-300">
                    {rep.status}
                  </span>
                </div>
                <p className="text-xs text-[#a4b2a9]">{rep.description}</p>
                <div className="text-[11px] font-mono text-[#85928a]">
                  {rep.category} · {rep.location_name || 'Palar Basin'} · {new Date(rep.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 5. ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {anomalies.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#081b13] p-8 text-center text-xs text-[#85928a]">
              {L('No active alerts loaded from backend.', 'செயலில் உள்ள எச்சரிக்கைகள் இல்லை.')}
            </div>
          ) : (
            anomalies.map((al) => (
              <div key={al.id} className="rounded-2xl border border-amber-500/30 bg-[#171208] p-5 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-xs font-mono text-amber-300">
                    <ShieldAlert className="w-4 h-4" />
                    <span>{al.location_name} · {al.severity}</span>
                  </span>
                  <span className="text-[11px] font-mono text-[#a4b2a9]">{al.status}</span>
                </div>
                <div className="text-sm font-semibold text-[#fcfbf7]">{al.parameter}</div>
                <p className="text-xs text-[#a4b2a9] leading-relaxed">{al.trigger_reason}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* 6. COMMUNITY UPDATES */}
      {activeTab === 'updates' && (
        <div className="space-y-3">
          {reports
            .filter((r) => r.status === 'Verified' || r.status === 'Action Initiated')
            .map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-[#081b13] p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#10b981]">{r.status}</span>
                  <span className="text-[#85928a] font-mono">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#fcfbf7]">{r.title}</h3>
                <p className="text-xs text-[#a4b2a9]">{r.description}</p>
              </div>
            ))}
          {reports.filter((r) => r.status === 'Verified' || r.status === 'Action Initiated').length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-[#081b13] p-8 text-center text-xs text-[#85928a]">
              {L('No verified community updates yet.', 'சரிபார்க்கப்பட்ட சமூகப் புதுப்பிப்புகள் இன்னும் இல்லை.')}
            </div>
          )}
        </div>
      )}

      {/* 7. CONSERVATION TIPS */}
      {activeTab === 'tips' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: L('1. Rooftop Rainwater Harvesting', '1. கூரை மழைநீர் சேகரிப்பு'),
              desc: L(
                'Route roof gutters through a first-flush gravel filter into a recharge pit or storage sump before Northeast monsoon storms.',
                'வடகிழக்கு பருவமழைக்கு முன் கூரை மழைநீரை வடிகட்டி மூலம் சேகரிப்புத் தொட்டி அல்லது உறிஞ்சு குழிக்குச் செலுத்துங்கள்.'
              ),
            },
            {
              title: L('2. Farm Percolation Trenches', '2. பண்ணை ஊடுருவல் அகழிகள்'),
              desc: L(
                'Clear silt from contour bunds and farm ponds so storm runoff recharges shallow borewells instead of flowing away.',
                'பண்ணைக் குட்டைகள் மற்றும் வரப்புகளில் உள்ள வண்டலை அகற்றி மழைநீரை நிலத்தடியில் சேமிக்கவும்.'
              ),
            },
            {
              title: L('3. Twice-Yearly Well Water Checks', '3. ஆண்டுக்கு இருமுறை கிணற்று நீர் பரிசோதனை'),
              desc: L(
                'Test domestic borewells before summer and after monsoon through district TWAD labs, especially near industrial stretches.',
                'கோடைக்கு முன்பும் மழைக்குப் பிறகும் TWAD ஆய்வகங்களில் கிணற்று நீரின் தரத்தைச் சோதிக்கவும்.'
              ),
            },
            {
              title: L('4. Keep Surface Drains Unblocked', '4. நீர்வரத்து கால்வாய்களைத் தூய்மையாக வைத்தல்'),
              desc: L(
                'Prevent plastic and solid waste dumping in village eri feeder channels to protect groundwater recharge quality.',
                'கிராம ஏரி வரத்துக் கால்வாய்களில் கழிவுகள் சேராமல் பாதுகாத்து நிலத்தடி நீரின் தரத்தைக் காப்போம்.'
              ),
            },
          ].map((tip) => (
            <div key={tip.title} className="rounded-2xl border border-white/10 bg-[#081b13] p-5 space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#10b981]">
                <BookOpen className="w-4 h-4" />
                <span>{tip.title}</span>
              </div>
              <p className="text-xs text-[#a4b2a9] leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
