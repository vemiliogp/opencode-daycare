# Design

## Context

See proposal.md for motivation. Current state: all authenticated routes live under `(main)/` with a single `AppSidebar` component. The `users` table has a `role` column (`user_role` enum: `staff`, `parent`, `admin`). There is no Next.js middleware file (`middleware.ts`) at the root — `utils/supabase/middleware.ts` is only a client helper. Feed state is managed by a single `FeedProvider` context.

## Goals / Non-Goals

**Goals:**
- Separate staff and family into distinct route groups with distinct layouts
- Enforce role-based access at the routing layer (middleware)
- Share UI components (`post-card`, `feed-posts`, `kid-card`) with a `mode` prop
- Split feed context: `useFeed()` for readonly, `useFeedActions()` for staff-only mutations
- Preserve all existing staff URLs and behavior (zero breaking changes)
- Scaffold family pages with no functional implementation

**Non-Goals:**
- Implementing family feed, resumen-dia, or account pages — scaffolds only
- Changing the DB schema or creating migrations
- Implementing avisos, crear-publicacion, or detalle-publicacion pages
- Multi-role support (single role per user)
- JWT metadata for role (DB query in middleware instead)

## Decisions

### D1: Middleware queries `users.role` from DB per request

**Decision:** The middleware reads `users.role` via a direct Supabase query on every authenticated request.

**Rationale:** Simpler than JWT metadata — no need to modify signup flow, email templates, or Supabase triggers. The query is a single-row lookup on a UUID primary key, which is fast. If performance becomes an issue, `user_metadata` can be added later.

**Alternatives considered:**
- JWT `user_metadata`: Zero queries but requires changes to user creation flow and migration of existing users.
- Session cookie with role: Adds complexity to cookie management and invalidation.

### D2: Route groups map to portals

**Decision:** `(staff)/` for staff (root URLs), `(family)/` for family (`/family/*` URLs).

**Rationale:** Next.js route groups allow different layouts per portal while keeping shared auth routes in `(auth)`. Staff keeps root URLs (`/`, `/kids`) for backward compatibility. Family gets `/family/*` namespace to avoid URL conflicts.

**Alternatives considered:**
- Same URLs, conditional layout: Not possible in Next.js — two `page.tsx` can't share a route.
- `/staff/*` and `/family/*`: Would change existing staff URLs, breaking bookmarks and links.

### D3: Feed context split into two hooks

**Decision:** `useFeed()` returns `{ posts: Post[] }` (readonly, always available). `useFeedActions()` returns `{ addPost, postDialogOpen, closePostDialog }` (staff-only, throws if called outside Staff layout).

**Rationale:** Type-safe separation prevents family code from accidentally calling staff-only actions. No need for conditional logic or no-op implementations.

**Alternatives considered:**
- Single hook with `mode` prop: Loses type safety, `addPost` exists but does nothing in family.
- Separate providers: Adds boilerplate to layout composition.

### D4: Shared components use `mode` prop

**Decision:** Components like `post-card`, `feed-posts`, `kid-card` accept an optional `mode?: 'staff' | 'family'` prop to conditionally render role-specific elements.

**Rationale:** Maximizes code reuse while keeping behavior correct. The `mode` propagates from the layout level, so individual pages don't need to know about roles.

**Alternatives considered:**
- Separate component files (`staff-post-card`, `family-post-card`): More files, harder to keep in sync when shared behavior changes.
- Context-based mode: Requires wrapping every component tree, adds indirection.

### D5: `app-sidebar.tsx` is deleted, not deprecated

**Decision:** Remove `app-sidebar.tsx` entirely and replace with `staff-sidebar.tsx` + `family-sidebar.tsx`.

**Rationale:** No external consumers of this component. Keeping a deprecated re-export adds confusion. The component is internal to the app layout.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| DB query per request in middleware adds latency | Single-row UUID lookup is ~1ms; acceptable for now. Add caching if needed later. |
| Family scaffolds may drift from design comps | Design comps are the source of truth; future implementation will match them. |
| Shared component `mode` prop could grow with more differences | If a component diverges too much (e.g., >50% different rendering), extract into separate files. |
| Users without a `users` row (auth-only) get redirected to login | This is correct behavior — all users should have a `users` row. Log these cases for debugging. |
| `getUserContext.ts` change may affect callers | Only adds `role` field to returned object — additive, not breaking. |

## Migration Plan

No deployment steps needed — this is a code-only change:
1. All staff routes keep their URLs (`/`, `/kids`, etc.)
2. Family routes are new (`/family/*`)
3. No database migrations
4. No env var changes
5. Deploy and verify staff can still access `/` and `/kids`
6. Verify parent users get redirected from `/` to `/family`
