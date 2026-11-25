import React, { useEffect, useRef } from 'react';

interface StardustBackgroundProps {
  className?: string;
  particleCount?: number;
  speed?: number;
  opacity?: number;
}

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  twinklePhase: number;
  twinkleSpeed: number;
  baseAlpha: number;
}

export const StardustBackground: React.FC<StardustBackgroundProps> = ({
  className = "fixed inset-0 pointer-events-none z-0 overflow-hidden",
  particleCount = 56,
  speed = 0.35,
  opacity = 0.65
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let isVisible = true;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Detect mobile / lower power
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.floor(particleCount * 0.45) : particleCount;

    // Palar Guard brand colors: muted emerald, pale ivory, subtle champagne, faint teal
    const colorPalette = [
      'rgba(16, 185, 129,', // Muted emerald
      'rgba(52, 211, 153,', // Soft emerald
      'rgba(252, 251, 247,', // Warm pale ivory
      'rgba(254, 243, 199,', // Subtle champagne
      'rgba(6, 182, 212,'    // Faint hydrology cyan
    ];

    let particles: StardustParticle[] = [];

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15, // gentle horizontal sway
          vy: (0.15 + Math.random() * 0.45) * speed, // downward drift
          size: 0.8 + Math.random() * 1.6, // mostly tiny dots
          color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.015 + Math.random() * 0.03,
          baseAlpha: 0.25 + Math.random() * 0.55
        });
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Handle visibility changes
    const onVisibility = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVisibility);

    // Animation Loop
    const draw = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Render gentle falling stardust dots
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!isReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.twinklePhase += p.twinkleSpeed;

          // Wrap around seamlessly
          if (p.y > height + 5) {
            p.y = -5;
            p.x = Math.random() * width;
          }
          if (p.x < -5) p.x = width + 5;
          if (p.x > width + 5) p.x = -5;
        }

        // Soft, non-aggressive sinusoidal twinkling
        const twinkle = 0.7 + 0.3 * Math.sin(p.twinklePhase);
        const currentAlpha = p.baseAlpha * twinkle * opacity;

        ctx.fillStyle = `${p.color} ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [particleCount, speed, opacity]);

  return (
    <div className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
