# x.ai — Intelligence Workspace

A modern, dark-themed single-page template built with **Vite** and **Three.js**, inspired by the x.ai product design.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Bundler | Vite 5 |
| 3D Engine | Three.js r128 (CDN) |
| Rendering | WebGL (via Three.js) + Canvas 2D |
| Styling | Vanilla CSS (no framework) |
| Layout | CSS Grid + Flexbox |

---

## Quick Start (Standalone)

The project ships as a **single `index.html`** file that loads Three.js from a CDN. You can open it directly in any browser — no build step required:

```bash
# Simply open in browser:
open index.html
```

Or serve it with any static file server:

```bash
npx serve .
# → http://localhost 5000
```

---

## Vite Project Setup

If you want to convert this into a full Vite module project (e.g. for bundling, tree-shaking, or adding frameworks later):

```bash
npm install          # installs vite + three
npm run dev          # starts dev server → http://localhost:5173
npm run build        # production build → ./dist
npm run preview      # preview production build
```

> **Note:** The standalone `index.html` uses a CDN `<script>` tag for Three.js. In a Vite module setup, replace the CDN tag with `import * as THREE from 'three'` at the top of a `.js` file and move your logic there.

---

## Project Structure

```
xai-project/
├── index.html          # Complete single-file template
├── package.json        # Vite + Three.js deps
├── vite.config.js      # Vite configuration
└── README.md           # This file
```

---

## Sections Overview

| # | Section | What's happening |
|---|---|---|
| 1 | **Hero** | Floating particle field + animated torus-knot wireframe (Three.js). Mouse-reactive parallax. |
| 2 | **Interactive Insight Flow** | Three cards (Ingest → Analyze → Generate) with SVG geometry icons and hover micro-interactions. |
| 3 | **Intelligence Dashboard** | Full mock dashboard: sidebar nav, stat cards, a 2D Canvas line chart (3 datasets), recent-insights table. |
| 4 | **Signature Interaction** | An icosahedron wireframe with vertex displacement driven by scroll progress + mouse rotation (Three.js). |
| 5 | **CTA + Footer** | Starfield + nebula glow background (Three.js), subscribe form, 4-column footer. |

---

## Animation & Interaction Decisions

- **Hero geometry:** A torus knot was chosen over a plain sphere to add organic complexity without being chaotic. It rotates continuously and responds to mouse position via smooth lerp interpolation.
- **Particle field:** 220 softly drifting points create depth and atmosphere without competing with the central element.
- **Signature icosahedron:** Vertex positions are displaced using sine waves keyed to scroll progress, creating a subtle "breathing" morph effect. The wireframe + solid layer combo gives it weight.
- **Dashboard chart:** Drawn on a plain `<canvas>` element (no chart library) to keep the bundle minimal and give full control over styling.
- **Performance:** All Three.js scenes use `alpha: true` and minimal geometry. Pixel ratio is capped at 2×. No post-processing filters.
