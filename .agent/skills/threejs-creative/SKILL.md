---
name: threejs-creative
description: "WebGL, Three.js, and React Three Fiber engineering. High-performance 3D scene composition, custom shaders, environmental digital twins, particle fields, and responsive fallbacks."
---

# Three.js and React Three Fiber Architecture

WebGL creates immersive digital-twin representations of real-world environmental phenomena.

## Production Guidelines

1. **Canvas Lifecycle & Optimization**:
   - Cap `devicePixelRatio` to `Math.min(window.devicePixelRatio, 2)` to protect mobile GPU thermal limits.
   - Use `demand` or `frameloop="always"` only when active particles or rotation require continuous render loops.
   - Always provide an accessible, styled 2D static fallback or SVG preview for low-power devices, software renderers, or WebGL context failures.

2. **Digital Twin Scene Construction**:
   - Palette coordination: Ensure lighting, ambient colors, and mesh materials harmonize directly with the brand color tokens (deep forest emerald, slate, glowing water cyan).
   - Clean teardown: Dispose geometries, textures, and materials when components unmount.
