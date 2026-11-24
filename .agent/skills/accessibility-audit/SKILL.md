---
name: accessibility-audit
description: "WCAG 2.2 AA accessibility verification. Semantic HTML, keyboard traversal, ARIA announcements, color contrast validation, and reduced motion compliance."
---

# Accessibility & Universal Usability Architecture

Accessible design is not an afterthought; it is fundamental frontend engineering.

## Standards Checklist

1. **Semantic Structure**:
   - Use proper landmarks: `<header>`, `<nav>`, `<main>`, `<section>`, `<aside>`, `<footer>`.
   - Sequential heading hierarchy (`h1` -> `h2` -> `h3`) without skipping levels.

2. **Color Contrast & Readability**:
   - Minimum 4.5:1 contrast ratio for all normal body text; 3:1 for large display titles and interactive controls.
   - Never rely on color alone to communicate critical states: pair color with icons and descriptive text badges (e.g. "Anomaly Detected [High Severity]").

3. **Keyboard Operability**:
   - Every interactive control must be focusable via `Tab` and activatable via `Enter` / `Space`.
   - Modals and slide-out drawers must trap keyboard focus while open and restore focus to trigger button upon close (`Escape` key dismiss).

4. **Screen Reader Integration**:
   - Provide `aria-live="polite"` for asynchronous updates (such as live filter results or alert counts).
   - Descriptive `alt` attributes on images and diagrams; decorative elements get `aria-hidden="true"`.
