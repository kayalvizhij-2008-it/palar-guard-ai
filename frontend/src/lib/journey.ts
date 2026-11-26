import { lerp, smootherstep, smoothstep, clamp } from './geo';

export interface JourneyKey {
  id: string;
  p: number;
  lat: number;
  lon: number;
  dist: number;
  label: { en: string; ta: string };
}

// Sequence: Space -> Earth -> Asia -> India -> South India -> Tamil Nadu -> Palar Basin -> Title reveal.
// Distances and scroll track bands are spaced cleanly so every geographic stage
// has generous dwell time and zero overlapping label windows.
export const JOURNEY_KEYS: JourneyKey[] = [
  { id: 'space',       p: 0.00, lat: 16.0,  lon: 44.0,  dist: 5.00, label: { en: 'Space',               ta: 'விண்வெளி' } },
  { id: 'earth',       p: 0.12, lat: 17.0,  lon: 68.0,  dist: 3.05, label: { en: 'Earth',               ta: 'பூமி' } },
  { id: 'asia',        p: 0.24, lat: 23.0,  lon: 82.0,  dist: 2.35, label: { en: 'Asia',                ta: 'ஆசியா' } },
  { id: 'india',       p: 0.37, lat: 21.0,  lon: 79.0,  dist: 1.92, label: { en: 'India',               ta: 'இந்தியா' } },
  { id: 'south-india', p: 0.50, lat: 12.2,  lon: 78.6,  dist: 1.54, label: { en: 'South India',         ta: 'தென் இந்தியா' } },
  { id: 'tamil-nadu',  p: 0.64, lat: 10.9,  lon: 78.5,  dist: 1.33, label: { en: 'Tamil Nadu',          ta: 'தமிழ்நாடு' } },
  { id: 'palar',       p: 0.78, lat: 12.82, lon: 79.05, dist: 1.22, label: { en: 'Palar River Basin',   ta: 'பாலாறு வடிநிலம்' } },
  { id: 'verified',    p: 0.94, lat: 12.82, lon: 79.05, dist: 1.19, label: { en: 'Verified basin view', ta: 'சரிபார்க்கப்பட்ட வடிநிலக் காட்சி' } },
];

export interface JourneySample {
  lat: number;
  lon: number;
  dist: number;
  stage: number;
  zoom: number;
  reveal: number;
}

export function sampleJourney(p: number): JourneySample {
  const last = JOURNEY_KEYS.length - 1;
  const pp = clamp(p, 0, 1);
  let i = 0;
  while (i < last - 1 && pp > JOURNEY_KEYS[i + 1].p) i++;
  const a = JOURNEY_KEYS[i];
  const b = JOURNEY_KEYS[Math.min(i + 1, last)];
  const span = b.p - a.p || 1;
  const t = pp >= JOURNEY_KEYS[last].p ? 1 : smootherstep((pp - a.p) / span);

  const dist = Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), t));
  const stage = pp >= JOURNEY_KEYS[last].p ? last : t > 0.5 ? i + 1 : i;
  const zoom =
    1 -
    (Math.log(dist) - Math.log(JOURNEY_KEYS[last].dist)) /
      (Math.log(JOURNEY_KEYS[0].dist) - Math.log(JOURNEY_KEYS[last].dist));

  return {
    lat: lerp(a.lat, b.lat, t),
    lon: lerp(a.lon, b.lon, t),
    dist,
    stage,
    zoom: clamp(zoom, 0, 1),
    // Starts only after Palar label fades out (0.87) and reaches 1.0 before Verified key (0.94)
    reveal: smoothstep(0.88, 0.935, pp),
  };
}

export const stageProgress = (stageIndex: number) => JOURNEY_KEYS[stageIndex].p;
