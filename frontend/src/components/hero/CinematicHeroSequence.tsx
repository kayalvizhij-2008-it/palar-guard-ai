import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, Pause, RotateCcw, FastForward, ChevronDown, 
  ArrowRight, ShieldAlert, CloudRain, Droplets, MapPin, 
  Compass, Sparkles, Award, Layers
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { PALAR_LOCATIONS } from '../../data/palarData';
import { BokehParticleGalaxy } from '../effects/BokehParticleGalaxy';

// --- GEOGRAPHIC & SPHERICAL PROJECTIONS ---
// Earth sphere radius = 2.0
// Palar Basin center: Lat ~12.8°N, Lng ~79.2°E
function latLngToVector3(lat: number, lng: number, radius = 2.0): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Procedural high-resolution satellite-style Earth texture canvas
function createEarthCanvasTexture(): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // 1. Deep Oceanic Gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#030b14');
  oceanGrad.addColorStop(0.5, '#051924');
  oceanGrad.addColorStop(1, '#020b12');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  // Helper to draw geographical regions on equirectangular projection
  const toX = (lng: number) => ((lng + 180) / 360) * width;
  const toY = (lat: number) => ((90 - lat) / 180) * height;

  // 2. Continents Background (Earth Green / Slate Brown)
  ctx.fillStyle = '#0a2318';
  ctx.strokeStyle = '#123d2b';
  ctx.lineWidth = 1.5;

  // Simplified continental landmass contours
  // Africa
  ctx.beginPath();
  ctx.ellipse(toX(20), toY(5), width * 0.08, height * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eurasia (Europe + Asia)
  ctx.beginPath();
  ctx.ellipse(toX(85), toY(45), width * 0.28, height * 0.26, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Americas
  ctx.beginPath();
  ctx.ellipse(toX(-90), toY(35), width * 0.12, height * 0.25, -0.2, 0, Math.PI * 2);
  ctx.ellipse(toX(-60), toY(-15), width * 0.09, height * 0.3, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Australia
  ctx.beginPath();
  ctx.ellipse(toX(135), toY(-25), width * 0.07, height * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  // 3. Detailed Indian Subcontinent Polygon
  ctx.fillStyle = '#103826';
  ctx.beginPath();
  const indiaCoords: [number, number][] = [
    [35.0, 74.0], // Kashmir
    [32.0, 76.0],
    [28.0, 80.0], // Nepal border
    [26.0, 88.0], // Bengal
    [22.0, 89.0], // Sundarbans
    [17.0, 83.0], // Andhra coast
    [13.0, 80.3], // Chennai / Palar coast
    [10.0, 79.8], // Point Calimere
    [8.08, 77.55], // Kanyakumari (South tip)
    [9.5, 76.2],  // Kerala coast
    [12.5, 75.0], // Karnataka
    [15.5, 73.8], // Goa
    [19.0, 72.8], // Mumbai
    [23.0, 68.5], // Gujarat Rann
    [27.0, 71.0], // Rajasthan
    [31.0, 74.5], // Punjab
    [35.0, 74.0]
  ];
  indiaCoords.forEach(([lat, lng], idx) => {
    const x = toX(lng);
    const y = toY(lat);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sri Lanka
  ctx.beginPath();
  ctx.ellipse(toX(80.7), toY(7.8), width * 0.009, height * 0.025, 0, 0, Math.PI * 2);
  ctx.fill();

  // 4. Tamil Nadu Accentuated Region (Southern India)
  ctx.fillStyle = '#1b5439';
  ctx.beginPath();
  const tnCoords: [number, number][] = [
    [13.5, 80.2], // North border near Pulicat/Chennai
    [12.8, 79.2], // Palar inland
    [11.5, 77.0], // Western Ghats
    [8.5, 77.5],  // South
    [9.3, 79.1],  // Gulf of Mannar
    [10.8, 79.9], // Cauvery delta
    [13.5, 80.2]
  ];
  tnCoords.forEach(([lat, lng], idx) => {
    const x = toX(lng);
    const y = toY(lat);
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fill();

  // 5. Palar River Reach Line directly on texture
  ctx.strokeStyle = '#2ad58b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(toX(78.2), toY(12.7)); // Source (Kolar plateau)
  ctx.lineTo(toX(78.6), toY(12.7)); // Vaniyambadi
  ctx.lineTo(toX(79.3), toY(12.9)); // Ranipet
  ctx.lineTo(toX(79.7), toY(12.8)); // Kanchipuram
  ctx.lineTo(toX(80.15), toY(12.5)); // Bay of Bengal Estuary
  ctx.stroke();

  // 6. City Night Lights (warm amber dots on subcontinent)
  const cityLights: [number, number, number][] = [
    [13.08, 80.27, 4], // Chennai
    [12.97, 77.59, 5], // Bengaluru
    [12.92, 79.13, 3], // Vellore / Ranipet
    [11.01, 76.96, 3], // Coimbatore
    [9.92, 78.11, 3],  // Madurai
    [19.07, 72.87, 6], // Mumbai
    [28.61, 77.20, 6], // Delhi
    [22.57, 88.36, 5], // Kolkata
    [17.38, 78.48, 5], // Hyderabad
  ];
  cityLights.forEach(([lat, lng, r]) => {
    const cx = toX(lng);
    const cy = toY(lat);
    const lightGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
    lightGrad.addColorStop(0, '#fef08a');
    lightGrad.addColorStop(0.4, 'rgba(251, 191, 36, 0.7)');
    lightGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = lightGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

// Procedural Clouds Fallback Canvas Texture
function createCloudsCanvasTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  for (let i = 0; i < 40; i++) {
    const cx = Math.random() * width;
    const cy = Math.random() * height;
    const rx = 30 + Math.random() * 80;
    const ry = 10 + Math.random() * 30;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

// Texture loader helper with satellite textures and procedural fallback
function usePlanetTextures() {
  const [textures, setTextures] = useState<{
    map: THREE.Texture;
    clouds: THREE.Texture;
    normal: THREE.Texture | null;
    specular: THREE.Texture | null;
  } | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const fallbackMap = createEarthCanvasTexture();
    const fallbackClouds = createCloudsCanvasTexture();

    Promise.all([
      new Promise<THREE.Texture>((resolve) => {
        loader.load('/textures/planets/earth_atmos_2048.jpg', 
          (t) => { t.colorSpace = THREE.SRGBColorSpace; resolve(t); }, 
          undefined, 
          () => resolve(fallbackMap)
        );
      }),
      new Promise<THREE.Texture>((resolve) => {
        loader.load('/textures/planets/earth_clouds_1024.png', 
          (t) => { t.colorSpace = THREE.SRGBColorSpace; resolve(t); }, 
          undefined, 
          () => resolve(fallbackClouds)
        );
      }),
      new Promise<THREE.Texture | null>((resolve) => {
        loader.load('/textures/planets/earth_normal_2048.jpg', 
          resolve, 
          undefined, 
          () => resolve(null)
        );
      }),
      new Promise<THREE.Texture | null>((resolve) => {
        loader.load('/textures/planets/earth_specular_2048.jpg', 
          resolve, 
          undefined, 
          () => resolve(null)
        );
      }),
    ]).then(([map, clouds, normal, specular]) => {
      setTextures({ map, clouds, normal, specular });
    });
  }, []);

  return textures;
}

// Detailed Palar Basin Boundary Coordinates (17,810 km² Catchment Perimeter)
const PALAR_BASIN_PERIMETER: [number, number][] = [
  [12.65, 78.20], // Kolar border SW
  [12.85, 78.25], // Bethamangala
  [13.10, 78.45], // Punganur North ridge
  [13.25, 78.85], // Chittoor NW hills
  [13.20, 79.20], // Nagari hills North
  [13.05, 79.55], // Arakkonam North plain
  [12.95, 79.85], // Sriperumbudur NE
  [12.75, 80.15], // Chengalpattu / Bay of Bengal Estuary
  [12.45, 80.10], // Sadras coastal reach South
  [12.35, 79.75], // Maduranthakam South
  [12.30, 79.35], // Vandavasi / Cheyyar South
  [12.40, 78.95], // Polur / Javadhu Hills foothills
  [12.50, 78.65], // Yelagiri Hills South
  [12.65, 78.20]  // Loop to SW
];

// Main River Reach & Tributary Curves
const PALAR_RIVER_COORDS: [number, number][] = [
  [12.72, 78.25], // Source
  [12.68, 78.62], // Vaniyambadi
  [12.79, 78.72], // Ambur
  [12.92, 79.13], // Vellore
  [12.93, 79.33], // Ranipet
  [12.93, 79.38], // Walajapet
  [12.83, 79.70], // Kanchipuram
  [12.68, 79.98], // Chengalpattu
  [12.51, 80.15]  // Sadras Bay of Bengal Estuary
];

// Cheyyar Tributary
const CHEYYAR_TRIBUTARY: [number, number][] = [
  [12.42, 78.95], // Javadhu hills
  [12.55, 79.25], // Polur
  [12.65, 79.55], // Cheyyar town
  [12.78, 79.75]  // Confluence with Palar
];

// --- 3D SCENE ORCHESTRATION COMPONENT ---
function CinematicGlobe({ 
  stageIndex, 
  stageProgress, 
  onSelectStation 
}: { 
  stageIndex: number; // 1 to 6
  stageProgress: number; // 0.0 to 1.0 continuous
  onSelectStation: (loc: any) => void;
}) {
  const { camera } = useThree();
  const globeGroupRef = useRef<THREE.Group>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const radarPulseRef = useRef<THREE.Mesh>(null);

  // Textures
  const planetTextures = usePlanetTextures();
  const earthTexture = useMemo(() => createEarthCanvasTexture(), []);
  const cloudsTexture = useMemo(() => createCloudsCanvasTexture(), []);

  // 3D Basin Polygon Spline (offset slightly above sphere radius = 2.025)
  const basinPerimeterPoints = useMemo(() => {
    return PALAR_BASIN_PERIMETER.map(([lat, lng]) => latLngToVector3(lat, lng, 2.03));
  }, []);

  const basinLineGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(basinPerimeterPoints, true);
    return new THREE.TubeGeometry(curve, 64, 0.012, 6, true);
  }, [basinPerimeterPoints]);

  // Main Palar River Tube Spline
  const riverPoints = useMemo(() => {
    return PALAR_RIVER_COORDS.map(([lat, lng]) => latLngToVector3(lat, lng, 2.035));
  }, []);

  const riverGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(riverPoints, false);
    return new THREE.TubeGeometry(curve, 64, 0.016, 6, false);
  }, [riverPoints]);

  // Cheyyar Tributary Tube Spline
  const cheyyarGeometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      CHEYYAR_TRIBUTARY.map(([lat, lng]) => latLngToVector3(lat, lng, 2.033)),
      false
    );
    return new THREE.TubeGeometry(curve, 32, 0.01, 6, false);
  }, []);

  // Tamil Nadu Highlight Ring Center (Lat ~11.5°N, Lng ~79°E)
  const tnCenterPos = useMemo(() => latLngToVector3(11.5, 79.0, 2.04), []);

  // 6 Continuous Keyframe Camera Coordinates across stages:
  // Stage 1 (0.0): Deep Space Earth
  // Stage 2 (0.2): Asia Approach
  // Stage 3 (0.4): India Focus
  // Stage 4 (0.6): Tamil Nadu Regional Zoom
  // Stage 5 (0.8): Palar River Basin Delineation
  // Stage 6 (1.0): Final Regional Horizon & Brand Reveal View
  const STAGE_KEYS = useMemo(() => [
    { pos: new THREE.Vector3(0.0, 0.25, 5.2), lookAt: new THREE.Vector3(0, 0, 0), rotY: 0.0 },
    { pos: new THREE.Vector3(0.85, 0.70, 3.8), lookAt: new THREE.Vector3(0.38, 0.42, 0.55), rotY: 0.18 },
    { pos: new THREE.Vector3(0.62, 0.62, 2.95), lookAt: new THREE.Vector3(0.30, 0.35, 0.72), rotY: 0.32 },
    { pos: new THREE.Vector3(0.46, 0.52, 2.25), lookAt: new THREE.Vector3(0.32, 0.40, 0.90), rotY: 0.35 },
    { pos: new THREE.Vector3(0.33, 0.47, 1.52), lookAt: new THREE.Vector3(0.31, 0.42, 1.10), rotY: 0.35 },
    { pos: new THREE.Vector3(0.12, -0.65, 2.95), lookAt: new THREE.Vector3(0.10, 0.25, 0.50), rotY: 0.35 }
  ], []);

  // Animate Camera & Scene Elements on each frame
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }

    if (radarPulseRef.current) {
      const s = 1.0 + (Math.sin(Date.now() * 0.005) * 0.25 + 0.25);
      radarPulseRef.current.scale.set(s, s, s);
    }

    // Continuous smooth interpolation across the 6 stages based on stageProgress (0.0 to 1.0)
    const clampedProgress = Math.max(0, Math.min(1, stageProgress));
    const segment = clampedProgress * (STAGE_KEYS.length - 1);
    const segIdx = Math.min(STAGE_KEYS.length - 2, Math.floor(segment));
    const subT = segment - segIdx;

    const targetPos = new THREE.Vector3().lerpVectors(
      STAGE_KEYS[segIdx].pos,
      STAGE_KEYS[segIdx + 1].pos,
      subT
    );
    const targetLookAt = new THREE.Vector3().lerpVectors(
      STAGE_KEYS[segIdx].lookAt,
      STAGE_KEYS[segIdx + 1].lookAt,
      subT
    );
    const targetRotY = THREE.MathUtils.lerp(
      STAGE_KEYS[segIdx].rotY,
      STAGE_KEYS[segIdx + 1].rotY,
      subT
    );

    camera.position.lerp(targetPos, 0.08);
    camera.lookAt(targetLookAt);

    if (globeGroupRef.current) {
      if (clampedProgress < 0.04) {
        // Slow ambient rotation in space
        globeGroupRef.current.rotation.y += delta * 0.04;
      } else {
        globeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          globeGroupRef.current.rotation.y,
          targetRotY,
          0.08
        );
      }
    }
  });

  return (
    <group ref={globeGroupRef}>
      {/* 1. Primary Earth Sphere with NASA Satellite Texture */}
      <mesh>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshStandardMaterial
          map={planetTextures?.map || earthTexture}
          normalMap={planetTextures?.normal || undefined}
          roughness={0.65}
          metalness={0.12}
        />
      </mesh>

      {/* 2. Atmospheric Clouds Layer */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.018, 64, 64]} />
        <meshStandardMaterial
          map={planetTextures?.clouds || cloudsTexture}
          transparent={true}
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Outer Emerald / Cyan Atmospheric Limb Glow */}
      <mesh>
        <sphereGeometry args={[2.08, 48, 48]} />
        <meshBasicMaterial
          color="#10b981"
          transparent={true}
          opacity={stageProgress >= 0.7 ? 0.09 : 0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 4. 3D Luminous Orbital Trajectory Rings matching reference blueprint */}
      <group rotation={[Math.PI / 3.2, Math.PI / 5, 0]}>
        <mesh>
          <ringGeometry args={[2.55, 2.58, 64]} />
          <meshBasicMaterial color="#2ad58b" transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[2.565, 0, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      <group rotation={[-Math.PI / 3.8, -Math.PI / 4, 0]}>
        <mesh>
          <ringGeometry args={[2.82, 2.85, 64]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* 5. 3D Orbiting Satellite in Upper Right Space */}
      <group position={[2.4, 2.0, 0.5]} rotation={[0.4, -0.6, 0.3]}>
        <mesh>
          <boxGeometry args={[0.14, 0.14, 0.22]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.115]}>
          <boxGeometry args={[0.135, 0.135, 0.01]} />
          <meshStandardMaterial color="#f59e0b" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.38, 0, 0]}>
          <boxGeometry args={[0.55, 0.015, 0.18]} />
          <meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0.38, 0, 0]}>
          <boxGeometry args={[0.55, 0.015, 0.18]} />
          <meshStandardMaterial color="#0284c7" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.11, 0.06]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.07, 0.04, 16]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.9} />
        </mesh>
      </group>

      {/* 6. Stages 2, 3, 4: Radar Targeting Rings over Tamil Nadu / South India */}
      {stageProgress >= 0.25 && stageProgress < 0.65 && (
        <group position={tnCenterPos}>
          <mesh ref={radarPulseRef}>
            <ringGeometry args={[0.08, 0.12, 32]} />
            <meshBasicMaterial color="#2ad58b" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.18, 0.20, 32]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color="#75e5ae" />
          </mesh>
        </group>
      )}

      {/* 7. Stage 4: Tamil Nadu Floating Label */}
      {stageIndex === 4 && (
        <Html position={[0.65, 0.55, 1.6]} center>
          <div className="bg-[#061811]/90 backdrop-blur-md border border-emerald-500/50 rounded-xl p-3 shadow-2xl pointer-events-none text-left min-w-[150px] animate-fade-in">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              REGIONAL FOCUS
            </div>
            <div className="text-base font-extrabold text-white tracking-tight">TAMIL NADU, INDIA</div>
            <div className="text-[11px] text-stone-300 font-mono">12.8°N, 79.2°E · COROMANDEL BASIN</div>
          </div>
        </Html>
      )}

      {/* 8. Stages 5 & 6: Palar River Basin Boundary Glowing Halo */}
      {stageProgress >= 0.62 && (
        <group>
          {/* Glowing Green Perimeter */}
          <mesh geometry={basinLineGeometry}>
            <meshBasicMaterial color="#2ad58b" />
          </mesh>

          {/* Main Palar River Luminous Tube */}
          <mesh geometry={riverGeometry}>
            <meshBasicMaterial color="#75e5ae" />
          </mesh>

          {/* Cheyyar Tributary */}
          <mesh geometry={cheyyarGeometry}>
            <meshBasicMaterial color="#34d399" transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {/* 9. Stage 5: Palar River Basin Floating Label */}
      {stageIndex === 5 && (
        <Html position={[0.48, 0.48, 1.6]} center>
          <div className="bg-[#061811]/95 backdrop-blur-md border border-emerald-400/60 rounded-xl p-3 shadow-2xl pointer-events-none text-left min-w-[180px] animate-fade-in">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              VERIFIED CATCHMENT
            </div>
            <div className="text-base font-extrabold text-white tracking-tight">THE PALAR RIVER BASIN</div>
            <div className="text-[11px] text-emerald-200 font-mono">17,810 km² · 7 BASELINE STATIONS</div>
          </div>
        </Html>
      )}

      {/* 10. Stages 5 & 6: Monitoring Station 3D Beacons */}
      {stageProgress >= 0.68 && (
        <group>
          {PALAR_LOCATIONS.map((loc) => {
            const pos = latLngToVector3(loc.latitude, loc.longitude, 2.045);
            const isCritical = loc.risk_score > 70;
            const beaconColor = isCritical ? '#ef4444' : loc.risk_score > 50 ? '#f59e0b' : '#2ad58b';

            return (
              <group 
                key={loc.id} 
                position={pos}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStation(loc);
                }}
              >
                <mesh position={[0, 0.04, 0]}>
                  <sphereGeometry args={[0.025, 16, 16]} />
                  <meshBasicMaterial color={beaconColor} />
                </mesh>
                <mesh position={[0, 0.02, 0]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.04, 8]} />
                  <meshBasicMaterial color={beaconColor} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.02, 0.035, 16]} />
                  <meshBasicMaterial color={beaconColor} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}

// --- CINEMATIC HERO SEQUENCE CONTROLLER ---
interface CinematicHeroSequenceProps {
  onExplore: (module?: string) => void;
  onOpenPresentation?: () => void;
  scrollProgress?: number; // 0.0 to 1.0 passed from parent sticky scroll container
  onScrollToStage?: (stageIndex: number) => void;
}

export const CinematicHeroSequence: React.FC<CinematicHeroSequenceProps> = ({ 
  onExplore, 
  onOpenPresentation,
  scrollProgress,
  onScrollToStage
}) => {
  const { lang, setLang } = useLanguage();
  const [internalProgress, setInternalProgress] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(scrollProgress === undefined);
  const [, setSelectedLocation] = useState<any>(null);

  // If scrollProgress prop is supplied from parent sticky scroller, use it; otherwise use internal progress
  const effectiveProgress = scrollProgress !== undefined 
    ? Math.max(0, Math.min(1, scrollProgress)) 
    : internalProgress;

  // Map effectiveProgress (0.0 to 1.0) to currentStage (1 to 6)
  const currentStage = useMemo(() => {
    if (effectiveProgress < 0.18) return 1; // 01 Space
    if (effectiveProgress < 0.36) return 2; // 02 Asia
    if (effectiveProgress < 0.54) return 3; // 03 India
    if (effectiveProgress < 0.72) return 4; // 04 Tamil Nadu
    if (effectiveProgress < 0.88) return 5; // 05 Palar Basin
    return 6; // 06 Brand Reveal
  }, [effectiveProgress]);

  // Fallback timer when standalone / not scroll-driven
  useEffect(() => {
    if (scrollProgress !== undefined || !isPlaying) return;

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        const next = prev + 0.006;
        if (next >= 1.0) {
          return 1.0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, scrollProgress]);

  const handleStageSelect = (stageIdx: number) => {
    if (onScrollToStage) {
      onScrollToStage(stageIdx);
    } else {
      const stageTargets = [0.0, 0.22, 0.42, 0.62, 0.78, 1.0];
      setInternalProgress(stageTargets[stageIdx - 1]);
    }
  };

  const handleReplay = () => {
    if (onScrollToStage) {
      onScrollToStage(1);
    } else {
      setInternalProgress(0);
      setIsPlaying(true);
    }
  };

  const handleSkipToReveal = () => {
    if (onScrollToStage) {
      onScrollToStage(6);
    } else {
      setInternalProgress(1.0);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#020905] overflow-hidden select-none flex flex-col justify-between">
      {/* 1. Celestial Bokeh Particle Galaxy Atmosphere */}
      <BokehParticleGalaxy 
        opacity={0.7} 
        speedMultiplier={0.8}
        className="absolute inset-0 z-0 pointer-events-none" 
      />

      {/* 2. 3D WebGL Earth Canvas Layer (Rock-Solid Camera & Atmosphere) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas
          camera={{ position: [0, 0.25, 5.2], fov: 42, near: 0.1, far: 2000 }}
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: 'high-performance'
          }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
            }, false);
          }}
        >
          {/* Subtle Starfield */}
          <Stars radius={80} depth={45} count={1200} factor={2.5} fade speed={0.2} />

          {/* Cinematic Sunlight Lighting */}
          <ambientLight intensity={0.45} />
          <directionalLight position={[6, 4, 3]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-4, -2, -2]} intensity={0.35} color="#10b981" />

          {/* Core Globe Visualization (Interpolates Camera without OrbitControls conflicts) */}
          <CinematicGlobe 
            stageIndex={currentStage} 
            stageProgress={effectiveProgress}
            onSelectStation={(loc) => setSelectedLocation(loc)}
          />
        </Canvas>
      </div>

      {/* 2. Top Cinematic Header Navigation Bar matching visual blueprint */}
      <header className="relative z-20 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-gradient-to-b from-[#020905]/90 via-[#020905]/60 to-transparent border-b border-white/[0.04]">
        {/* Left: Brand Identity matching blueprint */}
        <div 
          onClick={() => onExplore('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center p-0.5 shadow-emerald-glow">
            <div className="w-full h-full bg-[#03110a] rounded-[10px] flex items-center justify-center">
              <Droplets className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-1 font-sans text-base font-extrabold tracking-tight">
            <span className="text-white">Palar</span>
            <span className="text-white">Guard</span>
            <span className="text-[#2ad58b]">AI</span>
          </div>
        </div>

        {/* Center: Navigation Links matching blueprint */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-stone-300">
          <button onClick={() => onExplore('landing')} className="text-emerald-400 hover:text-emerald-300 transition-colors">
            {lang === 'ta' ? 'முகப்பு' : 'Home'}
          </button>
          <button onClick={() => onExplore('dashboard')} className="hover:text-white transition-colors">
            {lang === 'ta' ? 'கண்காணிப்பு' : 'Dashboard'}
          </button>
          <button onClick={() => onExplore('analytics')} className="hover:text-white transition-colors">
            {lang === 'ta' ? 'பகுப்பாய்வு' : 'Analytics'}
          </button>
          <a href="#challenge" className="hover:text-white transition-colors">
            {lang === 'ta' ? 'திட்டம் பற்றி' : 'About'}
          </a>
          <a href="#services" className="hover:text-white transition-colors">
            {lang === 'ta' ? 'ஆதரவு' : 'Support'}
          </a>
        </nav>

        {/* Right: Language Pill Switcher & Pitch Mode */}
        <div className="flex items-center gap-3">
          {/* EN / தமிழ் pill switcher matching blueprint */}
          <div className="flex items-center bg-[#072116] p-0.5 rounded-full border border-white/[0.12] text-xs">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                lang === 'en'
                  ? 'bg-emerald-500 text-[#041a11]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <span className="text-stone-500 px-0.5">|</span>
            <button
              onClick={() => setLang('ta')}
              className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                lang === 'ta'
                  ? 'bg-emerald-500 text-[#041a11]'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
          </div>

          <button
            onClick={handleSkipToReveal}
            className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 text-xs font-mono transition-colors"
          >
            <span>{lang === 'ta' ? 'தவிர்' : 'Skip'}</span>
            <FastForward className="w-3 h-3" />
          </button>

          <button
            onClick={() => onExplore('dashboard')}
            className="px-4 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-[#061811] text-xs font-bold transition-all shadow-forest-sm"
          >
            {lang === 'ta' ? 'கட்டுப்பாட்டு மையம் →' : 'Console →'}
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 4. DYNAMIC STAGE HUD OVERLAYS (STAGES 1 TO 6) */}
      {/* ============================================================ */}

      {/* STAGE 1: EARTH FROM SPACE ("EVERY DROP HAS A STORY.") */}
      {currentStage === 1 && (
        <div className="relative z-20 px-6 sm:px-12 max-w-7xl mx-auto w-full my-auto flex flex-col justify-center animate-fade-in pointer-events-none">
          <div className="max-w-xl space-y-4 sm:space-y-5 pointer-events-auto">
            {/* Introductory Caption specified in Prompt Part 1 */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-xs font-mono text-emerald-300 tracking-widest uppercase">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>EVERY DROP HAS A STORY.</span>
            </div>

            {/* 3-Line Headline matching blueprint */}
            <h1 className="text-3xl sm:text-5xl lg:text-5.5xl font-black text-white tracking-tight leading-[1.12] font-sans">
              {lang === 'ta' ? (
                <>
                  ஆபத்தைக் கண்டறி. <br />
                  மாற்றத்தைக் கணித்து அறி. <br />
                  <span className="text-[#2ad58b]">ஒவ்வொரு துளியையும் பாதுகாப்போம்.</span>
                </>
              ) : (
                <>
                  See the Risk. <br />
                  Predict the Change. <br />
                  <span className="text-[#2ad58b]">Protect Every Drop.</span>
                </>
              )}
            </h1>

            {/* Subtitle matching blueprint */}
            <p className="text-sm sm:text-base text-stone-200 font-normal leading-relaxed max-w-lg">
              {lang === 'ta'
                ? 'எதிர்காலத்திற்கான AI-ஆற்றல் கொண்ட நதிப்படுகை நீர் நுண்ணறிவு தளம்'
                : 'An AI-powered water intelligence platform for a sustainable tomorrow'}
            </p>

            {/* Action Buttons matching blueprint */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onExplore('dashboard')}
                className="px-7 py-3 rounded-full bg-[#2ad58b] hover:bg-[#25be7c] text-[#061811] font-bold text-sm shadow-emerald-glow transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <span>{lang === 'ta' ? 'கண்காணிப்பு தளம் →' : 'Explore Platform →'}</span>
              </button>

              {onOpenPresentation && (
                <button
                  onClick={onOpenPresentation}
                  className="px-6 py-3 rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/20 hover:border-emerald-400 text-sm font-semibold transition-all flex items-center gap-2 backdrop-blur-md"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>{lang === 'ta' ? 'டெமோ பார்க்க' : 'Watch Demo'}</span>
                </button>
              )}
            </div>

            {/* Scroll indicator matching blueprint */}
            <div className="flex items-center gap-2 text-xs text-stone-400 pt-2">
              <div className="w-5 h-8 rounded-full border-2 border-stone-400 flex items-start justify-center p-1">
                <div className="w-1 h-2 rounded-full bg-emerald-400 animate-bounce" />
              </div>
              <span>{lang === 'ta' ? 'கீழே உருட்டி ஆராய்க' : 'Scroll to Explore Journey'}</span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: MOVE TOWARD ASIA */}
      {currentStage === 2 && (
        <div className="relative z-20 px-6 sm:px-12 max-w-7xl mx-auto w-full my-auto flex flex-col justify-center animate-fade-in pointer-events-none">
          <div className="max-w-md p-6 rounded-3xl bg-[#061811]/90 backdrop-blur-md border border-emerald-500/30 shadow-2xl space-y-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">
                STAGE 02 · CONTINENTAL SCALE
              </span>
              <span className="text-xs font-mono text-stone-400">02 / 06</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">ASIA</h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'ta'
                ? 'கிழக்கு அரைக்கோளத்தின் முக்கிய நதிப்படுகைகள் மற்றும் 3.2 பில்லியன் மக்களின் நீர் தேவையை பூர்த்தி செய்யும் ஆசிய கண்டத்தை நோக்கி அணுகுகிறோம்.'
                : 'Approaching the Asian continent, home to 3.2 billion people facing seasonal water stress across major peninsular and alluvial river systems.'}
            </p>
            <div className="pt-1 text-[11px] font-mono text-emerald-300">
              Continents Focus: Indo-Gangetic & Peninsular Systems
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: MOVE TOWARD INDIA */}
      {currentStage === 3 && (
        <div className="relative z-20 px-6 sm:px-12 max-w-7xl mx-auto w-full my-auto flex flex-col justify-center animate-fade-in pointer-events-none">
          <div className="max-w-md p-6 rounded-3xl bg-[#061811]/90 backdrop-blur-md border border-emerald-500/30 shadow-2xl space-y-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">
                STAGE 03 · SUBCONTINENTAL SCALE
              </span>
              <span className="text-xs font-mono text-stone-400">03 / 06</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h2 className="text-3xl font-black text-white tracking-tight">INDIA</h2>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'ta'
                ? 'இந்திய துணைக் கண்டம் — தீவிர பருவமழை சுழற்சிகள், பிளவுபட்ட கடின பாறை நீர்த்தேக்கங்கள் மற்றும் விவசாய நிலத்தடி நீர் பயன்பாட்டு சவால்கள்.'
                : 'The Indian Subcontinent — governed by Southwest and Northeast monsoons, weathered crystalline charnockite aquifers, and intensive groundwater extraction.'}
            </p>
            <div className="pt-1 text-[11px] font-mono text-emerald-300">
              Target: Peninsular Hard-Rock Aquifer System
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: MOVE TOWARD TAMIL NADU */}
      {currentStage === 4 && (
        <div className="relative z-20 px-6 sm:px-12 max-w-7xl mx-auto w-full my-auto flex flex-col justify-center animate-fade-in pointer-events-none">
          <div className="max-w-md p-6 rounded-3xl bg-[#061811]/90 backdrop-blur-md border border-emerald-500/30 shadow-2xl space-y-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">
                STAGE 04 · REGIONAL SCALE
              </span>
              <span className="text-xs font-mono text-stone-400">04 / 06</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">TAMIL NADU, INDIA</h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'ta'
                ? 'சோழமண்டலக் கடற்கரையில் அமைந்துள்ள தமிழ்நாடு — வடகிழக்கு பருவமழையை பெருமளவில் நம்பியுள்ள விவசாய மற்றும் தொழிற்துறை மையங்கள்.'
                : 'Coromandel coastal state reliant predominantly on Northeast monsoon precipitation, where 60%+ groundwater blocks are classified as critical or over-exploited.'}
            </p>
            <div className="pt-1 text-[11px] font-mono text-emerald-300">
              Coromandel Catchment · 12.8° N, 79.2° E
            </div>
          </div>
        </div>
      )}

      {/* STAGE 5: REVEAL THE PALAR RIVER BASIN */}
      {currentStage === 5 && (
        <div className="relative z-20 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in pointer-events-none my-auto">
          {/* Left Basin Identity */}
          <div className="max-w-md p-6 rounded-3xl bg-[#061811]/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 tracking-widest uppercase">
                STAGE 05 · BASIN SCALE
              </span>
              <span className="text-xs font-mono text-stone-400">05 / 06</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">THE PALAR RIVER BASIN</h2>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'ta'
                ? 'கர்நாடகாவின் கோலார் பீடபூமியில் தொடங்கி, தமிழ்நாட்டின் வழியாக 348 கி.மீ பாய்ந்து வங்காள விரிகுடாவில் கலக்கும் 17,810 ச.கி.மீ நதிப்படுகை.'
                : 'Originating in Kolar plateau, flowing 348 km across Karnataka, Andhra Pradesh, and northern Tamil Nadu into the Bay of Bengal.'}
            </p>
            <div className="text-[11px] font-mono text-emerald-300">
              17,810 km² Perimeter • 7 Baseline Telemetry Stations
            </div>
          </div>

          {/* Right Live Basin Telemetry Chips */}
          <div className="flex flex-col gap-3 pointer-events-auto">
            <div className="p-3.5 rounded-2xl bg-[#061811]/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-3 min-w-[220px]">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                <CloudRain className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">Rainfall</div>
                <div className="text-lg font-bold font-sans text-white tabular-nums">682 mm</div>
                <div className="text-[10px] text-emerald-400 font-mono">(+12% Normal)</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#061811]/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-3 min-w-[220px]">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Groundwater</div>
                <div className="text-lg font-bold font-sans text-white tabular-nums">76% Capacity</div>
                <div className="text-[10px] text-stone-300 font-mono">14.9 mbgl Mean</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#061811]/90 backdrop-blur-md border border-red-500/30 shadow-2xl flex items-center gap-3 min-w-[220px]">
              <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-red-400 uppercase font-bold">Risk Level</div>
                <div className="text-lg font-bold font-sans text-red-400">Priority-V High</div>
                <div className="text-[10px] text-stone-300 font-mono">Ranipet Industrial Stretch</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 6: FINAL GEOGRAPHIC REVEAL & BRAND HORIZON */}
      {currentStage === 6 && (
        <div className="relative z-20 text-center max-w-3xl mx-auto px-4 space-y-5 animate-fade-in my-auto pb-12">
          {/* Logo Mark */}
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#2ad58b] to-[#10b981] p-0.5 shadow-2xl shadow-emerald-500/20">
            <div className="w-full h-full bg-[#03110a] rounded-2xl flex items-center justify-center">
              <Droplets className="w-7 h-7 text-[#2ad58b] fill-[#2ad58b]" />
            </div>
          </div>

          {/* Main Brand Title & Tagline specified in Prompt Part 1 */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans">
              PALAR <span className="text-[#2ad58b]">GUARD AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-200 font-medium tracking-wide">
              {lang === 'ta'
                ? 'ஆபத்தைக் கண்டறி. மாற்றத்தைக் கணித்து அறி. ஒவ்வொரு துளியையும் பாதுகாப்போம்.'
                : 'See the Risk. Predict the Change. Protect Every Drop.'}
            </p>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto leading-relaxed">
              {lang === 'ta'
                ? 'பாலாறு நதிப்படுகைக்கான நிலத்தடி நீர், மழைப்பொழிவு, நீர் தரம் மற்றும் மாசு இடர் தகவல்களை ஒருங்கிணைக்கும் சுற்றுச்சூழல் நுண்ணறிவு தளம்.'
                : 'An integrated environmental intelligence platform bringing groundwater, rainfall, water quality, and pollution-risk information together for the Palar River Basin.'}
            </p>
          </div>

          {/* Two Clear Primary Actions specified in Prompt Part 1 */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onExplore('dashboard')}
              className="px-8 py-3.5 rounded-full bg-[#2ad58b] hover:bg-[#25be7c] text-[#061811] font-bold text-sm shadow-emerald-glow transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <span>{lang === 'ta' ? 'கண்காணிப்பு தளம் →' : 'Explore the Platform'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExplore('dashboard')}
              className="px-7 py-3.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-400/40 text-sm font-semibold transition-all flex items-center gap-2 shadow-forest-sm"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ta' ? 'கட்டுப்பாட்டு மையம்' : 'Enter Dashboard'}</span>
            </button>
            {onOpenPresentation && (
              <button
                onClick={onOpenPresentation}
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 hover:border-emerald-500/40 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'ta' ? 'டெமோ பார்க்க' : 'Watch Guided Demo'}</span>
              </button>
            )}
            <a
              href="#understanding-water"
              className="px-5 py-3.5 rounded-full bg-transparent hover:bg-white/5 text-stone-300 text-sm font-medium transition-colors"
            >
              {lang === 'ta' ? 'கீழே தொடர்க ↓' : 'Scroll Down ↓'}
            </a>
          </div>

          {/* Micro Provenance Tag */}
          <div className="pt-2 text-xs font-mono text-emerald-400/80">
            Palar River Basin (17,810 km²) · CGWB, IMD & TNPCB Verified Science Data
          </div>
        </div>
      )}

      {/* Floating Circular AI Voice Assistant Trigger */}
      <button
        onClick={() => onExplore('assistant')}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 border-2 border-emerald-300 hover:scale-110 transition-all group"
        title={lang === 'ta' ? 'PALAR AI - குரல் உதவியாளர்' : 'PALAR AI - Voice Assistant'}
      >
        <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-30 pointer-events-none" />
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-white" stroke="none">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
        </svg>
      </button>

      {/* 5. Bottom Cinema Scrub Bar & Timeline Controller across the 6 Stages */}
      <footer className="relative z-20 px-6 py-3.5 bg-gradient-to-t from-[#020905] via-[#020905]/80 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06]">
        {/* Playback Toggle & Replay */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
            title={isPlaying ? "Pause cinematic experience" : "Play cinematic experience"}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={handleReplay}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors"
            title="Replay from Stage 1: Earth from space"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-stone-400">
            Stage 0{currentStage} / 06 · {Math.round(effectiveProgress * 100)}%
          </span>
        </div>

        {/* 6 Geographic Stage Pills matching Prompt Part 1 */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none max-w-full">
          {[
            { id: 1, label: "01 Space" },
            { id: 2, label: "02 Asia" },
            { id: 3, label: "03 India" },
            { id: 4, label: "04 Tamil Nadu" },
            { id: 5, label: "05 Palar Basin" },
            { id: 6, label: "06 Reveal" },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleStageSelect(sc.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                currentStage === sc.id
                  ? 'bg-emerald-500 text-[#061811] font-bold shadow-forest-sm'
                  : 'bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white'
              }`}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* Scroll Prompt */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-400 font-mono">
          <span>Scroll down to advance journey</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
        </div>
      </footer>
    </div>
  );
};
