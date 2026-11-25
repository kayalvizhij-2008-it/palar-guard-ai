import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Kanban,
  ListFilter,
  MapPin,
  ChevronRight,
  Lock,
  AlertCircle,
  Loader2,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService } from '../../services/api';
import { InvestigationItem, LocationData } from '../../types';
import { DataBadge } from '../common/DataBadge';

interface InvestigationModuleProps {
  onOpenAuth?: () => void;
}

export const InvestigationModule: React.FC<InvestigationModuleProps> = ({ onOpenAuth }) => {
  const { isAuthenticated, role } = useAuth();
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [investigations, setInvestigations] = useState<InvestigationItem[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedInv, setSelectedInv] = useState<InvestigationItem | null>(null);
  const [findingsInput, setFindingsInput] = useState<string>('');
  const [viewMode, setViewMode] = useState<'kanban' | 'dossier'>('kanban');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Create ticket form (Admin / Analyst)
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocId, setNewLocId] = useState(1);
  const [newPriority, setNewPriority] = useState('High');
  const [newAssigned, setNewAssigned] = useState('Aarthi L');

  const canAccess =
    isAuthenticated &&
    ['Administrator', 'Environmental Analyst', 'Field Investigator', 'Researcher'].includes(role);

  const loadInvestigations = async () => {
    if (!canAccess) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const [items, locs] = await Promise.all([
        apiService.getInvestigations(),
        apiService.getLocations(),
      ]);
      setInvestigations(items);
      setLocations(locs);
      if (items.length > 0) {
        setSelectedInv((prev) => items.find((i) => i.id === prev?.id) || items[0]);
        setFindingsInput((prev) => prev || items[0].findings || '');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load field investigations.', 'கள ஆய்வுகளை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestigations();
  }, [isAuthenticated, role]);

  const handleSelect = (inv: InvestigationItem) => {
    setSelectedInv(inv);
    setFindingsInput(inv.findings);
  };

  const handleUpdateStatus = async (id: number, status: InvestigationItem['status']) => {
    setSaving(true);
    setErrorMsg(null);
    try {
      await apiService.updateInvestigation(id, { status });
      setInvestigations((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      if (selectedInv?.id === id) {
        setSelectedInv((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || L('Failed to update investigation status.', 'நிலையைப் புதுப்பிக்க முடியவில்லை.'));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveFindings = async () => {
    if (!selectedInv) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await apiService.updateInvestigation(selectedInv.id, { findings: findingsInput });
      const updated = { ...selectedInv, findings: findingsInput };
      setInvestigations((prev) => prev.map((i) => (i.id === selectedInv.id ? updated : i)));
      setSelectedInv(updated);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Failed to save findings.', 'குறிப்புகளைச் சேமிக்க முடியவில்லை.'));
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      await apiService.createInvestigation({
        location_id: newLocId,
        title: newTitle.trim(),
        priority: newPriority,
        assigned_to: newAssigned.trim() || 'Unassigned',
      });
      setNewTitle('');
      setShowCreate(false);
      await loadInvestigations();
    } catch (err: any) {
      setErrorMsg(err?.message || L('Failed to create investigation.', 'ஆய்வு உருவாக்க முடியவில்லை.'));
    } finally {
      setSaving(false);
    }
  };

  if (!canAccess) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-[#0b1f17] p-8 text-center space-y-4 max-w-xl mx-auto my-8">
        <Lock className="w-8 h-8 text-[#d9c27a] mx-auto" />
        <h2 className="text-xl font-semibold text-[#fcfbf7]">
          {L('Field Investigation Access Restricted', 'கள ஆய்வு அணுகல் கட்டுப்படுத்தப்பட்டுள்ளது')}
        </h2>
        <p className="text-xs text-[#a4b2a9] leading-relaxed">
          {isAuthenticated
            ? L(
                `Your current role (${role}) does not have permission to view or update field investigation tickets.`,
                `உங்கள் தற்போதைய உரிமை (${role}) கள ஆய்வுப் பணிகளைப் பார்க்க அனுமதிக்கவில்லை.`
              )
            : L(
                'Sign in with an Administrator, Environmental Analyst, Field Investigator, or Researcher account to access the Kanban verification board.',
                'கள ஆய்வு கான்பன் பலகையைப் பார்க்க அங்கீகரிக்கப்பட்ட கணக்குடன் உள்நுழையவும்.'
              )}
        </p>
        {!isAuthenticated && onOpenAuth && (
          <button
            type="button"
            onClick={onOpenAuth}
            className="px-6 py-2.5 rounded-xl bg-[#10b981] text-[#041a11] text-xs font-semibold"
          >
            {L('Sign In', 'உள்நுழைக')}
          </button>
        )}
      </div>
    );
  }

  const kanbanStages: { title: string; status: InvestigationItem['status']; color: string }[] = [
    { title: L('Assigned', 'ஒதுக்கப்பட்டது'), status: 'Assigned', color: 'border-amber-500/40 text-amber-300 bg-amber-950/20' },
    { title: L('In Progress', 'செயல்பாட்டில்'), status: 'In Progress', color: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/20' },
    { title: L('Samples Collected', 'மாதிரிகள் சேகரிப்பு'), status: 'Field Samples Collected', color: 'border-teal-500/40 text-teal-300 bg-teal-950/20' },
    { title: L('Resolved', 'தீர்வு காணப்பட்டது'), status: 'Resolved', color: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-[#fcfbf7]">
              {L('Field Verification Kanban Board', 'கள சரிபார்ப்பு கான்பன் பலகை')}
            </h2>
            <DataBadge provenance="FIELD_VERIFIED" />
          </div>
          <p className="text-xs text-[#a4b2a9]">
            {L(
              'Role-protected verification tickets synced directly with the FastAPI database.',
              'தரவுத்தளத்துடன் இணைக்கப்பட்ட பாதுகாக்கப்பட்ட கள ஆய்வுப் பணிகள்.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['Administrator', 'Environmental Analyst'].includes(role) && (
            <button
              type="button"
              onClick={() => setShowCreate(!showCreate)}
              className="px-3 py-1.5 rounded-lg bg-[#10b981] text-[#041a11] text-xs font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{L('New Ticket', 'புதிய பணி')}</span>
            </button>
          )}

          <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 ${
                viewMode === 'kanban' ? 'bg-emerald-600 text-white font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>{L('Kanban', 'கான்பன்')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('dossier')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 ${
                viewMode === 'dossier' ? 'bg-emerald-600 text-white font-semibold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>{L('Dossier', 'விவரம்')}</span>
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </span>
          <button type="button" onClick={loadInvestigations} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-[#081b13] border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <input
            type="text"
            required
            placeholder={L('Investigation title', 'ஆய்வுத் தலைப்பு')}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="sm:col-span-2 px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-white"
          />
          <select
            value={newLocId}
            onChange={(e) => setNewLocId(Number(e.target.value))}
            className="px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-white"
          >
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAssigned}
              onChange={(e) => setNewAssigned(e.target.value)}
              placeholder={L('Assignee', 'பொறுப்பாளர்')}
              className="flex-1 px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-white"
            />
            <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-[#10b981] text-[#041a11] font-semibold">
              {L('Create', 'உருவாக்கு')}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-10 text-center text-xs text-[#a4b2a9]">
          <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
          {L('Loading field investigations...', 'கள ஆய்வுகள் ஏற்றப்படுகின்றன...')}
        </div>
      ) : viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanStages.map((stage) => {
            const stageItems = investigations.filter((i) => i.status === stage.status);
            return (
              <div
                key={stage.status}
                className="p-4 rounded-2xl bg-[#061c12] border border-white/[0.08] flex flex-col space-y-3 min-h-[380px]"
              >
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${stage.color}`}>
                  <span className="text-xs font-semibold font-mono uppercase">{stage.title}</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-black/40 tabular-nums">
                    {stageItems.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {stageItems.map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => {
                        handleSelect(inv);
                        setViewMode('dossier');
                      }}
                      className="p-3.5 rounded-xl bg-[#031109] border border-white/[0.06] hover:border-emerald-500/50 cursor-pointer transition-colors space-y-2"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                          {inv.priority}
                        </span>
                        <span className="text-stone-400">#{inv.id}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">{inv.title}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-stone-400">
                        <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{inv.location_name}</span>
                      </div>
                      <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-stone-400">
                        <span>{inv.assigned_to}</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                  {stageItems.length === 0 && (
                    <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-white/5 rounded-xl">
                      {L('No tickets', 'பணிகள் இல்லை')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            {investigations.map((inv) => (
              <div
                key={inv.id}
                onClick={() => handleSelect(inv)}
                className={`p-4 rounded-xl border cursor-pointer space-y-1.5 ${
                  selectedInv?.id === inv.id
                    ? 'bg-[#0c2e21] border-emerald-500/50'
                    : 'bg-[#092218] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-amber-300">{inv.priority}</span>
                  <span className="text-emerald-400">{inv.status}</span>
                </div>
                <h4 className="text-sm font-semibold text-white">{inv.title}</h4>
                <div className="text-xs text-stone-400">{inv.location_name} · {inv.assigned_to}</div>
              </div>
            ))}
          </div>

          {selectedInv && (
            <div className="lg:col-span-7 p-6 bg-[#092218] border border-white/[0.08] rounded-2xl space-y-5">
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">#{selectedInv.id}</span>
                  <h3 className="text-lg font-semibold text-white">{selectedInv.title}</h3>
                  <p className="text-xs text-stone-400">{selectedInv.location_name} · {selectedInv.assigned_to}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono text-xs">
                  {selectedInv.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>{L('Verification Checklist', 'சரிபார்ப்புப் பட்டியல்')}</span>
                </div>
                <div className="space-y-1.5 bg-[#05160e] p-3 rounded-lg border border-white/[0.06]">
                  {selectedInv.checklist.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-xs text-stone-300">
                      <input type="checkbox" className="rounded accent-emerald-500" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-white">{L('Ground Findings', 'கள ஆய்வுக் குறிப்புகள்')}</label>
                <textarea
                  rows={3}
                  value={findingsInput}
                  onChange={(e) => setFindingsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#05160e] border border-white/10 rounded-lg text-xs text-white"
                />
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveFindings}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-medium text-stone-200 rounded border border-white/10"
                >
                  {L('Save Findings', 'குறிப்புகளைச் சேமி')}
                </button>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex flex-wrap gap-2">
                {(['Assigned', 'In Progress', 'Field Samples Collected', 'Resolved'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={saving}
                    onClick={() => handleUpdateStatus(selectedInv.id, st)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border ${
                      selectedInv.status === st
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
