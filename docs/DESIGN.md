# BaleKerta Design Direction (DESIGN.md)

Reading this as: Cultural Spatial & Architectural Pre-Inspection Web App (BaleKerta) for Balinese architects, land owners, and TABG PBG reviewers, in a Balinese Lontar & Bata Terracotta Architectural Drafting language, dial ENERGY 2 / RHYTHM 2 / MOTION 1.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

## 1. Visual Identity & Dual-Theme Palette (R-20, R-21, R-25, R-29, R-34)

BaleKerta uses a strict 2-core + 1-accent architectural color system that adapts seamlessly between **Mode Gelap (Deep Obsidian Ink)** and **Mode Terang Lembut (Warm Lontar / Soft Limestone Paper)** without harsh `#FFFFFF` glare:

### Mode Gelap (Dark Mode - `html.dark`)
- **Canvas & Surfaces (`ink`):**
  - `ink-950`: `#0E0D0C` (`14 13 12`) - Main drafting canvas (`16.24:1` contrast with `bone-100`).
  - `ink-900`: `#161412` (`22 20 18`) - Primary architectural panel & card surface.
  - `ink-850`: `#1D1A17` (`29 26 23`) - Elevated inset surface (`6.61:1` contrast with `bone-400`).
  - `ink-800`: `#26221E` (`38 34 30`) - Active/selected state surface.
  - `ink-700`: `#332E29` (`51 46 41`) - Crisp architectural structural border.
  - `ink-600`: `#4A433C` (`74 67 60`) - Interactive control boundary (`>= 3:1` non-text contrast).
- **Typography & Primary Contrast (`bone`):**
  - `bone-100`: `#F0EAE1` (`240 234 225`) - Primary headings, key metrics, and solid primary CTA fill.
  - `bone-200`: `#E0D8CA` (`224 216 202`) - Primary CTA hover and strong subheadings.
  - `bone-300`: `#C8BFA8` (`200 191 168`) - Body prose and technical descriptions.
  - `bone-400`: `#A89F8D` (`168 159 141`) - Secondary labels, coordinates, and metadata (`>= 6.6:1` AA).
- **Accent (`clay` - Bata Bali Terracotta):**
  - `clay`: `#E06D4B` (`224 109 75`) - Used exclusively for spatial violations, critical alerts, and Kaja vector markers (`5.65:1` AA on `ink-900`).

### Mode Terang Lembut (Soft Light / Lontar Mode - `html.light`, Bebas Silau)
- **Canvas & Surfaces (`ink`):**
  - `ink-950`: `#F2ECE1` (`242 236 225`) - Warm Lontar / Limestone canvas (glare-free ~0.83 luminance).
  - `ink-900`: `#FAF6EE` (`250 246 238`) - Soft Warm Ivory card & sheet surface (never harsh pure white).
  - `ink-850`: `#EAE2D3` (`234 226 211`) - Warm Sand inset box & secondary surface.
  - `ink-800`: `#DFD5C3` (`223 213 195`) - Active/selected control surface.
  - `ink-700`: `#CFC4B0` (`207 196 176`) - Crisp architectural rule & card border.
  - `ink-600`: `#B5A892` (`181 168 146`) - Emphasized control border.
- **Typography & Primary Contrast (`bone`):**
  - `bone-100`: `#1C1916` (`28 25 22`) - Deep Charcoal Ink for primary headings & primary CTA button fill (`14.88:1` contrast on `#F2ECE1`).
  - `bone-200`: `#2E2924` (`46 41 36`) - Primary CTA hover & strong subheadings.
  - `bone-300`: `#423B34` (`66 59 52`) - Body prose and regulatory explanations.
  - `bone-400`: `#5C5349` (`92 83 73`) - Technical labels and monospace captions (`5.85:1` AA on `#EAE2D3`).
- **Accent (`clay` - Bata Bali Terracotta):**
  - `clay`: `#B84322` (`184 67 34`) - Deep Terracotta Brick for spatial violations and Kaja vector line (`4.62:1` AA on `#F2ECE1`, `5.40:1` on `#FAF6EE`).

## 2. Written Reasons for Major Design Decisions (R-31)

- **Why this color palette:** Warm Lontar parchment (`#F2ECE1`) and Deep Obsidian Ink (`#0E0D0C`) paired with Bata Bali Terracotta (`#B84322` / `#E06D4B`) ground the interface in traditional Balinese manuscript (Lontar) and brick (Bata) materials while eliminating screen glare.
- **Why this layout:** A 3-stage spatial workbench (1. Geodesic Site & Sanga Mandala Matrix -> 2. Side-by-Side Input Controls & Live Floor Plan Canvas -> 3. Dual-Pane Spatial Audit & Technical/Legal Ledger) aligns each screen's composition with the single engineering decision made at that step.
- **Why this typography:** `Geist Sans` provides high-legibility Indonesian prose at dense technical scales, while `Geist Mono` isolates numeric bearings, WGS84 coordinates, KDB ratios, Sikut Hasta conversions, and Perda article codes.
- **Why this spacing & radius scale:** Structured architectural radii (`6px` for technical badges/inputs, `8px` for interactive buttons, `12px` for primary drafting panels) and responsive density (`p-4` on mobile to `p-6` on desktop) distinguish interactive controls from structural containers.
- **Why use cards:** Cards group distinct spatial instruments (Geodesic Map, 3x3 Sanga Mandala Matrix, Room Inventory, Violation Diagnosis, and A4 PBG Inspection Sheet) so complex spatial data remains scannable without visual bleed.
- **Why these icons & motion:** Technical geometric icons (`Compass`, `Landmark`, `Layers`, `Printer`, `Scale`) are paired with visible text labels to clarify architectural actions, and motion is capped at `MOTION 1` (instant state feedback and smooth step transitions respecting `prefers-reduced-motion`).
