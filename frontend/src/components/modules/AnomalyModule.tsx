import React, { useEffect, useState } from 'react';
import { DataBadge } from '../common/DataBadge';
import { AnomalyAlertItem } from '../../types';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const AnomalyModule: React.FC = () => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [anomalies, setAnomalies] = useState<AnomalyAlertItem[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlertItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadAnomalies = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const list = await apiService.getAnomalies();
      setAnomalies(list);
      setSelectedAlert((prev) => list.find((a) => a.id === prev?.id) || list[0] || null);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load anomaly alerts.', 'அபாய எச்சரிக்கைகளை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: AnomalyAlertItem['status']) => {
    setErrorMsg(null);
    try {
      await apiService.updateAnomalyStatus(id, newStatus);
      setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
      if (selectedAlert && selectedAlert.id === id) {
        setSelectedAlert((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message ||
          L(
            'Triage requires Administrator or Environmental Analyst sign-in.',
            'நிலை மாற்றத்திற்கு நிர்வாகி அல்லது ஆய்வாளர் உள்நுழைவு தேவை.'
          )
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#1a0f13] to-[#17120e] border border-rose-500/25 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-semibold text-[#fcfbf7]">
              {L('Pollution Risk & Statistical Outliers', 'மாசு அபாயம் & புள்ளிவிவர மாறுபாடுகள்')}
            </h2>
            <DataBadge provenance="MODEL_PREDICTION" />
          </div>
          <p className="text-xs text-stone-300">
            {L(
              'Coral/Amber evidence board using robust Z-scores and seasonal IQR bounds to queue field verification.',
              'கள ஆய்வுக்கு முன்னுரிமை அளிக்க வலுவான Z-மதிப்புகளைப் பயன்படுத்தும் சான்றுப் பலகை.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={loadAnomalies}
          className="px-3 py-1.5 bg-red-950/70 border border-red-500/30 text-red-200 rounded-lg text-xs font-mono inline-flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{anomalies.filter((a) => a.status === 'Open').length} {L('Open Alerts', 'திறந்த எச்சரிக்கைகள்')}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{errorMsg}</span>
          </span>
          <button type="button" onClick={loadAnomalies} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      <div className="p-4 bg-[#14261d] rounded-xl border border-amber-500/30 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-stone-300 leading-relaxed">
          <span className="font-semibold text-amber-300">{L('Scientific Protocol: ', 'அறிவியல் நெறிமுறை: ')}</span>
          {L(
            'A statistical anomaly is a signal for field verification, never proof of causation or regulatory fault without laboratory testing.',
            'புள்ளிவிவர மாறுபாடு என்பது கள ஆய்விற்கான அறிகுறி மட்டுமே; ஆய்வக சோதனையின்றி முடிவாகக் கருதப்படாது.'
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-3">
          {anomalies.map((alert) => {
            const isSelected = selectedAlert?.id === alert.id;
            return (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors space-y-2 ${
                  isSelected
                    ? 'bg-[#221216] border-rose-500/50'
                    : 'bg-[#140e10] border-rose-500/15 hover:border-amber-500/35'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{alert.location_name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-stone-400">
                      #{alert.id}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      alert.severity === 'Critical'
                        ? 'bg-red-950 text-red-300 border border-red-500/30'
                        : alert.severity === 'High'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {alert.severity}
                  </span>
                </div>

                <div className="text-xs font-semibold text-amber-300">{alert.parameter}</div>
                <p className="text-xs text-stone-300 leading-relaxed">{alert.trigger_reason}</p>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
                  <span className="text-stone-400 tabular-nums">Z-Score: <strong className="text-white">{alert.z_score}</strong></span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/5 text-emerald-300">
                    {alert.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {selectedAlert && (
          <div className="lg:col-span-5 p-5 bg-[#150f12] border border-amber-500/20 rounded-xl space-y-5">
            <div className="border-b border-white/[0.08] pb-3">
              <div className="text-[10px] font-mono text-amber-400 uppercase">{L('Evidence Dossier', 'சான்று விவரம்')}</div>
              <h3 className="text-base font-semibold text-white mt-0.5">{selectedAlert.parameter}</h3>
              <p className="text-xs text-stone-400">{selectedAlert.location_name}</p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-stone-400">{L('Observed Value', 'பதிவு மதிப்பு')}</div>
                  <div className="text-lg font-semibold text-red-400 tabular-nums">{selectedAlert.observed_value}</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-400">{L('Expected Baseline', 'அடிப்படை அளவு')}</div>
                  <div className="text-lg font-semibold text-stone-300 tabular-nums">{selectedAlert.expected_baseline}</div>
                </div>
              </div>

              <div className="p-3 bg-[#05160e] rounded-lg border border-white/[0.06] space-y-1">
                <div className="text-[10px] text-stone-400">{L('Trigger Rationale', 'காரணம்')}</div>
                <p className="text-xs text-stone-200 font-sans leading-relaxed">{selectedAlert.trigger_reason}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="text-xs font-semibold text-white">{L('Triage Status (Analyst/Admin Only)', 'நிலை மாற்றம் (ஆய்வாளர்/நிர்வாகி மட்டும்)')}</div>
              <div className="grid grid-cols-3 gap-2">
                {(['Under Review', 'Verified', 'Dismissed'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleUpdateStatus(selectedAlert.id, st)}
                    className={`py-1.5 rounded text-xs font-medium border transition-colors ${
                      selectedAlert.status === st
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-white/5 hover:bg-white/10 text-stone-300 border-white/10'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
