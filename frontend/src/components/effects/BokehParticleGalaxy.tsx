import React, { useEffect, useRef } from 'react';

interface BokehParticleGalaxyProps {
  className?: string;
  particleCount?: number;
  interactive?: boolean;
  speedMultiplier?: number;
  opacity?: number;
}

interface Particle {
  x: number;
  y: number;
  baseRadius: number; // orbital distance from galaxy center
  angle: number;      // current angle in radians
  angularSpeed: number; // orbital speed
  armOffset: number;  // offset along spiral arm
  layer: number;      // 0: deep dust, 1: mid-arm, 2: core, 3: foreground bokeh
  size: number;
  color: string;
  twinkleSpeed: number;
  twinkleOffset: number;
  distortionX: number;
  distortionY: number;
}

export const BokehParticleGalaxy: React.FC<BokehParticleGalaxyProps> = ({
  className = "absolute inset-0 pointer-events-none overflow-hidden",
  particleCount = 550,
  interactive = true,
  speedMultiplier = 1.0,
  opacity = 0.85
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let centerX = 0;
    let centerY = 0;
    let isVisible = true;
    let isReducedMotion = false;

    // Media query check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      isReducedMotion = true;
    }

    // Touch/Mobile detection
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const effectiveCount = isTouch ? Math.min(180, particleCount) : particleCount;

    // Mouse Tracking with smooth lerp
    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      isHovered: false
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive || isTouch) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handlePointerLeave = () => {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
      mouse.isHovered = false;
    };

    // Color tokens matching PALAR GUARD AI Brand Identity
    // Soft emerald, muted green, champagne-white, subtle ivory, pale cyan
    const colors = [
      'rgba(16, 185, 129, 0.75)',  // Emerald
      'rgba(52, 211, 153, 0.65)',  // Light Emerald
      'rgba(5, 150, 105, 0.55)',   // Deep Emerald
      'rgba(254, 243, 199, 0.85)', // Champagne
      'rgba(252, 251, 247, 0.90)', // Warm Ivory
      'rgba(6, 182, 212, 0.60)',   // Hydrology Cyan
      'rgba(164, 178, 169, 0.40)'  // Muted Stone
    ];

    // Generate Particles in a 3-arm Logarithmic Spiral
    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const numArms = 3;
      const maxDist = Math.max(width, height) * 0.65;

      for (let i = 0; i < effectiveCount; i++) {
        // Arm index 0, 1, 2
        const arm = i % numArms;
        const armAngle = (arm * 2 * Math.PI) / numArms;

        // Exponential distribution: denser near core
        const normDist = Math.pow(Math.random(), 1.7);
        const radius = 15 + normDist * maxDist;

        // Logarithmic spiral angle theta = armAngle + k * ln(radius)
        const spiralAngle = armAngle + 1.4 * Math.log(radius / 12) + (Math.random() - 0.5) * 0.45;

        // Depth Layer:
        // Layer 0: large soft bokeh disks (diffuse dust)
        // Layer 1: mid-spiral arm stars
        // Layer 2: dense central galactic bulge
        // Layer 3: tiny high-contrast pinprick foreground stars
        const layerRand = Math.random();
        let layer = 1;
        let size = 1.8;

        if (layerRand < 0.12) {
          layer = 0; // Large background bokeh
          size = 6 + Math.random() * 12;
        } else if (layerRand < 0.45) {
          layer = 2; // Core cluster
          size = 1.2 + Math.random() * 2.2;
        } else if (layerRand < 0.85) {
          layer = 1; // Spiral arm stream
          size = 1.4 + Math.random() * 2.8;
        } else {
          layer = 3; // Foreground shimmer
          size = 2.4 + Math.random() * 3.6;
        }

        // Color selection based on layer
        let color = colors[Math.floor(Math.random() * colors.length)];
        if (layer === 2) {
          color = Math.random() > 0.4 ? 'rgba(252, 251, 247, 0.92)' : 'rgba(254, 243, 199, 0.85)';
        } else if (layer === 0) {
          color = Math.random() > 0.5 ? 'rgba(6, 78, 59, 0.35)' : 'rgba(16, 185, 129, 0.25)';
        }

        // Orbital angular velocity: Keplerian differential rotation (faster near center)
        const baseSpeed = -0.0006 * speedMultiplier; // Counter-clockwise
        const angularSpeed = baseSpeed * (0.8 + 12 / (radius + 20));

        particles.push({
          x: 0,
          y: 0,
          baseRadius: radius,
          angle: spiralAngle,
          angularSpeed,
          armOffset: (Math.random() - 0.5) * 25,
          layer,
          size,
          color,
          twinkleSpeed: 0.02 + Math.random() * 0.04,
          twinkleOffset: Math.random() * Math.PI * 2,
          distortionX: 0,
          distortionY: 0
        });
      }
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      centerX = width / 2;
      centerY = height / 2;

      initParticles();
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Attach mouse move on window/container for smooth tracking
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });

    // Handle Tab Visibility to prevent battery drain
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Render Loop
    let time = 0;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.016;

      // Smooth mouse lerp
      if (mouse.isHovered) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;
      } else {
        mouse.x += (-9999 - mouse.x) * 0.08;
        mouse.y += (-9999 - mouse.y) * 0.08;
      }

      ctx.clearRect(0, 0, width, height);

      // Deep Galactic Core Glow
      const coreGrad = ctx.createRadialGradient(
        centerX, centerY, 5,
        centerX, centerY, Math.min(width, height) * 0.45
      );
      coreGrad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
      coreGrad.addColorStop(0.3, 'rgba(5, 150, 105, 0.06)');
      coreGrad.addColorStop(0.7, 'rgba(4, 30, 20, 0.02)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Each Particle
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Orbit update (counter-clockwise)
        if (!isReducedMotion) {
          p.angle += p.angularSpeed;
        }

        // Natural undisturbed galactic position
        let currentRadius = p.baseRadius + Math.sin(time * 0.5 + p.twinkleOffset) * 2;
        let px = centerX + Math.cos(p.angle) * currentRadius;
        let py = centerY + Math.sin(p.angle) * currentRadius * 0.68; // 0.68 inclination gives 3D galactic disk tilt

        // Gravitational Mouse Distortion
        if (interactive && !isTouch && mouse.isHovered) {
          const dx = mouse.x - px;
          const dy = mouse.y - py;
          const distSq = dx * dx + dy * dy;
          const maxDist = 260; // Interaction radius in px

          if (distSq < maxDist * maxDist && distSq > 100) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / maxDist) * 38; // Gravitational pull strength
            const targetDistortX = (dx / dist) * force;
            const targetDistortY = (dy / dist) * force;

            // Smooth interpolation
            p.distortionX += (targetDistortX - p.distortionX) * 0.08;
            p.distortionY += (targetDistortY - p.distortionY) * 0.08;
          } else {
            // Spring return to rest
            p.distortionX *= 0.92;
            p.distortionY *= 0.92;
          }
        } else {
          p.distortionX *= 0.92;
          p.distortionY *= 0.92;
        }

        px += p.distortionX;
        py += p.distortionY;

        // Twinkle factor
        const twinkle = 0.65 + 0.35 * Math.sin(time * 2.5 * p.twinkleSpeed * 10 + p.twinkleOffset);
        const currentOpacity = opacity * twinkle;

        // Draw particle based on layer
        ctx.save();
        ctx.globalAlpha = currentOpacity;

        if (p.layer === 0) {
          // Large soft bokeh gradient
          const bokehGrad = ctx.createRadialGradient(px, py, 0, px, py, p.size);
          bokehGrad.addColorStop(0, p.color);
          bokehGrad.addColorStop(0.5, p.color.replace(/[\d\.]+\)$/, '0.12)'));
          bokehGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = bokehGrad;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.layer === 3) {
          // Crisp foreground star with soft glow ring
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Standard star dot
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [particleCount, interactive, speedMultiplier, opacity]);

  return (
    <div className={className} aria-hidden="true">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full"
      />
    </div>
  );
};
