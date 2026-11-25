import * as THREE from 'three';

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const clamp01 = (v: number) => clamp(v, 0, 1);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
export const smootherstep = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};

/**
 * Latitude/longitude (degrees) -> point on a sphere built with THREE.SphereGeometry
 * and an equirectangular texture (u=0 is longitude -180°).
 * Derived from SphereGeometry's own vertex formula:
 *   x = cos(lat)·cos(lon),  y = sin(lat),  z = -cos(lat)·sin(lon)
 */
export function latLonToVector3(latDeg: number, lonDeg: number, radius = 1, out = new THREE.Vector3()) {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);
  const c = Math.cos(lat);
  return out.set(radius * c * Math.cos(lon), radius * Math.sin(lat), -radius * c * Math.sin(lon));
}

export interface ParsedGeoJson {
  /** Closed rings (polygon outlines) as [lon, lat] pairs */
  rings: [number, number][][];
  /** Open polylines (rivers etc.) as [lon, lat] pairs */
  lines: [number, number][][];
  /** Attribution read from properties.source / properties.name of the first feature, if present */
  source: string | null;
}

const validPair = (p: unknown): p is [number, number] =>
  Array.isArray(p) &&
  p.length >= 2 &&
  Number.isFinite(p[0]) &&
  Number.isFinite(p[1]) &&
  Math.abs(p[0] as number) <= 180 &&
  Math.abs(p[1] as number) <= 90;

const cleanPath = (path: unknown): [number, number][] | null => {
  if (!Array.isArray(path)) return null;
  const pts = path.filter(validPair).map((p) => [p[0], p[1]] as [number, number]);
  return pts.length >= 2 ? pts : null;
};

/** Defensive GeoJSON reader. Never invents geometry: returns empty arrays for anything it cannot validate. */
export function parseGeoJson(json: unknown): ParsedGeoJson {
  const result: ParsedGeoJson = { rings: [], lines: [], source: null };
  const features: any[] = [];
  const j = json as any;
  if (j?.type === 'FeatureCollection' && Array.isArray(j.features)) features.push(...j.features);
  else if (j?.type === 'Feature') features.push(j);
  else if (j?.type) features.push({ type: 'Feature', geometry: j, properties: {} });

  for (const f of features) {
    const g = f?.geometry;
    if (!g) continue;
    if (result.source === null) {
      const props = f.properties ?? {};
      result.source = props.source ?? props.name ?? null;
    }
    const addRing = (r: unknown) => {
      const c = cleanPath(r);
      if (c) result.rings.push(c);
    };
    const addLine = (r: unknown) => {
      const c = cleanPath(r);
      if (c) result.lines.push(c);
    };
    switch (g.type) {
      case 'Polygon':
        if (Array.isArray(g.coordinates)) addRing(g.coordinates[0]);
        break;
      case 'MultiPolygon':
        if (Array.isArray(g.coordinates)) g.coordinates.forEach((poly: unknown[]) => addRing(poly?.[0]));
        break;
      case 'LineString':
        addLine(g.coordinates);
        break;
      case 'MultiLineString':
        if (Array.isArray(g.coordinates)) g.coordinates.forEach(addLine);
        break;
      default:
        break;
    }
  }
  return result;
}
