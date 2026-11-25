import React, { useEffect, useState } from 'react';
import { PALAR_LOCATIONS } from '../../data/palarData';
import { CommunityReportItem, LocationData } from '../../types';
import { DataBadge } from '../common/DataBadge';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Users, Send, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const CommunityReportingModule: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [reports, setReports] = useState<CommunityReportItem[]>([]);
  const [locations, setLocations] = useState<LocationData[]>(PALAR_LOCATIONS);
  const [title, setTitle] = useState('');
  const [locationId, setLocationId] = useState<number>(2);
  const [category, setCategory] = useState<CommunityReportItem['category']>('Effluent Discoloration');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canModerate =
    isAuthenticated && ['Administrator', 'Environmental Analyst', 'Field Investigator'].includes(role);

  const loadReports = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [reps, locs] = await Promise.all([
        apiService.getCommunityReports(),
        apiService.getLocations(),
      ]);
      setReports(reps);
      if (locs.length > 0) setLocations(locs);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load community reports.', 'புகார்களை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || description.trim().length < 5) return;
    setErrorMsg(null);
    setSubmittedMessage(null);

    try {
      const loc = locations.find((l) => l.id === locationId) || locations[0];
      const created = await apiService.submitCommunityReport({
        reporter_name: reporterName.trim() || 'Anonymous Citizen',
        location_id: loc.id,
        category,
        description: `${title.trim()}: ${description.trim()}`,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
      setReports((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
      setReporterName('');
      setSubmittedMessage(L('Report submitted and queued for moderation review.', 'புகார் பதிவு செய்யப்பட்டு ஆய்விற்கு அனுப்பப்பட்டது.'));
    } catch (err: any) {
      setErrorMsg(err?.message || L('Failed to submit report.', 'புகார் சமர்ப்பித்தல் தோல்வியடைந்தது.'));
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: CommunityReportItem['status']) => {
    setErrorMsg(null);
    try {
      await apiService.moderateCommunityReport(id, newStatus);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
    } catch (err: any) {
      setErrorMsg(err?.message || L('Moderation requires Analyst/Investigator/Admin sign-in.', 'நிலை மாற்றம் செய்ய அங்கீகரிக்கப்பட்ட உள்நுழைவு தேவை.'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-[#fcfbf7]">{L('Community Water Reporting', 'மக்கள் நீர் புகார்கள்')}</h2>
            <DataBadge provenance="COMMUNITY_REPORT" />
          </div>
          <p className="text-xs text-[#a4b2a9]">
            {L(
              'Citizen observation intake and role-protected moderation queue.',
              'பொதுமக்கள் புகார் பதிவு மற்றும் சரிபார்ப்பு வரிசை.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          className="px-3 py-1.5 bg-[#05140d] border border-white/10 text-emerald-300 rounded-lg text-xs font-mono inline-flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{reports.length} {L('Reports', 'புகார்கள்')}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </span>
          <button type="button" onClick={loadReports} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{L('Submit Ground Observation', 'களப் புகார் பதிவு')}</span>
            </h3>
          </div>

          {submittedMessage && (
            <div className="p-3 bg-emerald-950 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{submittedMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-300 mb-1">{L('Report Title', 'தலைப்பு')}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={L('e.g. Foam visible in irrigation canal', 'எ.கா. பாசனக் கால்வாயில் நுரை')}
                className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 mb-1">{L('Location', 'இடம்')}</label>
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-[#061811] border border-white/10 rounded-lg text-white"
                >
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-stone-300 mb-1">{L('Category', 'வகை')}</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CommunityReportItem['category'])}
                  className="w-full px-2.5 py-2 bg-[#061811] border border-white/10 rounded-lg text-white"
                >
                  <option value="Effluent Discoloration">Effluent Discoloration</option>
                  <option value="Well Depletion">Well Depletion</option>
                  <option value="Odor/Foaming">Odor/Foaming</option>
                  <option value="Sand Mining">Sand Mining</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-300 mb-1">{L('Description', 'விவரம்')}</label>
              <textarea
                rows={3}
                required
                minLength={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-stone-300 mb-1">{L('Reporter Name (Optional)', 'பெயர் (விருப்பம்)')}</label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-[#041a11] font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{L('Submit Report', 'சமர்ப்பி')}</span>
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="p-4 rounded-xl bg-[#092218] border border-white/[0.08] space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{rep.title}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#05140d] border border-emerald-500/30 text-emerald-300">
                  {rep.status}
                </span>
              </div>
              <p className="text-xs text-stone-300">{rep.description}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.05] text-[11px] font-mono text-stone-400">
                <span>{rep.location_name} · {rep.reporter_name}</span>
                {canModerate && (
                  <div className="flex gap-1.5">
                    {(['Verified', 'Action Initiated', 'Rejected'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateStatus(rep.id, st)}
                        className="px-2 py-0.5 rounded bg-white/5 hover:bg-emerald-950 text-stone-200 border border-white/10"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
