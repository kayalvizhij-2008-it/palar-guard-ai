import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  baseOpacity: number;
  pulseSpeed: number;
  phase: number;
  colorType: 'emerald' | 'teal' | 'champagne';
}

export const GlobalParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    let width = 0;
    let height = 0;
    let animationFrameId: number | null = null;
    let particles: Particle[] = [];
    let isTabVisible = !document.hidden;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Lightweight particle count: 24 on mobile, 52 on desktop
      const count = width < 768 ? 24 : 52;

      particles = Array.from({ length: count }, () => {
        const randType = Math.random();
        const colorType: 'emerald' | 'teal' | 'champagne' = 
          randType < 0.7 ? 'emerald' : randType < 0.9 ? 'teal' : 'champagne';

        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 0.75 + Math.random() * 1.5,
          speed: 0.22 + Math.random() * 0.55,
          drift: (Math.random() - 0.5) * 0.25,
          baseOpacity: 0.12 + Math.random() * 0.32,
          pulseSpeed: 0.01 + Math.random() * 0.02,
          phase: Math.random() * Math.PI * 2,
          colorType
        };
      });
    };

    let tick = 0;

    const render = () => {
      if (!isTabVisible) return;

      ctx.clearRect(0, 0, width, height);
      tick++;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move down with gentle horizontal drift
        p.y += p.speed;
        p.x += p.drift + Math.sin(tick * 0.01 + p.phase) * 0.15;

        // Loop seamlessly top and sides
        if (p.y > height + 8) {
          p.y = -6;
          p.x = Math.random() * width;
        }
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;

        // Gentle breathing opacity pulse
        const opacityMultiplier = 0.75 + Math.sin(tick * p.pulseSpeed + p.phase) * 0.25;
        const currentOpacity = Math.max(0.04, Math.min(0.5, p.baseOpacity * opacityMultiplier));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (p.colorType === 'emerald') {
          ctx.fillStyle = `rgba(42, 213, 139, ${currentOpacity})`;
          ctx.shadowColor = 'rgba(42, 213, 139, 0.45)';
          ctx.shadowBlur = 6;
        } else if (p.colorType === 'teal') {
          ctx.fillStyle = `rgba(14, 165, 233, ${currentOpacity * 0.9})`;
          ctx.shadowColor = 'rgba(14, 165, 233, 0.35)';
          ctx.shadowBlur = 5;
        } else {
          ctx.fillStyle = `rgba(245, 243, 235, ${currentOpacity * 0.8})`;
          ctx.shadowColor = 'rgba(245, 243, 235, 0.3)';
          ctx.shadowBlur = 4;
        }

        ctx.fill();
      }

      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(render);
    };

    resize();
    render();

    // Pause when tab is not active to conserve CPU & battery
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && !animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      } else if (!isTabVisible && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const handleResize = () => {
      resize();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-85"
      style={{ willChange: 'transform' }}
    />
  );
};

export default GlobalParticleBackground;
