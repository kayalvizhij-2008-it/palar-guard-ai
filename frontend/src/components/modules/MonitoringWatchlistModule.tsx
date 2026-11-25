import React, { useEffect, useState } from 'react';
import { Bell, Plus, Trash2, AlertTriangle, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { apiService, WatchlistEntry } from '../../services/api';
import { LocationData } from '../../types';

interface MonitoringWatchlistModuleProps {
  onOpenAuth?: () => void;
}

export const MonitoringWatchlistModule: React.FC<MonitoringWatchlistModuleProps> = ({ onOpenAuth }) => {
  const { isAuthenticated } = useAuth();
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [entries, setEntries] = useState<WatchlistEntry[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [locationId, setLocationId] = useState<number>(1);
  const [thresholdMbgl, setThresholdMbgl] = useState<number>(15.0);
  const [thresholdTds, setThresholdTds] = useState<number>(1500);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const locs = await apiService.getLocations();
      setLocations(locs);
      if (isAuthenticated) {
        const list = await apiService.getWatchlist();
        setEntries(list);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load monitoring watchlist.', 'கண்காணிப்புப் பட்டியலை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await apiService.addWatchlistItem({
        location_id: locationId,
        alert_threshold_mbgl: thresholdMbgl,
        alert_threshold_tds: thresholdTds,
        notes,
      });
      setNotes('');
      await loadData();
    } catch (err: any) {
      setErrorMsg(err?.message || L('Could not save watchlist station.', 'சேமிக்க முடியவில்லை.'));
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await apiService.removeWatchlistItem(id);
      setEntries((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      setErrorMsg(err?.message || L('Could not remove item.', 'நீக்க முடியவில்லை.'));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-[#0b1f17] p-8 text-center space-y-4 max-w-xl mx-auto my-8">
        <Lock className="w-8 h-8 text-[#d9c27a] mx-auto" />
        <h2 className="text-xl font-semibold text-[#fcfbf7]">
          {L('Sign In to Manage Your Monitoring Watchlist', 'கண்காணிப்புப் பட்டியலை நிர்வகிக்க உள்நுழையவும்')}
        </h2>
        <p className="text-xs text-[#a4b2a9]">
          {L(
            'Save stations with custom groundwater depth and TDS alert thresholds tied securely to your account.',
            'உங்கள் கணக்கில் நிலையங்களைச் சேமித்து நீர்மட்ட மற்றும் TDS எச்சரிக்கை வரம்புகளை அமைக்கவும்.'
          )}
        </p>
        {onOpenAuth && (
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

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-teal-500/25 bg-gradient-to-r from-[#071a1f] to-[#19150d] p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300">
            {L('SAVED LOCATION WATCHLIST', 'சேமிக்கப்பட்ட கண்காணிப்பு நிலையங்கள்')}
          </div>
          <h2 className="text-xl font-semibold text-[#fcfbf7]">
            {L('Station Monitoring & Thresholds', 'நிலைய கண்காணிப்பு & வரம்புகள்')}
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#05140d] border border-white/10 text-xs font-mono text-emerald-300 tabular-nums">
          {entries.length} {L('Watched Stations', 'கண்காணிப்பில்')}
        </span>
      </header>

      {errorMsg && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200 flex items-center justify-between">
          <span>{errorMsg}</span>
          <button type="button" onClick={loadData} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add Watchlist Form */}
        <form onSubmit={handleAdd} className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#081b13] p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#d9c27a]">
            <Plus className="w-4 h-4" />
            <span>{L('ADD STATION TO WATCHLIST', 'பட்டியலில் நிலையம் சேர்')}</span>
          </div>

          <div>
            <label className="block text-xs text-[#a4b2a9] mb-1">{L('Monitoring Station', 'கண்காணிப்பு நிலையம்')}</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-xs text-white"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.district})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#a4b2a9] mb-1">{L('Depth Limit (mbgl)', 'ஆழ வரம்பு (mbgl)')}</label>
              <input
                type="number"
                step="0.5"
                value={thresholdMbgl}
                onChange={(e) => setThresholdMbgl(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-xs text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs text-[#a4b2a9] mb-1">{L('TDS Limit (mg/L)', 'TDS வரம்பு (mg/L)')}</label>
              <input
                type="number"
                step="50"
                value={thresholdTds}
                onChange={(e) => setThresholdTds(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-xs text-white tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#a4b2a9] mb-1">{L('Notes', 'குறிப்புகள்')}</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={L('e.g. Pre-monsoon irrigation check', 'எ.கா. கோடைகால பாசன ஆய்வு')}
              className="w-full px-3 py-2 rounded-lg bg-[#05140d] border border-white/10 text-xs text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-[#041a11] text-xs font-semibold transition-colors"
          >
            {L('Save to Watchlist', 'பட்டியலில் சேமி')}
          </button>
        </form>

        {/* Watchlist Table / Cards */}
        <div className="lg:col-span-8 space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#a4b2a9]">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-400" />
              {L('Loading watchlist...', 'பட்டியல் ஏற்றப்படுகிறது...')}
            </div>
          ) : entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#081b13] p-10 text-center space-y-2">
              <Bell className="w-7 h-7 text-[#85928a] mx-auto" />
              <p className="text-sm font-medium text-[#fcfbf7]">{L('Your Watchlist is Empty', 'உங்கள் கண்காணிப்புப் பட்டியல் காலியாக உள்ளது')}</p>
              <p className="text-xs text-[#85928a]">
                {L('Add any Palar Basin station on the left to monitor threshold exceedances.', 'இடதுபுறத்தில் உள்ள படிவம் மூலம் நிலையத்தைச் சேர்க்கவும்.')}
              </p>
            </div>
          ) : (
            entries.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  item.threshold_exceeded ? 'border-amber-500/40 bg-[#1a1308]' : 'border-white/10 bg-[#081b13]'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    {item.threshold_exceeded ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                    )}
                    <h3 className="text-sm font-semibold text-[#fcfbf7]">{item.location_name}</h3>
                    <span className="text-[11px] font-mono text-[#85928a]">({item.district})</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-mono tabular-nums text-[#a4b2a9]">
                    <span>
                      Depth: <strong className="text-white">{item.latest_mbgl ?? '—'} mbgl</strong> (limit {item.alert_threshold_mbgl})
                    </span>
                    <span>
                      TDS: <strong className="text-white">{item.latest_tds ?? '—'} mg/L</strong> (limit {item.alert_threshold_tds})
                    </span>
                    <span>Open Alerts: {item.open_alerts}</span>
                  </div>
                  {item.notes && <p className="text-xs text-[#85928a]">{item.notes}</p>}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item.id)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-rose-500/40 text-xs text-stone-300 hover:text-rose-300 inline-flex items-center gap-1.5 self-start sm:self-center"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{L('Remove', 'நீக்கு')}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
