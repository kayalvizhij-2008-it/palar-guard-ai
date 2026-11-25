import React, { useState } from 'react';
import { DataBadge } from '../common/DataBadge';
import { BasinHero3D } from '../hero/BasinHero3D';
import { BasinMap } from '../maps/BasinMap';
import { Compass, Box, Map as MapIcon } from 'lucide-react';

interface DigitalTwinMapProps {
  onSelectLocation?: (locId: number) => void;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({ onSelectLocation }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');

  return (
    <div className="flex flex-col h-full bg-[#071912] rounded-xl border border-white/[0.08] overflow-hidden shadow-forest-md">
      {/* Map Control Bar */}
      <div className="p-4 bg-[#0a2319] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-emerald-400" />
          <div>
            <h3 className="text-sm font-bold text-ivory flex items-center gap-2">
              Palar Basin Geospatial Digital Twin
              <DataBadge provenance="VERIFIED_PUBLIC" />
            </h3>
            <p className="text-[11px] text-stone-300">Palar Catchment (17,810 km²) • Upper Basin to Bay of Bengal Estuary</p>
          </div>
        </div>

        {/* View Mode Toggle (2D GIS vs 3D Digital Twin) */}
        <div className="flex items-center gap-1 bg-[#05140d] p-1 rounded-lg border border-emerald-500/30">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === '2d' ? 'bg-emerald-600 text-ivory shadow-forest-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>2D GIS Map</span>
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium flex items-center gap-1.5 transition-colors ${
              viewMode === '3d' ? 'bg-emerald-600 text-ivory shadow-forest-sm' : 'text-stone-300 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D WebGL Twin</span>
          </button>
        </div>
      </div>

      {/* Main Display: 2D GIS Basin Map or 3D WebGL Twin */}
      {viewMode === '2d' ? (
        <div className="relative w-full p-3 bg-[#030d08]">
          <BasinMap onSelectStation={onSelectLocation} heightClass="h-[620px]" />
        </div>
      ) : (
        <div className="relative flex-1 min-h-[520px] w-full p-4 flex flex-col items-center justify-center bg-[#04120c]">
          <div className="w-full max-w-4xl">
            <BasinHero3D />
          </div>
        </div>
      )}
    </div>
  );
};
