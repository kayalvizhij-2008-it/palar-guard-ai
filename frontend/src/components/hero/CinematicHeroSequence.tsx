import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, Pause, RotateCcw, FastForward, ChevronDown, 
  ArrowRight, ShieldAlert, CloudRain, Droplets, MapPin, 
  Compass, Sparkles, Award, Layers
} from 'lucide-react';
import { PALAR_LOCATIONS } from '../../data/palarData';

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
  currentScene, 
  progress, 
  onSelectStation 
}: { 
  currentScene: number; 
  progress: number;
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
  const palarCenterPos = useMemo(() => latLngToVector3(12.8, 79.3, 2.04), []);

  // Animate Camera & Scene Elements on each frame
  useFrame((_, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }

    if (radarPulseRef.current) {
      const s = 1.0 + (Math.sin(Date.now() * 0.005) * 0.25 + 0.25);
      radarPulseRef.current.scale.set(s, s, s);
    }

    // Camera trajectory mapping based on currentScene (1 through 6)
    // Scene 1: Distant Earth [0, 0.4, 5.0]
    // Scene 2: India Subcontinent Approach [0.4, 0.6, 3.2]
    // Scene 3: Tamil Nadu Regional Zoom [0.35, 0.45, 2.3]
    // Scene 4: Palar Basin Delineation [0.25, 0.35, 1.45]
    // Scene 5: Digital Twin Elevated Perspective [0.22, 0.38, 1.25]
    // Scene 6: Brand Horizon Reveal [0, -1.15, 3.2]
    let targetPos = new THREE.Vector3(0, 0.3, 5.0);
    let targetLookAt = new THREE.Vector3(0, 0, 0);

    if (currentScene === 1) {
      targetPos.set(0, 0.2, 5.0);
      targetLookAt.set(0, 0, 0);
    } else if (currentScene === 2) {
      targetPos.set(0.65, 0.65, 3.2);
      targetLookAt.set(0.3, 0.35, 0.5);
    } else if (currentScene === 3) {
      targetPos.set(0.48, 0.55, 2.35);
      targetLookAt.set(0.35, 0.42, 0.9);
    } else if (currentScene === 4) {
      targetPos.set(0.35, 0.48, 1.55);
      targetLookAt.set(0.32, 0.42, 1.1);
    } else if (currentScene === 5) {
      targetPos.set(0.32, 0.52, 1.35);
      targetLookAt.set(0.32, 0.44, 1.15);
    } else {
      // Scene 6: Tilt down to show curved Earth horizon at the bottom!
      targetPos.set(0, -0.9, 3.3);
      targetLookAt.set(0, 0.4, 0);
    }

    camera.position.lerp(targetPos, 0.05);
    camera.lookAt(targetLookAt);

    // Subtle ambient globe orientation keeping India in view
    if (globeGroupRef.current) {
      if (currentScene === 1) {
        globeGroupRef.current.rotation.y += delta * 0.06;
      } else {
        // Gently align toward Indian longitude
        globeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
          globeGroupRef.current.rotation.y,
          0.35,
          0.04
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
          opacity={currentScene >= 6 ? 0.09 : 0.05}
          side={THREE.BackSide}
        />
      </mesh>

      {/* 4. Scene 2 & 3: Radar Targeting Circles over Tamil Nadu */}
      {(currentScene === 2 || currentScene === 3) && (
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

      {/* 5. Scene 3: Tamil Nadu Floating Label */}
      {currentScene === 3 && (
        <Html position={[0.65, 0.55, 1.6]} center>
          <div className="bg-[#061811]/90 backdrop-blur-md border border-emerald-500/50 rounded-xl p-3 shadow-2xl pointer-events-none text-left min-w-[150px] animate-fade-in">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              TARGET REGION
            </div>
            <div className="text-base font-extrabold text-white tracking-tight">TAMIL NADU</div>
            <div className="text-[11px] text-stone-300 font-mono">INDIA · COROMANDEL COAST</div>
          </div>
        </Html>
      )}

      {/* 6. Scene 4, 5, 6: Palar River Basin Boundary Glowing Halo */}
      {currentScene >= 4 && (
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

      {/* 7. Scene 4: Palar River Basin Floating Label */}
      {currentScene === 4 && (
        <Html position={[0.48, 0.48, 1.6]} center>
          <div className="bg-[#061811]/95 backdrop-blur-md border border-emerald-400/60 rounded-xl p-3 shadow-2xl pointer-events-none text-left min-w-[180px] animate-fade-in">
            <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              VERIFIED CATCHMENT
            </div>
            <div className="text-base font-extrabold text-white tracking-tight">PALAR RIVER BASIN</div>
            <div className="text-[11px] text-emerald-200 font-mono">17,810 km² · 7 STATIONS</div>
          </div>
        </Html>
      )}

      {/* 8. Scene 5: Monitoring Station 3D Beacons */}
      {currentScene >= 5 && currentScene < 6 && (
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
                {/* 3D Pin Head */}
                <mesh position={[0, 0.04, 0]}>
                  <sphereGeometry args={[0.025, 16, 16]} />
                  <meshBasicMaterial color={beaconColor} />
                </mesh>
                {/* Stem */}
                <mesh position={[0, 0.02, 0]}>
                  <cylinderGeometry args={[0.004, 0.004, 0.04, 8]} />
                  <meshBasicMaterial color={beaconColor} />
                </mesh>
                {/* Base Ring */}
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
}

export const CinematicHeroSequence: React.FC<CinematicHeroSequenceProps> = ({ 
  onExplore, 
  onOpenPresentation 
}) => {
  const [currentScene, setCurrentScene] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  // Total runtime 20 seconds:
  // Scene 1: 0–3s
  // Scene 2: 3–6s
  // Scene 3: 6–9s
  // Scene 4: 9–13s
  // Scene 5: 13–17s
  // Scene 6: 17–20s
  const sceneDurations = [3, 3, 3, 4, 4, 3];
  const totalDuration = sceneDurations.reduce((a, b) => a + b, 0); // 20s

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.1;
        if (next >= totalDuration) {
          return totalDuration; // Stay on Scene 6 (Brand reveal)
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  // Determine currentScene from progress seconds
  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < sceneDurations.length; i++) {
      accumulated += sceneDurations[i];
      if (progress <= accumulated) {
        setCurrentScene(i + 1);
        break;
      }
    }
  }, [progress]);

  const handleJumpToScene = (sceneIndex: number) => {
    let startTime = 0;
    for (let i = 0; i < sceneIndex - 1; i++) {
      startTime += sceneDurations[i];
    }
    setProgress(startTime + 0.2);
    setCurrentScene(sceneIndex);
  };

  const handleSkipIntro = () => {
    setProgress(17.5);
    setCurrentScene(6);
  };

  const handleReplay = () => {
    setProgress(0);
    setCurrentScene(1);
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full h-screen bg-[#020905] overflow-hidden select-none flex flex-col justify-between">
      {/* 1. 3D WebGL Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas
          camera={{ position: [0, 0.3, 5.0], fov: 42 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Cinematic Sunlight Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[6, 4, 3]} intensity={2.2} color="#ffffff" />
          <directionalLight position={[-4, -2, -2]} intensity={0.3} color="#10b981" />

          {/* Core Globe Visualization */}
          <CinematicGlobe 
            currentScene={currentScene} 
            progress={progress}
            onSelectStation={(loc) => setSelectedLocation(loc)}
          />

          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            rotateSpeed={0.5} 
            maxPolarAngle={Math.PI / 1.7} 
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      {/* 2. Top Cinematic Header HUD Bar */}
      <header className="relative z-20 px-6 py-5 flex items-center justify-between backdrop-blur-sm bg-gradient-to-b from-[#020905]/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2ad58b] to-[#10b981] flex items-center justify-center shadow-emerald-glow border border-white/20">
            <Droplets className="w-5 h-5 text-[#061811] fill-[#061811]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-extrabold text-base tracking-tight text-white">PALAR GUARD AI</span>
              <span className="px-1.5 py-0.2 bg-emerald-950/90 border border-emerald-400/40 text-[9px] font-mono text-emerald-300 rounded font-bold">
                CINEMATIC SATELLITE TWIN
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-mono hidden sm:block">Palar River Basin Environmental Intelligence</p>
          </div>
        </div>

        {/* Top Right Scene Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSkipIntro}
            className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 text-xs font-mono transition-colors flex items-center gap-1.5"
            title="Skip directly to Brand Presentation"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>

          {onOpenPresentation && (
            <button
              onClick={onOpenPresentation}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5 shadow-forest-sm transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Jury Pitch Mode</span>
            </button>
          )}

          <button
            onClick={() => onExplore('dashboard')}
            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#061811] text-xs font-bold transition-all shadow-forest-sm"
          >
            Console
          </button>
        </div>
      </header>

      {/* 3. Floating HUD Telemetry Panels (SCENE 05 — Environmental Intelligence) */}
      {currentScene === 5 && (
        <div className="relative z-20 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in pointer-events-none">
          {/* Card 1: RAINFALL */}
          <div className="pointer-events-auto p-4 rounded-2xl bg-[#061811]/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-3.5 min-w-[210px]">
            <div className="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">Rainfall</div>
              <div className="text-xl font-bold font-sans text-white tabular-nums">682 mm</div>
              <div className="text-[11px] text-emerald-400 font-mono font-medium">(+12% Normal)</div>
            </div>
          </div>

          {/* Card 2: GROUNDWATER */}
          <div className="pointer-events-auto p-4 rounded-2xl bg-[#061811]/90 backdrop-blur-md border border-white/10 shadow-2xl flex items-center gap-3.5 min-w-[210px]">
            <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider font-bold">Groundwater</div>
              <div className="text-xl font-bold font-sans text-white tabular-nums">76% Capacity</div>
              <div className="text-[11px] text-stone-300 font-mono">Post-Monsoon Recharge</div>
            </div>
          </div>

          {/* Card 3: RISK LEVEL */}
          <div className="pointer-events-auto p-4 rounded-2xl bg-[#061811]/90 backdrop-blur-md border border-red-500/30 shadow-2xl flex items-center gap-3.5 min-w-[210px]">
            <div className="w-11 h-11 rounded-xl bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider font-bold">Risk Level</div>
              <div className="text-xl font-bold font-sans text-red-400">Priority-V / High</div>
              <div className="text-[11px] text-stone-300 font-mono">Ranipet Tannery Stretch</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SCENE 06 — Cinematic Brand Reveal Overlay */}
      {currentScene === 6 && (
        <div className="relative z-20 text-center max-w-3xl mx-auto px-4 space-y-6 animate-fade-in my-auto pb-16">
          {/* Logo Mark */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#2ad58b] to-[#10b981] p-0.5 shadow-2xl shadow-emerald-500/20">
            <div className="w-full h-full bg-[#03110a] rounded-2xl flex items-center justify-center">
              <Droplets className="w-8 h-8 text-[#2ad58b] fill-[#2ad58b]" />
            </div>
          </div>

          {/* Main Brand Title */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-sans">
              PALAR <span className="text-[#2ad58b]">GUARD AI</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-200 font-medium tracking-wide">
              See the Risk. Predict the Change. Protect Every Drop.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onExplore('dashboard')}
              className="px-8 py-3.5 rounded-full bg-[#2ad58b] hover:bg-[#25be7c] text-[#061811] font-bold text-sm shadow-emerald-glow transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <span>Explore the Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExplore('dashboard')}
              className="px-7 py-3.5 rounded-full bg-emerald-950/90 hover:bg-emerald-900 text-emerald-200 border border-emerald-400/40 text-sm font-semibold transition-all flex items-center gap-2 shadow-forest-sm"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Open Intelligence Dashboard</span>
            </button>
            {onOpenPresentation && (
              <button
                onClick={onOpenPresentation}
                className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 hover:border-emerald-500/40 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Award className="w-4 h-4 text-emerald-400" />
                <span>Watch Guided Demo</span>
              </button>
            )}
            <a
              href="#challenge"
              className="px-5 py-3.5 rounded-full bg-transparent hover:bg-white/5 text-stone-300 text-sm font-medium transition-colors"
            >
              Learn More ↓
            </a>
          </div>

          {/* Micro Provenance Tag */}
          <div className="pt-2 text-xs font-mono text-emerald-400/80">
            Palar River Basin (17,810 km²) · CGWB 2022 & CPCB Priority-V Verified Architecture
          </div>
        </div>
      )}

      {/* 5. Bottom Cinema Scrub Bar & Timeline Controller */}
      <footer className="relative z-20 px-6 py-4 bg-gradient-to-t from-[#020905] via-[#020905]/80 to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/[0.06]">
        {/* Playback Toggle & Timecode */}
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
            title="Replay cinematic experience from Scene 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono text-stone-400">
            00:{Math.floor(progress).toString().padStart(2, '0')} / 00:{totalDuration}
          </span>
        </div>

        {/* 6-Scene Quick Jump Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
          {[
            { id: 1, label: "01 Earth" },
            { id: 2, label: "02 India" },
            { id: 3, label: "03 Tamil Nadu" },
            { id: 4, label: "04 Palar Basin" },
            { id: 5, label: "05 Intelligence" },
            { id: 6, label: "06 Brand Reveal" },
          ].map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleJumpToScene(sc.id)}
              className={`px-3 py-1 rounded-full transition-all ${
                currentScene === sc.id
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
          <span>Scroll to explore platform</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce text-emerald-400" />
        </div>
      </footer>
    </div>
  );
};
