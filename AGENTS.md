# PALAR GUARD AI — ARCHITECTURE & DESIGN SYSTEM DIRECTIVES

> **Tagline:** See the Risk. Predict the Change. Protect Every Drop.  
> **Category:** AI-Powered Environmental Intelligence and Water-Risk Decision Platform  
> **Geography:** Palar River Basin, Tamil Nadu, India  
> **Team:** Kayalvizhi J (Founder & Project Lead), Harini S, Aarthi L — Chennai Institute of Technology  

---

## 1. OFFICIAL BRAND IDENTITY & COLOR TOKENS

The interface must reflect an institutional-grade, premium Environmental DeepTech startup. Avoid generic blue SaaS styling and avoid generic purple AI glows.

- **Deep Forest Green** (`#062319`, `#083325`): Primary foundation and deep dark-mode backgrounds.
- **Emerald Accent** (`#10b981`, `#059669`): Primary status indicators, verified water flow, positive trends.
- **Charcoal & Slate** (`#121614`, `#1c221e`, `#2d3731`): Surface card containers, subtle hairlines, chrome borders.
- **Warm Ivory & Soft White** (`#fcfbf7`, `#f3f1ea`, `#ffffff`): Editorial headings, high-contrast readable body text.
- **Muted Stone** (`#85928a`, `#a4b2a9`): Metadata, secondary labels, chart axis rules.
- **Restrained Environmental Accents**:
  - Groundwater Stress Warning: Deep Amber (`#d97706`)
  - Pollution Anomaly Alert: Crimson Coral (`#e11d48`)
  - Rainfall / Recharge: Cyan Hydrology (`#0891b2`)
  - Confidence Rating: Sage Green (`#16a34a`)

---

## 2. INTELLIGENT 7-STAGE SKILL USAGE WORKFLOW

When designing or refining any frontend page or module for PALAR GUARD AI, adhere strictly to this sequential workflow:

```
Stage 1: UNDERSTAND  ──▶  Stage 2: ART DIRECTION  ──▶  Stage 3: PLAN
                                                             │
Stage 6: UNSLOP      ◀──  Stage 5: REVIEW         ◀──  Stage 4: IMPLEMENT
       │
Stage 7: VERIFY & TEST
```

1. **Stage 1 — Understand**:
   - Review domain requirements, target persona (environmental analyst, researcher, field investigator, community user), and data provenance.
2. **Stage 2 — Art Direction**:
   - Invoke `taste-skill`, `ui-ux-pro-max`, and `frontend-design`.
   - Commit to deliberate typography pairings, bespoke color tokens, and asymmetric layout anchors.
3. **Stage 3 — Plan**:
   - Define component boundaries, responsive breakpoints (mobile, tablet, desktop), state transitions (loading, error, empty, success), and chart specifications.
4. **Stage 4 — Implement**:
   - Build cleanly with React, TypeScript, Tailwind CSS, Lucide icons, Framer Motion, and Three.js/R3F for the Digital Twin.
5. **Stage 5 — Review**:
   - Invoke `impeccable` to audit hierarchy, contrast, density, alignment, copy clarity, and accessibility (WCAG 2.2 AA).
6. **Stage 6 — Unslop**:
   - Apply the 9-pass `unslop` refinement:
     - 4px spacing rhythm.
     - Single neutral ramp tinted toward forest stone.
     - Vector SVG line icons only (zero emojis in UI structure).
     - Clean editorial copy without hype words ("seamless", "supercharge", "magic").
     - Tabular numbers (`tabular-nums`) on all metric displays.
     - Nested radii calculation (`r_inner = r_outer - padding`).
     - Sub-300ms motion discipline.
7. **Stage 7 — Verify**:
   - Run TypeScript checks (`tsc --noEmit`), Vite production build (`npm run build`), and browser responsiveness verification.

---

## 3. PROHIBITED ANTI-PATTERNS (SLOP ARTIFACTS)

- ❌ NEVER use gradient text fills (`bg-gradient-to-r text-transparent bg-clip-text`).
- ❌ NEVER add glowing purple/neon backdrop blur circles or generic tech grids.
- ❌ NEVER use emojis (🌊 💧 🚀 📈 ⚠️) as structural navigation or button icons. Use Lucide React vector icons.
- ❌ NEVER use identical repeating 3-column card grids without an asymmetric focal anchor.
- ❌ NEVER use looping animations (`animate-pulse`, `animate-bounce`) unless indicating an active, live unacknowledged emergency alert.
- ❌ NEVER fabricate sensor data or accuse specific industries/facilities of pollution without verification.

---

## 4. SCIENTIFIC DATA PROVENANCE & CONFIDENCE BADGES

Every metric, chart, and map layer must prominently display its provenance category:

1. **[VERIFIED PUBLIC]** — Validated observations from official government/agency records (CGWB, CPCB, TNPCB, WRIS).
2. **[HISTORICAL REPORT]** — Observations extracted from published scientific literature or historical survey benchmarks.
3. **[COMMUNITY REPORT]** — Citizen-submitted observations undergoing moderation review.
4. **[MODEL PREDICTION]** — Statistical time-series forecast with confidence intervals and clear limitations.
5. **[SYNTHETIC DEMO DATA]** — Explicitly labeled demonstration data for unmonitored test scenarios:  
   *`"SYNTHETIC DEMONSTRATION DATA — NOT A REAL ENVIRONMENTAL MEASUREMENT"`*

---

## 5. PALAR GUARD AI CORE MODULE INVENTORY

The platform implements 16 dedicated, fully connected functional modules:

1. **Palar Basin Digital Twin** (Interactive 2D/3D Geospatial GIS with layer controls)
2. **Groundwater Stress Intelligence** (Hydrographs, depth-to-water trends, seasonal shifts)
3. **Groundwater Forecasting** (Explainable time-series projections with confidence bands)
4. **Rainfall & Recharge Intelligence** (Monsoon distribution, catchment precipitation, recharge zones)
5. **Water Quality Intelligence** (pH, TDS, EC, Chromium, Heavy metals, BOD, DO vs standards)
6. **Pollution Anomaly Detection** (Robust Z-score / IQR statistical outlier identification)
7. **Geospatial Risk Prioritisation** (Multi-criteria weighted risk ranking with explainable breakdown)
8. **Data Confidence & Reliability Engine** (Provenance badges, completeness metrics, audit trails)
9. **Community Water Reporting** (Citizen incident submission, geotagging, moderation pipeline)
10. **Early Warning & Investigation Centre** (Alerts dispatch, triage, field investigation notes)
11. **Recharge Intervention Intelligence** (Suitability scoring for check dams, recharge shafts)
12. **PALAR AI Environmental Assistant** (Grounded retrieval-augmented conversational intelligence)
13. **Analytics & Reporting Centre** (Custom query builder, CSV export, PDF dossier generator)
14. **Role-Based Access Control** (Enforced roles: Admin, Analyst, Researcher, Investigator, Community, Viewer)
15. **English & Tamil Support** (Full dual-language interface localization)
16. **Administration, Audit & Notifications** (User management, system health, audit log trail)
