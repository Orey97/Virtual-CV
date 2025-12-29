# QA Report & Design Spec

## 1. Forensic Findings (Pre-Fix Analysis)

The previous implementation suffered from several visual and UX conflicts:

*   **Arsenal Section Isolation:** The Arsenal section previously attempted to render its own background context, creating a jarring visual disconnect from the rest of the application. This broke the "single continuous universe" immersion.
*   **Visual Competition:** High-contrast elements in the previous background layers competed with foreground text, reducing readability.
*   **Motion Jitter:** Random, rapid movements in the particle systems created a "screensaver" or "demo" feel rather than a stable, instrument-grade interface.
*   **Interactive Distraction:** Excessive mouse-follow behavior (connect-the-dots) drew attention away from the content and towards the background.

## 2. Global Background Design Spec

### Layer Stack (Z-Index Order)
1.  **Base:** Deep space gradient (CSS `background-color` + radial gradients).
2.  **Cosmic Field:** `#neural-field` Canvas (Z-index: -1).
    *   **Nodes:** Sparse, white (opacity 0.1 - 0.5), size 1px-2px.
    *   **Motion:** Deterministic "Autonomous Drift" (Vector Z +0.08).
    *   **Interaction:** Minimal dampening (0.005 influence), no aggressive swarm behavior.
3.  **Atmosphere:** `.atmosphere-system` (Z-index: 0).
    *   **Noise:** `background-noise.png` overlay (opacity 0.03).
    *   **Vignette:** Radial gradient to darken edges and focus center.
    *   **Grid:** `grid-pattern.png` (opacity 0.05) for structural depth.
4.  **Content:** Main UI layers (Z-index: 10+).

### Motion Rules
*   **Drift:** Constant, slow Z-axis movement creates a feeling of forward travel through a vast void.
*   **Parallax:** Nodes move at speeds relative to their simulated Z-depth.
*   **Stability:** No sudden zooms or direction changes.
*   **Mobile:** Reduced node count (250) for stable 60fps; same motion physics.

### Color Discipline
*   **Background:** Deep Navy/Black (`#0a0a12` base).
*   **Nodes:** Pure White (`#ffffff`) with varying alpha.
*   **Glass Elements:** Semi-transparent dark panels (`rgba(10, 10, 18, 0.8)`) to allow background bleed-through.

## 3. Implementation Summary
*   **`style.css`**: Refined atmosphere opacities, ensured global coverage.
*   **`main.js`**: Replaced `CosmicField` with `SystemLattice`.
    *   Removed random jitter.
    *   Implemented "SystemLattice" class for structured, orderly motion.
    *   Optimized render loop with `requestAnimationFrame`.
*   **`arsenal-3d.css`**: Removed section-specific background overrides.

## 4. Performance & QA Checklist

| Check | Status | Notes |
| :--- | :--- | :--- |
| **No Pointer Interference** | PASS | Canvas `pointer-events: none` confirmed. |
| **Readability** | PASS | Text clear against dark background (verified via `lattice_hero_mobile.png`). |
| **Mobile Performance** | PASS | Node count capped at 250. 60fps target met on sim. |
| **Arsenal Integration** | PASS | Arsenal glass cards show global background (verified via `lattice_arsenal_mobile.png`). |
| **Motion Stability** | PASS | No flicker, no jitter. Smooth drift confirmed. |
| **Zoom/FOV** | PASS | No FOV changes or camera dolly effects. |
