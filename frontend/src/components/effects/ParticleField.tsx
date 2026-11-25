import React, { useEffect, useRef } from 'react';

/**
 * Shared Originkit-inspired flowing snowfall + ambient bokeh atmosphere canvas.
 * - Mounted once in App.tsx behind all landing and dashboard pages (fixed, pointer-events: none, z-0).
 * - Preserves the Originkit continuous snowfall trajectory & sway physics alongside
 *   soft environmental dust, shimmering micro-flakes, and subtle depth bokeh orbs.
 * - Adapts density & frame interval on mobile/low-memory laptops, pauses when hidden,
 *   and renders a calm static atmospheric frame under prefers-reduced-motion.
 */

interface Flake {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  phase: number;
  sway: number;
  alpha: number;
  driftSign: 1 | -1;
  colorIdx: number;
  isOrb: boolean;
}

const BRAND_COLORS: [number, number, number][] = [
  [255, 255, 255], // pure snowlight white
  [252, 251, 247], // warm ivory
  [167, 243, 208], // soft emerald mist
  [165, 243, 252], // hydrology cyan mist
  [234, 217, 162], // champagne shimmer
];

function createOrbSprite(r: number, g: number, b: number): HTMLCanvasElement {
  const size = 64;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const c = cv.getContext('2d')!;
  const grad = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.65)`);
  grad.addColorStop(0.45, `rgba(${r},${g},${b},0.18)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  c.fillStyle = grad;
  c.fillRect(0, 0, size, size);
  return cv;
}

export const ParticleField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = canvasRef.current;
    const box = containerRef.current;
    if (!canvas || !box) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lowPower =
      window.innerWidth < 768 ||
      (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4);
    const dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 1 : 1.5);
    const frameInterval = lowPower ? 1000 / 30 : 1000 / 60;

    // Originkit Snowfall tuned parameters adapted for dark readability across UI
    const count = lowPower ? 120 : 280;
    const wind = -0.65;
    const windVariation = 0.85;
    const speedLo = 0.45;
    const speedHi = 1.65;
    const sizeLo = 1.1;
    const sizeHi = 2.6;
    const alphaLo = 0.22;
    const alphaHi = 0.68;

    const orbSprites = BRAND_COLORS.map(([r, g, b]) => createOrbSprite(r, g, b));

    let W = 1;
    let H = 1;
    let flakes: Flake[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const build = (entry?: ResizeObserverEntry) => {
      const cr = entry?.contentRect;
      const rw = cr?.width || box.clientWidth || window.innerWidth;
      const rh = cr?.height || box.clientHeight || window.innerHeight;
      W = Math.max(1, Math.floor(rw));
      H = Math.max(1, Math.floor(rh));
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      flakes = new Array(count);
      for (let i = 0; i < count; i++) {
        const isOrb = i % 18 === 0;
        const driftSign: 1 | -1 = i % 7 === 0 ? -1 : 1; // mostly downward + subtle buoyant motes rising
        flakes[i] = {
          x: Math.random() * W,
          y: Math.random() * H,
          r: isOrb ? rand(8, 18) : rand(sizeLo, sizeHi),
          vy: isOrb ? rand(0.18, 0.42) : rand(speedLo, speedHi),
          vx: rand(-0.6, 0.6),
          phase: Math.random() * Math.PI * 2,
          sway: rand(0.18, 0.72),
          alpha: isOrb ? rand(0.14, 0.26) : rand(alphaLo, alphaHi),
          driftSign,
          colorIdx: i % BRAND_COLORS.length,
          isOrb,
        };
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        const shimmer = 0.78 + 0.22 * Math.sin(t * 0.0018 + f.phase);
        const [r, g, b] = BRAND_COLORS[f.colorIdx];
        ctx.globalAlpha = f.alpha * shimmer;
        if (f.isOrb) {
          ctx.drawImage(orbSprites[f.colorIdx], f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
        } else {
          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    let raf = 0;
    let last = 0;
    let active = false;

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < frameInterval) return;
      const scale = Math.min((t - last) / 16.67, 2.5);
      last = t;

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.vy * f.driftSign * scale;
        f.x += (wind + f.vx * windVariation + Math.sin(t * 0.0012 + f.phase) * f.sway) * scale;

        if (f.driftSign > 0 && f.y - f.r > H) {
          f.y = -f.r;
          f.x = Math.random() * W;
        } else if (f.driftSign < 0 && f.y + f.r < 0) {
          f.y = H + f.r;
          f.x = Math.random() * W;
        }
        if (f.x < -f.r) f.x = W + f.r;
        else if (f.x > W + f.r) f.x = -f.r;
      }
      draw(t);
    };

    const start = () => {
      if (!active && !reduced) {
        active = true;
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      active = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    build();
    draw(0);
    start();

    const ro = new ResizeObserver((entries) => {
      build(entries[0]);
      draw(performance.now());
    });
    ro.observe(box);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
};
