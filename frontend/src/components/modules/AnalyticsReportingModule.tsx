import React, { useEffect, useState } from 'react';
import { DataBadge } from '../common/DataBadge';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { LocationData, WaterQualityPoint } from '../../types';
import { Download, Printer, CheckCircle2, FileText, Search, AlertCircle } from 'lucide-react';

export const AnalyticsReportingModule: React.FC = () => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [waterQuality, setWaterQuality] = useState<WaterQualityPoint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadDossierData = async () => {
    setErrorMsg(null);
    try {
      const [locs, wq] = await Promise.all([apiService.getLocations(), apiService.getWaterQuality()]);
      setLocations(locs);
      setWaterQuality(wq);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load live report records.', 'அறிக்கைத் தரவை ஏற்ற முடியவில்லை.'));
    }
  };

  useEffect(() => {
    loadDossierData();
  }, []);

  const filteredStations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportCSV = () => {
    const headers = 'Location ID,Station Name,District,Basin Zone,Risk Score,Confidence Level,TDS mg/L,Chromium mg/L\n';
    const rows = filteredStations
      .map((l) => {
        const wq = waterQuality.find((w) => w.location_id === l.id);
        return `${l.id},"${l.name}","${l.district}","${l.basin_zone}",${l.risk_score},"${l.confidence_level}",${wq?.tds_mg_l ?? ''},${wq?.chromium_mg_l ?? ''}`;
      })
      .join('\n');
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(headers + rows);

    const a = document.createElement('a');
    a.setAttribute('href', csvContent);
    a.setAttribute('download', `PALAR_GUARD_AI_Dossier_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    a.remove();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Reports & Dossiers Workspace: Ivory, Charcoal & Muted Champagne Gold */}
      <div className="rounded-2xl bg-[#151817]/95 border border-[#d9c27a]/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-[#d9c27a]">
              <FileText className="w-3.5 h-3.5" />
              {L('EDITORIAL DOSSIER WORKSPACE', 'ஆவண & அறிக்கை நூலகம்')}
            </span>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#fcfbf7] tracking-wide">
            {L('Reports & Environmental Dossiers', 'சுற்றுச்சூழல் அறிக்கைகள் & தொகுப்புகள்')}
          </h2>
          <p className="text-xs text-stone-300">
            {L(
              'Search station audits, export live CSV tables, and print institutional hydrological briefs.',
              'நிலையத் தணிக்கைகளைத் தேடி CSV கோப்புகளாகவும் அச்சு அறிக்கைகளாகவும் பதிவிறக்கவும்.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#1e2320] hover:bg-[#272d29] text-[#d9c27a] border border-[#d9c27a]/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{L('Export Live CSV', 'CSV பதிவிறக்கு')}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#d9c27a] hover:bg-[#e5d292] text-[#111513] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{L('Print Dossier', 'அறிக்கை அச்சிடு')}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {errorMsg}
          </span>
          <button type="button" onClick={loadDossierData} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{L('Live CSV dataset downloaded successfully.', 'நேரடி CSV தரவுத்தொகுப்பு பதிவிறக்கப்பட்டது.')}</span>
        </div>
      )}

      {/* Printable Warm Ivory Dossier Sheet */}
      <div className="p-6 sm:p-8 bg-[#f7f4eb] text-[#141917] border border-[#d8d0ba] rounded-2xl space-y-6 shadow-md">
        <div className="border-b border-[#ded7c3] pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-mono text-[#8b6f26] uppercase tracking-[0.2em] font-bold">
              {L('EXECUTIVE ENVIRONMENTAL INTELLIGENCE DOSSIER', 'நிர்வாக சுற்றுச்சூழல் நுண்ணறிவு அறிக்கை')}
            </div>
            <h1 className="text-2xl font-serif font-bold text-[#111815] mt-1">
              {L('Palar River Basin Hydrological Audit', 'பாலாறு வடிநில நீரியல் தணிக்கை அறிக்கை')}
            </h1>
            <p className="text-xs text-[#54615a] mt-1 font-mono">
              {L('Tamil Nadu, India', 'தமிழ்நாடு, இந்தியா')} · {new Date().toLocaleDateString()} · PG-2026-AUDIT
            </p>
          </div>
          <div className="relative w-full sm:w-64 print:hidden">
            <Search className="w-3.5 h-3.5 text-[#66736c] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={L('Filter station or district…', 'நிலையம் அல்லது மாவட்டம்…')}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white border border-[#cfc6ad] text-xs text-[#111815] placeholder:text-[#7c8982] focus:outline-none focus:border-[#9e7f32]"
            />
          </div>
        </div>

        <div className="space-y-2 text-xs leading-relaxed text-[#2c3832]">
          <h3 className="text-sm font-bold text-[#111815]">
            {L('1. Catchment Summary & Verification Principle', '1. வடிநிலச் சுருக்கம் & சரிபார்ப்பு நெறிமுறை')}
          </h3>
          <p>
            {L(
              'Across the 17,810 km² Palar catchment, upper industrial reaches (Ambur, Vaniyambadi, Ranipet) exhibit distinct salinity and chromium screening profiles compared to downstream agrarian tank cascades (Walajapet, Kanchipuram). All statistical anomalies trigger field verification workflows rather than automated regulatory rulings.',
              '17,810 ச.கி.மீ பாலாறு வடிநிலத்தில் மேல் பகுதி தொழிற்பேட்டை மையங்களும் கீழ் பகுதி வேளாண் ஏரித் தொடர்களும் வேறுபட்ட நீர் தரப் பண்புகளைக் கொண்டுள்ளன. புள்ளிவிவர மாறுபாடுகள் அனைத்தும் கள ஆய்வுக்கு மட்டுமே அனுப்பப்படுகின்றன.'
            )}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#dcd4be]">
            <thead>
              <tr className="bg-[#ece6d4] border-b border-[#d6ceb6] font-mono text-[11px] text-[#3c4842]">
                <th className="p-2.5">{L('Station', 'நிலையம்')}</th>
                <th className="p-2.5">{L('Zone', 'மண்டலம்')}</th>
                <th className="p-2.5 text-right">{L('Risk (0-100)', 'இடர்')}</th>
                <th className="p-2.5 text-right">TDS (mg/L)</th>
                <th className="p-2.5 text-right">{L('Chromium', 'குரோமியம்')}</th>
                <th className="p-2.5 text-center">{L('Confidence', 'நம்பகத்தன்மை')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5decb] font-mono text-[11px]">
              {filteredStations.map((loc) => {
                const wq = waterQuality.find((w) => w.location_id === loc.id);
                return (
                  <tr key={loc.id} className="hover:bg-[#f0ebd9]">
                    <td className="p-2.5 font-sans font-semibold text-[#111815]">{loc.name}</td>
                    <td className="p-2.5 text-[#4e5b54]">{loc.basin_zone}</td>
                    <td className="p-2.5 text-right font-bold text-[#9a6318] tabular-nums">{loc.risk_score}</td>
                    <td className="p-2.5 text-right tabular-nums">{wq?.tds_mg_l ?? '—'}</td>
                    <td className={`p-2.5 text-right tabular-nums ${(wq?.chromium_mg_l ?? 0) > 0.05 ? 'text-rose-700 font-bold' : 'text-teal-800'}`}>
                      {wq?.chromium_mg_l ?? '—'}
                    </td>
                    <td className="p-2.5 text-center text-[#36443d]">{loc.confidence_level}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
