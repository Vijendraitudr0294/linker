# Biotra UI/UX Orchestration Rules

These rules are MANDATORY for all platform developments to ensure high-fidelity, premium, and responsive user experiences.

## 1. Color & Atmosphere
- **60-30-10 Rule**: 60% Base (Neutral/Dark), 30% Secondary (Subtle Gradients), 10% Accent (Brand/Vibrant).
- **Glassmorphism Standard**: All floating panels must use `backdrop-blur-md` or `backdrop-blur-xl` with a border of `white/5` or `black/5` for physical depth.
- **Dynamic Contrasts**: Texts must always use `getContrastColor` logic to ensure readability against dynamic user themes.

## 2. Structure & Grid
- **The "Substrate" Principle**: All layouts must sit on an invisible 4px/8px modular grid.
- **Card Hierarchy**: Nested cards must have slightly smaller corner radii than their parents (e.g., Parent 40px -> Child 32px).
- **Biotra Mirror Compliance**: All profile-related components MUST work in a 380px fixed-width container without horizontal overflow.

## 3. Typography Hierarchy
- **Primary Titles**: `font-black`, `tracking-tight`, `leading-tight`. Use `Outfit` or `Plus Jakarta Sans`.
- **Labels**: `text-[10px]`, `font-black`, `uppercase`, `tracking-[0.2em]`, `text-black/40`.
- **Body**: `font-medium`, `leading-relaxed`, `text-black/60`.

## 4. Micro-Interactions
- **Hover Transitions**: `transition-all duration-300 cubic-bezier(0.16, 1, 0.3, 1)`.
- **Interactive Feedback**:
  - Hover: Use `translate-y-[-2px]` and `shadow-xl`.
  - Active: Use `scale-[0.98]` or `active:shadow-none`.
- **Loading States**: Never show a blank screen; always use `Loader2` or skeleton pulses.

## 5. Mobile-First Logic
- **Touch Targets**: Buttons must be at least `44px` in height.
- **Responsive Stacks**: Avoid horizontal scrolling for critical buttons. Use vertical stacks (`flex-col`) on widths < 400px.
- **Edge Padding**: Always maintain at least `16px` (p-4) gutter on mobile views.

## 6. Implementation Checklist
- [ ] Does it use design tokens (not hardcoded hex)?
- [ ] Is it readable on both light and dark backgrounds?
- [ ] Does it work inside the Live Mirror frame?
- [ ] Are animations smooth (no layout shifts)?
