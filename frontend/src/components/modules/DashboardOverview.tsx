import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TopKPICardsRow } from '../dashboard/TopKPICardsRow';
import { CentralBasinSatelliteMap } from '../dashboard/CentralBasinSatelliteMap';
import { WaterAnalyticsChart } from '../dashboard/WaterAnalyticsChart';
import { PriorityAlertsCard } from '../dashboard/PriorityAlertsCard';
import { GlobeMiniView } from '../dashboard/GlobeMiniView';
import { BasinTerrain3DBlock } from '../dashboard/BasinTerrain3DBlock';
import { VoiceAssistantMini } from '../dashboard/VoiceAssistantMini';
import { CommunityFeedbackCard } from '../dashboard/CommunityFeedbackCard';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS, GROUNDWATER_TIMESERIES } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { ArrowUpRight, Droplets, ChevronDown, ChevronUp } from 'lucide-react';

interface DashboardOverviewProps {
  onSelectModule: (moduleId: string) => void;
  onSelectLocation?: (locId: number) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  onSelectModule, 
  onSelectLocation 
}) => {
  const { t, lang, mode } = useLanguage();
  const [showTechnicalTable, setShowTechnicalTable] = useState(false);

  return (
    <div className="space-y-4 pb-8 select-none">
      
      {/* 1. Top 5 KPI Metric Cards Row matching reference blueprint */}
      <TopKPICardsRow
        onRefreshData={() => {}}
        onSelectCard={(cardId) => onSelectModule(cardId)}
      />

      {/* 2. Middle Grid: Central Satellite Map (Left) + Environmental Analytics & Priority Alerts (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (Approx 58% on Desktop): Central Satellite GIS Map */}
        <div className="lg:col-span-7 xl:col-span-7">
          <CentralBasinSatelliteMap
            onSelectStation={(stationId) => {
              onSelectLocation?.(stationId);
              onSelectModule('groundwater');
            }}
          />
        </div>

        {/* Right Column (Approx 42% on Desktop): Chart + Alerts */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-4">
          {/* Top-Right: Water Status Summary Chart */}
          <div className="flex-1">
            <WaterAnalyticsChart />
          </div>

          {/* Middle-Right: Priority Alerts */}
          <div className="flex-1">
            <PriorityAlertsCard
              onViewAll={() => onSelectModule('anomalies')}
              onSelectAlert={(alertId) => onSelectModule('anomalies')}
            />
          </div>
        </div>

      </div>

      {/* 3. Bottom Row: 4 Dedicated Interactive Blocks matching reference blueprint */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Block 1: Palar on the Global Map (3D Earth WebGL) */}
        <GlobeMiniView onOpenGlobe={() => onSelectModule('digital_twin')} />

        {/* Block 2: 3D Basin Catchment Block (3D Terrain WebGL) */}
        <BasinTerrain3DBlock onOpen3D={() => onSelectModule('digital_twin')} />

        {/* Block 3: AI Voice Assistant (Tamil Speech STT & TTS) */}
        <VoiceAssistantMini onOpenFullAssistant={() => onSelectModule('assistant')} />

        {/* Block 4: Community Feedback / Action */}
        <CommunityFeedbackCard onOpenReportModal={() => onSelectModule('community')} />
      </div>

      {/* 4. Expert Mode Technical Breakdown Drawer (Available when Expert Mode is active or toggled) */}
      {mode === 'expert' && (
        <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-4 shadow-xl">
          <div 
            onClick={() => setShowTechnicalTable(!showTechnicalTable)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white tracking-wide">
                {lang === 'ta' ? 'அறிவியல் கண்காணிப்பு நிலையங்கள் - முழு புள்ளிவிவரங்கள்' : 'Scientific Baseline Telemetry Stations - Complete Data Matrix'}
              </h3>
              <DataBadge provenance="VERIFIED_PUBLIC" />
            </div>
            <div className="flex items-center gap-1 text-xs text-stone-400 group-hover:text-emerald-400 transition-colors">
              <span>{showTechnicalTable ? (lang === 'ta' ? 'மறைக்க' : 'Collapse') : (lang === 'ta' ? 'காட்டுக' : 'Expand')}</span>
              {showTechnicalTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>

          {showTechnicalTable && (
            <div className="mt-3 overflow-x-auto pt-2 border-t border-white/[0.06] animate-in fade-in">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-400 border-b border-white/[0.06] text-[11px] font-mono">
                    <th className="py-2 font-medium">{lang === 'ta' ? 'நிலையம்' : 'Station'}</th>
                    <th className="py-2 font-medium">{lang === 'ta' ? 'மாவட்டம்' : 'District'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'நிலத்தடி நீர் (mbgl)' : 'GW Depth (mbgl)'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'TDS (mg/L)' : 'TDS (mg/L)'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'குரோமியம் Cr⁶⁺ (ppm)' : 'Chromium (ppm)'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'ஆபத்து குறியீடு' : 'Risk Score'}</th>
                    <th className="py-2 font-medium text-right">{lang === 'ta' ? 'நடவடிக்கை' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {PALAR_LOCATIONS.map((loc) => {
                    const wq = WATER_QUALITY_STATIONS.find(w => w.location_id === loc.id);
                    const gw = GROUNDWATER_TIMESERIES[loc.id];
                    const depth = gw ? gw[gw.length - 1]?.depth_mbgl : 13.5;
                    const tds = wq?.tds_mg_l ?? 750;
                    const chromium = wq?.chromium_mg_l ?? 0.02;

                    return (
                      <tr key={loc.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 font-bold text-white">{loc.name}</td>
                        <td className="py-2.5 text-stone-300">{loc.district}</td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-white">{depth}</td>
                        <td className="py-2.5 text-right font-mono tabular-nums text-white">{tds}</td>
                        <td className={`py-2.5 text-right font-mono tabular-nums ${chromium > 0.05 ? 'text-red-400 font-bold' : 'text-emerald-400'}`}>
                          {chromium}
                        </td>
                        <td className="py-2.5 text-right font-mono tabular-nums">
                          <span className={loc.risk_score > 70 ? 'text-red-400 font-bold' : 'text-amber-400 font-medium'}>
                            {loc.risk_score} / 100
                          </span>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => onSelectModule('groundwater')}
                            className="px-2.5 py-1 bg-white/5 hover:bg-emerald-600/30 text-stone-200 hover:text-emerald-200 rounded text-[11px] font-medium transition-colors"
                          >
                            {lang === 'ta' ? 'வரைபடம்' : 'Hydrograph'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
