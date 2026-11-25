import React, { useState } from 'react';
import { BasinHero3D } from '../hero/BasinHero3D';
import { BasinMap } from '../maps/BasinMap';
import { useLanguage } from '../../context/LanguageContext';
import { Compass, Box, Map as MapIcon } from 'lucide-react';

interface DigitalTwinMapProps {
  onSelectLocation?: (locId: number) => void;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({ onSelectLocation }) => {
  const { lang } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  return (
    <div className="flex flex-col h-full bg-[#061214]/95 rounded-2xl border border-teal-500/20 overflow-hidden shadow-forest-md">
      {/* Map-First Top Bar */}
      <div className="p-4 bg-[#07191c] border-b border-teal-500/20 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-950 border border-teal-500/35 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#fcfbf7]">
              {L('Basin Explorer — Geospatial Intelligence', 'வடிநில ஆய்வு — புவிசார் நுண்ணறிவு')}
            </h2>
            <p className="text-[11px] text-slate-300">
              {L(
                'Palar Catchment (17,810 km²) · Verified station coordinates, layer visibility & regional search',
                'பாலாறு வடிநிலம் (17,810 ச.கி.மீ) · சரிபார்க்கப்பட்ட நிலையங்கள், அடுக்கு கட்டுப்பாடு & தேடல்'
              )}
            </p>
          </div>
        </div>

        {/* View Mode Toggle (2D GIS vs 3D Digital Twin) */}
        <div className="flex items-center gap-1 bg-[#040d0f] p-1 rounded-xl border border-teal-500/30">
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === '2d' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>{L('2D GIS Explorer', '2D GIS வரைபடம்')}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === '3d' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{L('3D Terrain Relief', '3D நிலப்பரப்பு')}</span>
          </button>
        </div>
      </div>

      {/* Main Map-First Canvas */}
      {viewMode === '2d' ? (
        <div className="relative w-full p-3 bg-[#030b0d]">
          <BasinMap onSelectStation={onSelectLocation} heightClass="h-[640px]" />
        </div>
      ) : (
        <div className="relative flex-1 min-h-[540px] w-full p-4 flex flex-col items-center justify-center bg-[#041013]">
          <div className="w-full max-w-4xl">
            <BasinHero3D />
          </div>
        </div>
      )}
    </div>
  );
};
