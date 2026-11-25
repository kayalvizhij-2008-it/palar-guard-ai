import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { LocationData, WaterQualityPoint } from '../../types';
import { FlipCard, Reveal } from '../motion/motion';
import { FlaskConical, Info, RefreshCw, AlertCircle } from 'lucide-react';

export const WaterQualityModule: React.FC = () => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [stations, setStations] = useState<WaterQualityPoint[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadQuality = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const [wq, locs] = await Promise.all([apiService.getWaterQuality(), apiService.getLocations()]);
      setStations(wq);
      setLocations(locs);
      if (wq.length && !wq.some((s) => s.location_id === selectedStationId)) {
        setSelectedStationId(wq[0].location_id);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load water quality records.', 'நீர் தரப் பதிவுகளை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuality();
  }, []);

  const selectedStation = useMemo(
    () => stations.find((s) => s.location_id === selectedStationId) || stations[0] || null,
    [stations, selectedStationId]
  );

  const locName = (id: number) =>
    locations.find((l) => l.id === id)?.name || `${L('Station', 'நிலையம்')} #${id}`;

  const paramCards = selectedStation
    ? [
        {
          id: 'ph',
          title: L('pH Value', 'pH அளவு'),
          val: String(selectedStation.ph),
          unit: 'pH',
          limit: L('BIS: 6.5 – 8.5', 'BIS: 6.5 – 8.5'),
          exceeds: selectedStation.ph < 6.5 || selectedStation.ph > 8.5,
          note: L('Acidity/alkalinity balance affecting aquatic corrosion.', 'நீரின் அமில-கார சமநிலை அளவீடு.'),
        },
        {
          id: 'tds',
          title: L('Total Dissolved Solids', 'மொத்தக் கரைந்த திடப்பொருள் (TDS)'),
          val: String(selectedStation.tds_mg_l),
          unit: 'mg/L',
          limit: L('BIS Acceptable: <500', 'BIS வரம்பு: <500'),
          exceeds: selectedStation.tds_mg_l > 1500,
          note: L('High dissolved salts restrict irrigation and untreated domestic use.', 'அதிக உப்புத்தன்மை விவசாயம் மற்றும் குடிநீருக்கு சவாலானது.'),
        },
        {
          id: 'ec',
          title: L('Electrical Conductivity', 'மின் கடத்துத்திறன் (EC)'),
          val: String(selectedStation.ec_us_cm),
          unit: 'µS/cm',
          limit: L('CPCB Baseline: <1500', 'CPCB வரம்பு: <1500'),
          exceeds: selectedStation.ec_us_cm > 2500,
          note: L('Ionic concentration proxy across tannery-adjacent drains.', 'நீரில் உள்ள அயனிச் செறிவைக் குறிக்கும் அளவீடு.'),
        },
        {
          id: 'cr',
          title: L('Total Chromium', 'மொத்த குரோமியம்'),
          val: String(selectedStation.chromium_mg_l),
          unit: 'mg/L',
          limit: L('BIS Limit: <0.05', 'BIS வரம்பு: <0.05'),
          exceeds: selectedStation.chromium_mg_l > 0.05,
          note: L('Requires duplicate TNPCB laboratory assay before regulatory attribution.', 'அதிகாரப்பூர்வ முடிவுக்கு இரட்டை ஆய்வக சோதனை தேவை.'),
        },
        {
          id: 'bod',
          title: L('Biochemical Oxygen Demand', 'உயிர்வேதியியல் ஆக்ஸிஜன் தேவை (BOD)'),
          val: String(selectedStation.bod_mg_l),
          unit: 'mg/L',
          limit: L('CPCB Limit: <3.0', 'CPCB வரம்பு: <3.0'),
          exceeds: selectedStation.bod_mg_l > 3.0,
          note: L('Measures biodegradable organic load depleting river oxygen.', 'கரிமக் கழிவுகளால் ஏற்படும் ஆக்ஸிஜன் குறைப்பை அளவிடுகிறது.'),
        },
        {
          id: 'do',
          title: L('Dissolved Oxygen', 'கரைந்த ஆக்ஸிஜன் (DO)'),
          val: String(selectedStation.do_mg_l),
          unit: 'mg/L',
          limit: L('CPCB Min: >5.0', 'CPCB குறைந்தபட்சம்: >5.0'),
          exceeds: selectedStation.do_mg_l < 5.0,
          note: L('Essential indicator for healthy aquatic ecology.', 'நீர்வாழ் உயிரினங்களின் நலத்திற்கான முக்கிய அளவீடு.'),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Crisp Warm Ivory Laboratory Header (breaks away from uniform dark-green panels) */}
      <div className="rounded-2xl bg-[#f5f2ea] text-[#111815] border border-[#d6d0c0] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-teal-800 font-semibold">
              <FlaskConical className="w-3.5 h-3.5" />
              {L('WATER QUALITY LABORATORY BENCHMARK', 'நீர் தர ஆய்வகப் பகுப்பாய்வு')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0f1c17] tracking-tight">
            {L('Hydrochemical Parameter Explorer', 'நீர் வேதியியல் அளவுரு ஆய்வகம்')}
          </h2>
          <p className="text-xs text-[#43524b]">
            {L(
              'Station-by-station hydrochemical parameters compared against BIS 10500 and CPCB surface limits.',
              'BIS 10500 மற்றும் CPCB தரநிலைகளுடன் நிலைய வாரியான நீர் தர ஒப்பீடு.'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="wq-station" className="text-xs font-mono text-[#43524b]">
            {L('Station:', 'நிலையம்:')}
          </label>
          <select
            id="wq-station"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-white border border-[#c7c0ae] text-xs font-semibold text-[#111815] focus:outline-none focus:border-teal-600"
          >
            {stations.map((st) => (
              <option key={st.location_id} value={st.location_id}>
                {locName(st.location_id)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={loadQuality}
            aria-label={L('Reload water quality data', 'நீர் தரத் தரவைப் புதுப்பி')}
            className="p-2 rounded-lg bg-white border border-[#c7c0ae] text-teal-800 hover:bg-teal-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {errorMsg}
          </span>
          <button type="button" onClick={loadQuality} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {/* Ivory Lab Assay Parameter Flip Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {paramCards.map((p, idx) => (
          <Reveal key={p.id} kind="fall" delay={idx * 0.04}>
            <FlipCard
              className="h-36"
              label={`${p.title} — ${L('flip for laboratory standard context', 'விவரங்களுக்குத் திருப்பவும்')}`}
              frontClassName={`border ${p.exceeds ? 'border-rose-300 bg-[#fff8f7]' : 'border-[#dbd5c5] bg-[#faf8f2]'} text-[#111815]`}
              backClassName="border-teal-700 bg-[#0d2626] text-[#fcfbf7]"
              front={
                <div className="h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-semibold text-[#475850] truncate">{p.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                        p.exceeds ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {p.exceeds ? L('Above Benchmark', 'வரம்புக்கு மேல்') : L('Within Range', 'வரம்பிற்குள்')}
                    </span>
                  </div>
                  <div className={`text-2xl font-bold font-mono tabular-nums ${p.exceeds ? 'text-rose-700' : 'text-[#0f1c17]'}`}>
                    {p.val} <span className="text-xs font-normal text-[#56675f]">{p.unit}</span>
                  </div>
                  <div className="text-[11px] font-mono text-teal-800">{p.limit}</div>
                </div>
              }
              back={
                <div className="h-full flex flex-col justify-between">
                  <div className="text-[10px] font-mono uppercase text-cyan-300">{p.title}</div>
                  <p className="text-xs leading-relaxed text-slate-100">{p.note}</p>
                  <div className="text-[10px] font-mono text-slate-300">{p.limit}</div>
                </div>
              }
            />
          </Reveal>
        ))}
      </div>

      {/* Comparative Water Quality Lab Ledger (Warm Ivory Surface) */}
      <div className="rounded-2xl bg-[#faf8f2] text-[#111815] border border-[#d6d0c0] p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e4dfd0] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#0f1c17]">
              {L('Comparative Water Quality Matrix (Palar Basin)', 'ஒப்பீட்டு நீர் தரப் பட்டியல் (பாலாறு வடிநிலம்)')}
            </h3>
            <p className="text-[11px] text-[#4d5d55]">
              {L('Reference: CPCB Polluted Stretches & TNPCB Observations', 'ஆதாரம்: CPCB & தமிழ்நாடு மாசுக் கட்டுப்பாட்டு வாரியம்')}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[#4d5d55] border-b border-[#e4dfd0] text-[11px] font-mono">
                <th className="py-2.5 font-semibold">{L('Station Location', 'நிலையம்')}</th>
                <th className="py-2.5 font-semibold text-right">pH</th>
                <th className="py-2.5 font-semibold text-right">TDS (mg/L)</th>
                <th className="py-2.5 font-semibold text-right">EC (µS/cm)</th>
                <th className="py-2.5 font-semibold text-right">{L('Chromium', 'குரோமியம்')}</th>
                <th className="py-2.5 font-semibold text-right">BOD (mg/L)</th>
                <th className="py-2.5 font-semibold text-center">{L('Status', 'நிலை')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebe6d9]">
              {stations.map((station) => {
                const isElevated = station.tds_mg_l > 1500 || station.chromium_mg_l > 0.05;
                return (
                  <tr
                    key={station.location_id}
                    onClick={() => setSelectedStationId(station.location_id)}
                    className={`cursor-pointer transition-colors ${
                      station.location_id === selectedStationId ? 'bg-teal-50/90' : 'hover:bg-[#f2efe5]'
                    }`}
                  >
                    <td className="py-3 font-semibold text-[#0f1c17]">{locName(station.location_id)}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{station.ph}</td>
                    <td className={`py-3 text-right font-mono tabular-nums ${station.tds_mg_l > 1500 ? 'text-rose-700 font-bold' : ''}`}>
                      {station.tds_mg_l}
                    </td>
                    <td className={`py-3 text-right font-mono tabular-nums ${station.ec_us_cm > 2500 ? 'text-rose-700 font-bold' : ''}`}>
                      {station.ec_us_cm}
                    </td>
                    <td className={`py-3 text-right font-mono tabular-nums ${station.chromium_mg_l > 0.05 ? 'text-rose-700 font-bold' : 'text-teal-800'}`}>
                      {station.chromium_mg_l}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums">{station.bod_mg_l}</td>
                    <td className="py-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                          isElevated ? 'bg-rose-100 text-rose-700' : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {isElevated ? L('Elevated', 'அதிகம்') : L('Baseline', 'இயல்பு')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#efeadd] rounded-lg border border-[#dbd5c5] text-[11px] text-[#35453d] leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-teal-800 shrink-0 mt-0.5" />
          <span>
            <strong>{L('Scientific Integrity Guidance: ', 'அறிவியல் வழிகாட்டுதல்: ')}</strong>
            {L(
              'BIS 10500 drinking thresholds are benchmark comparisons; Chromium above 0.05 mg/L indicates industrial discharge risk requiring duplicate on-site laboratory testing.',
              'BIS 10500 வரம்புகள் ஒப்பீட்டிற்காக மட்டுமே; 0.05 mg/L-க்கு மேல் குரோமியம் இருந்தால் நேரடி ஆய்வகப் பரிசோதனை அவசியம்.'
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
