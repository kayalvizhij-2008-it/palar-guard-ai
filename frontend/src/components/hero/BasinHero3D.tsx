import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PALAR_LOCATIONS, WATER_QUALITY_STATIONS, ANOMALIES_DATA } from '../../data/palarData';
import { DataBadge } from '../common/DataBadge';
import { Droplets, Activity, CloudRain, RotateCw, Layers, ShieldCheck, Compass, Info } from 'lucide-react';

type VisualMode = 'groundwater' | 'water_quality' | 'rainfall';

interface StationNode3D {
  id: number;
  name: string;
  district: string;
  zone: string;
  risk: number;
  tds: number;
  depth: number;
  hasAnomaly: boolean;
  position: [number, number, number];
}

// Convert geographic [Lat, Lng] on Palar Basin into 3D Cartesian coordinates on sphere surface (Radius = 2.05)
function geoToSphere(lat: number, lng: number, radius = 2.05): [number, number, number] {
  // Center of Palar Basin: Lat ~12.8, Lng ~79.2
  // Scale local basin offset to visible hemisphere
  const latOffset = (lat - 12.8) * 0.45;
  const lngOffset = (lng - 79.2) * 0.45;
  
  // Standard spherical mapping focused on forward facing quadrant
  const phi = (90 - (20 + latOffset * 10)) * (Math.PI / 180);
  const theta = (25 + lngOffset * 10) * (Math.PI / 180);

  const x = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);
  return [x, y, z];
}

function BasinGlobeModel({ 
  mode, 
  selectedStation, 
  onSelectStation 
}: { 
  mode: VisualMode; 
  selectedStation: number | null; 
  onSelectStation: (id: number) => void;
}) {
  const globeGroupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Smooth ambient rotation
  useFrame((_, delta) => {
    if (globeGroupRef.current) {
      globeGroupRef.current.rotation.y += delta * 0.08;
    }
  });

  // Hydrological river reaches in 3D: Main Palar River + Tributaries
  const riverSplinePoints = useMemo(() => {
    // 7 baseline coordinates converted to 3D surface
    return PALAR_LOCATIONS.map(loc => new THREE.Vector3(...geoToSphere(loc.latitude, loc.longitude, 2.06)));
  }, []);

  const riverCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3(riverSplinePoints);
  }, [riverSplinePoints]);

  const riverLineGeometry = useMemo(() => {
    return new THREE.TubeGeometry(riverCurve, 64, 0.015, 8, false);
  }, [riverCurve]);

  // Flowing water particles along river channel
  const flowParticleCount = 120;
  const flowPositions = useMemo(() => {
    const arr = new Float32Array(flowParticleCount * 3);
    for (let i = 0; i < flowParticleCount; i++) {
      const t = Math.random();
      const pt = riverCurve.getPoint(t);
      arr[i * 3] = pt.x + (Math.random() - 0.5) * 0.02;
      arr[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.02;
      arr[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.02;
    }
    return arr;
  }, [riverCurve]);

  // Station Nodes data mapping
  const stationNodes: StationNode3D[] = useMemo(() => {
    return PALAR_LOCATIONS.map(loc => {
      const wq = WATER_QUALITY_STATIONS.find(w => w.location_id === loc.id);
      const hasAnomaly = ANOMALIES_DATA.some(a => a.location_id === loc.id && a.status === 'Open');
      return {
        id: loc.id,
        name: loc.name,
        district: loc.district,
        zone: loc.basin_zone,
        risk: loc.risk_score,
        tds: wq?.tds_mg_l || 750,
        depth: loc.id === 1 ? 14.9 : loc.id === 2 ? 14.5 : 12.4,
        hasAnomaly,
        position: geoToSphere(loc.latitude, loc.longitude, 2.07)
      };
    });
  }, []);

  return (
    <group ref={globeGroupRef}>
      {/* 1. Earth/Basin Primary Sphere in Natural Deep Forest Green */}
      <Sphere args={[2.0, 64, 64]}>
        <meshStandardMaterial
          color="#061811"
          roughness={0.65}
          metalness={0.2}
        />
      </Sphere>

      {/* 2. Atmospheric & Hydrological Elevation Contour Wireframe */}
      <Sphere args={[2.015, 40, 40]}>
        <meshBasicMaterial
          color="#10b981"
          wireframe={true}
          transparent={true}
          opacity={0.07}
        />
      </Sphere>

      {/* 3. Outer Atmospheric Glow Shell */}
      <Sphere args={[2.14, 32, 32]}>
        <meshBasicMaterial
          color="#10b981"
          transparent={true}
          opacity={0.03}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* 4. Palar Main River Reach 3D Tube */}
      <mesh geometry={riverLineGeometry}>
        <meshBasicMaterial
          color={mode === 'water_quality' ? '#06b6d4' : mode === 'groundwater' ? '#10b981' : '#34d399'}
          transparent={true}
          opacity={0.8}
        />
      </mesh>

      {/* 5. Hydrological Particle Stream */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[flowPositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.03}
          color="#34d399"
          transparent={true}
          opacity={0.9}
        />
      </points>

      {/* 6. Station Beacons with Dynamic Mode Coloring */}
      {stationNodes.map((st) => {
        const isSelected = selectedStation === st.id;

        let beaconColor = '#10b981';
        if (mode === 'groundwater') {
          beaconColor = st.depth > 14.0 ? '#ef4444' : st.depth > 12.0 ? '#f59e0b' : '#10b981';
        } else if (mode === 'water_quality') {
          beaconColor = st.hasAnomaly ? '#ef4444' : st.tds > 1500 ? '#f59e0b' : '#06b6d4';
        } else {
          beaconColor = st.id === 5 || st.id === 6 ? '#10b981' : '#6ee7b7';
        }

        return (
          <group 
            key={st.id} 
            position={st.position}
            onClick={(e) => {
              e.stopPropagation();
              onSelectStation(st.id);
            }}
          >
            {/* Core Node Beacon */}
            <mesh>
              <sphereGeometry args={[isSelected ? 0.055 : 0.04, 16, 16]} />
              <meshBasicMaterial color={beaconColor} />
            </mesh>

            {/* Pulsing Concentric Radar Halo */}
            <mesh>
              <ringGeometry args={[0.06, 0.08, 16]} />
              <meshBasicMaterial color={beaconColor} transparent opacity={isSelected ? 0.8 : 0.4} side={THREE.DoubleSide} />
            </mesh>

            {/* Interactive HTML Tooltip on Selected Node */}
            {isSelected && (
              <Html distanceFactor={6} position={[0, 0.15, 0]} center>
                <div className="bg-[#061811]/95 backdrop-blur-md border border-emerald-500/40 rounded-lg p-2.5 shadow-forest-lg min-w-[170px] pointer-events-auto text-left">
                  <div className="text-[10px] font-mono text-emerald-400 font-bold">{st.zone}</div>
                  <div className="text-xs font-bold text-white leading-tight">{st.name}</div>
                  <div className="text-[10px] text-stone-400 mb-1.5">{st.district} District</div>
                  
                  <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-[#030d08] rounded border border-white/10 text-[10px] font-mono">
                    {mode === 'groundwater' && (
                      <>
                        <div>
                          <div className="text-stone-400">Water Depth</div>
                          <div className="font-bold text-amber-400">{st.depth} mbgl</div>
                        </div>
                        <div>
                          <div className="text-stone-400">Risk Score</div>
                          <div className="font-bold text-emerald-300">{st.risk}/100</div>
                        </div>
                      </>
                    )}
                    {mode === 'water_quality' && (
                      <>
                        <div>
                          <div className="text-stone-400">TDS Value</div>
                          <div className="font-bold text-emerald-300">{st.tds} mg/L</div>
                        </div>
                        <div>
                          <div className="text-stone-400">Chromium</div>
                          <div className="font-bold text-red-400">{st.id === 1 ? '0.082' : '0.015'} mg/L</div>
                        </div>
                      </>
                    )}
                    {mode === 'rainfall' && (
                      <>
                        <div>
                          <div className="text-stone-400">Recharge</div>
                          <div className="font-bold text-emerald-400">84% Suitable</div>
                        </div>
                        <div>
                          <div className="text-stone-400">Rainfall</div>
                          <div className="font-bold text-cyan-300">682 mm</div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {st.hasAnomaly && (
                    <div className="mt-1 text-[9px] text-red-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                      Active Anomaly Flagged
                    </div>
                  )}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// 2D Static High-Fidelity Topographic Fallback (Intel N100 / Low-Power Mode)
function FallbackBasinVisual({ onSelectStation }: { onSelectStation: (id: number) => void }) {
  return (
    <div className="w-full h-full min-h-[440px] flex flex-col items-center justify-between p-6 bg-gradient-to-br from-[#0c2419] via-[#061811] to-[#04100b] rounded-2xl border border-emerald-500/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 500 500">
          <circle cx="250" cy="250" r="230" stroke="#10b981" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <circle cx="250" cy="250" r="170" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.6" />
          <path d="M 80 280 Q 200 220 280 250 T 440 220" stroke="#34d399" strokeWidth="3" fill="none" />
          <path d="M 160 180 Q 240 230 280 250" stroke="#059669" strokeWidth="2" fill="none" strokeDasharray="2 2" />
        </svg>
      </div>

      <div className="relative z-10 w-full flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          DIGITAL TWIN (ACCELERATED 2D FALLBACK)
        </div>
        <DataBadge provenance="VERIFIED_PUBLIC" />
      </div>

      <div className="relative z-10 text-center my-6">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-emerald-glow">
          <Compass className="w-8 h-8 text-emerald-400" />
        </div>
        <h4 className="text-white font-bold text-lg mb-1">Palar Catchment Topography</h4>
        <p className="text-xs text-stone-300 max-w-sm mb-4">
          Continuous surveillance across 7 baseline river stations: Vaniyambadi, Ambur, Vellore, Ranipet, Walajapet, Kanchipuram, and Chengalpattu Estuary.
        </p>

        {/* Station Selectors */}
        <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
          {PALAR_LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => onSelectStation(loc.id)}
              className="px-2.5 py-1 rounded bg-[#071d14] hover:bg-emerald-900/60 border border-emerald-500/30 text-[11px] font-mono text-stone-200 hover:text-emerald-300 transition-colors"
            >
              {loc.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400 font-mono">
        <span>Catchment: 17,810 km²</span>
        <span className="text-emerald-400">Standard WebGL Fallback Active</span>
      </div>
    </div>
  );
}

export const BasinHero3D: React.FC<{ onNavigateToModule?: (mod: string) => void }> = ({ onNavigateToModule }) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [mode, setMode] = useState<VisualMode>('groundwater');
  const [selectedStation, setSelectedStation] = useState<number | null>(1);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // WebGL Feature Detection
  React.useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <FallbackBasinVisual onSelectStation={(id) => setSelectedStation(id)} />;
  }

  const selectedLocData = PALAR_LOCATIONS.find(l => l.id === selectedStation) || PALAR_LOCATIONS[0];

  return (
    <div className="w-full h-[460px] md:h-[540px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#071f16] via-[#051811] to-[#04100b] border border-emerald-500/30 shadow-forest-lg select-none">
      {/* 3D Canvas with Performance Caps (DPR <= 1.5 for low-power GPUs) */}
      <Canvas
        camera={{ position: [0, 0, 4.6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 4, 3]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-4, -2, -2]} intensity={0.5} color="#10b981" />
        
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.2}>
          <BasinGlobeModel
            mode={mode}
            selectedStation={selectedStation}
            onSelectStation={(id) => setSelectedStation(id)}
          />
        </Float>

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          minDistance={3.8}
          maxDistance={6.0}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
        />
      </Canvas>

      {/* Top Left: Catchment Georeference HUD */}
      <div className="absolute top-4 left-4 pointer-events-none bg-[#05150e]/85 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/[0.08] shadow-forest-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>PALAR BASIN DIGITAL TWIN</span>
        </div>
        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
          12.8° N, 79.1° E • 17,810 km² Catchment • 7 Baseline Nodes
        </p>
      </div>

      {/* Top Right: Layer Mode Switcher HUD */}
      <div className="absolute top-4 right-4 z-20 bg-[#05150e]/90 backdrop-blur-md p-1.5 rounded-xl border border-white/[0.08] flex items-center gap-1 shadow-forest-sm">
        <button
          onClick={() => setMode('groundwater')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
            mode === 'groundwater' 
              ? 'bg-emerald-600 text-white font-bold' 
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
          title="Highlight Groundwater Depletion"
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Groundwater</span>
        </button>
        <button
          onClick={() => setMode('water_quality')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
            mode === 'water_quality' 
              ? 'bg-cyan-600 text-white font-bold' 
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
          title="Highlight Chemical Quality & Outliers"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Quality</span>
        </button>
        <button
          onClick={() => setMode('rainfall')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
            mode === 'rainfall' 
              ? 'bg-emerald-600 text-white font-bold' 
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
          title="Highlight Recharge Infiltration Potential"
        >
          <CloudRain className="w-3.5 h-3.5" />
          <span>Recharge</span>
        </button>
      </div>

      {/* Bottom Center: Station Node Quick Nav Rail */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#05150e]/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/[0.08] text-[11px] font-mono overflow-x-auto max-w-full">
          <span className="text-stone-400 mr-1 hidden sm:inline">Inspect:</span>
          {PALAR_LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => setSelectedStation(loc.id)}
              className={`px-2 py-0.5 rounded text-[10px] whitespace-nowrap transition-colors ${
                selectedStation === loc.id 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-stone-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {loc.name.split(' ')[0]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className="pointer-events-auto p-2 bg-[#05150e]/90 hover:bg-[#092218] rounded-xl border border-white/[0.08] text-stone-300 hover:text-white transition-colors"
          title={autoRotate ? "Pause 3D Orbit" : "Resume 3D Orbit"}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'text-emerald-400' : 'text-stone-400'}`} />
        </button>
      </div>
    </div>
  );
};
