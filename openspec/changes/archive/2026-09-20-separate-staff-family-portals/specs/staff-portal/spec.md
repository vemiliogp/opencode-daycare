# Spec Delta

## Purpose

Provides the staff-facing portal with full CRUD capabilities for managing a daycare: creating posts, managing children (list, detail, create, edit), viewing announcements, and user account settings. All existing staff functionality from the current `(main)` route group lives under this capability.

## ADDED Requirements

### Requirement: Staff can access the feed at the root URL
Authenticated users with role `staff` or `admin` SHALL see the daycare feed at `/`. The feed displays posts created by staff members, grouped by day, with the ability to create new posts, edit existing posts, and react/comment on posts.

#### Scenario: Staff accesses root URL
- **WHEN** a staff user navigates to `/`
- **THEN** the system displays the staff feed with posts from their daycare

#### Scenario: Staff creates a new post
- **WHEN** a staff user clicks "Nueva publicación" and submits a post
- **THEN** the post appears in the feed and is visible to the appropriate audience

### Requirement: Staff can manage children
Authenticated users with role `staff` or `admin` SHALL access `/kids` to view all children in their daycare, search by name, and add new children. Individual child profiles at `/kids/[id]` SHALL show full details including allergies, room assignment, enrollment date, and linked parents.

#### Scenario: Staff views children list
- **WHEN** a staff user navigates to `/kids`
- **THEN** the system displays all active children in the daycare grouped by room

#### Scenario: Staff views child profile
- **WHEN** a staff user clicks on a child from the list
- **THEN** the system displays the child's full profile with allergies, room, and linked parents

### Requirement: Staff sidebar displays staff-specific navigation
The staff portal SHALL render a sidebar with the daycare name (e.g., "Sala Soles"), a "Nueva publicación" button, and navigation links: Feed, Niños, Avisos, Mi cuenta. The user section at the bottom SHALL display the user's name, role, and daycare name.

#### Scenario: Staff sees correct sidebar
- **WHEN** a staff user is on any staff page
- **THEN** the sidebar shows daycare name, "Nueva publicación" button, and staff nav items

### Requirement: Staff portal is inaccessible to parent users
Users with role `parent` SHALL NOT access any route under the staff portal (`/`, `/kids/*`, `/avisos/*`). The system SHALL redirect them to `/family`.

#### Scenario: Parent attempts staff access
- **WHEN** a parent user navigates to `/kids`
- **THEN** the system redirects them to `/family`
