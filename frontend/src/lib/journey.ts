import { lerp, smootherstep, smoothstep, clamp } from './geo';

export interface JourneyKey {
  id: string;
  p: number;
  lat: number;
  lon: number;
  dist: number;
  label: { en: string; ta: string };
}

export const JOURNEY_KEYS: JourneyKey[] = [
  { id: 'space', p: 0.0, lat: 16, lon: 42, dist: 5.2, label: { en: 'Space', ta: 'விண்வெளி' } },
  { id: 'earth', p: 0.14, lat: 18, lon: 68, dist: 3.1, label: { en: 'Earth', ta: 'பூமி' } },
  { id: 'asia', p: 0.28, lat: 24, lon: 84, dist: 2.3, label: { en: 'Asia', ta: 'ஆசியா' } },
  { id: 'india', p: 0.42, lat: 19, lon: 79, dist: 1.75, label: { en: 'India', ta: 'இந்தியா' } },
  { id: 'tamil-nadu', p: 0.56, lat: 11.8, lon: 78.9, dist: 1.38, label: { en: 'Tamil Nadu', ta: 'தமிழ்நாடு' } },
  { id: 'palar', p: 0.7, lat: 12.9, lon: 79.3, dist: 1.24, label: { en: 'Palar River Basin', ta: 'பாலாறு வடிநிலம்' } },
  { id: 'verified', p: 0.84, lat: 12.9, lon: 79.3, dist: 1.18, label: { en: 'Verified basin view', ta: 'சரிபார்க்கப்பட்ட வடிநிலக் காட்சி' } },
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
    reveal: smoothstep(0.82, 0.94, pp),
  };
}

export const stageProgress = (stageIndex: number) => JOURNEY_KEYS[stageIndex].p;
