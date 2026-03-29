# Phase 1: High-Impact Visuals - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning
**Source:** Sovereign Creative Head Directive (Twenty.com Pivot)

<domain>
## Phase Boundary
This phase delivers the fundamental visual shift from monochrome Zen-G to the "Vibrant Chromo" aesthetic. It includes the global design tokens, the redesigned ImmersiveHero, and the refined Marketplace cards.

### Deliverables
- `VibeHub.css`: Centralized glassmorthic and aura-gradient base styles.
- `TwentyHero.tsx`: A high-impact, colorful "One View" hero.
- `ChromoCards.tsx`: Refined marketplace items with luminous brand-glows.
- Fixed content: No typos (`MONHT`, `unlimed`), no placeholders (`SDFZDF`).

</domain>

<decisions>
## Implementation Decisions

### Aesthetic: Vibrant Chromo
- **Base Color**: #0A0A0A (Deepest black-grey).
- **Aura Fields**: Use absolute-positioned radial gradients in the background (Indigo, Cyan, Pink).
- **Glassmorphism**: `1px` white/10 borders, `blur(12px)`, `bg-black/20`.
- **Typography**: Display: **Syne** (Ultra-bold), Body: **Outfit** (Clean professional).

### Functional: "One View"
- The Hero MUST remain in one viewport view on all devices.
- On mobile, the "Aura" image scales down to fit beside/above the text without pushing it down.

### the agent's Discretion
- Specific aura placement (top-right vs center).
- Precise hover interaction for ChromoCards (glow intensity).

</decisions>

<canonical_refs>
## Canonical References
- `src/index.css`: To be updated with global Vibe tokens.
- `src/components/landing/redesign/ImmersiveHero.tsx`: To be rewritten as `TwentyHero`.
- `src/components/landing/redesign/MarketplacePreview.tsx`: To be updated with ChromoCards logic.

</canonical_refs>

<specifics>
## Specific Ideas
- The "Twenty.com" look uses ultra-clean rounded corners (`rounded-2xl` or `rounded-3xl` for cards, `rounded-sm` for technical labels).
- Use `framer-motion` for staggered entrance of the aura fields.

</specifics>

---
*Phase: 01-High-Impact-Visuals*
*Context gathered: 2026-03-29 via Creative Head Audit*
