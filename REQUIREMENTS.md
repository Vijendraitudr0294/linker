# Requirements: Fixing the Biotra Platform

## V1 Scope: The "No-Shit" Fixes
- [ ] Correct all typos:
  - `MONHT` -> `MONTH`
  - `unlimed` -> `unlimited`
- [ ] Remove all "SDFZDF", "SDFSDFSD", "TEST" placeholders.
- [ ] Implement robust auth protection on all `/dashboard` and `/admin` routes. If a user is NOT logged in and tries to access these routes, they must be redirected to `/login`.
- [ ] Populate the Footer with real-ish links (Social, Product, Company).
- [ ] Flesh out the "Subscribe" section in the footer.
- [ ] Fix the contrast of buttons in the Design Studio themes (especially the "LINKS" and "Schedule" buttons).
- [ ] Replace the placeholder product image in the live preview with a more representative high-end creator product screenshot.
- [ ] Replace static text in social flow with more dynamic-sounding mockups (e.g. "Optimal time discovered from your analytics...").

## Out of Scope
- [ ] Adding new complex features.
- [ ] Migration to a new tech stack.
- [ ] Custom domain mapping logic (out of scope for this "fix").
