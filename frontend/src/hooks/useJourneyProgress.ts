import { useCallback, useEffect, useRef, useState } from 'react';
import { clamp01 } from '../lib/geo';

/**
 * Tracks scroll progress (0..1) through a tall container that holds a sticky viewport.
 * Progress is written to a ref so the WebGL loop can read it with zero React renders.
 * Scrolling up reverses the value, so the camera journey reverses naturally.
 */
export function useJourneyProgress() {
  const containerRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      progressRef.current = total > 0 ? clamp01(-rect.top / total) : 0;
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scrollToProgress = useCallback((p: number, smooth: boolean) => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + total * clamp01(p), behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  return { containerRef, progressRef, scrollToProgress };
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

/** One-time WebGL capability probe; releases the probe context immediately. */
export function useWebGLSupport(): 'checking' | 'ok' | 'unavailable' {
  const [state, setState] = useState<'checking' | 'ok' | 'unavailable'>('checking');
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = (canvas.getContext('webgl2') || canvas.getContext('webgl')) as WebGLRenderingContext | null;
      if (!gl) {
        setState('unavailable');
        return;
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setState('ok');
    } catch {
      setState('unavailable');
    }
  }, []);
  return state;
}
