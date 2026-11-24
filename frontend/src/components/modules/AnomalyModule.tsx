import React, { useState } from 'react';
import { ANOMALIES_DATA } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { AnomalyAlertItem } from '../../types';
import { AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';

export const AnomalyModule: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AnomalyAlertItem[]>(ANOMALIES_DATA);
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlertItem | null>(anomalies[0]);

  const handleUpdateStatus = (id: number, newStatus: AnomalyAlertItem['status']) => {
    setAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (selectedAlert && selectedAlert.id === id) {
      setSelectedAlert(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#092218] border border-white/[0.08] rounded-2xl shadow-forest-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-ivory tracking-tight">Pollution Anomaly Detection</h2>
            <DataBadge provenance="MODEL_PREDICTION" />
          </div>
          <p className="text-xs text-stone-300">
            Statistical deviation engine using robust Z-scores and seasonal IQR bounds to signal prioritized field verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-red-950/80 border border-red-500/30 text-red-300 rounded text-xs font-mono">
            {anomalies.filter(a => a.status === 'Open').length} Open Alerts
          </span>
        </div>
      </div>

      {/* Mandatory Scientific Protocol Box */}
      <div className="p-4 bg-[#14261d] rounded-xl border border-amber-500/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-300 leading-relaxed">
          <span className="font-bold text-amber-300">Statistical Anomaly Protocol: </span>
          An anomaly is an indicator for investigation, not legal proof of pollution. Never attribute causation to an individual or business without certified physical laboratory validation.
        </div>
      </div>

      {/* Main Grid: Alerts List & Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Anomalies List */}
        <div className="lg:col-span-7 space-y-3">
          {anomalies.map((alert) => {
            const isSelected = selectedAlert?.id === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected 
                    ? 'bg-[#0c2e21] border-emerald-500/50 shadow-forest-sm' 
                    : 'bg-[#092218] border-white/[0.08] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{alert.location_name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-stone-400">
                      ID: #{alert.id}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    alert.severity === 'Critical' ? 'bg-red-950 text-red-300 border border-red-500/30' :
                    alert.severity === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                    'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {alert.severity}
                  </span>
                </div>

                <div className="text-xs font-semibold text-amber-300">{alert.parameter}</div>
                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">{alert.trigger_reason}</p>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-400">Robust Z-Score: <strong className="text-white">{alert.z_score}</strong></span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    alert.status === 'Open' ? 'text-red-400 bg-red-950/40' :
                    alert.status === 'Under Review' ? 'text-amber-400 bg-amber-950/40' :
                    alert.status === 'Verified' ? 'text-emerald-400 bg-emerald-950/40' :
                    'text-stone-400 bg-stone-900/40'
                  }`}>
                    {alert.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Alert Deep Dive & Analyst Review Action */}
        {selectedAlert && (
          <div className="lg:col-span-5 p-5 bg-[#092218] border border-white/[0.08] rounded-xl space-y-5">
            <div className="border-b border-white/[0.08] pb-3">
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Alert Deep Dive</div>
              <h3 className="text-base font-bold text-white mt-0.5">{selectedAlert.parameter}</h3>
              <p className="text-xs text-stone-400">{selectedAlert.location_name}</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-stone-400">Observed Value</div>
                  <div className="text-lg font-bold text-red-400 tabular-nums">{selectedAlert.observed_value}</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400">Seasonal Baseline</div>
                  <div className="text-lg font-bold text-stone-300 tabular-nums">{selectedAlert.expected_baseline}</div>
                </div>
              </div>

              <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] space-y-1">
                <div className="text-[10px] text-stone-400">Trigger Rationale</div>
                <p className="text-xs text-stone-200 font-sans leading-relaxed">{selectedAlert.trigger_reason}</p>
              </div>

              <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-stone-400">Detection Methodology</div>
                  <div className="text-xs text-emerald-300">Robust Median Absolute Deviation (MAD)</div>
                </div>
                <DataBadge provenance={selectedAlert.provenance} />
              </div>
            </div>

            {/* Analyst Review Status Actions */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="text-xs font-semibold text-white">Analyst Review Actions</div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleUpdateStatus(selectedAlert.id, 'Under Review')}
                  className={`py-1.5 rounded text-xs font-medium border transition-colors ${
                    selectedAlert.status === 'Under Review'
                      ? 'bg-amber-600 text-white border-amber-500'
                      : 'bg-white/5 hover:bg-white/10 text-stone-300 border-white/10'
                  }`}
                >
                  Under Review
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAlert.id, 'Verified')}
                  className={`py-1.5 rounded text-xs font-medium border transition-colors ${
                    selectedAlert.status === 'Verified'
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-white/5 hover:bg-white/10 text-stone-300 border-white/10'
                  }`}
                >
                  Verify Alert
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedAlert.id, 'Dismissed')}
                  className={`py-1.5 rounded text-xs font-medium border transition-colors ${
                    selectedAlert.status === 'Dismissed'
                      ? 'bg-stone-700 text-white border-stone-600'
                      : 'bg-white/5 hover:bg-white/10 text-stone-300 border-white/10'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
