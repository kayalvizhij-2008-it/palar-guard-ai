import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { useLanguage } from '../../context/LanguageContext';
import { clamp, latLonToVector3, lerp, parseGeoJson, smoothstep, ParsedGeoJson } from '../../lib/geo';
import { JOURNEY_KEYS, sampleJourney, stageProgress } from '../../lib/journey';
import {
  INDIA_OUTLINE,
  INDIA_STATE_RINGS,
  PALAR_BASIN_WRIS_RINGS,
  PALAR_RIVER_10M,
  SOUTH_ASIA_LAND_RINGS,
  SOUTH_INDIA_NEIGHBORS,
  SRI_LANKA_OUTLINE,
  TAMIL_NADU_OUTLINE,
} from '../../lib/geography';
import { PALAR_LOCATIONS } from '../../data/palarData';
import { useJourneyProgress, usePrefersReducedMotion, useWebGLSupport } from '../../hooks/useJourneyProgress';

type GeoState = { status: 'loading' | 'ready' | 'missing' | 'invalid'; data: ParsedGeoJson | null };

/* ------------------------------------------------------------------ */
/* Textures: cancel-safe loading, explicit disposal, honest fallback.   */
/* ------------------------------------------------------------------ */

const EARTH_MAP = '/textures/planets/earth_atmos_2048.jpg';
const CLOUD_MAP = '/textures/planets/earth_clouds_1024.png';
const NORMAL_MAP = '/textures/planets/earth_normal_2048.jpg';
const VERIFIED_BASIN_URL = '/data/palar-verified-basin.geojson';

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
            t.anisotropy = maxAnisotropy;
            t.minFilter = THREE.LinearFilter;
            t.magFilter = THREE.LinearFilter;
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
/* High-resolution Regional Cartographic Patch (South Asia / India)     */
/* Renders a 2048x2048 curved spherical mesh (60 px/degree) over       */
/* [64°E..98°E, 3°N..37°N] so coastlines, states, and Tamil Nadu stay  */
/* razor-sharp at close zoom instead of pixelating the global 2048 map.*/
/* ------------------------------------------------------------------ */

const PATCH_LON_MIN = 64;
const PATCH_LON_MAX = 98;
const PATCH_LAT_MIN = 3;
const PATCH_LAT_MAX = 37;

function SouthAsiaCrispPatch({
  earthMap,
  maxAnisotropy,
  coarsePointer,
  opacityRef,
}: {
  earthMap: THREE.Texture | null;
  maxAnisotropy: number;
  coarsePointer: boolean;
  opacityRef: React.MutableRefObject<number>;
}) {
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const geometry = useMemo(() => {
    const segs = 36;
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    const r = 1.0005;

    for (let iy = 0; iy <= segs; iy++) {
      const v = iy / segs;
      const lat = lerp(PATCH_LAT_MIN, PATCH_LAT_MAX, v);
      for (let ix = 0; ix <= segs; ix++) {
        const u = ix / segs;
        const lon = lerp(PATCH_LON_MIN, PATCH_LON_MAX, u);
        const vec = latLonToVector3(lat, lon, r);
        positions.push(vec.x, vec.y, vec.z);
        uvs.push(u, v);
      }
    }

    for (let iy = 0; iy < segs; iy++) {
      for (let ix = 0; ix < segs; ix++) {
        const a = iy * (segs + 1) + ix;
        const b = a + 1;
        const c = a + (segs + 1);
        const d = c + 1;
        indices.push(a, b, d, a, d, c);
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    g.setIndex(indices);
    return g;
  }, []);

  const texture = useMemo(() => {
    const size = coarsePointer ? 1024 : 2048;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const toX = (lon: number) => ((lon - PATCH_LON_MIN) / (PATCH_LON_MAX - PATCH_LON_MIN)) * size;
    const toY = (lat: number) => ((PATCH_LAT_MAX - lat) / (PATCH_LAT_MAX - PATCH_LAT_MIN)) * size;

    // 1. Base terrain: satellite relief cropped from earth_atmos_2048.jpg (if loaded) or deep forest tone
    ctx.fillStyle = '#0e291d';
    ctx.fillRect(0, 0, size, size);
    const img = earthMap?.image as HTMLImageElement | HTMLCanvasElement | undefined;
    if (img && (img as HTMLImageElement).width) {
      const iw = (img as HTMLImageElement).width;
      const ih = (img as HTMLImageElement).height;
      const sx = ((PATCH_LON_MIN + 180) / 360) * iw;
      const sw = ((PATCH_LON_MAX - PATCH_LON_MIN) / 360) * iw;
      const sy = ((90 - PATCH_LAT_MAX) / 180) * ih;
      const sh = ((PATCH_LAT_MAX - PATCH_LAT_MIN) / 180) * ih;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
      // Subtle forest-darkening glaze so border vectors & state typography pop cleanly
      ctx.fillStyle = 'rgba(5, 22, 16, 0.34)';
      ctx.fillRect(0, 0, size, size);
    }

    // 2. Razor-sharp 10m Ocean Mask: punch out Natural Earth 10m landmasses so coastal pixels never blur
    const oceanCanvas = document.createElement('canvas');
    oceanCanvas.width = size;
    oceanCanvas.height = size;
    const octx = oceanCanvas.getContext('2d');
    if (octx) {
      octx.fillStyle = '#061522';
      octx.fillRect(0, 0, size, size);
      octx.globalCompositeOperation = 'destination-out';
      octx.fillStyle = '#000000';
      for (const ring of SOUTH_ASIA_LAND_RINGS) {
        if (ring.length < 3) continue;
        octx.beginPath();
        ring.forEach(([lon, lat], i) => {
          const x = toX(lon);
          const y = toY(lat);
          if (i === 0) octx.moveTo(x, y);
          else octx.lineTo(x, y);
        });
        octx.closePath();
        octx.fill();
      }
      ctx.drawImage(oceanCanvas, 0, 0);
      oceanCanvas.width = 0;
      oceanCanvas.height = 0;
    }

    // 3. Subtle 2-degree GIS lat/lon graticule
    ctx.strokeStyle = 'rgba(164, 178, 169, 0.08)';
    ctx.lineWidth = Math.max(1, size / 2048);
    for (let lon = 66; lon <= 96; lon += 2) {
      const x = toX(lon);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.stroke();
    }
    for (let lat = 5; lat <= 35; lat += 2) {
      const y = toY(lat);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    }

    // 4. All Indian State Borders (subtle ivory hairlines baked cleanly at 2048x2048)
    ctx.strokeStyle = 'rgba(252, 251, 247, 0.24)';
    ctx.lineWidth = Math.max(1, size / 1400);
    for (const ring of INDIA_STATE_RINGS) {
      if (ring.length < 2) continue;
      ctx.beginPath();
      ring.forEach(([lon, lat], i) => {
        const x = toX(lon);
        const y = toY(lat);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    }

    // 5. Crisp Cartographic Labels for Orientation (baked directly on the map so zero HUD collisions)
    const scale = size / 2048;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const drawMapLabel = (
      text: string,
      lon: number,
      lat: number,
      fontSizePx: number,
      fillStyle: string,
      letterSpace = 2
    ) => {
      const x = toX(lon);
      const y = toY(lat);
      ctx.save();
      ctx.font = `600 ${Math.round(fontSizePx * scale)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      if ('letterSpacing' in ctx) {
        (ctx as any).letterSpacing = `${Math.round(letterSpace * scale)}px`;
      }
      ctx.lineWidth = Math.max(2, 4 * scale);
      ctx.strokeStyle = 'rgba(4, 18, 12, 0.85)';
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fillStyle;
      ctx.fillText(text, x, y);
      ctx.restore();
    };

    const LABEL_OVERRIDES: Record<string, [number, number]> = {
      'Kerala': [76.22, 9.68],
      'Andhra Pradesh': [78.88, 15.55],
      'Karnataka': [75.85, 14.55],
      'Telangana': [79.15, 17.85],
    };

    for (const n of SOUTH_INDIA_NEIGHBORS) {
      const [lx, ly] = LABEL_OVERRIDES[n.name] || n.labelPos;
      drawMapLabel(n.name.toUpperCase(), lx, ly, 15, 'rgba(203, 213, 206, 0.62)', 2);
    }
    drawMapLabel('SRI LANKA', 80.7, 7.8, 16, 'rgba(203, 213, 206, 0.56)', 3);
    drawMapLabel('BAY OF BENGAL', 84.5, 13.0, 19, 'rgba(125, 211, 252, 0.36)', 5);
    drawMapLabel('ARABIAN SEA', 73.2, 12.6, 19, 'rgba(125, 211, 252, 0.36)', 5);
    // Placed in central-south Tamil Nadu (well clear of Kerala and Palar Basin)
    drawMapLabel('TAMIL NADU', 78.75, 10.72, 23, 'rgba(209, 250, 229, 0.96)', 4);

    // 6. Smooth edge alpha fade so the regional patch blends imperceptibly into the global globe
    const mask = ctx.createRadialGradient(
      size * 0.5,
      size * 0.5,
      size * 0.25,
      size * 0.5,
      size * 0.5,
      size * 0.51
    );
    mask.addColorStop(0, 'rgba(255,255,255,1)');
    mask.addColorStop(0.62, 'rgba(255,255,255,0.92)');
    mask.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = 'source-over';

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, [earthMap, maxAnisotropy, coarsePointer]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => texture?.dispose(), [texture]);

  useFrame(() => {
    if (matRef.current) {
      matRef.current.opacity = opacityRef.current;
    }
  });

  if (!texture) return null;

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* 3D scene helpers                                                     */
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

/** Renders thick anti-aliased 3D geographic lines on the sphere surface using Three.js Line2 */
function SphereThickLines({
  paths,
  radius,
  color,
  linewidth,
  opacity,
  loop = false,
}: {
  paths: [number, number][][];
  radius: number;
  color: string;
  linewidth: number;
  opacity: number;
  loop?: boolean;
}) {
  const size = useThree((s) => s.size);

  const items = useMemo(() => {
    return paths
      .filter((p) => p.length >= 2)
      .map((path) => {
        const pts = loop && (path[0][0] !== path[path.length - 1][0] || path[0][1] !== path[path.length - 1][1])
          ? [...path, path[0]]
          : path;
        const flat: number[] = [];
        for (const [lon, lat] of pts) {
          const v = latLonToVector3(lat, lon, radius);
          flat.push(v.x, v.y, v.z);
        }
        const geom = new LineGeometry();
        geom.setPositions(flat);
        const mat = new LineMaterial({
          color: new THREE.Color(color).getHex(),
          linewidth,
          transparent: true,
          opacity,
          depthWrite: false,
          worldUnits: false,
        });
        mat.resolution.set(Math.max(1, size.width), Math.max(1, size.height));
        const line = new Line2(geom, mat);
        line.computeLineDistances();
        return { line, geom, mat };
      });
  }, [paths, radius, color, linewidth, loop]);

  useEffect(() => {
    items.forEach(({ mat }) => {
      mat.resolution.set(Math.max(1, size.width), Math.max(1, size.height));
    });
  }, [items, size.width, size.height]);

  useEffect(() => {
    items.forEach(({ mat }) => {
      mat.opacity = opacity;
    });
  }, [items, opacity]);

  useEffect(
    () => () =>
      items.forEach(({ geom, mat }) => {
        geom.dispose();
        mat.dispose();
      }),
    [items]
  );

  return (
    <>
      {items.map(({ line }) => (
        <primitive key={line.uuid} object={line} />
      ))}
    </>
  );
}

/** Filled polygon projected onto the sphere surface (regional spans). */
function SpherePolygon({
  ring,
  radius,
  color,
  opacity,
}: {
  ring: [number, number][];
  radius: number;
  color: string;
  opacity: number;
}) {
  const geometry = useMemo(() => {
    const closed =
      ring.length > 1 &&
      ring[0][0] === ring[ring.length - 1][0] &&
      ring[0][1] === ring[ring.length - 1][1];
    const pts = closed ? ring.slice(0, -1) : ring;
    const contour = pts.map(([lon, lat]) => new THREE.Vector2(lon, lat));
    const faces = THREE.ShapeUtils.triangulateShape(contour, []);
    const positions = new Float32Array(pts.length * 3);
    pts.forEach(([lon, lat], i) => {
      const v = latLonToVector3(lat, lon, radius);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setIndex(faces.flat());
    return g;
  }, [ring, radius]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
}

interface SceneProps {
  progressRef: React.MutableRefObject<number>;
  reduced: boolean;
  coarsePointer: boolean;
  basin: ParsedGeoJson | null;
  onStage: (i: number) => void;
  onTextureStatus: (s: EarthTextures['status']) => void;
  introRef: React.RefObject<HTMLDivElement>;
  titleRef: React.RefObject<HTMLDivElement>;
  railFillRef: React.RefObject<HTMLDivElement>;
  tamilNaduLabelRef: React.RefObject<HTMLDivElement>;
  indiaLabelRef: React.RefObject<HTMLDivElement>;
  southIndiaLabelRef: React.RefObject<HTMLDivElement>;
  palarLabelRef: React.RefObject<HTMLDivElement>;
}

function JourneyScene({
  progressRef,
  reduced,
  coarsePointer,
  basin,
  onStage,
  onTextureStatus,
  introRef,
  titleRef,
  railFillRef,
  tamilNaduLabelRef,
  indiaLabelRef,
  southIndiaLabelRef,
  palarLabelRef,
}: SceneProps) {
  const { camera, size, gl } = useThree();
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  const tex = useEarthTextures(maxAnisotropy);

  useEffect(() => onTextureStatus(tex.status), [tex.status, onTextureStatus]);

  const initialized = useRef(false);
  const smooth = useRef(0);
  const lastStage = useRef(-1);
  const earthMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const cloudMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const patchOpacityRef = useRef(0);

  const indiaGroupRef = useRef<THREE.Group>(null);
  const southGroupRef = useRef<THREE.Group>(null);
  const tamilNaduGroupRef = useRef<THREE.Group>(null);
  const palarBasinGroupRef = useRef<THREE.Group>(null);

  const atmoUniforms = useMemo(
    () => ({ uColor: { value: new THREE.Color('#8fd9c0') }, uIntensity: { value: 0.72 } }),
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

  // Verified 7 CGWB/TNPCB monitoring stations transformed to 3D sphere markers
  const stationMarkers = useMemo(() => {
    return PALAR_LOCATIONS.map((loc) => {
      const pos = latLonToVector3(loc.latitude, loc.longitude, 1.0036);
      const normal = pos.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      return { id: loc.id, pos, quat, isCritical: loc.risk_score > 70 };
    });
  }, []);

  useEffect(() => {
    if (earthMatRef.current) {
      earthMatRef.current.needsUpdate = true;
    }
  }, [tex.map, tex.normal]);

  // Stage indices matching JOURNEY_KEYS in journey.ts
  // 0=space, 1=earth, 2=asia, 3=india, 4=south-india, 5=tamil-nadu, 6=palar, 7=verified
  const INDIA_STAGE = 3;
  const SOUTH_INDIA_STAGE = 4;
  const TN_STAGE = 5;
  const PALAR_STAGE = 6;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const target = progressRef.current;
    if (!initialized.current) {
      smooth.current = target;
      initialized.current = true;
    } else {
      const k = reduced ? 1 : 1 - Math.exp(-dt * 6.5);
      smooth.current += (target - smooth.current) * k;
      if (Math.abs(target - smooth.current) < 1e-4) smooth.current = target;
    }

    const p = smooth.current;
    const s = sampleJourney(p);

    const aspect = size.width / Math.max(1, size.height);
    const f = aspect < 1 ? clamp(1 / aspect, 1, 1.85) : 1;
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

    // Restrained atmospheric rim and cloud fade: clear and sharp before reaching India
    atmoUniforms.uIntensity.value = 0.72 * (1 - smoothstep(0.25, 0.58, s.zoom));
    if (cloudMatRef.current) cloudMatRef.current.opacity = 0.32 * (1 - smoothstep(0.22, 0.52, s.zoom));
    if (cloudsRef.current && !reduced) cloudsRef.current.rotation.y += dt * 0.0025;

    // Fade in the 2048x2048 crisp regional cartography patch smoothly as we approach India
    patchOpacityRef.current = smoothstep(0.26, 0.44, s.zoom);

    if (indiaGroupRef.current) {
      indiaGroupRef.current.visible = s.stage >= INDIA_STAGE;
    }
    if (southGroupRef.current) {
      southGroupRef.current.visible = s.stage >= SOUTH_INDIA_STAGE;
    }
    if (tamilNaduGroupRef.current) {
      tamilNaduGroupRef.current.visible = s.stage >= SOUTH_INDIA_STAGE;
      const tnIntensity = s.stage >= TN_STAGE ? 1 : 0.45;
      tamilNaduGroupRef.current.children.forEach((child, idx) => {
        const mat = (child as THREE.Mesh).material as (THREE.Material & { opacity?: number }) | undefined;
        if (mat && typeof mat.opacity === 'number') {
          if (idx === 0) mat.opacity = tnIntensity * 0.24; // fill
          else if (idx === 1) mat.opacity = tnIntensity * 0.85; // dark casing
          else mat.opacity = tnIntensity; // bright emerald outline
        }
      });
    }
    if (palarBasinGroupRef.current) {
      palarBasinGroupRef.current.visible = s.stage >= PALAR_STAGE;
    }

    if (s.stage !== lastStage.current) {
      lastStage.current = s.stage;
      onStage(s.stage);
    }

    // Intro hero fades cleanly BEFORE Earth stage (p = 0.12) so globe is 100% unobstructed
    const introFade = 1 - smoothstep(0.01, 0.07, p);
    const intro = introRef.current;
    if (intro) {
      intro.style.opacity = String(introFade);
      intro.style.visibility = introFade > 0.02 ? 'visible' : 'hidden';
      intro.style.transform = reduced ? 'none' : `translateY(${(1 - introFade) * -20}px)`;
      intro.style.pointerEvents = introFade > 0.35 ? 'auto' : 'none';
    }

    const title = titleRef.current;
    if (title) {
      title.style.opacity = String(s.reveal);
      title.style.visibility = s.reveal > 0.02 ? 'visible' : 'hidden';
      title.style.transform = reduced ? 'none' : `translateY(${(1 - s.reveal) * 18}px)`;
    }
    if (railFillRef.current) railFillRef.current.style.transform = `scaleY(${p})`;

    // Strictly disjoint stage label windows — zero overlap between stages
    const fade = (from: number, to: number, outFrom: number, outTo: number) =>
      smoothstep(from, to, p) * (1 - smoothstep(outFrom, outTo, p));

    const indiaLabel = indiaLabelRef.current;
    if (indiaLabel) indiaLabel.style.opacity = String(fade(0.31, 0.35, 0.41, 0.44));

    const southLabel = southIndiaLabelRef.current;
    if (southLabel) southLabel.style.opacity = String(fade(0.45, 0.49, 0.55, 0.58));

    const tnLabel = tamilNaduLabelRef.current;
    if (tnLabel) tnLabel.style.opacity = String(fade(0.59, 0.63, 0.69, 0.72));

    const palarLabel = palarLabelRef.current;
    if (palarLabel) palarLabel.style.opacity = String(fade(0.73, 0.77, 0.84, 0.87));
  });

  // Verified Natural Earth 10m & India-WRIS C18PAL01–C18PAL29 paths
  const indiaPaths = useMemo(() => [INDIA_OUTLINE], []);
  const sriLankaPaths = useMemo(() => [SRI_LANKA_OUTLINE], []);
  const tamilNaduPaths = useMemo(() => [TAMIL_NADU_OUTLINE], []);

  const basinRings = useMemo(() => {
    if (basin && basin.rings.length > 0) return basin.rings;
    return PALAR_BASIN_WRIS_RINGS;
  }, [basin]);

  const riverLines = useMemo(() => {
    if (basin && basin.lines.length > 0) return basin.lines;
    return [PALAR_RIVER_10M];
  }, [basin]);

  return (
    <>
      {!reduced && <Stars radius={60} depth={30} count={700} factor={2.0} fade speed={0} />}
      <ambientLight intensity={0.62} />
      <directionalLight ref={sunRef} intensity={2.3} color="#fffdf5" />

      {/* Global 3D Earth */}
      <mesh>
        <sphereGeometry args={[1, 80, 80]} />
        <meshStandardMaterial
          key={tex.map ? 'earth-textured' : 'earth-fallback'}
          ref={earthMatRef}
          map={tex.map ?? undefined}
          normalMap={tex.normal ?? undefined}
          color={tex.map ? '#ffffff' : '#1f3d31'}
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>

      {/* High-Resolution South Asia / India / Tamil Nadu Regional Cartography (60 px/deg) */}
      <SouthAsiaCrispPatch
        earthMap={tex.map}
        maxAnisotropy={maxAnisotropy}
        coarsePointer={coarsePointer}
        opacityRef={patchOpacityRef}
      />

      {/* Subtle Clouds — fade out cleanly before India zoom */}
      {tex.clouds && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[1.006, 64, 64]} />
          <meshStandardMaterial
            ref={cloudMatRef}
            map={tex.clouds}
            color="#fcfbf7"
            transparent
            opacity={0.32}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      )}

      {/* Restrained Atmosphere rim */}
      <mesh>
        <sphereGeometry args={[1.042, 64, 64]} />
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

      {/* India national outline (Natural Earth 10m — aligns identically with Tamil Nadu 10m) */}
      <group ref={indiaGroupRef} visible={false}>
        <SphereThickLines
          paths={indiaPaths}
          radius={1.0014}
          color="#f3f1ea"
          linewidth={2.0}
          opacity={0.82}
          loop
        />
      </group>

      {/* Sri Lanka orientation outline for South India stage */}
      <group ref={southGroupRef} visible={false}>
        <SphereThickLines
          paths={sriLankaPaths}
          radius={1.0014}
          color="#85928a"
          linewidth={1.4}
          opacity={0.55}
          loop
        />
      </group>

      {/* Tamil Nadu state — highlighted cleanly in emerald over dark contrast casing */}
      <group ref={tamilNaduGroupRef} visible={false}>
        <SpherePolygon ring={TAMIL_NADU_OUTLINE} radius={1.0016} color="#10b981" opacity={0.24} />
        <SphereThickLines
          paths={tamilNaduPaths}
          radius={1.0021}
          color="#041810"
          linewidth={5.5}
          opacity={0.85}
          loop
        />
        <SphereThickLines
          paths={tamilNaduPaths}
          radius={1.0025}
          color="#34d399"
          linewidth={3.0}
          opacity={1.0}
          loop
        />
      </group>

      {/* Verified India-WRIS Palar River Basin (C18PAL01–C18PAL29) + Natural Earth 10m Palar River */}
      <group ref={palarBasinGroupRef} visible={false}>
        {basinRings.map((ring, idx) => (
          <SpherePolygon
            key={`basin-fill-${idx}`}
            ring={ring}
            radius={1.0028}
            color="#0891b2"
            opacity={0.26}
          />
        ))}
        <SphereThickLines
          paths={basinRings}
          radius={1.0031}
          color="#041810"
          linewidth={4.4}
          opacity={0.85}
          loop
        />
        <SphereThickLines
          paths={basinRings}
          radius={1.0033}
          color="#22d3ee"
          linewidth={2.4}
          opacity={0.98}
          loop
        />
        <SphereThickLines
          paths={riverLines}
          radius={1.0035}
          color="#041810"
          linewidth={4.8}
          opacity={0.9}
        />
        <SphereThickLines
          paths={riverLines}
          radius={1.0037}
          color="#38bdf8"
          linewidth={2.8}
          opacity={1.0}
        />
        {/* 7 Verified CGWB / TNPCB Monitoring Station Pins along the Palar River */}
        {stationMarkers.map((st) => (
          <group key={st.id} position={st.pos} quaternion={st.quat}>
            <mesh>
              <ringGeometry args={[0.0009, 0.00135, 24]} />
              <meshBasicMaterial color="#fcfbf7" transparent opacity={0.95} side={THREE.DoubleSide} />
            </mesh>
            <mesh>
              <circleGeometry args={[0.0008, 20]} />
              <meshBasicMaterial color={st.isCritical ? '#e11d48' : '#10b981'} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
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
  const [basin, setBasin] = useState<GeoState>({ status: 'loading', data: null });

  const introRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const railFillRef = useRef<HTMLDivElement>(null);
  const tamilNaduLabelRef = useRef<HTMLDivElement>(null);
  const indiaLabelRef = useRef<HTMLDivElement>(null);
  const southIndiaLabelRef = useRef<HTMLDivElement>(null);
  const palarLabelRef = useRef<HTMLDivElement>(null);

  const coarsePointer = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches,
    []
  );

  // Load verified India-WRIS + Natural Earth 10m Palar GeoJSON (falls back cleanly to bundled verified arrays)
  useEffect(() => {
    let cancelled = false;
    fetch(VERIFIED_BASIN_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (cancelled) return;
        if (!json) {
          setBasin({ status: 'missing', data: null });
          return;
        }
        const parsed = parseGeoJson(json);
        if (parsed.rings.length > 0 || parsed.lines.length > 0) {
          setBasin({ status: 'ready', data: parsed });
        } else {
          setBasin({ status: 'invalid', data: null });
        }
      })
      .catch(() => {
        if (!cancelled) setBasin({ status: 'missing', data: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
  const heightSvh = webgl === 'unavailable' ? 100 : reduced ? 480 : 720;

  const isIndiaStage = stage === 3;
  const isSouthIndiaStage = stage === 4;
  const isTamilNaduStage = stage === 5;
  const isPalarStage = stage === 6;

  const reveal = (
    <div
      ref={titleRef}
      className="absolute inset-x-0 bottom-[8svh] sm:bottom-[10svh] z-30 px-6 sm:px-20 text-center pointer-events-none"
      style={{
        opacity: webgl === 'unavailable' ? 1 : 0,
        visibility: webgl === 'unavailable' ? 'visible' : 'hidden',
      }}
    >
      <div className="mx-auto max-w-2xl rounded-3xl border border-[#10b981]/35 bg-[#04140d]/95 backdrop-blur-md px-6 py-6 sm:px-10 sm:py-7 shadow-2xl pointer-events-auto">
        <div className="inline-block rounded-full border border-[#d9c27a]/40 bg-[#061811] px-3.5 py-1 text-[11px] font-mono tracking-[0.24em] uppercase text-[#d9c27a] mb-3">
          {L('12.9°N, 79.3°E · PALAR RIVER BASIN · TAMIL NADU', '12.9°N, 79.3°E · பாலாறு வடிநிலம் · தமிழ்நாடு')}
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-semibold tracking-[0.06em] text-[#fcfbf7]">
          {t('app_title')}
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#d9c27a] tracking-wide max-w-xl mx-auto">
          {t('tagline')}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onExplore?.('dashboard')}
            className="rounded-full bg-[#10b981] hover:bg-[#059669] px-7 py-3 text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#041a11] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {t('explore_platform')}
          </button>
          <a
            href="#editorial"
            className="rounded-full border border-[#d9c27a]/55 bg-[#061811]/90 px-6 py-3 text-xs sm:text-sm tracking-widest uppercase text-[#fcfbf7] hover:bg-[#d9c27a]/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            {L('Read the Journey', 'பயணத்தைப் படிக்க')}
          </a>
        </div>
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
            dpr={[1, coarsePointer ? 1.25 : Math.min(window.devicePixelRatio, 2)]}
            camera={{ fov: 40, near: 0.01, far: 100, position: [0, 0, 5.0] }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            className="!absolute inset-0"
          >
            <ContextGuard onLost={onLost} onRestored={onRestored} />
            <JourneyScene
              progressRef={progressRef}
              reduced={reduced}
              coarsePointer={coarsePointer}
              basin={basin.data}
              onStage={setStage}
              onTextureStatus={setTexStatus}
              introRef={introRef}
              titleRef={titleRef}
              railFillRef={railFillRef}
              tamilNaduLabelRef={tamilNaduLabelRef}
              indiaLabelRef={indiaLabelRef}
              southIndiaLabelRef={southIndiaLabelRef}
              palarLabelRef={palarLabelRef}
            />
          </Canvas>
        )}

        {/* Top-left compact geographic context cards (strictly disjoint windows, never obscure map center) */}
        {webgl !== 'unavailable' && (
          <div
            ref={indiaLabelRef}
            aria-hidden
            className="absolute top-14 left-3 sm:top-5 sm:left-6 z-20 max-w-[260px] sm:max-w-xs pointer-events-none"
            style={{ opacity: 0 }}
          >
            <div className="rounded-xl border border-[#f3f1ea]/35 bg-[#04140d]/95 backdrop-blur-sm px-4 py-2.5 shadow-lg space-y-1">
              <div className="text-[11px] font-mono font-semibold tracking-[0.22em] uppercase text-[#fcfbf7]">
                {L('INDIA · SOUTH ASIA', 'இந்தியா · தென் ஆசியா')}
              </div>
              <div className="text-[10px] font-mono text-[#a4b2a9]">
                {L('Natural Earth 10m national boundary', 'Natural Earth 10m தேசிய எல்லை')}
              </div>
            </div>
          </div>
        )}

        {webgl !== 'unavailable' && (
          <div
            ref={southIndiaLabelRef}
            aria-live="polite"
            className="absolute top-14 left-3 sm:top-5 sm:left-6 z-20 max-w-[260px] sm:max-w-xs pointer-events-none"
            style={{ opacity: 0 }}
          >
            <div className="rounded-xl border border-[#a4b2a9]/40 bg-[#04140d]/95 backdrop-blur-sm px-4 py-2.5 shadow-lg space-y-1">
              <div className="text-[11px] font-mono font-semibold tracking-[0.22em] uppercase text-[#fcfbf7]">
                {L('SOUTH INDIA', 'தென் இந்தியா')}
              </div>
              <div className="text-[10px] font-mono text-[#a4b2a9]">
                {L('Peninsular states & Coromandel coast', 'தென்னிந்திய மாநிலங்கள் & கடற்கரை')}
              </div>
            </div>
          </div>
        )}

        {webgl !== 'unavailable' && (
          <div
            ref={tamilNaduLabelRef}
            aria-live="polite"
            className="absolute top-14 left-3 sm:top-5 sm:left-6 z-20 max-w-[295px] sm:max-w-sm pointer-events-none"
            style={{ opacity: 0 }}
          >
            <div className="rounded-xl border-2 border-[#10b981] bg-[#041810]/95 backdrop-blur-sm px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl space-y-1">
              <div className="text-xs sm:text-[13px] font-mono font-bold tracking-[0.22em] uppercase text-[#34d399]">
                {L('TAMIL NADU, INDIA', 'தமிழ்நாடு, இந்தியா')}
              </div>
              <div className="text-[10px] font-mono text-[#d1fae5]">
                {L('8.1°N–13.6°N · 76.2°E–80.4°E · 130,058 km²', '8.1°N–13.6°N · 76.2°E–80.4°E · 1,30,058 km²')}
              </div>
              <div className="text-[10px] text-[#a4b2a9]">
                {L('Palar Basin sits in northeastern Tamil Nadu', 'பாலாறு வடிநிலம் வடகிழக்கு தமிழ்நாட்டில் உள்ளது')}
              </div>
            </div>
          </div>
        )}

        {webgl !== 'unavailable' && (
          <div
            ref={palarLabelRef}
            aria-live="polite"
            className="absolute top-14 left-3 sm:top-5 sm:left-6 z-20 max-w-[300px] sm:max-w-sm pointer-events-none"
            style={{ opacity: 0 }}
          >
            <div className="rounded-xl border-2 border-[#22d3ee] bg-[#04161a]/95 backdrop-blur-sm px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-xl space-y-1">
              <div className="text-xs sm:text-[13px] font-mono font-bold tracking-[0.22em] uppercase text-[#22d3ee]">
                {L('PALAR RIVER BASIN', 'பாலாறு வடிநிலம்')}
              </div>
              <div className="text-[10px] font-mono text-[#cffafe]">
                {L('18,044 km² WRIS catchment · 7 monitoring stations', '18,044 km² WRIS நீர்ப்பிடிப்பு · 7 நிலையங்கள்')}
              </div>
              <div className="text-[10px] text-[#a4b2a9]">
                {L('Emerald: Tamil Nadu · Cyan: Palar Basin · Blue: Palar River', 'பச்சை: தமிழ்நாடு · நீலம்: பாலாறு வடிநிலம்')}
              </div>
            </div>
          </div>
        )}

        {/* Initial Viewport Centered Brand (fades before Earth stage so globe stays clear) */}
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

        {/* Bottom-left Stage Counter */}
        {webgl !== 'unavailable' && (
          <div className="absolute left-4 sm:left-6 bottom-5 sm:bottom-7 z-20 text-[#fcfbf7] max-w-[75vw] sm:max-w-sm pointer-events-none">
            <div className="font-mono text-xs tracking-[0.28em] text-[#d9c27a] tabular-nums">
              {String(stage + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </div>
            <div aria-live="polite" className="mt-1 text-xl sm:text-3xl font-serif">
              {current.label[lang]}
            </div>
            {isIndiaStage && (
              <div className="mt-2 rounded-lg border border-white/10 bg-[#061811]/85 px-3 py-1.5 text-[11px] text-[#a4b2a9]">
                {L('India — zooming toward South India', 'இந்தியா — தென் இந்தியாவை நோக்கி')}
              </div>
            )}
            {isSouthIndiaStage && (
              <div className="mt-2 rounded-lg border border-white/10 bg-[#061811]/85 px-3 py-1.5 text-[11px] text-[#a4b2a9]">
                {L('South India — Deccan plateau & peninsular coastline', 'தென் இந்தியா — தக்காண பீடபூமி & கடற்கரை')}
              </div>
            )}
            {isTamilNaduStage && (
              <div className="mt-2 rounded-lg border border-[#10b981]/35 bg-[#061811]/90 px-3 py-1.5 text-[11px] text-[#34d399]">
                {L('Tamil Nadu state boundary highlighted in emerald', 'தமிழ்நாடு மாநில எல்லை பச்சை நிறத்தில்')}
              </div>
            )}
            {isPalarStage && (
              <div className="mt-2 rounded-lg border border-[#22d3ee]/35 bg-[#061811]/90 px-3 py-1.5 text-[11px] text-[#22d3ee]">
                {L(
                  'India-WRIS Palar Basin boundary (cyan) & Palar River (blue)',
                  'India-WRIS பாலாறு வடிநில எல்லை & பாலாறு நதி'
                )}
              </div>
            )}
            {texStatus === 'failed' && (
              <div className="mt-2 max-w-xs text-xs text-amber-400">
                {L('Satellite texture could not be loaded.', 'செயற்கைக்கோள் படம் ஏற்றப்படவில்லை.')}
              </div>
            )}
          </div>
        )}

        {/* Right Vertical Stage Navigation Rail */}
        {webgl !== 'unavailable' && (
          <nav
            aria-label={L('Journey stages', 'பயண நிலைகள்')}
            className="absolute right-3 sm:right-5 top-1/2 z-40 -translate-y-1/2 flex flex-col items-end gap-3"
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
            className="absolute right-3 top-3 sm:right-4 sm:top-4 z-30 rounded-full border border-white/15 bg-[#061811]/90 px-3 py-1.5 text-[11px] tracking-widest uppercase text-[#a4b2a9] hover:text-[#fcfbf7] hover:border-[#d9c27a]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
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
