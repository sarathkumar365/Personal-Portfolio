# How I Build Section: 3D Map/Timeline Research

Date: March 20, 2026
Branch: `codex/how-i-build-3d-map-research`

## Goal
Document how real map/timeline UIs achieve 3D effects, what frontend teams use in production, and what this means for the current landing page "How I Build Software" section.

## Current Section (As Implemented)
The current section is implemented in:
- `src/components/software-path-map.tsx`
- `src/components/home-page.tsx`
- `data-source/home.json`

Current behavior:
- Dashed SVG path rendered inside a fixed container.
- Milestones are positioned via `SVGPathElement.getPointAtLength()`.
- Hover/focus reveals an information card with skills for each phase.
- Visual depth is stylistic (CSS perspective/context), not true geospatial 3D.

Conclusion:
- Current experience is a polished pseudo-map/timeline.
- It does not use a map engine, camera pitch, terrain, or depth-tested WebGL layers.

## What "Real" 3D Map Effect Means
In production map products, 3D usually includes:
- Vector/WebGL map rendering.
- Camera controls (pitch/tilt + heading/rotation).
- Real depth/occlusion between basemap geometry and overlays.
- Optional terrain and 3D building extrusion.

This is fundamentally different from a flat SVG path with animated cards.

## What FE Teams Commonly Use
Most common stack patterns:
1. **Map engine:** Mapbox GL JS or MapLibre GL JS.
2. **Overlay/data viz:** deck.gl (`TripsLayer`, `PathLayer`) for animated paths/timelines.
3. **React layer:** `react-map-gl` wrappers for React integration.
4. **Narrative motion:** GSAP/scroll orchestration for camera-driven storytelling.

Why this stack is common:
- WebGL map engines handle camera, terrain, and 3D primitives efficiently.
- deck.gl handles high-performance animated paths/temporal playback.
- React wrappers simplify state/control integration with app UI.

## Option Analysis For This Portfolio

### Option A: Keep Current Component + Stronger Pseudo-3D
Use current SVG component, but add:
- Foreground/background parallax layers.
- Dynamic shadow/light response on mouse/scroll.
- Subtle camera-like transforms tied to scroll position.

Pros:
- Low complexity and low bundle impact.
- No external map tokens or map tile dependencies.
- Fastest path to a better visual feel.

Cons:
- Still not true 3D map behavior.
- Limited realism compared to WebGL map pipelines.

### Option B: True WebGL Map Timeline
Rebuild section with MapLibre/Mapbox + optional deck.gl.

Pros:
- Real camera pitch/rotation and depth feel.
- Supports terrain/buildings and richer map storytelling.
- Closer to modern map product behavior.

Cons:
- More implementation and tuning effort.
- Larger runtime complexity and performance considerations.
- Potential token/licensing constraints (Mapbox) unless using MapLibre-compatible tiles.

## Recommended Practical Direction
For a portfolio landing page, start with **Option A** for speed and control.
If the goal is to showcase map-grade engineering depth, build a dedicated **Option B** variant (or separate demo page) and keep the homepage version lightweight.

## Reference Sources
- Google Maps WebGL docs:
  - https://developers.google.com/maps/documentation/javascript/webgl
  - https://developers.google.com/maps/documentation/javascript/webgl/webgl-overlay-view
  - https://developers.google.com/maps/documentation/javascript/examples/webgl/webgl-tilt-rotation
- Mapbox GL JS examples:
  - https://docs.mapbox.com/mapbox-gl-js/example/3d-buildings/
  - https://docs.mapbox.com/mapbox-gl-js/example/add-terrain/
  - https://docs.mapbox.com/mapbox-gl-js/example/animate-point-along-route/
- deck.gl docs:
  - https://deck.gl/docs/api-reference/geo-layers/trips-layer
  - https://deck.gl/docs/api-reference/layers/path-layer
- MapLibre example:
  - https://maplibre.org/maplibre-gl-js/docs/examples/3d-terrain/
- CSS 3D references:
  - https://developer.mozilla.org/en-US/docs/Web/CSS/perspective
  - https://developer.mozilla.org/en-US/docs/Web/CSS/transform-style

## Notes
This document is research-only and does not change UI behavior by itself.
