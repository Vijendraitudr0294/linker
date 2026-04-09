# Phase 2: Security & Authentication Protocol - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning
**Source:** Roadmap & Code Audit

<domain>
## Phase Boundary
This phase establishes a robust admin/dashboard protection layer and cleans up the auth-related components for a "Twenty.com" grade architecture.

- [x] Consolidate `ProtectedRoute` and `PublicRoute` into `src/components/auth/`.
- [x] Implement RBAC (Role-Based Access Control) for internal admin routes.
- [x] Fix auth redirection edge cases (already logged in → /dashboard).
</domain>

<decisions>
## Implementation Decisions

### Auth Organization
- **Move to `src/components/auth/`**: Existing components in `src/components/` will be migrated.
- **Refine `ProtectedRoute`**: Add an optional `adminOnly` property. If `adminOnly` is true, check `user.role === 'admin'`.

### Admin Protection
- **Role Check**: Admin routes in `App.tsx` should explicitly use the `adminOnly` flag or a separate `AdminRoute`.
- **Redirects**: If a non-admin tries to access `/dashboard/admin`, redirect to `/dashboard`.

### Global Redirects
- **Already Logged In**: `PublicRoute` already handles this, but verify `/login` redirect on "/" landing if session is active (or stay on landing, usually landing remains public).
</decisions>

<canonical_refs>
## Canonical References
- `src/stores/authStore.ts` — Role and Auth state source of truth.
- `src/App.tsx` — Router configuration.
- `src/components/ProtectedRoute.tsx` — Base implementation to refine.
- `src/components/PublicRoute.tsx` — Base implementation to refine.
</canonical_refs>

<specifics>
## Specific Ideas
- **Loading State**: Maintain the clean loading spinner during auth initialization.
- **Role field**: Use `user.role` from `authStore`.
</specifics>

<deferred>
## Deferred Ideas
- **2FA Support**: Not required for v1.0.
- **OAuth Expansion**: Supabase supports it, but not in this phase's scope.
</deferred>
