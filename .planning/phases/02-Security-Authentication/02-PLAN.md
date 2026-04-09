# Phase 2: Security & Authentication - Plan

## Summary
Secure the creation substrate by implementing role-based access control (RBAC) and consolidating auth logic into a clean, predictable architecture.

## Technical Goals
- **Auth Consolidation**: Move `ProtectedRoute.tsx` and `PublicRoute.tsx` to `src/components/auth/`.
- **RBAC Implementation**: Enhance `ProtectedRoute` with an `adminOnly` flag or a separate `AdminRoute`.
- **Router Security**: Apply `adminOnly` protection to all `/dashboard/admin/*` routes in `App.tsx`.
- **Clean Redirects**: Ensure users with correct sessions are directed to `/dashboard` from public auth pages.

## Frontmatter
- **Wave**: 1 (Sequential)
- **Files Modified**: `src/components/auth/ProtectedRoute.tsx`, `src/components/auth/PublicRoute.tsx`, `src/App.tsx`
- **Requirements Addressed**: [P2.1], [P2.2], [P2.3], [P2.4]

---

<tasks>

<task id="P2.1" wave="1">
<objective>Consolidate Auth Components</objective>
<read_first>
- `src/components/ProtectedRoute.tsx`
- `src/components/PublicRoute.tsx`
</read_first>
<action>
1. Create `src/components/auth/` directory.
2. Move (copy and then delete) `src/components/ProtectedRoute.tsx` and `src/components/PublicRoute.tsx` to `src/components/auth/`.
3. Update imports in the moved files (e.g., `@/stores/authStore` should remain as `@/stores/authStore`).
</action>
<acceptance_criteria>
- `src/components/auth/ProtectedRoute.tsx` exists.
- `src/components/auth/PublicRoute.tsx` exists.
- `src/components/ProtectedRoute.tsx` is removed.
- `src/components/PublicRoute.tsx` is removed.
</acceptance_criteria>
</task>

<task id="P2.2" wave="1">
<objective>Implement RBAC in ProtectedRoute</objective>
<read_first>
- `src/components/auth/ProtectedRoute.tsx`
- `src/stores/authStore.ts`
</read_first>
<action>
1. Add an optional `adminOnly?: boolean` prop to `ProtectedRoute`.
2. Extract the `user` object from `useAuthStore`.
3. If `adminOnly` is true:
   - If user is NOT an admin (e.g., `user?.role !== 'admin'`), redirect to `/dashboard` using `<Navigate to="/dashboard" replace />`.
</action>
<acceptance_criteria>
- `ProtectedRoute.tsx` handles `adminOnly` prop.
- If `adminOnly` is true and `role !== 'admin'`, the component redirects to `/dashboard`.
- If user is not authenticated, it still redirects to `/login`.
</acceptance_criteria>
</task>

<task id="P2.3" wave="1">
<objective>Secure Admin Routes in App.tsx</objective>
<read_first>
- `src/App.tsx`
</read_first>
<action>
1. Update `ProtectedRoute` and `PublicRoute` imports to `@/components/auth/...`.
2. Find the routes under `/dashboard/admin` and wrap them with `ProtectedRoute` using the `adminOnly` prop.
   - Example: `<Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />`.
3. Ensure the nested admin routes (like `admin/settings` and `admin/user/:userId`) are similarly protected.
</action>
<acceptance_criteria>
- `App.tsx` imports point to the new `auth/` folder.
- All admin-only routes in the `/dashboard` subtree now pass `adminOnly` to `ProtectedRoute`.
</acceptance_criteria>
</task>

<task id="P2.4" wave="1">
<objective>Final Auth Verification</objective>
<read_first>
- `src/App.tsx`
- `src/components/auth/PublicRoute.tsx`
</read_first>
<action>
1. Audit `PublicRoute.tsx` to ensure it redirects already authenticated users to `/dashboard`. (It already does but verify).
2. Ensure `AppInit` correctly initializes the session on boot (already exists but verify it doesn't break redirections).
</action>
<acceptance_criteria>
- Unauthenticated access to `/dashboard` redirects to `/login`.
- Non-admin authenticated access to `/dashboard/admin` redirects back to `/dashboard`.
- Authenticated access to `/login` redirects to `/dashboard`.
</acceptance_criteria>
</task>

</tasks>

## Verification Criteria
### Security Integrity
- [ ] No direct URL access to dashboard for guests.
- [ ] No admin access for regular users.
- [ ] Clean loading state during auth check.

### Reliability
- [ ] Auth state persists cross-refresh.
- [ ] Proper redirection to `/login` on logout.

## must_haves
- [ ] Functional `adminOnly` protection.
- [ ] Centralized `auth/` components.
- [ ] 100% correct URL redirection.
