import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';
import { MapLegend } from './MapLegend';
import { MapLayerControl, MapLayerState } from './MapLayerControl';
import { LocationDetailPanel, StationDetailData } from './LocationDetailPanel';
import { apiService } from '../../services/api';
import { PALAR_LOCATIONS } from '../../data/palarData';
import { LocationData } from '../../types';
import { ZoomIn, ZoomOut, Layers, Search, Compass, AlertCircle } from 'lucide-react';

// Illustrative catchment envelope around the monitored Palar corridor.
// ILLUSTRATIVE ONLY — not a surveyed or official basin boundary.
const CATCHMENT_BOUNDARY: [number, number][] = [
  [13.15, 78.25], [13.25, 78.60], [13.28, 79.10],
  [13.22, 79.45], [13.12, 79.80], [12.98, 80.15],
  [12.65, 80.20], [12.45, 79.85], [12.38, 79.35],
  [12.42, 78.85], [12.60, 78.45], [12.85, 78.30],
  [13.15, 78.25],
];

// Palar River main channel — water-blue vector spine through the monitored corridor
// Coordinates: CGWB Palar Aquifer Report station corridor (interpolated river course)
// ILLUSTRATIVE RIVER CORRIDOR — not a surveyed hydrological flowline
const MAIN_PALAR_RIVER: [number, number][] = [
  [12.6825, 78.6186], [12.7904, 78.7166], [12.9165, 79.1325],
  [12.9274, 79.3330], [12.9304, 79.3817], [12.8342, 79.7036],
  [12.6841, 79.9836], [12.5167, 80.1600],
];

// Tributaries — Cheyyar and Poiney join the Palar in the Walajapet reach
const CHEYYAR_TRIBUTARY: [number, number][] = [
  [12.4500, 78.9500], [12.5200, 79.2500], [12.6500, 79.5500], [12.7800, 79.7200],
];

const POINEY_TRIBUTARY: [number, number][] = [
  [13.2000, 79.1500], [13.0800, 79.2800], [12.9400, 79.3400],
];

const TAMIL_NAMES: Record<number, string> = {
  1: 'ராணிப்பேட்டை தொழில் பகுதி',
  2: 'ஆம்பூர் தோல் பதனிடும் பகுதி',
  3: 'வாணியம்பாடி நீர்ப்பிடிப்பு',
  4: 'வேலூர் மத்திய சமவெளி',
  5: 'வாலாஜாபேட்டை பாசனப் பகுதி',
  6: 'காஞ்சிபுரம் பகுதி',
  7: 'செங்கல்பட்டு வடிநிலப் பகுதி',
};

interface BasinMapProps {
  onSelectStation?: (stationId: number) => void;
  initialStationId?: number;
  heightClass?: string;
  showLayerControls?: boolean;
}

export const BasinMap: React.FC<BasinMapProps> = ({
  onSelectStation,
  heightClass = 'h-[500px]',
  showLayerControls = true,
}) => {
  const { lang } = useLanguage();
  const Ltxt = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [basemapType, setBasemapType] = useState<'satellite' | 'dark'>('satellite');
  const [layerControlOpen, setLayerControlOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<StationDetailData | null>(null);

  // Seed with the central demonstration stations so the map never renders empty
  // while (or if) the live monitoring API is unreachable.
  const [stations, setStations] = useState<LocationData[]>(PALAR_LOCATIONS);
  const [boundaryAvailable, setBoundaryAvailable] = useState(false);
  const [boundaryNotice, setBoundaryNotice] = useState<string>('');
  const [mapError, setMapError] = useState<string | null>(null);
  const [verifiedOverview, setVerifiedOverview] = useState<any>(null);

  const [layers, setLayers] = useState<MapLayerState>({
    catchment: true,
    riverNetwork: true,
    stations: true,
    groundwater: true,
    rainfall: false,
    waterQuality: true,
    anomalies: true,
    risks: false,
    community: false,
    investigations: false,
    recharge: false,
  });

  const toggleLayer = (key: keyof MapLayerState) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const loadMapData = async () => {
    setMapError(null);
    try {
      const [locs, overview] = await Promise.all([
        apiService.getLocations(),
        apiService.getMapOverview(),
      ]);
      setStations(locs);
      setVerifiedOverview(overview);
      setBoundaryAvailable(Boolean(overview?.metadata?.basin_boundary_available));
      setBoundaryNotice(overview?.metadata?.boundary_notice || '');
    } catch (_err) {
      // Silent fallback: stations will already be populated via withReadFallback in api.ts
      // Do not expose raw API errors to dashboard users
      setBoundaryAvailable(false);
      setBoundaryNotice('Station-corridor spatial view across verified coordinates.');
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const fetchStationDetail = async (stationId: number) => {
    try {
      const data = await apiService.getMapStationDetail(stationId);
      setSelectedStation(data);
    } catch (err: any) {
      setMapError(err?.message || Ltxt('Unable to load station details.', 'நிலைய விவரங்களை ஏற்ற முடியவில்லை.'));
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [12.86, 79.25],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    const esriTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 18, maxNativeZoom: 18 }
    );
    const darkTile = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    });

    (basemapType === 'satellite' ? esriTile : darkTile).addTo(map);

    // Catchment layer: verified GeoJSON when available, otherwise the clearly
    // labelled illustrative envelope so the basin context is never missing.
    if (layers.catchment && !boundaryAvailable) {
      L.polygon(CATCHMENT_BOUNDARY, {
        color: '#10b981',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#062319',
        fillOpacity: 0.15,
      })
        .bindTooltip(
          '<div style="font-size:10px;color:#fcfbf7;">Palar catchment · <span style="color:#a4b2a9;">illustrative envelope</span></div>',
          { sticky: true }
        )
        .addTo(map);
    }

    // Draw ONLY verified GeoJSON boundary features if present; never draw invented polygons
    if (layers.catchment && boundaryAvailable && verifiedOverview?.features) {
      const polyFeatures = verifiedOverview.features.filter(
        (f: any) => f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon'
      );
      if (polyFeatures.length > 0) {
        L.geoJSON(
          { type: 'FeatureCollection', features: polyFeatures } as any,
          {
            style: {
              color: '#10b981',
              weight: 2,
              fillColor: '#062319',
              fillOpacity: 0.16,
            },
          }
        ).addTo(map);
      }
    }

    // ── Palar River network: always rendered from inline geometry ───────────────
    // Independent of API connectivity, so the blue river is never missing.
    // Geometry is an illustrative corridor, labelled as such in the tooltip.
    if (layers.riverNetwork) {
      // Soft water-blue halo for prominence under the channel line
      L.polyline(MAIN_PALAR_RIVER, {
        color: '#0891b2',
        weight: 9,
        opacity: 0.22,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Main river channel — water blue
      L.polyline(MAIN_PALAR_RIVER, {
        color: '#38bdf8',
        weight: 3.5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).bindTooltip(
        `<div style="font-size:11px;font-weight:600;color:#fcfbf7;background:#06181182;padding:2px 6px;border-radius:4px;">
          Palar River · <span style="color:#a4b2a9;font-weight:400;">Illustrative corridor</span>
        </div>`,
        { sticky: true }
      ).addTo(map);

      // Tributaries — Cheyyar and Poiney
      L.polyline(CHEYYAR_TRIBUTARY, {
        color: '#0ea5e9',
        weight: 2.2,
        opacity: 0.75,
      }).addTo(map);

      L.polyline(POINEY_TRIBUTARY, {
        color: '#0ea5e9',
        weight: 2.2,
        opacity: 0.75,
      }).addTo(map);
    }

    const markerGroup = L.layerGroup().addTo(map);
    if (layers.stations) {
      stations.forEach((loc) => {
        const isCritical = loc.risk_score > 70;
        const markerColor = isCritical ? '#e11d48' : loc.risk_score > 55 ? '#d97706' : '#10b981';

        const customIcon = L.divIcon({
          className: 'custom-station-pin',
          html: `
            <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px;">
              <div style="width: 14px; height: 14px; border-radius: 50%; background: ${markerColor}; border: 2px solid #fcfbf7; box-shadow: 0 0 8px rgba(0,0,0,0.6);"></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });
        const nameDisplay = lang === 'ta' ? TAMIL_NAMES[loc.id] || loc.name : loc.name;
        marker.bindTooltip(
          `<div style="font-size: 11px; font-weight: 600; color: #fcfbf7;">
            ${nameDisplay} · illustrative demo marker · ${loc.risk_score}/100
          </div>`,
          { permanent: false, direction: 'top' }
        );
        marker.on('click', () => fetchStationDetail(loc.id));
        marker.addTo(markerGroup);
      });
    }

    mapInstanceRef.current = map;
    const t1 = setTimeout(() => map.invalidateSize(), 120);
    return () => {
      clearTimeout(t1);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [basemapType, layers.catchment, layers.riverNetwork, layers.stations, lang, stations, boundaryAvailable, verifiedOverview]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !mapInstanceRef.current) return;
    const q = searchQuery.toLowerCase();
    const match = stations.find(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q) ||
        (TAMIL_NAMES[l.id] && TAMIL_NAMES[l.id].includes(searchQuery))
    );
    if (match) {
      mapInstanceRef.current.flyTo([match.latitude, match.longitude], 12, { duration: 1.2 });
      fetchStationDetail(match.id);
    }
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-white/[0.08] bg-[#020b06]`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" data-interactive-map="true" />

      <div className="absolute bottom-3 left-3 z-[400] max-w-[calc(100%-190px)] rounded-lg border border-amber-500/30 bg-[#061811]/90 px-2.5 py-2 text-[9px] leading-snug text-amber-100/90 pointer-events-none">
        SYNTHETIC DEMONSTRATION DATA — NOT A REAL ENVIRONMENTAL MEASUREMENT
        <span className="block text-stone-300">River and catchment vectors are illustrative; markers are demonstration locations.</span>
      </div>

      {/* Top Search & Layer Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 max-w-sm w-full pointer-events-auto">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={Ltxt('Search station or district...', 'நிலையம் அல்லது மாவட்டத்தைத் தேடு...')}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#061811]/90 border border-white/10 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-emerald-500"
            />
          </form>

          {showLayerControls && (
            <button
              type="button"
              onClick={() => setLayerControlOpen(!layerControlOpen)}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                layerControlOpen
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-[#061811]/90 text-stone-300 border-white/10 hover:text-white'
              }`}
              title={Ltxt('Toggle GIS layers', 'வரைபட அடுக்குகள்')}
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Map error — show only in development (not in production when API is simply offline) */}
      {mapError && (import.meta as any).env?.DEV && (
        <div className="absolute inset-x-4 top-16 z-[450] rounded-xl border border-rose-500/40 bg-[#1a090d]/95 p-3 text-xs text-rose-200 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{mapError}</span>
          </span>
          <button
            type="button"
            onClick={loadMapData}
            className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-semibold shrink-0"
          >
            {Ltxt('Retry', 'மீண்டும் முயற்சி')}
          </button>
        </div>
      )}

      {layerControlOpen && (
        <div className="absolute top-14 left-3 z-[400]">
          <MapLayerControl
            layers={layers}
            onToggleLayer={toggleLayer}
            onClose={() => setLayerControlOpen(false)}
          />
        </div>
      )}

      <LocationDetailPanel
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onNavigateToAnalysis={(id) => onSelectStation?.(id)}
      />

      <div className="absolute bottom-3 right-3 z-[400] flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center bg-[#061811]/90 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setBasemapType('satellite')}
            className={`px-2 py-0.5 rounded ${basemapType === 'satellite' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setBasemapType('dark')}
            className={`px-2 py-0.5 rounded ${basemapType === 'dark' ? 'bg-emerald-600 text-white font-bold' : 'text-stone-400 hover:text-white'}`}
          >
            Dark GIS
          </button>
        </div>

        <MapLegend />

        <div className="flex items-center gap-1 bg-[#061811]/90 p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-1.5 rounded-lg hover:bg-white/10 text-stone-300 hover:text-white"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.setView([12.86, 79.25], 9)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-emerald-400 hover:text-emerald-300"
            aria-label="Reset Basin View"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
