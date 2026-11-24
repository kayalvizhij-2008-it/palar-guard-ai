import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from '../../context/LanguageContext';
import { Box, Compass } from 'lucide-react';

function TerrainBlockMesh() {
  const meshRef = useRef<THREE.Group>(null);

  // Smooth ambient rotation
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12;
    }
  });

  // Procedural isometric terrain block geometry with elevation displacement
  const { geometry, riverLine } = useMemo(() => {
    const geom = new THREE.BoxGeometry(2.4, 0.45, 1.8, 32, 4, 24);
    const pos = geom.attributes.position;

    // Displace top vertices to simulate Palar catchment topography and river valley
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      if (y > 0.1) {
        const x = pos.getX(i);
        const z = pos.getZ(i);

        // Valley equation along river channel (flowing from x=-1.0 to x=1.0)
        const riverZ = 0.3 * Math.sin(x * 2.5);
        const distToRiver = Math.abs(z - riverZ);

        // Hill elevation noise
        const hillElevation = 0.18 * Math.cos(x * 3) * Math.sin(z * 4) + 0.1;
        const valleyCarve = Math.min(distToRiver * 0.4, 0.22);
        pos.setY(i, y + hillElevation - (distToRiver < 0.2 ? 0.08 : 0));
      }
    }
    geom.computeVertexNormals();

    // Spline points for the glowing river running through the 3D block
    const curvePoints = [
      new THREE.Vector3(-1.1, 0.28, 0.3 * Math.sin(-1.1 * 2.5)),
      new THREE.Vector3(-0.6, 0.24, 0.3 * Math.sin(-0.6 * 2.5)),
      new THREE.Vector3(0.0, 0.22, 0.3 * Math.sin(0.0 * 2.5)),
      new THREE.Vector3(0.6, 0.19, 0.3 * Math.sin(0.6 * 2.5)),
      new THREE.Vector3(1.1, 0.17, 0.3 * Math.sin(1.1 * 2.5)),
    ];
    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const riverGeom = new THREE.TubeGeometry(curve, 32, 0.025, 8, false);

    return { geometry: geom, riverLine: riverGeom };
  }, []);

  return (
    <group ref={meshRef} position={[0, -0.1, 0]}>
      {/* Terrain Earth Block */}
      <mesh geometry={geometry}>
        <meshStandardMaterial
          color="#0d3f27"
          roughness={0.8}
          metalness={0.2}
          emissive="#041f13"
          emissiveIntensity={0.2}
          flatShading
        />
      </mesh>

      {/* River channel in glowing cyan */}
      <mesh geometry={riverLine}>
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Boundary highlight ring */}
      <mesh position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.1, 1.15, 32]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

interface BasinTerrain3DBlockProps {
  onOpen3D?: () => void;
}

export const BasinTerrain3DBlock: React.FC<BasinTerrain3DBlockProps> = ({ onOpen3D }) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-[#061e15] border border-white/[0.08] p-3.5 shadow-xl flex flex-col justify-between h-[210px] relative overflow-hidden group">
      {/* Header matching blueprint */}
      <div className="flex items-center justify-between z-10">
        <div>
          <h4 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('card_3d_title')}</span>
          </h4>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold block">
            17,810 km²
          </span>
        </div>
        <button
          onClick={onOpen3D}
          className="text-[11px] text-stone-300 hover:text-emerald-300 transition-colors font-medium flex items-center gap-1"
        >
          <span>{t('card_3d_btn')}</span>
        </button>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas camera={{ position: [2.2, 1.8, 2.4], fov: 42 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 5, 3]} intensity={1.5} color="#dcfce7" />
          <pointLight position={[-3, 2, -3]} intensity={0.5} color="#059669" />
          <TerrainBlockMesh />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        </Canvas>
      </div>

      {/* Tag */}
      <div className="z-10 text-[10px] text-stone-400 text-center font-mono">
        Digital Elevation Relief • Hydrography Network
      </div>
    </div>
  );
};
