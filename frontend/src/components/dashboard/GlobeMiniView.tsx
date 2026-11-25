import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from '../../context/LanguageContext';
import { latLonToVector3 } from '../../lib/geo';
import { Globe } from 'lucide-react';

const EARTH_MAP = '/textures/planets/earth_atmos_2048.jpg';
const CLOUD_MAP = '/textures/planets/earth_clouds_1024.png';
const FOCUS = { lat: 12.9, lon: 79.3 };

function useTextures() {
  const [state, setState] = useState<{
    map: THREE.Texture | null;
    clouds: THREE.Texture | null;
    done: boolean;
  }>({ map: null, clouds: null, done: false });

  useEffect(() => {
    let cancelled = false;
    const loaded: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();

    const loadTex = (url: string, isColor: boolean) =>
      new Promise<THREE.Texture | null>((resolve) =>
        loader.load(
          url,
          (tx) => {
            tx.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
            tx.anisotropy = 4;
            loaded.push(tx);
            resolve(tx);
          },
          undefined,
          () => resolve(null)
        )
      );

    Promise.all([loadTex(EARTH_MAP, true), loadTex(CLOUD_MAP, false)]).then(([map, clouds]) => {
      if (!cancelled) setState({ map, clouds, done: true });
    });

    return () => {
      cancelled = true;
      loaded.forEach((x) => x.dispose());
    };
  }, []);

  return state;
}

const VERT = `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
const FRAG = `varying vec3 vN; uniform vec3 uColor; void main(){ float i = pow(0.62 - dot(vN, vec3(0.,0.,1.)), 4.0); gl_FragColor = vec4(uColor,1.0)*i*0.9; }`;

function Earth({ onStatus }: { onStatus: (ok: boolean) => void }) {
  const tex = useTextures();
  const clouds = useRef<THREE.Mesh>(null);
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color('#8fd9c0') } }), []);
  const marker = useMemo(() => latLonToVector3(FOCUS.lat, FOCUS.lon, 1.012), []);

  useEffect(() => {
    if (tex.done) onStatus(!!tex.map);
  }, [tex.done, tex.map, onStatus]);

  useFrame((_, d) => {
    if (clouds.current) clouds.current.rotation.y += Math.min(d, 0.1) * 0.01;
  });

  return (
    <group>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          key={tex.map ? 'mini-textured' : 'mini-fallback'}
          map={tex.map ?? undefined}
          color={tex.map ? '#ffffff' : '#1f3d31'}
          roughness={0.92}
          metalness={0}
        />
      </mesh>
      {tex.clouds && (
        <mesh ref={clouds}>
          <sphereGeometry args={[1.007, 48, 48]} />
          <meshStandardMaterial
            map={tex.clouds}
            color="#fcfbf7"
            transparent
            opacity={0.42}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      )}
      <mesh>
        <sphereGeometry args={[1.05, 48, 48]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={marker}>
        <sphereGeometry args={[0.014, 12, 12]} />
        <meshBasicMaterial color="#d9c27a" />
      </mesh>
    </group>
  );
}

interface GlobeMiniViewProps {
  onOpenGlobe?: () => void;
}

export const GlobeMiniView: React.FC<GlobeMiniViewProps> = ({ onOpenGlobe }) => {
  const { t, lang } = useLanguage();
  const [texOk, setTexOk] = useState(true);
  const cam = useMemo(() => latLonToVector3(14, 76, 3.25).toArray() as [number, number, number], []);

  return (
    <div className="rounded-2xl bg-[#071c15] border border-white/[0.08] p-3.5 shadow-xl flex flex-col justify-between h-[220px] relative overflow-hidden group">
      <div className="flex items-center justify-between z-10">
        <h4 className="text-xs font-bold text-[#fcfbf7] tracking-wide flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span>{t('card_global_title')}</span>
        </h4>
        <button
          type="button"
          onClick={onOpenGlobe}
          className="text-[11px] text-stone-300 hover:text-teal-300 transition-colors font-medium flex items-center gap-1"
        >
          <span>{t('card_global_btn')}</span>
        </button>
      </div>

      <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: cam, fov: 38, near: 0.1, far: 50 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
        >
          <ambientLight intensity={0.42} />
          <directionalLight position={[4, 2, 5]} intensity={2.2} color="#fffaf0" />
          <Earth onStatus={setTexOk} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} rotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="z-10 text-[10px] text-stone-400 text-center font-mono tabular-nums">
        {texOk
          ? `${lang === 'ta' ? 'பாலாறு வடிநிலப் பகுதி' : 'Palar basin region'} · ~12.9°N, 79.3°E`
          : lang === 'ta'
          ? 'செயற்கைக்கோள் படம் ஏற்றப்படவில்லை'
          : 'Satellite texture unavailable'}
      </div>
    </div>
  );
};
