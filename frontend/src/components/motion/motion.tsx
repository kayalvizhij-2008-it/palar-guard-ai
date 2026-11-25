import React, { useState } from 'react';
import { motion, useReducedMotion, Variants, Variant } from 'framer-motion';

/**
 * Shared scroll-reveal and 3D flip interaction system.
 * - IntersectionObserver driven via Framer Motion whileInView.
 * - Fully respects prefers-reduced-motion.
 */

export type RevealKind = 'fall' | 'rise' | 'left' | 'right' | 'scale' | 'perspective';

const EASE = [0.22, 1, 0.36, 1] as const;

const buildVariants = (kind: RevealKind): Variants => {
  const hidden: Record<RevealKind, Variant> = {
    fall: { opacity: 0, y: -36, rotate: -1.8 },
    rise: { opacity: 0, y: 24 },
    left: { opacity: 0, x: -44 },
    right: { opacity: 0, x: 44 },
    scale: { opacity: 0, scale: 0.94 },
    perspective: { opacity: 0, rotateX: 12, y: 20, transformPerspective: 900 },
  };
  return {
    hidden: hidden[kind],
    shown: { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1, rotateX: 0 },
  };
};

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  kind?: RevealKind;
  delay?: number;
}

export const Reveal: React.FC<RevealProps> = ({ kind = 'rise', delay = 0, children, ...rest }) => {
  const reduce = useReducedMotion();
  if (reduce) return <div {...rest}>{children}</div>;
  return (
    <motion.div
      {...(rest as any)}
      variants={buildVariants(kind)}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 0.48, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
};

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  frontClassName?: string;
  backClassName?: string;
  label: string;
}

/**
 * Selective 3D flip card supporting hover (fine pointers), click/tap (mobile),
 * keyboard Enter/Space (via native <button>), and prefers-reduced-motion.
 */
export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  className = 'h-56',
  frontClassName = 'border-white/10 bg-[#0a2218]',
  backClassName = 'border-[#d9c27a]/35 bg-[#0c2a1e]',
  label,
}) => {
  const [flipped, setFlipped] = useState(false);
  const reduce = useReducedMotion();

  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches) {
      setFlipped(false);
    }
  };

  return (
    <div
      className={`group [perspective:1000px] ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={label}
        onClick={() => setFlipped((f) => !f)}
        className="relative h-full w-full text-left [transform-style:preserve-3d] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl"
        style={{
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transition: reduce ? 'none' : 'transform 0.55s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl border p-4 [backface-visibility:hidden] ${frontClassName}`}
        >
          {front}
        </div>
        <div
          className={`absolute inset-0 overflow-hidden rounded-2xl border p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] ${backClassName}`}
        >
          {back}
        </div>
      </button>
    </div>
  );
};
