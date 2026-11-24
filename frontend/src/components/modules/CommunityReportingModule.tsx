import React, { useState } from 'react';
import { COMMUNITY_REPORTS_DATA, PALAR_LOCATIONS } from '../../data/palarData';
import { CommunityReportItem } from '../../types';
import { DataBadge } from '../common/DataBadge';
import { Users, Send, CheckCircle2, AlertTriangle, Upload, Eye } from 'lucide-react';

export const CommunityReportingModule: React.FC = () => {
  const [reports, setReports] = useState<CommunityReportItem[]>(COMMUNITY_REPORTS_DATA);
  const [title, setTitle] = useState('');
  const [locationId, setLocationId] = useState<number>(2);
  const [category, setCategory] = useState<CommunityReportItem['category']>('Effluent Discoloration');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [submittedMessage, setSubmittedMessage] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    const loc = PALAR_LOCATIONS.find(l => l.id === locationId) || PALAR_LOCATIONS[0];
    const newReport: CommunityReportItem = {
      id: reports.length + 1,
      location_id: loc.id,
      location_name: loc.name,
      title,
      category,
      description,
      latitude: loc.latitude,
      longitude: loc.longitude,
      status: 'Pending Review',
      reporter_name: reporterName || 'Anonymous Citizen',
      created_at: new Date().toISOString()
    };

    setReports([newReport, ...reports]);
    setTitle('');
    setDescription('');
    setReporterName('');
    setSubmittedMessage(true);
    setTimeout(() => setSubmittedMessage(false), 4000);
  };

  const handleUpdateStatus = (id: number, newStatus: CommunityReportItem['status']) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Community Water Reporting</h2>
            <DataBadge provenance="COMMUNITY_REPORT" />
          </div>
          <p className="text-xs text-stone-300">
            Citizen science portal allowing local farmers and residents to submit observations regarding dry wells, discoloration, or odors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 rounded text-xs font-mono">
            {reports.length} Reports Logged
          </span>
        </div>
      </div>

      {/* Main Grid: Submission Form & Reports Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submission Form */}
        <div className="lg:col-span-5 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Submit Ground Observation</span>
            </h3>
            <p className="text-[11px] text-stone-400">Reports trigger analyst review and potential field triage dispatch.</p>
          </div>

          {submittedMessage && (
            <div className="p-3 bg-emerald-950 border border-emerald-500/40 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Report submitted successfully! Queued for moderation review.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-stone-400 mb-1 font-mono text-[11px]">Report Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Foam visible in irrigation canal"
                className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1 font-mono text-[11px]">Location Reach</label>
                <select
                  value={locationId}
                  onChange={e => setLocationId(Number(e.target.value))}
                  className="w-full px-2.5 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  {PALAR_LOCATIONS.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-mono text-[11px]">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Effluent Discoloration">Effluent Discoloration</option>
                  <option value="Well Depletion">Well Depletion</option>
                  <option value="Odor/Foaming">Odor / Foaming</option>
                  <option value="Sand Mining">Illegal Sand Extraction</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-mono text-[11px]">Detailed Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe observations, time of day, water color, nearby landmarks..."
                className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-mono text-[11px]">Your Name / Contact (Optional)</label>
              <input
                type="text"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                placeholder="e.g. S. Kumar (Local Farmer)"
                className="w-full px-3 py-2 bg-[#061811] border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-forest-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Incident Report</span>
            </button>
          </form>
        </div>

        {/* Right Column: Moderated Reports Feed */}
        <div className="lg:col-span-7 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Community Incident Feed</h3>
              <p className="text-[11px] text-stone-400">All submissions undergo verification checklist before dispatch</p>
            </div>
            <DataBadge provenance="COMMUNITY_REPORT" />
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <div 
                key={report.id}
                className="p-4 rounded-xl bg-[#05160e] border border-white/[0.06] space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{report.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {report.category}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    report.status === 'Verified' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                    report.status === 'Action Initiated' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                    'bg-stone-900 text-stone-300 border border-stone-600/30'
                  }`}>
                    {report.status}
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">{report.description}</p>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>Location: <strong className="text-stone-300">{report.location_name}</strong></span>
                  <span>Reported by: {report.reporter_name}</span>
                </div>

                {/* Moderation Controls (Analyst / Admin Action) */}
                <div className="pt-1 flex items-center gap-2 justify-end">
                  <span className="text-[10px] text-stone-500 font-mono">Moderate:</span>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'Verified')}
                    className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30"
                  >
                    Verify
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'Action Initiated')}
                    className="px-2 py-0.5 rounded text-[10px] bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-500/30"
                  >
                    Initiate Action
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(report.id, 'Rejected')}
                    className="px-2 py-0.5 rounded text-[10px] bg-red-950 hover:bg-red-900 text-red-300 border border-red-500/30"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
