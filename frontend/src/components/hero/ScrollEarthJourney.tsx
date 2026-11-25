import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from '../../context/LanguageContext';
import { clamp, latLonToVector3, smoothstep, ParsedGeoJson } from '../../lib/geo';
import { JOURNEY_KEYS, sampleJourney, stageProgress } from '../../lib/journey';
import { useJourneyProgress, usePrefersReducedMotion, useWebGLSupport } from '../../hooks/useJourneyProgress';

type GeoState = { status: 'loading' | 'ready' | 'missing' | 'invalid'; data: ParsedGeoJson | null };

/* ------------------------------------------------------------------ */
/* Textures: cancel-safe loading, explicit disposal, honest fallback.   */
/* ------------------------------------------------------------------ */

const EARTH_MAP = '/textures/planets/earth_atmos_2048.jpg';
const CLOUD_MAP = '/textures/planets/earth_clouds_1024.png';
const NORMAL_MAP = '/textures/planets/earth_normal_2048.jpg';

interface EarthTextures {
  status: 'loading' | 'ready' | 'failed';
  map: THREE.Texture | null;
  clouds: THREE.Texture | null;
  normal: THREE.Texture | null;
}

function useEarthTextures(maxAnisotropy: number): EarthTextures {
  const [state, setState] = useState<EarthTextures>({
    status: 'loading',
    map: null,
    clouds: null,
    normal: null,
  });

  useEffect(() => {
    let cancelled = false;
    const loaded: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();

    const load = (url: string, isColor = true) =>
      new Promise<THREE.Texture | null>((resolve) =>
        loader.load(
          url,
          (t) => {
            if (isColor) t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = Math.min(8, maxAnisotropy);
            t.needsUpdate = true;
            loaded.push(t);
            resolve(t);
          },
          undefined,
          () => resolve(null)
        )
      );

    Promise.all([load(EARTH_MAP, true), load(CLOUD_MAP, false), load(NORMAL_MAP, false)]).then(
      ([map, clouds, normal]) => {
        if (cancelled) return;
        setState({
          status: map ? 'ready' : 'failed',
          map,
          clouds,
          normal,
        });
      }
    );

    return () => {
      cancelled = true;
      loaded.forEach((t) => t.dispose());
    };
  }, [maxAnisotropy]);

  return state;
}

/* ------------------------------------------------------------------ */
/* 3D scene                                                             */
/* ------------------------------------------------------------------ */

const ATMO_VERT = /* glsl */ `
varying vec3 vN;
void main() {
  vN = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const ATMO_FRAG = /* glsl */ `
varying vec3 vN;
uniform vec3 uColor;
uniform float uIntensity;
void main() {
  float i = pow(0.65 - dot(vN, vec3(0.0, 0.0, 1.0)), 4.0);
  gl_FragColor = vec4(uColor, 1.0) * i * uIntensity;
}`;

function ContextGuard({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const el = gl.domElement;
    const lost = (e: Event) => {
      e.preventDefault();
      onLost();
    };
    el.addEventListener('webglcontextlost', lost, false);
    el.addEventListener('webglcontextrestored', onRestored, false);
    return () => {
      el.removeEventListener('webglcontextlost', lost, false);
      el.removeEventListener('webglcontextrestored', onRestored, false);
    };
  }, [gl, onLost, onRestored]);
  return null;
}

function OverlayLines({ geo, radius }: { geo: ParsedGeoJson | null; radius: number }) {
  const objects = useMemo(() => {
    if (!geo) return [] as THREE.Line[];
    const mk = (path: [number, number][], loop: boolean, color: string, opacity: number) => {
      const pts = path.map(([lon, lat]) => latLonToVector3(lat, lon, radius));
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      return loop ? new THREE.LineLoop(g, m) : new THREE.Line(g, m);
    };
    return [
      ...geo.rings.map((r) => mk(r, true, '#d9c27a', 0.95)),
      ...geo.lines.map((l) => mk(l, false, '#34d399', 0.9)),
    ];
  }, [geo, radius]);

  useEffect(
    () => () =>
      objects.forEach((o) => {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }),
    [objects]
  );

  return (
    <>
      {objects.map((o) => (
        <primitive key={o.uuid} object={o} />
      ))}
    </>
  );
}

interface SceneProps {
  progressRef: React.MutableRefObject<number>;
  reduced: boolean;
  basin: ParsedGeoJson | null;
  river: ParsedGeoJson | null;
  onStage: (i: number) => void;
  onTextureStatus: (s: EarthTextures['status']) => void;
  introRef: React.RefObject<HTMLDivElement>;
  titleRef: React.RefObject<HTMLDivElement>;
  railFillRef: React.RefObject<HTMLDivElement>;
}

function JourneyScene({
  progressRef,
  reduced,
  basin,
  river,
  onStage,
  onTextureStatus,
  introRef,
  titleRef,
  railFillRef,
}: SceneProps) {
  const { camera, size, gl } = useThree();
  const tex = useEarthTextures(gl.capabilities.getMaxAnisotropy());

  useEffect(() => onTextureStatus(tex.status), [tex.status, onTextureStatus]);

  const initialized = useRef(false);
  const smooth = useRef(0);
  const lastStage = useRef(-1);
  const earthMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cloudMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const overlayRef = useRef<THREE.Group>(null);
  const atmoUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#8fd9c0') }, uIntensity: { value: 1 } }),
    []
  );
  const tmp = useMemo(
    () => ({
      dir: new THREE.Vector3(),
      side: new THREE.Vector3(),
      up: new THREE.Vector3(0, 1, 0),
      sun: new THREE.Vector3(),
    }),
    []
  );

  // Exact verified Palar monitoring corridor center point (12.9°N, 79.3°E)
  const palarPoint = useMemo(() => latLonToVector3(12.9, 79.3, 1.004), []);
  const palarQuat = useMemo(() => {
    const normal = palarPoint.clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  }, [palarPoint]);

  // Force shader recompile when async texture maps resolve
  useEffect(() => {
    if (earthMatRef.current) {
      earthMatRef.current.needsUpdate = true;
    }
  }, [tex.map, tex.normal]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const target = progressRef.current;
    if (!initialized.current) {
      smooth.current = target;
      initialized.current = true;
    } else {
      const k = reduced ? 1 : 1 - Math.exp(-dt * 5.5);
      smooth.current += (target - smooth.current) * k;
      if (Math.abs(target - smooth.current) < 1e-4) smooth.current = target;
    }

    const p = smooth.current;
    const s = sampleJourney(p);

    const aspect = size.width / Math.max(1, size.height);
    const f = aspect < 1 ? clamp(1 / aspect, 1, 2) : 1;
    latLonToVector3(s.lat, s.lon, 1 + (s.dist - 1) * f, camera.position);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    if (sunRef.current) {
      const b = smoothstep(0.15, 0.5, s.zoom);
      tmp.dir.copy(camera.position).normalize();
      tmp.side.crossVectors(tmp.up, tmp.dir).normalize();
      tmp.sun
        .copy(tmp.dir)
        .multiplyScalar(0.35 + 0.65 * b)
        .addScaledVector(tmp.side, 1.1 * (1 - b))
        .addScaledVector(tmp.up, 0.35)
        .multiplyScalar(10);
      sunRef.current.position.copy(tmp.sun);
    }

    atmoUniforms.uIntensity.value = 1 - 0.78 * smoothstep(0.35, 0.85, s.zoom);
    if (cloudMatRef.current) cloudMatRef.current.opacity = 0.42 * (1 - smoothstep(0.45, 0.8, s.zoom));
    if (cloudsRef.current && !reduced) cloudsRef.current.rotation.y += dt * 0.003;
    if (overlayRef.current) overlayRef.current.visible = s.stage >= 4;

    if (s.stage !== lastStage.current) {
      lastStage.current = s.stage;
      onStage(s.stage);
    }

    const introFade = 1 - smoothstep(0.02, 0.16, p);
    const intro = introRef.current;
    if (intro) {
      intro.style.opacity = String(introFade);
      intro.style.transform = reduced ? 'none' : `translateY(${(1 - introFade) * -28}px)`;
      intro.style.pointerEvents = introFade > 0.35 ? 'auto' : 'none';
    }

    const title = titleRef.current;
    if (title) {
      title.style.opacity = String(s.reveal);
      title.style.transform = reduced ? 'none' : `translateY(${(1 - s.reveal) * 24}px)`;
      title.style.pointerEvents = s.reveal > 0.5 ? 'auto' : 'none';
    }
    if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${p})`;
  });

  return (
    <>
      {!reduced && <Stars radius={60} depth={30} count={900} factor={2.2} fade speed={0} />}
      <ambientLight intensity={0.45} />
      <directionalLight ref={sunRef} intensity={2.2} color="#fffaf0" />

      {/* Earth (keyed on map presence so Three.js always binds the loaded satellite texture) */}
      <mesh>
        <sphereGeometry args={[1, 72, 72]} />
        <meshStandardMaterial
          key={tex.map ? 'earth-textured' : 'earth-fallback'}
          ref={earthMatRef}
          map={tex.map ?? undefined}
          normalMap={tex.normal ?? undefined}
          color={tex.map ? '#ffffff' : '#1f3d31'}
          roughness={0.85}
          metalness={0.05}
        />
      </mesh>

      {/* Subtle Clouds using RGBA alpha channel from earth_clouds_1024.png */}
      {tex.clouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.006, 64, 64]} />
          <meshStandardMaterial
            ref={cloudMatRef}
            map={tex.clouds}
            color="#fcfbf7"
            transparent
            opacity={0.45}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      )}

      {/* Atmosphere rim */}
      <mesh>
        <sphereGeometry args={[1.045, 64, 64]} />
        <shaderMaterial
          uniforms={atmoUniforms}
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          side={THREE.BackSide}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Palar Reference Pin + Verified GeoJSON Overlay (only when files exist) */}
      <group ref={overlayRef} visible={false}>
        <group position={palarPoint} quaternion={palarQuat}>
          <mesh>
            <ringGeometry args={[0.0045, 0.0065, 32]} />
            <meshBasicMaterial color="#d9c27a" transparent opacity={0.95} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.0022, 24]} />
            <meshBasicMaterial color="#10b981" side={THREE.DoubleSide} />
          </mesh>
        </group>
        <OverlayLines geo={basin} radius={1.0015} />
        <OverlayLines geo={river} radius={1.002} />
      </group>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Page section                                                         */
/* ------------------------------------------------------------------ */

interface Props {
  onExplore?: (view?: string) => void;
}

export const ScrollEarthJourney: React.FC<Props> = ({ onExplore }) => {
  const { lang, t } = useLanguage();
  const L = (en: string, ta: string) => (lang === 'ta' ? ta : en);

  const reduced = usePrefersReducedMotion();
  const webgl = useWebGLSupport();
  const { containerRef, progressRef, scrollToProgress } = useJourneyProgress();

  const [stage, setStage] = useState(0);
  const [visible, setVisible] = useState(true);
  const [canvasKey, setCanvasKey] = useState(0);
  const [contextLost, setContextLost] = useState(false);
  const [texStatus, setTexStatus] = useState<EarthTextures['status']>('loading');

  const introRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const basin: GeoState = { status: 'missing', data: null };
  const river: GeoState = { status: 'missing', data: null };

  const coarsePointer = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches,
    []
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let inView = true;
    let tabVisible = !document.hidden;
    const apply = () => setVisible(inView && tabVisible);
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        apply();
      },
      { threshold: 0 }
    );
    io.observe(el);
    const onVis = () => {
      tabVisible = !document.hidden;
      apply();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [containerRef]);

  const onLost = useCallback(() => setContextLost(true), []);
  const onRestored = useCallback(() => {
    setContextLost(false);
    setCanvasKey((k) => k + 1);
  }, []);

  const jump = (i: number) => scrollToProgress(stageProgress(i), !reduced);
  const total = JOURNEY_KEYS.length;
  const current = JOURNEY_KEYS[stage];
  const showBoundaryNote = stage >= 5;
  const heightSvh = webgl === 'unavailable' ? 100 : reduced ? 420 : 560;

  const boundaryNote =
    basin.status === 'ready'
      ? `${L('Boundary', 'எல்லை')}: ${basin.data?.source ?? L('Verified Dataset', 'சரிபார்க்கப்பட்ட தரவு')}`
      : '';

  const reveal = (
    <div
      ref={titleRef}
      className="absolute inset-x-0 bottom-[14svh] sm:bottom-[14svh] z-20 px-8 sm:px-36 lg:px-44 text-center"
      style={{
        opacity: webgl === 'unavailable' ? 1 : 0,
        pointerEvents: webgl === 'unavailable' ? 'auto' : 'none',
      }}
    >
      <div className="inline-block rounded-full border border-[#d9c27a]/35 bg-[#061811]/85 px-3.5 py-1 text-[11px] font-mono tracking-[0.24em] uppercase text-[#d9c27a] mb-4">
        {L('12.9°N, 79.3°E · PALAR RIVER BASIN', '12.9°N, 79.3°E · பாலாறு வடிநிலம்')}
      </div>
      <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[0.06em] text-[#fcfbf7] drop-shadow-sm">
        {t('app_title')}
      </h2>
      <p className="mt-4 text-sm sm:text-lg text-[#d9c27a] tracking-wide max-w-2xl mx-auto">
        {t('tagline')}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => onExplore?.('dashboard')}
          className="rounded-full bg-[#10b981] hover:bg-[#059669] px-7 py-3 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#041a11] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {t('explore_platform')}
        </button>
        <a
          href="#journey-story"
          className="rounded-full border border-[#d9c27a]/55 bg-[#061811]/80 px-6 py-3 text-xs sm:text-sm tracking-widest uppercase text-[#fcfbf7] hover:bg-[#d9c27a]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          {L('Read the Journey', 'பயணத்தைப் படிக்க')}
        </a>
      </div>
    </div>
  );

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      aria-label={L(
        'Scroll journey from space to the Palar River Basin',
        'விண்வெளியிலிருந்து பாலாறு வடிநிலம் வரை உருட்டும் பயணம்'
      )}
      className="relative w-full bg-transparent"
      style={{ height: `${heightSvh}svh` }}
    >
      <div className="sticky top-16 h-[calc(100svh-4rem)] w-full overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-10 bg-gradient-to-t from-[#030b08] to-transparent"
        />
        {webgl === 'ok' && (
          <Canvas
            key={canvasKey}
            frameloop={visible ? 'always' : 'never'}
            dpr={[1, coarsePointer ? 1 : 1.5]}
            camera={{ fov: 40, near: 0.01, far: 100, position: [0, 0, 5.2] }}
            gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
            className="!absolute inset-0"
          >
            <ContextGuard onLost={onLost} onRestored={onRestored} />
            <JourneyScene
              progressRef={progressRef}
              reduced={reduced}
              basin={basin.data}
              river={river.data}
              onStage={setStage}
              onTextureStatus={setTexStatus}
              introRef={introRef}
              titleRef={titleRef}
              railFillRef={railFillRef}
            />
          </Canvas>
        )}

        {/* Exact Initial Viewport Centered Brand (fades gently when visitor scrolls down, reverses smoothly back to top) */}
        {webgl !== 'unavailable' && (
          <div
            ref={introRef}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 sm:px-24 text-center pointer-events-auto"
          >
            <div className="rounded-3xl bg-[radial-gradient(ellipse_at_center,rgba(3,11,8,0.68)_0%,rgba(3,11,8,0.28)_62%,transparent_100%)] px-6 py-6 sm:px-10 sm:py-8 max-w-3xl">
              <div className="inline-block rounded-full border border-[#d9c27a]/40 bg-[#061811]/85 px-3.5 py-1 text-[11px] font-mono tracking-[0.22em] uppercase text-[#d9c27a] mb-4">
                {L('PALAR RIVER BASIN · TAMIL NADU', 'பாலாறு நதிப்படுகை · தமிழ்நாடு')}
              </div>
              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[0.06em] text-[#fcfbf7] drop-shadow-[0_6px_28px_rgba(0,0,0,0.85)]">
                {t('app_title')}
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-lg lg:text-xl text-[#d9c27a] tracking-wide max-w-2xl mx-auto">
                {t('tagline')}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onExplore?.('dashboard')}
                  className="rounded-full bg-[#10b981] hover:bg-[#059669] px-7 py-3 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#041a11] transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {t('explore_platform')}
                </button>
                <a
                  href="#editorial"
                  className="rounded-full border border-[#d9c27a]/55 bg-[#061811]/85 px-6 py-3 text-xs sm:text-sm tracking-widest uppercase text-[#fcfbf7] hover:bg-[#d9c27a]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  {L('Read the Journey', 'பயணத்தைப் படிக்க')}
                </a>
              </div>
            </div>
          </div>
        )}

        {webgl === 'unavailable' && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, #1f4d3a 0%, #0c2a1e 28%, #061811 55%, #020905 80%)',
            }}
          />
        )}

        {webgl !== 'unavailable' && (
          <div className="absolute left-4 sm:left-6 bottom-6 sm:bottom-8 z-20 text-[#fcfbf7] max-w-[75vw] sm:max-w-sm pointer-events-none">
            <div className="font-mono text-xs tracking-[0.28em] text-[#d9c27a] tabular-nums">
              {String(stage + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </div>
            <div aria-live="polite" className="mt-1 text-xl sm:text-3xl font-serif">
              {current.label[lang]}
            </div>
            {showBoundaryNote && boundaryNote && (
              <div className="mt-2 rounded-lg border border-white/10 bg-[#061811]/85 px-3 py-2 text-[11px] text-[#a4b2a9]">
                {boundaryNote}
              </div>
            )}
            {texStatus === 'failed' && (
              <div className="mt-2 max-w-xs text-xs text-amber-400">
                {L('Satellite texture could not be loaded.', 'செயற்கைக்கோள் படம் ஏற்றப்படவில்லை.')}
              </div>
            )}
          </div>
        )}

        {webgl !== 'unavailable' && (
          <nav
            aria-label={L('Journey stages', 'பயண நிலைகள்')}
            className="absolute right-3 sm:right-5 top-1/2 z-20 -translate-y-1/2 flex flex-col items-end gap-3"
          >
            <div className="absolute right-[5px] top-0 bottom-0 w-px bg-white/10">
              <div
                ref={railFillRef}
                className="h-full w-px origin-top bg-[#d9c27a]"
                style={{ transform: 'scaleY(0)' }}
              />
            </div>
            {JOURNEY_KEYS.map((k, i) => (
              <button
                key={k.id}
                type="button"
                onClick={() => jump(i)}
                aria-label={k.label[lang]}
                aria-current={i === stage ? 'step' : undefined}
                className="group relative flex items-center gap-3 focus:outline-none"
              >
                <span
                  className={`hidden sm:block text-[11px] tracking-wider transition-opacity ${
                    i === stage
                      ? 'opacity-100 text-[#fcfbf7]'
                      : 'opacity-0 group-hover:opacity-80 group-focus-visible:opacity-80 text-[#a4b2a9]'
                  }`}
                >
                  {k.label[lang]}
                </span>
                <span
                  className={`relative h-[11px] w-[11px] rounded-full border ${
                    i <= stage ? 'bg-[#d9c27a] border-[#d9c27a]' : 'bg-[#020905] border-white/30'
                  } group-focus-visible:ring-2 group-focus-visible:ring-emerald-400`}
                />
              </button>
            ))}
          </nav>
        )}

        {webgl !== 'unavailable' && stage === 0 && (
          <div className="absolute inset-x-0 bottom-16 sm:bottom-8 z-20 text-center text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#d9c27a] pointer-events-none">
            {L('SCROLL TO EXPLORE', 'கீழே உருட்டி ஆராயுங்கள்')}
          </div>
        )}
        {webgl !== 'unavailable' && (
          <button
            type="button"
            onClick={() => scrollToProgress(1, false)}
            className="absolute right-4 top-4 z-20 rounded-full border border-white/15 bg-[#061811]/85 px-3 py-1.5 text-[11px] tracking-widest uppercase text-[#a4b2a9] hover:text-[#fcfbf7] hover:border-[#d9c27a]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {L('Skip to title', 'தலைப்புக்குச் செல்')}
          </button>
        )}

        {contextLost && (
          <div
            role="status"
            className="absolute inset-x-0 top-20 z-30 mx-auto w-fit rounded bg-black/80 border border-amber-500/40 px-4 py-2 text-xs text-amber-300"
          >
            {L('Graphics context lost; restoring…', 'வரைகலை இணைப்பு துண்டிக்கப்பட்டது; மீட்டெடுக்கிறது…')}{' '}
            <button
              type="button"
              className="underline ml-2"
              onClick={() => {
                setContextLost(false);
                setCanvasKey((k) => k + 1);
              }}
            >
              {L('Reload scene', 'காட்சியை மீண்டும் ஏற்று')}
            </button>
          </div>
        )}

        {reveal}
      </div>
    </section>
  );
};

export default ScrollEarthJourney;
