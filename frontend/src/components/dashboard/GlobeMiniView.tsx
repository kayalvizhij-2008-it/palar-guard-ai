import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from '../../context/LanguageContext';
import { ExternalLink, Globe } from 'lucide-react';

// Create procedural high-detail Earth texture
function createMiniEarthTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Deep space ocean
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
  oceanGrad.addColorStop(0, '#020b14');
  oceanGrad.addColorStop(0.5, '#051926');
  oceanGrad.addColorStop(1, '#020b12');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, width, height);

  const toX = (lng: number) => ((lng + 180) / 360) * width;
  const toY = (lat: number) => ((90 - lat) / 180) * height;

  // Continents in dark forest emerald
  ctx.fillStyle = '#0a2e1d';
  ctx.strokeStyle = '#105e38';
  ctx.lineWidth = 1.5;

  // Africa
  ctx.beginPath();
  ctx.ellipse(toX(20), toY(5), width * 0.08, height * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eurasia (Europe + Asia)
  ctx.beginPath();
  ctx.ellipse(toX(85), toY(45), width * 0.28, height * 0.26, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // India subcontinent
  ctx.fillStyle = '#0e422a';
  ctx.beginPath();
  ctx.moveTo(toX(70), toY(28));
  ctx.lineTo(toX(88), toY(26));
  ctx.lineTo(toX(78), toY(8));
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tamil Nadu & Palar radiant beacon
  ctx.fillStyle = '#10b981';
  ctx.shadowColor = '#34d399';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(toX(79.5), toY(12.8), 6, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function MiniEarthMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createMiniEarthTexture(), []);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.7}
          metalness={0.1}
          emissive="#062e1c"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Atmospheric Glow Ring */}
      <mesh scale={[1.58, 1.58, 1.58]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

interface GlobeMiniViewProps {
  onOpenGlobe?: () => void;
}

export const GlobeMiniView: React.FC<GlobeMiniViewProps> = ({ onOpenGlobe }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-3.5 shadow-xl flex flex-col justify-between h-[210px] relative overflow-hidden group">
      {/* Header matching blueprint */}
      <div className="flex items-center justify-between z-10">
        <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t('card_global_title')}</span>
        </h4>
        <button
          onClick={onOpenGlobe}
          className="text-[11px] text-stone-300 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1"
        >
          <span>{t('card_global_btn')}</span>
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [0, 0.4, 3.2], fov: 42 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 3, 5]} intensity={1.5} color="#e0f2fe" />
          <pointLight position={[-5, -3, -5]} intensity={0.4} color="#059669" />
          <MiniEarthMesh />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        </Canvas>
      </div>

      {/* Subtle bottom tag */}
      <div className="z-10 text-[10px] text-stone-400 text-center font-mono">
        Lat 12.8°N, Lng 79.2°E • Tamil Nadu, India
      </div>
    </div>
  );
};
