import React, { useEffect, useRef, useState } from 'react';

type CursorMode = 'default' | 'button' | 'link' | 'card' | 'text' | 'map-grab' | 'map-grabbing' | 'hidden';

export const CustomCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  const [cursorMode, setCursorMode] = useState<CursorMode>('default');
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isClicked, setIsClicked] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect touch or mobile / coarse pointer
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
    let isMouseDown = false;
    let animationFrameId: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement | null;
      if (!target) {
        setCursorMode('default');
        return;
      }

      // Preserve native cursor inside inputs, selects, textareas, maps, or explicit opt-outs
      if (target.closest('input, textarea, select, option, [contenteditable="true"], [data-no-custom-cursor="true"]')) {
        setCursorMode('text');
        return;
      }

      // Map grabbing context
      if (target.closest('.leaflet-container, [data-interactive-map="true"], canvas')) {
        setCursorMode('hidden');
        return;
      }

      // Buttons and clickable controls
      if (target.closest('button, [role="button"], .interactive-button')) {
        setCursorMode('button');
        return;
      }

      // Links
      if (target.closest('a')) {
        setCursorMode('link');
        return;
      }

      // Cards
      if (target.closest('.interactive-card, [data-card="true"]')) {
        setCursorMode('card');
        return;
      }

      setCursorMode('default');
    };

    const onMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      setIsClicked(true);

      // Trigger expanding click ripple at exact click point
      if (rippleRef.current) {
        rippleRef.current.style.left = `${e.clientX}px`;
        rippleRef.current.style.top = `${e.clientY}px`;
        rippleRef.current.classList.remove('animate-cursor-ripple');
        // Force reflow
        void rippleRef.current.offsetWidth;
        rippleRef.current.classList.add('animate-cursor-ripple');
      }

      const target = e.target as HTMLElement | null;
      if (target?.closest('.leaflet-container, [data-interactive-map="true"]')) {
        setCursorMode('map-grabbing');
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

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Smooth Lerp Animation Loop (60/120fps)
    const render = () => {
      // Direct placement for central dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }

      // Smooth delayed trailing ring (lerp factor: 0.16)
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  if (isTouchDevice) return null;

  // Determine Ring Size & Style based on mode
  let ringSizeClasses = "w-9 h-9 border-[#10b981]/50 bg-[#10b981]/[0.04]";
  let dotClasses = "w-2 h-2 bg-[#fcfbf7] shadow-[0_0_10px_#10b981]";

  if (cursorMode === 'button') {
    ringSizeClasses = "w-14 h-14 border-[#2ad58b] bg-[#10b981]/15 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-110";
    dotClasses = "w-1.5 h-1.5 bg-[#2ad58b]";
  } else if (cursorMode === 'link') {
    ringSizeClasses = "w-12 h-12 border-cyan-400/80 bg-cyan-500/10 scale-105";
    dotClasses = "w-2 h-2 bg-cyan-300";
  } else if (cursorMode === 'card') {
    ringSizeClasses = "w-12 h-12 border-emerald-400/60 bg-emerald-500/5";
    dotClasses = "w-2 h-2 bg-[#fcfbf7]";
  } else if (cursorMode === 'map-grab') {
    ringSizeClasses = "w-10 h-10 border-dashed border-emerald-400/80 bg-emerald-500/10";
    dotClasses = "w-2.5 h-2.5 bg-emerald-400";
  } else if (cursorMode === 'map-grabbing') {
    ringSizeClasses = "w-7 h-7 border-emerald-300 bg-emerald-500/30 scale-90";
    dotClasses = "w-3 h-3 bg-white";
  } else if (cursorMode === 'text') {
    // Hide custom ring so system caret isn't obstructed
    ringSizeClasses = "w-0 h-0 opacity-0 border-transparent";
    dotClasses = "w-0 h-0 opacity-0";
  } else if (cursorMode === 'hidden') {
    ringSizeClasses = "opacity-0";
    dotClasses = "opacity-0";
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none" aria-hidden="true">
      {/* 1. Trailing Halo Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-all duration-150 ease-out flex items-center justify-center ${ringSizeClasses} ${
          isClicked ? 'scale-90 opacity-90' : ''
        }`}
        style={{ willChange: 'transform' }}
      />

      {/* 2. Central Pinpoint Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full transition-transform duration-75 ease-out ${dotClasses}`}
        style={{ willChange: 'transform' }}
      />

      {/* 3. Expanding Click Ripple */}
      <div
        ref={rippleRef}
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-emerald-400 opacity-0 pointer-events-none"
      />
    </div>
  );
};

export default CustomCursor;
