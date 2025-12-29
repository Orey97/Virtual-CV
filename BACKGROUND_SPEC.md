# Global Background Design Spec

## 1. Forensic Findings
The initial audit revealed several factors contributing to the "visually weak and confusing" state:
- **Competing Backgrounds:** The Arsenal section had its own dedicated background layers (`.arsenal-bg`, `.grid-layer`, `.scan-line`) that clashed with the global atmosphere, creating a disjointed experience.
- **Jittery Motion:** The previous `#neural-field` implementation used a "connect-the-dots" particle system that felt chaotic and "screensaver-like," distracting from the content.
- **Inconsistent Depth:** The lack of a unified coordinate system meant some elements felt flat while others floated, breaking the immersion.

## 2. Global Design Specification

### Layer Stack
The new atmosphere is built on a unified `z-index` stack to ensure depth without interference:
1.  **Base (CSS):** Deep void background color (`#0a0a0a`) with a subtle radial gradient (`radial-gradient(circle at 50% 50%, #1a1f35 0%, #0a0a0a 70%)`) to ground the scene.
2.  **Grid (CSS):** A 3D perspective grid (`.atmo-grid`) using linear gradients, rotated 60 degrees on the X-axis, moving slowly to suggest forward momentum. Opacity: 0.15.
3.  **Stars (Canvas):** A multi-layer starfield (`#neural-field`) with 3 depth planes.
    *   *Layer 1 (Distant):* Smallest stars, slowest motion (parallax factor 0.05).
    *   *Layer 2 (Mid):* Medium stars, medium motion (parallax factor 0.1).
    *   *Layer 3 (Close):* Larger stars, fastest motion (parallax factor 0.2).
4.  **Vignette (CSS):** A global radial gradient overlay to darken edges and focus attention on the center content.

### Motion Rules
- **Drift:** Stars have a constant, ultra-slow drift (0.05px/frame) to keep the scene alive.
- **Parallax:** Scroll and mouse movements drive parallax at strictly clamped rates to prevent nausea or disorientation.
    *   Scroll Influence: Y-axis only.
    *   Mouse Influence: X and Y axis, heavily dampened (0.05 friction).
- **Twinkle:** Random sine-wave alpha oscillation for individual stars (1-3s periods) to add "cosmic" life.
- **No Zoom:** FOV changes and Z-axis zooming are strictly forbidden.

### Color Discipline
- **Palette:** Deep Navy (`#0a0f19`), Void Black (`#000000`), Starlight (`#ffffff`), Cyan Accents (`rgba(0, 255, 242, ...)`).
- **Consistency:** All sections now sit transparently on top of this global "dark mode" palette.

## 3. Performance & QA Checklist
- [x] **Pointer Events:** Verified that `.atmosphere-system` and `#neural-field` have `pointer-events: none` and do not block UI clicks.
- [x] **Readability:** Confirmed high contrast between text and background in Hero and Arsenal sections. Glassmorphism panels used where necessary.
- [x] **Mobile Performance:** Star count reduced on mobile devices (detected via screen width). Animation loop uses `requestAnimationFrame` for battery efficiency.
- [x] **Stability:** No jitter or "wobble" in star positions. Coordinates are float-based but rendered with sub-pixel precision.
- [x] **Integration:** Arsenal section backgrounds removed; transparency enables seamless view of the global starfield.
