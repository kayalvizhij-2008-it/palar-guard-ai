import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS, ANOMALIES_DATA } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { Layers, Compass, AlertCircle } from 'lucide-react';

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
  const [activeLayer, setActiveLayer] = useState<'all' | 'risk' | 'water_quality' | 'anomalies'>('all');
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO &copy; OpenStreetMap',
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
        if (onSelectLocation) onSelectLocation(loc.id);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [activeLayer, onSelectLocation]);

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

        {/* Layer Filters */}
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
      </div>

      {/* Leaflet DOM Node */}
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
      </div>
    </div>
  );
};
