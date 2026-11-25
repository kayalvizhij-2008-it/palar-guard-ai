import React, { useEffect, useRef, useState } from 'react';

type CursorMode = 'default' | 'button' | 'link' | 'text' | 'map-grab' | 'map-grabbing' | 'hidden';

export const PremiumCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [cursorLabel, setCursorLabel] = useState<string>('');
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect touch or mobile pointer
    const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (isTouch) {
      setIsTouchDevice(true);
      return;
    }

    // 2. Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsTouchDevice(true);
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let targetX = mouseX;
    let targetY = mouseY;
    let magneticTarget: HTMLElement | null = null;
    let magneticStrength = 0.25;

    let isMouseDown = false;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Check if hovering over magnetic element
      const target = e.target as HTMLElement | null;
      const magneticEl = target?.closest('[data-magnetic="true"]') as HTMLElement | null;

      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        targetX = mouseX + (centerX - mouseX) * magneticStrength;
        targetY = mouseY + (centerY - mouseY) * magneticStrength;
        magneticTarget = magneticEl;
      } else {
        targetX = mouseX;
        targetY = mouseY;
        magneticTarget = null;
      }

      // Detect cursor context
      if (!target) {
        setCursorMode('default');
        setCursorLabel('');
        return;
      }

      const isInput = target.closest('input, textarea, [contenteditable="true"]');
      if (isInput) {
        setCursorMode('text');
        setCursorLabel('');
        return;
      }

      const isMap = target.closest('.leaflet-container, [data-interactive-map="true"]');
      if (isMap) {
        setCursorMode(isMouseDown ? 'map-grabbing' : 'map-grab');
        setCursorLabel('');
        return;
      }

      const isButton = target.closest('button, [role="button"], .interactive-button');
      if (isButton) {
        setCursorMode('button');
        const customLabel = (isButton as HTMLElement).getAttribute('data-cursor-label');
        setCursorLabel(customLabel || 'OPEN');
        return;
      }

      const isLink = target.closest('a');
      if (isLink) {
        setCursorMode('link');
        setCursorLabel('');
        return;
      }

      setCursorMode('default');
      setCursorLabel('');
    };

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      setIsClicked(true);

      const target = e.target as HTMLElement | null;
      if (target?.closest('.leaflet-container, [data-interactive-map="true"]')) {
        setCursorMode('map-grabbing');
      }

      // Trigger ripple at click coordinates
      if (rippleRef.current) {
        rippleRef.current.style.left = `${e.clientX}px`;
        rippleRef.current.style.top = `${e.clientY}px`;
        rippleRef.current.classList.remove('animate-cursor-ripple');
        void rippleRef.current.offsetWidth; // Force reflow
        rippleRef.current.classList.add('animate-cursor-ripple');
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      isMouseDown = false;
      setIsClicked(false);
      const target = e.target as HTMLElement | null;
      if (target?.closest('.leaflet-container, [data-interactive-map="true"]')) {
        setCursorMode('map-grab');
      }
    };

    const onMouseLeave = () => {
      setCursorMode('hidden');
    };

    const onMouseEnter = () => {
      setCursorMode('default');
    };

    // Smooth lerp loop
    const tick = () => {
      // Direct center dot update
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Smooth follower ring lerp (0.16 factor)
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (isTouchDevice) return null;

  // Determine ring styling based on cursor mode
  const getRingClasses = () => {
    switch (cursorMode) {
      case 'button':
        return 'w-14 h-14 -ml-7 -mt-7 border-emerald-400 bg-emerald-500/15 backdrop-blur-[1px] scale-110';
      case 'link':
        return 'w-10 h-10 -ml-5 -mt-5 border-cyan-400 bg-cyan-500/10 scale-105';
      case 'map-grab':
        return 'w-8 h-8 -ml-4 -mt-4 border-emerald-300 border-dashed bg-emerald-500/10';
      case 'map-grabbing':
        return 'w-7 h-7 -ml-3.5 -mt-3.5 border-emerald-400 bg-emerald-500/30 scale-95';
      case 'text':
        return 'w-2 h-6 -ml-1 -mt-3 rounded-none border-l-2 border-emerald-400 bg-transparent opacity-40';
      case 'hidden':
        return 'opacity-0 scale-50';
      case 'default':
      default:
        return 'w-8 h-8 -ml-4 -mt-4 border-emerald-400/40 bg-emerald-500/5';
    }
  };

  return (
    <>
      {/* 1. Precise Center Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 will-change-transform ${
          cursorMode === 'text' || cursorMode === 'hidden' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div className={`w-2 h-2 -ml-1 -mt-1 rounded-full transition-transform duration-150 ${
          isClicked ? 'scale-75 bg-emerald-300' : 'scale-100 bg-[#2ad58b]'
        } shadow-[0_0_8px_rgba(42,213,139,0.8)]`} />
      </div>

      {/* 2. Trailing Luminous Halo Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[9998] will-change-transform"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
      >
        <div
          className={`rounded-full border transition-all duration-200 ease-out flex items-center justify-center text-[9px] font-mono font-bold tracking-widest text-emerald-200 ${getRingClasses()} ${
            isClicked ? 'scale-90 border-emerald-300' : ''
          } shadow-[0_0_15px_rgba(42,213,139,0.25)]`}
        >
          {cursorMode === 'button' && cursorLabel && (
            <span className="animate-fade-in pointer-events-none drop-shadow">
              {cursorLabel}
            </span>
          )}
        </div>
      </div>

      {/* 3. Click Ripple Wave */}
      <div
        ref={rippleRef}
        aria-hidden="true"
        className="fixed pointer-events-none z-[9997] w-12 h-12 -ml-6 -mt-6 rounded-full border border-emerald-400 opacity-0"
      />
    </>
  );
};

export default PremiumCursor;
