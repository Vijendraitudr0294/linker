# Phase 1: High-Impact Visuals - Plan

## Summary
Transform the Biotra landing experience into a high-vibrancy, "Twenty.com" inspired "Sovereign Creative Studio" through global CSS tokens and a "One View" hero redesign while clearing visual technical debt.

## Technical Goals
- **Global Design System**: Implement `VibeHub` tokens (glassmorphism, aura gradients).
- **Core Landing**: Redesign the Hero and Marketplace components for maximum "color full" impact.
- **Content Integrity**: Eradicate all placeholders (`SDFZDF`) and typos (`MONHT`).

## Frontmatter
- **Wave**: 1 (Parallelizable)
- **Files Modified**: `src/index.css`, `src/components/landing/redesign/ImmersiveHero.tsx`, `src/components/landing/redesign/MarketplacePreview.tsx`, `src/components/landing/redesign/TrustSection.tsx`
- **Requirements Addressed**: [P1.1], [P1.2], [P1.3], [P1.4]

---

<tasks>

<task id="P1.1" wave="1">
<objective>Implement 'VibeHub' Global Design System Tokens</objective>
<read_first>
- `src/index.css`
- `.planning/phases/01-High-Impact-Visuals/01-CONTEXT.md`
</read_first>
<action>
Add the following classes to `src/index.css`:
1. `.vibe-glass`: `backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl`.
2. `.vibe-aura-indigo`: `bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)]`.
3. `.vibe-aura-cyan`: `bg-[radial-gradient(circle,rgba(6,182,212,0.15)_0%,transparent_70%)]`.
4. Update `.boutique-container` to use a 1280px max-width and `px-8`.
</action>
<acceptance_criteria>
- `src/index.css` contains `.vibe-glass` definition.
- `src/index.css` contains at least two `.vibe-aura-*` radial gradient classes.
- `.boutique-container` max-width is `1280px`.
</acceptance_criteria>
</task>

<task id="P1.2" wave="1">
<objective>Eradicate Global Typos and Placeholders</objective>
<read_first>
- `ROADMAP.md` (to find all listed typos)
- `src/pages/RedesignedPage.tsx`
- `src/components/landing/redesign/TrustSection.tsx`
</read_first>
<action>
1. Replace all instances of `MONHT` with `MONTH`.
2. Replace all instances of `unlimed` with `unlimited`.
3. Search for and remove `SDFZDF`, `SDFSDFSD`, and `TEST` placeholder strings in all `src/components/landing/` components.
4. Replace placeholder text "STAY CONNECTED" with "JOIN THE SOVEREIGN COLLECTIVE".
</action>
<acceptance_criteria>
- `grep -r "MONHT" src/` returns 0 results.
- `grep -r "unlimed" src/` returns 0 results.
- `grep -r "SDFZDF" src/` returns 0 results.
</acceptance_criteria>
</task>

<task id="P1.3" wave="2">
<objective>Redesign ImmersiveHero (Twenty.com Style)</objective>
<read_first>
- `src/components/landing/redesign/ImmersiveHero.tsx`
</read_first>
<action>
1. Shift layout to a **Center-Aligned** or **Clean Split** (Sovereign style).
2. Implement **Vibrant Aura Background**: Position two absolute-positioned div elements behind the content with `.vibe-aura-indigo` and `.vibe-aura-cyan`.
3. Typography: Use `fluid-text` for the H1 with `Syne` ultra-bold, max 110px.
4. Redesign the primary CTA to use a luminous border or hover glow.
5. Ensure the sculptural image scales appropriately without pushing the H1 below the fold on mobile (375px).
</action>
<acceptance_criteria>
- `ImmersiveHero.tsx` uses at least one `vibe-aura` class.
- The component is fully visible in one viewport height (One-View) on a 1920x1080 screen.
- Mobile H1 font size is at least 40px but doesn't cause overflow.
</acceptance_criteria>
</task>

<task id="P1.4" wave="2">
<objective>Refine Marketplace Cards (ChromoCards)</objective>
<read_first>
- `src/components/landing/redesign/MarketplacePreview.tsx`
</read_first>
<action>
1. Apply `.vibe-glass` to the card containers.
2. Add a sub-glow to each card on hover (Indigo for Alex Volkov, Cyan for Sarah Chen).
3. Increase card border radius to `1.5rem` (rounded-3xl).
4. Update tags to use Space Mono small caps with reduced letter spacing.
</action>
<acceptance_criteria>
- `MarketplacePreview.tsx` uses the `.vibe-glass` class.
- Card `rounded-` class is `3xl` or equivalent custom px.
- Cards exhibit a luminous glow on hover in the browser.
</acceptance_criteria>
</task>

</tasks>

## Verification Criteria
### Visual Integrity
- [ ] No placeholders visible in the Hero fold.
- [ ] Hero "Aura" background gives the "color full" feel as requested.
- [ ] Responsiveness tested on Mobile, Tablet, and Desktop.

### Content
- [ ] Typos resolved.
- [ ] "Twenty.com" clean-professional aesthetic achieved.

## must_haves
- [ ] Vibrant Aura Identity (Twenty-style).
- [ ] 100% Correct Content (No "MONHT").
- [ ] One-View Responsive Hero.
