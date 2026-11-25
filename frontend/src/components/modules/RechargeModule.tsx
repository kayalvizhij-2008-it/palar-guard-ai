import React, { useEffect, useState } from 'react';
import { DataBadge } from '../common/DataBadge';
import { apiService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { RechargeItem } from '../../types';
import { Reveal } from '../motion/motion';
import { Layers, Info, RefreshCw, AlertCircle } from 'lucide-react';

export const RechargeModule: React.FC = () => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [items, setItems] = useState<RechargeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadRecharge = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiService.getRechargeAssessments();
      setItems(data);
    } catch (err: any) {
      setErrorMsg(err?.message || L('Unable to load recharge suitability data.', 'நீர் செறிவூட்டல் தரவை ஏற்ற முடியவில்லை.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecharge();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-[#071821] to-[#082221] border border-cyan-500/25 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest text-cyan-300">
              <Layers className="w-3.5 h-3.5" />
              {L('MANAGED AQUIFER RECHARGE SCREENING', 'நிலத்தடி நீர் செறிவூட்டல் ஆய்வு')}
            </span>
            <DataBadge provenance="VERIFIED_PUBLIC" />
          </div>
          <h2 className="text-xl font-bold text-[#fcfbf7] tracking-tight">
            {L('Recharge Intervention Intelligence', 'நீர் செறிவூட்டல் திட்டமிடல் நுண்ணறிவு')}
          </h2>
          <p className="text-xs text-slate-300">
            {L(
              'Hydrogeological screening evaluating infiltration capacity, alluvium thickness, and terrain slope for targeted replenishment.',
              'மணல் படுகை தடிமன், சரிவு மற்றும் ஊடுருவல் திறன் அடிப்படையில் தடுப்பணை மற்றும் ஏரிப் புனரமைப்பு ஆய்வு.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={loadRecharge}
          className="px-3 py-1.5 bg-cyan-950/80 border border-cyan-500/35 text-cyan-200 rounded-xl text-xs font-mono inline-flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{items.length} {L('Zones', 'பகுதிகள்')}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            {errorMsg}
          </span>
          <button type="button" onClick={loadRecharge} className="px-3 py-1 rounded bg-rose-600 text-white font-semibold">
            {L('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      <div className="p-4 bg-[#071a20] rounded-xl border border-cyan-500/25 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-cyan-300">{L('Engineering Screening Notice: ', 'பொறியியல் ஆய்வு அறிவிப்பு: ')}</span>
          {L(
            'Suitability scores represent regional screening based on slope and permeability; they do not substitute for site geotechnical bore logging.',
            'தகுதி மதிப்பெண்கள் ஆரம்ப நிலை ஆய்வு மட்டுமே; கட்டுமானத்திற்கு முன் நேரடி மண் மற்றும் நிலத்தடி ஆய்வு அவசியம்.'
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <Reveal key={item.id} kind="fall" delay={idx * 0.06}>
            <div className="p-5 rounded-2xl bg-[#071820]/95 border border-cyan-500/20 hover:border-cyan-400/45 transition-colors space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#fcfbf7]">{item.location_name}</h3>
                  <span className="text-xs text-cyan-300 font-mono">{item.status}</span>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">{L('Suitability Score', 'தகுதி மதிப்பெண்')}</div>
                  <div className="text-xl font-bold font-mono text-emerald-300 tabular-nums">
                    {item.score} / 100
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 bg-[#041016] rounded-xl border border-white/[0.06] text-xs font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">{L('Soil Type', 'மண் வகை')}</div>
                  <div className="text-slate-100 truncate">{item.soil}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">{L('Slope', 'சரிவு')}</div>
                  <div className="text-slate-100 tabular-nums">{item.slope}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">{L('Vadose Space', 'சேமிப்பு ஆழம்')}</div>
                  <div className="text-slate-100 tabular-nums">{item.head_m} m</div>
                </div>
              </div>

              <div className="p-3 bg-cyan-950/40 rounded-xl border border-cyan-500/20 space-y-1">
                <div className="text-[10px] text-cyan-300 font-mono font-bold uppercase">
                  {L('Recommended Structure', 'பரிந்துரைக்கப்படும் அமைப்பு')}
                </div>
                <div className="text-xs text-[#fcfbf7] font-medium">{item.recommended}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
};
