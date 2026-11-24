---
name: unslop
description: "Turns vibecoded, AI-looking UI into a designed interface with its own character. Finds a direction from the product itself, then fixes spacing, color, icons, copy, type, layout, details, visuals and motion in that order. Use when a UI shows tells like purple gradients, glows, gradient text, emoji labels, 'New ✨' badges, glossy blobs, uppercase tracked labels, pulsing elements or uneven spacing. Works on React, Tailwind, HTML and CSS, for dashboards, apps and landing pages."
license: CC-BY-4.0
---

# Unslop: Crafting Distinctive, Slop-Free Interfaces

Vibecoded UI fails in the same predictable ways: every surface glows, every label has an emoji, spacing is arbitrary, and copy is filled with hype. Unslopping fixes the craft and keeps the product.

## The 9-Pass Refinement Sequence

1. **Pass 1 — Spacing**:
   - Everything sits strictly on a 4px grid (4, 8, 12, 16, 20, 24, 32, 48, 64px).
   - Equal components share identical heights, paddings, and margins.
   - Eliminate one-off arbitrary values like `mt-[13px]`.

2. **Pass 2 — Color**:
   - Use one coherent neutral ramp tinted toward the product's natural world (charcoal, slate, warm stone).
   - Three clear text roles: Primary (high contrast), Secondary (medium contrast), Muted (low contrast but WCAG AA compliant).
   - In chrome and navigation, use at most one accent hue, reserved for key actions or crucial numbers.
   - Ban all hue-shifting gradients on cards, gradient text, colored glows, neon borders, and radial background blobs.

3. **Pass 3 — Icons**:
   - Replace every emoji used as an icon or decoration with crisp vector line icons (Lucide React).
   - Single size (16px or 20px) and single stroke width (1.5px or 1.75px) across a view.
   - Icons inherit their text role's color; never give icons random standalone rainbow hues.

4. **Pass 4 — Copy**:
   - Headlines state concrete facts in plain language without hype words ("supercharge", "seamless", "AI-powered magic").
   - Eliminate exclamation marks in interface text.
   - No greeting headlines like "Welcome back, User! 👋"; name the context directly (e.g., "Palar Basin Intelligence Console").
   - Never use fake metrics ("Loved by 10,000+ teams"). Use verifiable or honestly labeled demonstration metrics.

5. **Pass 5 — Typography**:
   - Two weights only for general text (400 Regular and 500 Medium; 600 SemiBold only for major section headlines).
   - Eliminate heavy 800/900 black weights and all gradient fills on typography.
   - Numbers must use `tabular-nums` for alignment.

6. **Pass 6 — Layout**:
   - Provide a balanced asymmetric visual anchor rather than repeating identical 3-column card grids everywhere.
   - Navigation stays quiet: logo, primary links, one primary CTA button.
   - Provide generous whitespace for content breathing room.

7. **Pass 7 — Details**:
   - Nested border radii: inner radius = outer radius - padding.
   - Tables and lists must have clear hover, selection, and keyboard focus states.
   - Hairline 1px borders with 8-10% opacity instead of thick borders.

8. **Pass 8 — Visuals**:
   - Remove decorative filler (holographic brains, floating tech spheres, generic neon waves).
   - Every visual must represent real domain elements (e.g., actual river basin topography, hydrological diagrams, observation charts).

9. **Pass 9 — Motion**:
   - Remove looping animations (`animate-pulse`, `animate-ping`) on elements that are not active real-time alerts.
   - Micro-interactions must complete in 150-250ms with cubic-bezier easing.
   - Animate only `transform` and `opacity` properties; never animate layout dimensions (`width`, `height`, `margin`).
