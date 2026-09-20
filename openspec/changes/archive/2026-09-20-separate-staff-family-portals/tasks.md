# Tasks

## 1. Route Reorganization

- [x] 1.1 Create `app/(staff)/` directory and move `app/(main)/page.tsx` → `app/(staff)/page.tsx`; verify `npm run build` succeeds and `/` still renders
- [x] 1.2 Move `app/(main)/kids/` → `app/(staff)/kids/`; verify `/kids` and `/kids/[id]` still render correctly
- [x] 1.3 Delete `app/(main)/pokemon/` directory and `app/(main)/layout.tsx`; verify no import errors in `npm run lint` and `npx tsc --noEmit`
- [x] 1.4 Delete empty `app/(main)/` directory; verify app still builds

## 2. Staff Layout & Sidebar

- [x] 2.1 Create `components/staff-sidebar.tsx` by extracting logic from `app-sidebar.tsx`; verify it renders with staff nav items and "Nueva publicación" button
- [x] 2.2 Create `app/(staff)/layout.tsx` that wraps children with `StaffSidebar`, `FeedProvider`, and `CreatePostDialog`; verify `/` renders with staff layout
- [x] 2.3 Delete `components/app-sidebar.tsx`; verify `npx tsc --noEmit` reports no errors (no dangling imports)

## 3. Feed Provider Split

- [x] 3.1 Update `components/feed-provider.tsx` to split hooks: `useFeed()` returns `{ posts }`, `useFeedActions()` returns `{ addPost, postDialogOpen, closePostDialog }`; verify `npx tsc --noEmit` passes
- [x] 3.2 Update `app/(staff)/layout.tsx` to provide both contexts (FeedProvider for posts + actions context for mutations); verify staff feed can still create posts
- [x] 3.3 Update all consumers of `useFeed()` that use `addPost`/`postDialogOpen` to use `useFeedActions()` instead; verify `npm run lint` and `npx tsc --noEmit` pass

## 4. Shared Component Updates

- [x] 4.1 Update `components/post-card.tsx` to accept `mode?: 'staff' | 'family'` prop; staff mode shows "Editar" link, family mode hides it; verify both modes render without errors
- [x] 4.2 Update `components/feed-posts.tsx` to accept `mode` prop and accept posts as optional prop (for family read-only); verify staff mode uses context, family mode uses passed posts
- [x] 4.3 Update `components/kid-card.tsx` to accept `mode` prop; staff mode has edit link, family mode doesn't; verify both modes render

## 5. Family Layout & Sidebar

- [x] 5.1 Create `components/family-sidebar.tsx` with "Familia" brand, nav items (Feed, Resumen del día, Mi cuenta), no create button; verify it renders with correct nav
- [x] 5.2 Create `app/(family)/layout.tsx` that wraps children with `FamilySidebar` (no FeedProvider, no CreatePostDialog); verify it renders without errors
- [x] 5.3 Create `app/(family)/page.tsx` scaffold with placeholder content "Family Feed — coming soon"; verify `/family` renders with family layout

## 6. Family Scaffold Pages

- [x] 6.1 Create `app/(family)/resumen-dia/page.tsx` scaffold with placeholder content; verify `/family/resumen-dia` renders
- [x] 6.2 Create `app/(family)/account/page.tsx` scaffold with placeholder content; verify `/family/account` renders

## 7. Auth Context Update

- [x] 7.1 Update `lib/actions/get-user-context.ts` to include `role` in the returned `UserContext` interface; verify the function returns `role: 'staff' | 'parent' | 'admin'`
- [x] 7.2 Verify all callers of `getUserContext` still compile and work (no breaking changes — additive only)

## 8. Middleware Implementation

- [x] 8.1 Create `middleware.ts` at project root with auth check: unauthenticated → redirect `/login`; verify `/login` is accessible without auth
- [x] 8.2 Add role-based routing: query `users.role` for authenticated users; verify staff can access `/` and parent gets redirected to `/family`
- [x] 8.3 Add staff→family block: if staff accesses `/family/*` → redirect `/`; verify redirect works
- [x] 8.4 Add parent→staff block: if parent accesses `/`, `/kids/*`, `/avisos/*` → redirect `/family`; verify redirect works
- [x] 8.5 Handle missing `users` row: if authenticated but no row in `users` → redirect `/login`; verify behavior
- [x] 8.6 Verify `/login` and `/activar-cuenta` are always accessible regardless of auth status

## 9. Verification

- [x] 9.1 Run `npm run lint` and verify zero errors
- [x] 9.2 Run `npx tsc --noEmit` and verify zero errors
- [x] 9.3 Run `npm run build` and verify build succeeds
- [x] 9.4 Start dev server (`npm run dev`) and verify: staff user can access `/` and `/kids`; parent user is redirected from `/` to `/family`; unauthenticated user is redirected to `/login`
