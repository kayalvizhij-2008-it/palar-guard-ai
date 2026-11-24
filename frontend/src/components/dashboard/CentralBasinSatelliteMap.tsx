import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLanguage } from '../../context/LanguageContext';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS, GROUNDWATER_TIMESERIES } from '../../data/palarData';
import { 
  Maximize2, Minimize2, ZoomIn, ZoomOut, Layers, 
  MapPin, AlertTriangle, ShieldCheck, Droplets, Info, X
} from 'lucide-react';

// Coordinates for Palar River Basin Catchment Boundary (17,810 km²)
const CATCHMENT_BOUNDARY: [number, number][] = [
  [13.15, 78.25], // Western catchment tip (Kolar/Kuppam border)
  [13.25, 78.60], // North-west boundary
  [13.28, 79.10], // Chittoor ridge
  [13.22, 79.45], // North-east Poiney catchment
  [13.12, 79.80], // Arakkonam north boundary
  [12.98, 80.15], // Near Chennai fringe
  [12.65, 80.20], // Bay of Bengal Palar estuary (Sadras/Chengalpattu coast)
  [12.45, 79.85], // Southern coastal hills
  [12.38, 79.35], // Cheyyar southern ridge
  [12.42, 78.85], // Javadi Hills south
  [12.60, 78.45], // Tirupathur / Yelagiri ridge
  [12.85, 78.30], // Bethamangala flank
  [13.15, 78.25]  // Closed polygon
];

// Main Palar River path
const MAIN_PALAR_RIVER: [number, number][] = [
  [12.6825, 78.6186], // Vaniyambadi
  [12.7904, 78.7166], // Ambur
  [12.9165, 79.1325], // Vellore
  [12.9274, 79.3330], // Ranipet
  [12.9304, 79.3817], // Walajapet
  [12.8342, 79.7036], // Kanchipuram
  [12.6841, 79.9836], // Chengalpattu
  [12.5167, 80.1600]  // Bay of Bengal Estuary (Sadras)
];

// Tributary 1: Cheyyar River (South)
const CHEYYAR_TRIBUTARY: [number, number][] = [
  [12.4500, 78.9500], // Javadi Hills origin
  [12.5200, 79.2500], // Polur
  [12.6500, 79.5500], // Cheyyar town
  [12.7800, 79.7200], // Joins Palar below Kanchipuram
];

// Tributary 2: Poiney River (North)
const POINEY_TRIBUTARY: [number, number][] = [
  [13.2000, 79.1500], // Chittoor hills origin
  [13.0800, 79.2800], // Poiney valley
  [12.9400, 79.3400], // Joins Palar near Ranipet/Walajapet
];

interface CentralBasinSatelliteMapProps {
  onSelectStation?: (stationId: number) => void;
}

export const CentralBasinSatelliteMap: React.FC<CentralBasinSatelliteMapProps> = ({
  onSelectStation
}) => {
  const { t, lang } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [basemapType, setBasemapType] = useState<'satellite' | 'dark'>('satellite');
  const [selectedStation, setSelectedStation] = useState<typeof PALAR_LOCATIONS[0] | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Focus stations from the reference image
  const targetStations = [
    { name: 'Ranipet', nameTa: 'ராணிப்பேட்டை', lat: 12.9274, lng: 79.3330, status: 'warning', color: '#f59e0b', id: 4 },
    { name: 'Vellore', nameTa: 'வேலூர்', lat: 12.9165, lng: 79.1325, status: 'normal', color: '#10b981', id: 3 },
    { name: 'Kanchipuram', nameTa: 'காஞ்சிபுரம்', lat: 12.8342, lng: 79.7036, status: 'alert', color: '#f59e0b', id: 6 },
    { name: 'Chengalpattu', nameTa: 'செங்கல்பட்டு', lat: 12.6841, lng: 79.9836, status: 'normal', color: '#10b981', id: 7 },
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [12.88, 79.25],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });
    mapInstanceRef.current = map;

    // Basemap: Esri World Imagery (Photorealistic Satellite) or Carto Dark
    const tileUrl = basemapType === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: ['a', 'b', 'c', 'd']
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // 1. Draw glowing neon emerald catchment boundary
    const boundaryPolygon = L.polygon(CATCHMENT_BOUNDARY, {
      color: '#10b981',
      weight: 3.5,
      opacity: 0.95,
      fillColor: '#10b981',
      fillOpacity: 0.08,
      dashArray: '8, 4',
      className: 'glow-boundary'
    }).addTo(map);

    // Subtle outer halo for catchment boundary
    L.polygon(CATCHMENT_BOUNDARY, {
      color: '#34d399',
      weight: 7,
      opacity: 0.35,
      fill: false,
    }).addTo(map);

    // 2. Draw Main Palar River (Luminous Cyan Polyline)
    L.polyline(MAIN_PALAR_RIVER, {
      color: '#06b6d4',
      weight: 4.5,
      opacity: 0.95,
      className: 'glow-river'
    }).addTo(map);

    // River glow line
    L.polyline(MAIN_PALAR_RIVER, {
      color: '#22d3ee',
      weight: 8,
      opacity: 0.4,
    }).addTo(map);

    // 3. Draw Tributaries (Cheyyar & Poiney)
    L.polyline(CHEYYAR_TRIBUTARY, {
      color: '#0891b2',
      weight: 2.5,
      opacity: 0.85,
      dashArray: '4, 4'
    }).addTo(map);

    L.polyline(POINEY_TRIBUTARY, {
      color: '#0891b2',
      weight: 2.5,
      opacity: 0.85,
      dashArray: '4, 4'
    }).addTo(map);

    // 4. Place Key Station Markers with custom glowing dots and text labels
    targetStations.forEach(st => {
      const customIcon = L.divIcon({
        className: 'custom-station-pin',
        html: `
          <div class="relative flex items-center group cursor-pointer">
            <div class="w-4 h-4 rounded-full flex items-center justify-center" style="background-color: ${st.color}33; border: 2px solid ${st.color}; box-shadow: 0 0 10px ${st.color}">
              <div class="w-1.5 h-1.5 rounded-full" style="background-color: ${st.color}"></div>
            </div>
            <div class="ml-2 px-2 py-0.5 rounded-md bg-[#061811]/90 border border-white/20 text-[11px] font-bold text-white shadow-lg whitespace-nowrap backdrop-blur-sm pointer-events-auto">
              ${lang === 'ta' ? st.name : st.name}
            </div>
          </div>
        `,
        iconSize: [120, 24],
        iconAnchor: [8, 12],
      });

      const marker = L.marker([st.lat, st.lng], { icon: customIcon }).addTo(map);
      marker.on('click', () => {
        const fullData = PALAR_LOCATIONS.find(loc => loc.id === st.id) || PALAR_LOCATIONS[0];
        setSelectedStation(fullData);
        onSelectStation?.(st.id);
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [basemapType, lang]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const toggleBasemap = () => setBasemapType(prev => prev === 'satellite' ? 'dark' : 'satellite');
  const toggleFullscreen = () => setIsFullscreen(prev => !prev);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/[0.08] bg-[#03110b] shadow-2xl transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[440px] md:h-[480px]'
    }`}>
      {/* Leaflet Map DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top-Left Floating Title Badge matching reference image */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto">
        <div className="px-3.5 py-2 rounded-xl bg-[#061a12]/90 backdrop-blur-md border border-emerald-500/30 shadow-xl">
          <div className="text-xs font-bold text-emerald-300 tracking-wide">
            {t('catchment_title')}
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-black text-white font-mono tracking-tight">17,810 km²</span>
            <span className="text-[10px] text-stone-300 font-medium">{t('catchment_official')}</span>
          </div>
        </div>
      </div>

      {/* Top-Right Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-[#061a12]/85 hover:bg-emerald-900/60 backdrop-blur-md border border-white/[0.1] text-stone-200 hover:text-white transition-all shadow-lg"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Bottom-Right Zoom & Layer Switch Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 pointer-events-auto">
        <div className="flex flex-col rounded-xl bg-[#061a12]/90 backdrop-blur-md border border-white/[0.1] shadow-xl overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-white/10 text-stone-200 hover:text-white transition-colors border-b border-white/[0.08]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-white/10 text-stone-200 hover:text-white transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={toggleBasemap}
          className="p-2.5 rounded-xl bg-[#061a12]/90 hover:bg-emerald-900/60 backdrop-blur-md border border-white/[0.1] text-stone-200 hover:text-white transition-all shadow-xl"
          title={`Switch to ${basemapType === 'satellite' ? 'Dark Vector' : 'Satellite'} Basemap`}
        >
          <Layers className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Bottom-Left Floating Legend matching reference image */}
      <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
        <div className="px-3.5 py-2.5 rounded-xl bg-[#061a12]/90 backdrop-blur-md border border-white/[0.1] shadow-xl text-[11px] space-y-1.5 min-w-[170px]">
          {/* Catchment Boundary */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-2.5 rounded-[2px] border border-emerald-400 bg-emerald-500/20"></span>
            <span className="text-stone-300 font-medium">{t('legend_boundary')}</span>
          </div>
          {/* Palar River */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50"></span>
            <span className="text-stone-300 font-medium">{t('legend_river')}</span>
          </div>
          {/* Tributaries */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-0.5 rounded-full bg-cyan-600"></span>
            <span className="text-stone-300 font-medium">{t('legend_tributaries')}</span>
          </div>
          {/* Monitoring Stations */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-amber-400 bg-amber-400/30"></span>
            <span className="text-stone-300 font-medium">{t('legend_stations')}</span>
          </div>
        </div>
      </div>

      {/* Selected Station Popover / Drawer if clicked */}
      {selectedStation && (
        <div className="absolute top-16 right-4 z-20 w-72 rounded-2xl bg-[#061d14]/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl p-4 animate-in fade-in slide-in-from-right-4 pointer-events-auto">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div>
              <h4 className="text-sm font-bold text-white">{selectedStation.name}</h4>
              <p className="text-[10px] text-emerald-400 font-mono">{selectedStation.district} District • {selectedStation.basin_zone}</p>
            </div>
            <button
              onClick={() => setSelectedStation(null)}
              className="p-1 rounded-md hover:bg-white/10 text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {(() => {
            const wq = WATER_QUALITY_STATIONS.find(w => w.location_id === selectedStation.id);
            const gw = GROUNDWATER_TIMESERIES[selectedStation.id];
            const depth = gw ? gw[gw.length - 1]?.depth_mbgl : 13.5;
            const tds = wq?.tds_mg_l ?? 750;
            const chromium = wq?.chromium_mg_l ?? 0.02;

            return (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-black/30 border border-white/[0.04]">
                  <span className="text-[10px] text-stone-400 block">Groundwater</span>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">{depth} mbgl</span>
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-white/[0.04]">
                  <span className="text-[10px] text-stone-400 block">Risk Score</span>
                  <span className={`text-sm font-bold font-mono tabular-nums ${
                    selectedStation.risk_score > 70 ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {selectedStation.risk_score} / 100
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-white/[0.04]">
                  <span className="text-[10px] text-stone-400 block">TDS</span>
                  <span className="text-sm font-bold text-white font-mono tabular-nums">{tds} mg/L</span>
                </div>
                <div className="p-2 rounded-xl bg-black/30 border border-white/[0.04]">
                  <span className="text-[10px] text-stone-400 block">Chromium Cr⁶⁺</span>
                  <span className={`text-sm font-bold font-mono tabular-nums ${
                    chromium > 0.05 ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {chromium} ppm
                  </span>
                </div>
              </div>
            );
          })()}

          <button
            onClick={() => {
              onSelectStation?.(selectedStation.id);
              setSelectedStation(null);
            }}
            className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-forest-sm transition-colors text-center"
          >
            Open Full Hydrograph & Analysis →
          </button>
        </div>
      )}
    </div>
  );
};
