import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';

// 3D Palar Basin River Mesh & Station Nodes
function BasinDigitalTwinModel() {
  const globeRef = useRef<THREE.Group>(null);
  const riverPointsRef = useRef<THREE.Points>(null);

  // Controlled slow ambient planetary rotation
  useFrame((_, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.15;
    }
  });

  // Hydrological particle field representing basin water flow
  const particleCount = 180;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const radius = 2.05 + Math.random() * 0.15;

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    // Forest Emerald to Hydrology Cyan gradient particles
    colors[i * 3] = 0.06; // R
    colors[i * 3 + 1] = 0.72 + Math.random() * 0.2; // G
    colors[i * 3 + 2] = 0.51 + Math.random() * 0.4; // B
  }

  // Palar Basin key station coordinates mapped to 3D sphere surface
  // (Latitude ~12.8°N, Longitude ~79.1°E)
  const stationNodes = [
    { name: "Ambur (Upper)", pos: [0.38, 0.48, 1.95], color: "#f59e0b" },
    { name: "Ranipet (Industrial)", pos: [0.42, 0.50, 1.93], color: "#ef4444" },
    { name: "Vellore (Central)", pos: [0.40, 0.49, 1.94], color: "#10b981" },
    { name: "Kanchipuram (Lower)", pos: [0.45, 0.47, 1.92], color: "#06b6d4" },
  ];

  return (
    <group ref={globeRef}>
      {/* Primary Earth/Basin Sphere in Mineral Charcoal & Forest Tint */}
      <Sphere args={[2.0, 64, 64]}>
        <meshStandardMaterial
          color="#082218"
          roughness={0.65}
          metalness={0.25}
          wireframe={false}
        />
      </Sphere>

      {/* Atmospheric Elevation Contour Grid */}
      <Sphere args={[2.02, 32, 32]}>
        <meshBasicMaterial
          color="#10b981"
          wireframe={true}
          transparent={true}
          opacity={0.08}
        />
      </Sphere>

      {/* Palar River Network Flow Curves */}
      <points ref={riverPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          vertexColors={true}
          transparent={true}
          opacity={0.85}
        />
      </points>

      {/* Verified Monitoring Station 3D Beacon Points */}
      {stationNodes.map((st, idx) => (
        <group key={idx} position={st.pos as [number, number, number]}>
          <mesh>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color={st.color} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.06, 0.08, 16]} />
            <meshBasicMaterial color={st.color} transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// 2D Static High-Fidelity Topographic Fallback
function FallbackBasinVisual() {
  return (
    <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0c231a] via-[#061811] to-[#04120c] rounded-2xl border border-emerald-500/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 400 400">
          <circle cx="200" cy="200" r="180" stroke="#10b981" strokeWidth="1" fill="none" strokeDasharray="4 4" />
          <circle cx="200" cy="200" r="130" stroke="#10b981" strokeWidth="1.5" fill="none" />
          <path d="M 60 220 Q 150 180 200 210 T 340 190" stroke="#34d399" strokeWidth="2.5" fill="none" />
          <path d="M 120 150 Q 180 190 200 210" stroke="#059669" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      <div className="relative z-10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center shadow-emerald-glow">
          <div className="w-6 h-6 rounded-full bg-emerald-400 animate-ping opacity-75" />
        </div>
        <h4 className="text-ivory font-bold text-lg mb-1">Palar Basin Digital Twin</h4>
        <p className="text-xs text-stone-300 max-w-xs mb-4">
          Catchment Hydrological Monitoring: Ranipet • Ambur • Vaniyambadi • Vellore • Kanchipuram
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-card rounded-md border border-white/10 text-[11px] font-mono text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          7 Monitored River Nodes Active
        </div>
      </div>
    </div>
  );
}

export const BasinHero3D: React.FC = () => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <FallbackBasinVisual />;
  }

  return (
    <div className="w-full h-[420px] md:h-[500px] relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#071f16] to-[#04120c] border border-emerald-500/20 shadow-forest-lg">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 4.8], fov: 45 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 4, 3]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-4, -2, -2]} intensity={0.4} color="#10b981" />
        
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
          <BasinDigitalTwinModel />
        </Float>

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      </Canvas>

      {/* Floating Basin Coordinate HUD */}
      <div className="absolute top-4 left-4 pointer-events-none bg-surface-deep/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/[0.08]">
        <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          DIGITAL TWIN: PALAR RIVER BASIN
        </div>
        <p className="text-[10px] text-stone-400 font-mono mt-0.5">12.8° N, 79.1° E • 17,810 km² Catchment</p>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none bg-surface-deep/80 backdrop-blur-md px-3 py-2 rounded-lg border border-white/[0.08]">
        <div className="text-[10px] text-stone-300 font-mono text-right">Interactive 3D Mesh</div>
        <div className="text-[11px] text-emerald-300 font-mono text-right">Rotate to Inspect Basin Nodes</div>
      </div>
    </div>
  );
};
