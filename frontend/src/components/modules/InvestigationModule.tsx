import React, { useState } from 'react';
import { INVESTIGATIONS_DATA } from '../../data/palarData';
import { InvestigationItem } from '../../types';
import { DataBadge } from '../common/DataBadge';
import { 
  ClipboardList, CheckCircle2, Clock, AlertTriangle, 
  UserCheck, ShieldAlert, CheckSquare, Kanban, ListFilter,
  MapPin, ChevronRight
} from 'lucide-react';

export const InvestigationModule: React.FC = () => {
  const [investigations, setInvestigations] = useState<InvestigationItem[]>(INVESTIGATIONS_DATA);
  const [selectedInv, setSelectedInv] = useState<InvestigationItem | null>(investigations[0]);
  const [findingsInput, setFindingsInput] = useState<string>(investigations[0]?.findings || '');
  const [viewMode, setViewMode] = useState<'dossier' | 'kanban'>('kanban');

  const handleSelect = (inv: InvestigationItem) => {
    setSelectedInv(inv);
    setFindingsInput(inv.findings);
  };

  const handleUpdateStatus = (id: number, status: InvestigationItem['status']) => {
    setInvestigations(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    if (selectedInv?.id === id) {
      setSelectedInv(prev => prev ? { ...prev, status } : null);
    }
  };

  const handleSaveFindings = () => {
    if (!selectedInv) return;
    const updated = { ...selectedInv, findings: findingsInput };
    setInvestigations(prev => prev.map(i => i.id === selectedInv.id ? updated : i));
    setSelectedInv(updated);
  };

  const kanbanStages: { title: string; status: InvestigationItem['status']; color: string }[] = [
    { title: 'Open / Dispatched', status: 'Assigned', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
    { title: 'In Progress', status: 'In Progress', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20' },
    { title: 'Samples Collected', status: 'Field Samples Collected', color: 'border-teal-500/40 text-teal-400 bg-teal-950/20' },
    { title: 'Resolved & Audited', status: 'Resolved', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20' }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-white tracking-tight">Early Warning & Field Investigation Centre</h2>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <p className="text-xs text-stone-300">
            Field team dispatch tracking, chemical sampling verification, and on-ground remediation workflow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'kanban' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              onClick={() => setViewMode('dossier')}
              className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                viewMode === 'dossier' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Dossier View</span>
            </button>
          </div>

          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 rounded text-xs font-mono">
            {investigations.filter(i => i.status !== 'Resolved').length} Active
          </span>
        </div>
      </div>

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanStages.map((stage) => {
            const stageItems = investigations.filter(i => i.status === stage.status);

            return (
              <div 
                key={stage.title} 
                className="p-4 rounded-2xl bg-[#061c12] border border-white/[0.08] flex flex-col justify-between space-y-3 min-h-[460px]"
              >
                <div>
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between mb-3 ${stage.color}`}>
                    <span className="text-xs font-bold font-mono uppercase tracking-wider">{stage.title}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/50 font-mono">
                      {stageItems.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {stageItems.map((inv) => (
                      <div
                        key={inv.id}
                        onClick={() => {
                          handleSelect(inv);
                          setViewMode('dossier');
                        }}
                        className="p-3.5 rounded-xl bg-[#031109] border border-white/[0.06] hover:border-emerald-500/50 cursor-pointer transition-all space-y-2 group shadow-forest-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            inv.priority === 'Urgent' 
                              ? 'bg-rose-950 text-rose-300 border border-rose-500/30' 
                              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
                          }`}>
                            {inv.priority}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">#{inv.id}</span>
                        </div>

                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {inv.title}
                        </h4>

                        <div className="flex items-center gap-1 text-[11px] text-stone-400">
                          <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="truncate">{inv.location_name}</span>
                        </div>

                        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] text-stone-400">
                          <span>Team: <strong className="text-stone-200">{inv.assigned_to}</strong></span>
                          <ChevronRight className="w-3 h-3 text-stone-500 group-hover:text-emerald-400 transition-colors" />
                        </div>
                      </div>
                    ))}

                    {stageItems.length === 0 && (
                      <div className="p-6 text-center text-xs text-stone-500 border border-dashed border-white/5 rounded-xl">
                        No dispatches in this stage
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[10px] font-mono text-stone-500 text-center pt-2 border-t border-white/[0.04]">
                  Click card to open full dossier
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DOSSIER & CHECKLIST VIEW */}
      {viewMode === 'dossier' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Investigation Cases List */}
          <div className="lg:col-span-5 space-y-3">
            {investigations.map((inv) => {
              const isSelected = selectedInv?.id === inv.id;
              return (
                <div
                  key={inv.id}
                  onClick={() => handleSelect(inv)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected 
                      ? 'bg-[#0c2e21] border-emerald-500/50 shadow-forest-sm' 
                      : 'bg-[#092218] border-white/[0.08] hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      inv.priority === 'Urgent' ? 'bg-red-950 text-red-300 border border-red-500/30' :
                      'bg-amber-950 text-amber-300 border border-amber-500/30'
                    }`}>
                      {inv.priority}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">{inv.status}</span>
                  </div>

                  <h4 className="text-sm font-bold text-white">{inv.title}</h4>
                  <div className="text-xs text-stone-300 font-mono">{inv.location_name}</div>

                  <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-stone-400">
                    <span>Assigned: <strong className="text-stone-300">{inv.assigned_to}</strong></span>
                    <span className="text-[10px] font-mono">ID: #{inv.id}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Case Details & Verification Checklist */}
          {selectedInv && (
            <div className="lg:col-span-7 p-6 bg-[#092218] border border-white/[0.08] rounded-2xl space-y-5 shadow-forest-md">
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Investigation Dossier</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{selectedInv.title}</h3>
                  <p className="text-xs text-stone-400">{selectedInv.location_name} • Assigned to {selectedInv.assigned_to}</p>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono text-xs font-bold">
                  {selectedInv.status}
                </span>
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  <span>Field Verification Checklist</span>
                </div>
                <div className="space-y-1.5 bg-[#05160e] p-3 rounded-lg border border-white/[0.06]">
                  {selectedInv.checklist.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                      <input type="checkbox" defaultChecked={idx < 2} className="rounded accent-emerald-500" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Field Findings Editor */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-white">Investigator Ground Notes & Findings</div>
                <textarea
                  rows={3}
                  value={findingsInput}
                  onChange={e => setFindingsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#05160e] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 resize-none font-sans"
                />
                <button
                  onClick={handleSaveFindings}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-xs font-medium text-stone-300 rounded border border-white/10 transition-colors"
                >
                  Save Notes
                </button>
              </div>

              {/* Status Transition Action Buttons */}
              <div className="pt-3 border-t border-white/[0.08] space-y-2">
                <div className="text-xs font-semibold text-white">Update Dispatch Stage</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedInv.id, 'In Progress')}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-xs font-medium text-stone-300 border border-white/10 transition-colors"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedInv.id, 'Field Samples Collected')}
                    className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded text-xs font-medium border border-cyan-500/30 transition-colors"
                  >
                    Samples Collected
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedInv.id, 'Resolved')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-forest-sm transition-colors"
                  >
                    Resolve Case
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
