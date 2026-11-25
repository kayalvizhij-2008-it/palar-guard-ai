import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS, ANOMALIES_DATA } from '../../data/palarData';
import { LocationData } from '../../types';
import { DataBadge } from '../common/DataBadge';
import { BasinHero3D } from '../hero/BasinHero3D';
import { 
  Layers, Compass, AlertCircle, Box, Map as MapIcon, 
  X, Droplets, Activity, ShieldCheck, ArrowRight, Info, CheckCircle2 
} from 'lucide-react';

const riverPathCoords: [number, number][] = [
  [12.6825, 78.6186], // Vaniyambadi
  [12.7904, 78.7166], // Ambur
  [12.9165, 79.1325], // Vellore
  [12.9274, 79.3330], // Ranipet
  [12.9304, 79.3817], // Walajapet
  [12.8342, 79.7036], // Kanchipuram
  [12.6841, 79.9836], // Palar Estuary near Chengalpattu
];

interface DigitalTwinMapProps {
  onSelectLocation?: (locId: number) => void;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({ onSelectLocation }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [activeLayer, setActiveLayer] = useState<'all' | 'risk' | 'water_quality' | 'anomalies'>('all');
  const [selectedStation, setSelectedStation] = useState<LocationData | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (viewMode !== '2d') return;
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [12.8300, 79.2500],
      zoom: 9,
      scrollWheelZoom: true,
    });
    mapInstanceRef.current = map;

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri &copy; Maxar, Earthstar Geographics',
      maxZoom: 18,
    }).addTo(map);

    L.polyline(riverPathCoords, {
      color: '#10b981',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 4'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    PALAR_LOCATIONS.forEach((loc) => {
      const hasAnomaly = ANOMALIES_DATA.some(a => a.location_id === loc.id && a.status === 'Open');
      const wq = WATER_QUALITY_STATIONS.find(w => w.location_id === loc.id);

      let markerColor = '#10b981';
      if (loc.risk_score > 70) markerColor = '#ef4444';
      else if (loc.risk_score > 50) markerColor = '#f59e0b';

      if (activeLayer === 'risk' || activeLayer === 'all') {
        L.circle([loc.latitude, loc.longitude], {
          radius: loc.risk_score * 80,
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.12,
          weight: 1
        }).addTo(layerGroup);
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid #ffffff;
            box-shadow: 0 0 10px ${markerColor};
          "></div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const popupHtml = `
        <div style="min-width: 200px; color: #f3f1ea; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-family: monospace; color: #34d399; font-weight: bold;">${loc.basin_zone}</span>
            <span style="font-size: 9px; padding: 2px 4px; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16,185,129,0.4); border-radius: 4px; color: #a7f3d0;">
              ${loc.confidence_level} CONFIDENCE
            </span>
          </div>
          <h4 style="font-size: 13px; font-weight: bold; margin: 0 0 2px 0; color: #ffffff;">${loc.name}</h4>
          <p style="font-size: 11px; color: #9ca3af; margin: 0 0 8px 0;">${loc.district} District • 12.8° N, 79.1° E</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; background: #061811; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 8px; font-family: monospace; font-size: 11px;">
            <div>
              <div style="font-size: 9px; color: #9ca3af;">Risk Score</div>
              <div style="font-weight: bold; color: #f59e0b;">${loc.risk_score} / 100</div>
            </div>
            <div>
              <div style="font-size: 9px; color: #9ca3af;">TDS Value</div>
              <div style="font-weight: bold; color: #34d399;">${wq?.tds_mg_l || 'N/A'} mg/L</div>
            </div>
          </div>

          ${hasAnomaly ? `
            <div style="padding: 4px 6px; background: rgba(153, 27, 27, 0.5); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 4px; font-size: 10px; color: #fca5a5; margin-bottom: 8px;">
              ⚠️ Active Environmental Anomaly
            </div>
          ` : ''}

          <div style="font-size: 10px; color: #10b981; font-weight: bold; text-align: center; cursor: pointer;">
            Click to inspect hydrographs
          </div>
        </div>
      `;

      const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon })
        .bindPopup(popupHtml)
        .addTo(layerGroup);

      marker.on('click', () => {
        setSelectedStation(loc);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [viewMode, activeLayer, onSelectLocation]);

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

        {/* View Mode Toggle (2D GIS vs 3D Digital Twin) & Layer Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1 bg-[#05140d] p-1 rounded-lg border border-emerald-500/30">
            <button
              onClick={() => setViewMode('2d')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === '2d' ? 'bg-emerald-600 text-ivory shadow-forest-sm' : 'text-stone-300 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>2D GIS Map</span>
            </button>
            <button
              onClick={() => setViewMode('3d')}
              className={`px-2.5 py-1 text-xs rounded font-medium flex items-center gap-1.5 transition-colors ${
                viewMode === '3d' ? 'bg-emerald-600 text-ivory shadow-forest-sm' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D WebGL Twin</span>
            </button>
          </div>

          {viewMode === '2d' && (
            <div className="flex items-center gap-1.5 bg-[#05140d] p-1 rounded-lg border border-white/[0.08]">
              <button
                onClick={() => setActiveLayer('all')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${activeLayer === 'all' ? 'bg-emerald-600 text-ivory' : 'text-stone-300 hover:text-white'}`}
              >
                All Layers
              </button>
              <button
                onClick={() => setActiveLayer('risk')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${activeLayer === 'risk' ? 'bg-emerald-600 text-ivory' : 'text-stone-300 hover:text-white'}`}
              >
                Risk Zones
              </button>
              <button
                onClick={() => setActiveLayer('water_quality')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${activeLayer === 'water_quality' ? 'bg-emerald-600 text-ivory' : 'text-stone-300 hover:text-white'}`}
              >
                Water Quality
              </button>
              <button
                onClick={() => setActiveLayer('anomalies')}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${activeLayer === 'anomalies' ? 'bg-emerald-600 text-ivory' : 'text-stone-300 hover:text-white'}`}
              >
                Active Anomalies
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Display: 2D Leaflet DOM or 3D WebGL Canvas */}
      {viewMode === '2d' ? (
        <div className="relative flex-1 min-h-[460px] w-full">
          <div ref={mapContainerRef} className="h-full w-full min-h-[460px]" />

          {/* Legend Box */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-[#071912]/90 backdrop-blur-md p-3 rounded-lg border border-white/10 shadow-forest-md text-xs pointer-events-none">
            <div className="font-bold text-ivory mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Basin Map Legend</span>
            </div>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="text-stone-300">High Risk Priority (&gt; 70)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-stone-300">Moderate Stress (50 - 70)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-stone-300">Normal Baseline (&lt; 50)</span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <span className="w-4 h-0.5 bg-emerald-400 border-dashed"></span>
                <span className="text-stone-300">Palar Main River Reach</span>
              </div>
            </div>
          </div>

          {/* Station Telemetry Slide-Over Drawer */}
          {selectedStation && (() => {
            const wq = WATER_QUALITY_STATIONS.find(w => w.location_id === selectedStation.id);
            const alert = ANOMALIES_DATA.find(a => a.location_id === selectedStation.id && a.status === 'Open');
            return (
              <div className="absolute top-4 right-4 bottom-4 z-[1001] w-80 sm:w-96 bg-[#061811]/95 backdrop-blur-md rounded-2xl border border-emerald-500/40 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto animate-fade-in text-left">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                        <span>{selectedStation.station_code}</span>
                        <span className="text-stone-500">•</span>
                        <span>{selectedStation.basin_zone}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-white mt-0.5">{selectedStation.name}</h3>
                      <p className="text-xs text-stone-300">{selectedStation.district} District, Tamil Nadu</p>
                    </div>
                    <button
                      onClick={() => setSelectedStation(null)}
                      className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                      title="Close drawer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges strip */}
                  <div className="flex flex-wrap items-center gap-2">
                    <DataBadge provenance="VERIFIED_PUBLIC" />
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {selectedStation.cpcb_stretch_priority}
                    </span>
                  </div>

                  {/* Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-[#04120c] border border-white/10">
                      <div className="text-[10px] text-stone-400 mb-0.5">Risk Score</div>
                      <div className="text-lg font-bold text-amber-400 tabular-nums">
                        {selectedStation.risk_score} / 100
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#04120c] border border-white/10">
                      <div className="text-[10px] text-stone-400 mb-0.5">TDS Value</div>
                      <div className="text-lg font-bold text-emerald-300 tabular-nums">
                        {wq?.tds_mg_l || 'N/A'} mg/L
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#04120c] border border-white/10">
                      <div className="text-[10px] text-stone-400 mb-0.5">Total Chromium</div>
                      <div className="text-lg font-bold text-red-400 tabular-nums">
                        {wq?.chromium_mg_l || 0.015} mg/L
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#04120c] border border-white/10">
                      <div className="text-[10px] text-stone-400 mb-0.5">Aquifer Type</div>
                      <div className="text-[11px] font-medium text-stone-200 truncate">
                        {selectedStation.aquifer_type.split(' ')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Active Anomaly Banner if present */}
                  {alert && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-red-300">
                        <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>Active Statistical Anomaly</span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        {alert.trigger_reason} (Robust Z-Score: {alert.z_score})
                      </p>
                    </div>
                  )}

                  {/* Provenance Description */}
                  <div className="text-[11px] text-stone-400 leading-relaxed border-t border-white/10 pt-3">
                    <span className="font-semibold text-stone-300">Source:</span> {selectedStation.verified_source}
                  </div>
                </div>

                {/* Direct Action Button */}
                <button
                  onClick={() => {
                    if (onSelectLocation) onSelectLocation(selectedStation.id);
                  }}
                  className="mt-4 w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-forest-sm transition-colors"
                >
                  <span>Open Full Station Hydrographs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="relative flex-1 min-h-[500px] w-full p-4 flex flex-col items-center justify-center bg-[#04120c]">
          <div className="w-full max-w-4xl">
            <BasinHero3D />
          </div>
        </div>
      )}
    </div>
  );
};
