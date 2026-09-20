# role-based-routing

## Purpose

Enforces role-based access control at the routing layer so that staff and parent users can only access their respective portals. The middleware intercepts every request, determines the user's role from the database, and redirects to the appropriate portal or login page.

## Requirements

### Requirement: Unauthenticated users are redirected to login
Requests to any route other than `/login` and `/activar-cuenta` from unauthenticated users SHALL be redirected to `/login`. The originally requested path SHALL NOT be preserved as a query parameter.

#### Scenario: Unauthenticated user accesses root
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** the system redirects to `/login`

#### Scenario: Unauthenticated user accesses family route
- **WHEN** an unauthenticated user navigates to `/family`
- **THEN** the system redirects to `/login`

### Requirement: Auth routes are always accessible
The routes `/login` and `/activar-cuenta` SHALL be accessible to all users regardless of authentication status or role.

#### Scenario: Authenticated user visits login
- **WHEN** an authenticated staff user navigates to `/login`
- **THEN** the system allows access (no redirect)

### Requirement: Staff users are routed to staff portal
Users with role `staff` or `admin` SHALL be allowed access to staff routes (`/`, `/kids/*`, `/kids/[id]/*`, `/avisos/*`, `/account`). If a staff user attempts to access a family route (`/family/*`), the system SHALL redirect to `/`.

#### Scenario: Staff accesses staff route
- **WHEN** a staff user navigates to `/kids`
- **THEN** the request proceeds normally

#### Scenario: Staff blocked from family route
- **WHEN** a staff user navigates to `/family`
- **THEN** the system redirects to `/`

### Requirement: Parent users are routed to family portal
Users with role `parent` SHALL be allowed access to family routes (`/family/*`). If a parent user attempts to access any staff route (`/`, `/kids/*`, `/avisos/*`), the system SHALL redirect to `/family`.

#### Scenario: Parent accesses family route
- **WHEN** a parent user navigates to `/family`
- **THEN** the request proceeds normally

#### Scenario: Parent blocked from staff route
- **WHEN** a parent user navigates to `/kids`
- **THEN** the system redirects to `/family`

### Requirement: Role is resolved from the users table
The middleware SHALL query `users.role` for the authenticated user on each request. The query SHALL use the user's Supabase auth UUID from `auth.uid()`. If the user has no matching row in the `users` table, the system SHALL treat them as unauthenticated and redirect to `/login`.

#### Scenario: Role lookup succeeds
- **WHEN** a user with a valid session and matching `users` row makes a request
- **THEN** the middleware proceeds with routing based on their role

#### Scenario: User has no database record
- **WHEN** a user is authenticated in Supabase but has no row in `users`
- **THEN** the system redirects to `/login`
