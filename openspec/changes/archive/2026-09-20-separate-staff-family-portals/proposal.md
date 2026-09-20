# Proposal

## Why

OpenDayCare currently serves all authenticated users from a single route group (`(main)/`) with a single sidebar (`AppSidebar`). The design comps define two distinct portals — **Staff** (teachers who create posts, manage children, send announcements) and **Family** (parents who view their children's feed and daily summaries) — with different navigation, capabilities, and UI. Without a route-level separation, staff-only pages and family-only pages share the same URL namespace and layout, making it impossible to enforce role-based access control, build family-facing features, or maintain distinct sidebars and navigation.

## What Changes

- **Route reorganization**: Move current `(main)/*` routes → `(staff)/*` (same public URLs: `/`, `/kids`, `/kids/[id]`). Remove `(main)/pokemon/*` (demo code, not in designs).
- **New family routes**: Create `(family)/*` route group under `/family/*` with scaffold pages (`page.tsx`, `resumen-dia/page.tsx`, `account/page.tsx`). No functional implementation — placeholders only.
- **New middleware**: Create `middleware.ts` (root) that reads `users.role` from the DB and enforces role-based routing:
  - `staff` → allow `/`, `/kids/*`, `/avisos/*`, block `/family/*` → redirect `/`
  - `parent` → allow `/family/*`, block `/kids/*`, `/avisos/*` → redirect `/family`
  - `admin` → same as `staff`
  - Unauthenticated → redirect `/login`
- **Sidebar split**: Extract `AppSidebar` → `StaffSidebar` + new `FamilySidebar`. Staff sidebar keeps "Nueva publicación" button and staff nav. Family sidebar shows "Familia" brand, simplified nav (Feed, Resumen del día, Mi cuenta), no create button.
- **Feed provider split**: `useFeed()` returns `{ posts }` (readonly). New `useFeedActions()` returns `{ addPost, postDialogOpen, closePostDialog }` — only available inside Staff layout.
- **Shared component updates**: `post-card`, `feed-posts`, `kid-card` gain `mode?: 'staff' | 'family'` prop to conditionally render role-specific elements (e.g., "Editar" button only for staff).
- **Cleanup**: Delete `app-sidebar.tsx`, `(main)/layout.tsx`.

## Capabilities

### New Capabilities

- `staff-portal`: Staff-facing route group with full CRUD capabilities — create posts, manage children, view announcements. All existing functionality lives under this capability.
- `family-portal`: Family-facing route group under `/family/*` with read-only access to children's feed and daily summaries. Scaffolds only in this change; functional implementation in a future change.
- `role-based-routing`: Middleware-based access control that routes users to their portal based on `users.role` and prevents cross-portal access.

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- **Routes**: All staff routes keep their current public URLs (`/`, `/kids`, `/kids/[id]`). New family routes appear at `/family/*`.
- **Components**: `app-sidebar.tsx` deleted (replaced). `feed-provider.tsx` API changes (split into two hooks). `post-card`, `feed-posts`, `kid-card` gain optional `mode` prop.
- **Middleware**: New `middleware.ts` root file adds auth + role checks on every request. `utils/supabase/middleware.ts` helper remains unchanged.
- **Auth**: `getUserContext.ts` extended to include `role` in returned context. No DB schema changes.
- **Zero breaking changes for staff**: Existing staff users see no difference in URLs or behavior.
