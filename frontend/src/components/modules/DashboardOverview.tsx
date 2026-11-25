import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TopKPICardsRow } from '../dashboard/TopKPICardsRow';
import { CentralBasinSatelliteMap } from '../dashboard/CentralBasinSatelliteMap';
import { WaterAnalyticsChart } from '../dashboard/WaterAnalyticsChart';
import { PriorityAlertsCard } from '../dashboard/PriorityAlertsCard';
import { GlobeMiniView } from '../dashboard/GlobeMiniView';
import { BasinTerrain3DBlock } from '../dashboard/BasinTerrain3DBlock';
import { Reveal } from '../motion/motion';
import { VoiceAssistantMini } from '../dashboard/VoiceAssistantMini';
import { CommunityFeedbackCard } from '../dashboard/CommunityFeedbackCard';
import { apiService } from '../../services/api';
import { LocationData, WaterQualityPoint } from '../../types';
import { ChevronDown, ChevronUp, FileSearch, Bell, ArrowRight, RefreshCw } from 'lucide-react';

interface DashboardOverviewProps {
  onSelectModule: (moduleId: string) => void;
  onSelectLocation?: (locId: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSelectModule,
  onSelectLocation,
}) => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const [showTechnicalTable, setShowTechnicalTable] = useState(false);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [waterQuality, setWaterQuality] = useState<WaterQualityPoint[]>([]);
  const [tableError, setTableError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadMatrix = async () => {
    setTableError(null);
    try {
      const [locs, wq] = await Promise.all([
        apiService.getLocations(),
        apiService.getWaterQuality(),
      ]);
      setLocations(locs);
      setWaterQuality(wq);
    } catch (err: any) {
      setTableError(err?.message || L('Unable to load station matrix.', 'நிலையப் பட்டியலை ஏற்ற முடியவில்லை.'));
    }
  };

  useEffect(() => {
    loadMatrix();
  }, [refreshTick]);

  return (
    <div className="space-y-4 pb-8">
      {/* Operations Centre Header */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#061e12] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-[#d9c27a]">
            {L('ENVIRONMENTAL OPERATIONS CENTRE', 'சுற்றுச்சூழல் செயல்பாட்டு மையம்')}
          </div>
          <h1 className="text-lg font-semibold text-[#fcfbf7]">
            {L('Palar River Basin Monitoring Overview', 'பாலாறு வடிநிலக் கண்காணிப்பு சுருக்கம்')}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setRefreshTick((k) => k + 1)}
            className="px-3 py-2 rounded-xl bg-[#05140d] hover:bg-white/5 border border-white/10 text-xs font-medium text-emerald-300 inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{L('Sync Live Data', 'தரவைப் புதுப்பி')}</span>
          </button>
          <button
            type="button"
            onClick={() => onSelectModule('documents')}
            className="px-3.5 py-2 rounded-xl bg-[#161326] hover:bg-[#1f1a36] border border-violet-500/35 text-xs font-medium text-violet-200 inline-flex items-center gap-1.5"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>{L('Document Intelligence', 'ஆவண நுண்ணறிவு')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSelectModule('monitoring')}
            className="px-3.5 py-2 rounded-xl bg-[#05140d] hover:bg-white/5 border border-white/10 text-xs font-medium text-[#fcfbf7] inline-flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5 text-[#d9c27a]" />
            <span>{L('Watchlist', 'கண்காணிப்புப் பட்டியல்')}</span>
          </button>
        </div>
      </div>

      {/* Top Live KPI Row */}
      <TopKPICardsRow refreshTrigger={refreshTick} onSelectCard={(cardId) => onSelectModule(cardId)} />

      {/* Main Split: Satellite Map + Analytics & Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7">
          <CentralBasinSatelliteMap
            onSelectStation={(stationId) => {
              onSelectLocation?.(stationId);
              onSelectModule('groundwater');
            }}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex-1">
            <WaterAnalyticsChart />
          </div>
          <div className="flex-1">
            <PriorityAlertsCard
              onViewAll={() => onSelectModule('anomalies')}
              onSelectAlert={() => onSelectModule('anomalies')}
            />
          </div>
        </div>
      </div>

      {/* Bottom Quick-Launch Row (staggered falling reveal) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Reveal kind="fall" delay={0}>
          <GlobeMiniView onOpenGlobe={() => onSelectModule('digital_twin')} />
        </Reveal>
        <Reveal kind="fall" delay={0.07}>
          <BasinTerrain3DBlock onOpen3D={() => onSelectModule('digital_twin')} />
        </Reveal>
        <Reveal kind="fall" delay={0.14}>
          <VoiceAssistantMini onOpenFullAssistant={() => onSelectModule('assistant')} />
        </Reveal>
        <Reveal kind="fall" delay={0.21}>
          <CommunityFeedbackCard onOpenReportModal={() => onSelectModule('community')} />
        </Reveal>
      </div>

      {/* Collapsible Verified Station Matrix */}
      <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4">
        <button
          type="button"
          onClick={() => setShowTechnicalTable(!showTechnicalTable)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white">
              {L('Baseline Monitoring Station Matrix', 'அடிப்படைக் கண்காணிப்பு நிலையப் பட்டியல்')}
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs text-stone-400">
            <span>{showTechnicalTable ? L('Collapse', 'சுருக்கு') : L('Expand', 'விரி')}</span>
            {showTechnicalTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {showTechnicalTable && (
          <div className="mt-3 overflow-x-auto pt-3 border-t border-white/[0.06]">
            {tableError ? (
              <div className="text-xs text-rose-300">{tableError}</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-400 border-b border-white/[0.06] text-[11px] font-mono">
                    <th className="py-2">{L('Station', 'நிலையம்')}</th>
                    <th className="py-2">{L('District', 'மாவட்டம்')}</th>
                    <th className="py-2 text-right">TDS (mg/L)</th>
                    <th className="py-2 text-right">{L('Chromium (mg/L)', 'குரோமியம்')}</th>
                    <th className="py-2 text-right">{L('Risk Score', 'இடர் மதிப்பெண்')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {locations.map((loc) => {
                    const wq = waterQuality.find((w) => w.location_id === loc.id);
                    return (
                      <tr key={loc.id} className="hover:bg-white/[0.02]">
                        <td className="py-2.5 font-semibold text-white">{loc.name}</td>
                        <td className="py-2.5 text-stone-300">{loc.district}</td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-white">{wq?.tds_mg_l ?? '—'}</td>
                        <td className={`py-2.5 text-right font-mono tabular-nums ${(wq?.chromium_mg_l ?? 0) > 0.05 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}`}>
                          {wq?.chromium_mg_l ?? '—'}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-amber-300">
                          {loc.risk_score} / 100
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
