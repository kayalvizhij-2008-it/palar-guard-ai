import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailingPosition, setTrailingPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(true);

  useEffect(() => {
    // Check if device has fine pointer (mouse/trackpad) and not touch-only
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!hasFinePointer || isTouch) {
      setIsTouchDevice(true);
      return;
    }
    
    setIsTouchDevice(false);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering over clickable or interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const interactive = target.closest('button, a, input, select, textarea, [role="button"], .cursor-pointer, [data-cursor-interactive]');
        setIsHovered(!!interactive);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  // Smooth trailing ring lerp animation
  useEffect(() => {
    if (isTouchDevice) return;
    let animId: number;

    const followMouse = () => {
      setTrailingPosition(prev => ({
        x: prev.x + (position.x - prev.x) * 0.22,
        y: prev.y + (position.y - prev.y) * 0.22,
      }));
      animId = requestAnimationFrame(followMouse);
    };

    animId = requestAnimationFrame(followMouse);
    return () => cancelAnimationFrame(animId);
  }, [position, isTouchDevice]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* 1. Precise Center Dot */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full transition-transform duration-75"
        style={{
          width: '6px',
          height: '6px',
          backgroundColor: '#2ad58b',
          transform: `translate3d(${position.x - 3}px, ${position.y - 3}px, 0) scale(${isClicking ? 0.7 : isHovered ? 1.4 : 1})`,
          boxShadow: '0 0 8px rgba(42, 213, 139, 0.8)',
        }}
      />

      {/* 2. Smooth Trailing Halo Ring */}
      <div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border border-emerald-400/50 transition-all duration-150 ease-out"
        style={{
          width: isHovered ? '42px' : '26px',
          height: isHovered ? '42px' : '26px',
          transform: `translate3d(${trailingPosition.x - (isHovered ? 21 : 13)}px, ${trailingPosition.y - (isHovered ? 21 : 13)}px, 0) scale(${isClicking ? 0.85 : 1})`,
          backgroundColor: isHovered ? 'rgba(42, 213, 139, 0.08)' : 'transparent',
          backdropFilter: isHovered ? 'blur(1px)' : 'none',
        }}
      />
    </>
  );
};
