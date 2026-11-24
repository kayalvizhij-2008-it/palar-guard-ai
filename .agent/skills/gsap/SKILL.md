---
name: gsap
description: "GSAP (GreenSock Animation Platform) guidelines. Covers ScrollTrigger, timeline choreographies, pinning, scrubbed scroll storytelling, and React integration using @gsap/react useGSAP."
---

# GSAP Animation & ScrollTrigger Architecture

Use GSAP for complex timeline sequences, pinning sections, and scroll-scrubbed storytelling.

## Best Practices with React

1. **Scoping & Cleanup**:
   - Always use `@gsap/react`'s `useGSAP()` hook or clean up scroll triggers in `useEffect` returns to prevent memory leaks and duplicate triggers on hot reloads.
   - Example:
     ```tsx
     useGSAP(() => {
       gsap.from(".hero-element", { opacity: 0, y: 30, duration: 0.8, stagger: 0.1 });
     }, { scope: containerRef });
     ```

2. **ScrollTrigger Restraint**:
   - Pinned sections must have clear entry and exit points.
   - Avoid pinning on viewports under 768px (mobile) where screen height is constrained.

3. **Performance Budget**:
   - Only tween `x`, `y`, `scale`, `rotation`, and `opacity`.
   - Use `will-change: transform` only during active animation, not permanently on all DOM nodes.
