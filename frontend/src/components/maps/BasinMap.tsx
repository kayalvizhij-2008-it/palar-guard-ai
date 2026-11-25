import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';
import { MapLegend } from './MapLegend';
import { MapLayerControl, MapLayerState } from './MapLayerControl';
import { LocationDetailPanel, StationDetailData } from './LocationDetailPanel';
import { apiService } from '../../services/api';
import { LocationData } from '../../types';
import { ZoomIn, ZoomOut, Layers, Search, Compass, AlertCircle } from 'lucide-react';

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

  const [stations, setStations] = useState<LocationData[]>([]);
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
    } catch (err: any) {
      setMapError(err?.message || Ltxt('Failed to load map stations from API.', 'வரைபட நிலையங்களை ஏற்ற முடியவில்லை.'));
    }
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const fetchStationDetail = async (stationId: number) => {
    try {
      const data = await apiService.getMapStationDetail(stationId);
      setSelectedStation(data);
      onSelectStation?.(stationId);
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

    // Station-connecting corridor derived strictly from verified station coordinates
    if (layers.riverNetwork && stations.length >= 2) {
      const sorted = [...stations].sort((a, b) => a.longitude - b.longitude);
      const corridor: [number, number][] = sorted.map((s) => [s.latitude, s.longitude]);
      L.polyline(corridor, {
        color: '#10b981',
        weight: 2.5,
        dashArray: '6, 6',
        opacity: 0.85,
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
            ${nameDisplay} · ${loc.risk_score}/100
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

        {/* Honest Boundary Dataset Status */}
        {!boundaryAvailable && !mapError && (
          <div className="pointer-events-auto max-w-md rounded-lg border border-amber-500/30 bg-[#061811]/90 px-3 py-1.5 text-[11px] text-amber-200">
            {Ltxt(
              boundaryNotice || 'Verified basin boundary GeoJSON unavailable. Approximate polygons disabled.',
              'சரிபார்க்கப்பட்ட வடிநில எல்லை GeoJSON இல்லை. தோராய எல்லை முடக்கப்பட்டுள்ளது.'
            )}
          </div>
        )}
      </div>

      {mapError && (
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
