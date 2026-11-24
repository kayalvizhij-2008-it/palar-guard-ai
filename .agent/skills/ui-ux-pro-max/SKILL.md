---
name: ui-ux-pro-max
description: "UI/UX design intelligence. Searchable local database with 67 styles, 161 palettes, 57 font pairings, 25 charts, and 21 stacks. Use when designing, building, or reviewing UI: pages, components, color schemes, typography, layout, accessibility, animation, or data visualization."
---

# UI/UX Pro Max - Design Intelligence

Comprehensive design guide for web, mobile, and desktop applications. Contains 67 styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 25 chart types across 22 technology stacks.

## Key Principles & Checklists

### 1. Accessibility (CRITICAL - Priority 1)
- **Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large display text.
- **Focus States**: Visible 2-4px focus rings with clear offset on all interactive elements.
- **Keyboard Navigation**: Full tab order traversal matching logical DOM hierarchy.
- **Semantic Labels**: Always supply `aria-label` or visible label for icon buttons.
- **Reduced Motion**: Respect `prefers-reduced-motion: reduce`. Provide instant state changes or gentle crossfades.

### 2. Touch & Interaction (CRITICAL - Priority 2)
- **Target Size**: Minimum 44x44px hit target area.
- **Target Spacing**: Minimum 8px gap between adjacent touch targets.
- **Immediate Feedback**: Under 100ms visual response for hover, focus, active, and press states.
- **No Hover-Only**: Essential information and actions must not rely exclusively on mouse hover.

### 3. Layout & Responsive (HIGH - Priority 3)
- **Mobile First**: Fluid auto-collapsing grids. Zero horizontal scroll on viewports >= 320px.
- **Spacing Scale**: 4px/8px incremental rhythm (4, 8, 12, 16, 24, 32, 48, 64, 96px).
- **Line Length**: 45-75 characters per line on body copy; generous 1.5-1.75 line-height.
- **Z-Index System**: Layered scale (`z-0`, `z-10` content, `z-20` sticky headers, `z-40` overlays/dialogs, `z-50` notifications/toasts).

### 4. Style Selection (HIGH - Priority 4)
- **Match Product Purpose**: Serious environmental intelligence demands deep forest greens, emerald tones, crisp charcoals, and warm ivories rather than candy-colored SaaS gradients.
- **Consistency**: Maintain identical border-radius scale, elevation shadows, and icon strokes across all screens.
- **No Emoji as Structural Icons**: Always use SVG vector icons (Lucide Icons) with consistent 1.5-2px stroke.

### 5. Data Visualization & Charts (Priority 5)
- **Chart Matching**: Trends -> Line charts; Comparisons -> Bar charts; Spatial distribution -> Geospatial map layers.
- **Legends & Tooltips**: Always include explicit units (mg/L, meters below ground level, mm rainfall), dates, and visible legends.
- **Accessible Palette**: Differentiate series with both distinct hues and dashed/solid line strokes for colorblind legibility.
