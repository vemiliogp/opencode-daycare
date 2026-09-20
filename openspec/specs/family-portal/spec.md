# family-portal

## Purpose

Provides the family-facing portal where parents can view their children's daily activity, see summaries, and manage their account. This portal is read-only — parents cannot create posts or manage children. It is isolated from the staff portal at separate URLs under `/family/*`.

## Requirements

### Requirement: Parents can access the family feed at /family
Authenticated users with role `parent` SHALL see their children's feed at `/family`. The feed displays posts related to their children, grouped by day, in read-only mode. Parents can react and comment but cannot create or edit posts.

#### Scenario: Parent accesses family feed
- **WHEN** a parent user navigates to `/family`
- **THEN** the system displays the family feed with posts about their children

#### Scenario: Parent attempts to create a post
- **WHEN** a parent user is on the family feed
- **THEN** no "Nueva publicación" button or create post functionality is visible

### Requirement: Family sidebar displays family-specific navigation
The family portal SHALL render a sidebar with the label "Familia" (no daycare name), no "Nueva publicación" button, and navigation links: Feed, Resumen del día, Mi cuenta. The user section at the bottom SHALL display the parent's name and their relationship to their children (e.g., "Mamá de Mateo").

#### Scenario: Parent sees correct sidebar
- **WHEN** a parent user is on any family page
- **THEN** the sidebar shows "Familia" brand, no create button, and family nav items

### Requirement: Family portal is inaccessible to staff users
Users with role `staff` or `admin` SHALL NOT access any route under the family portal (`/family/*`). The system SHALL redirect them to `/`.

#### Scenario: Staff attempts family access
- **WHEN** a staff user navigates to `/family`
- **THEN** the system redirects them to `/`

### Requirement: Family portal provides scaffold pages
This change SHALL provide scaffold (placeholder) pages for `/family/resumen-dia` and `/family/account`. These pages SHALL render a basic layout with the family sidebar but contain no functional content. Full implementation is deferred to a future change.

#### Scenario: Parent visits resumen-dia scaffold
- **WHEN** a parent user navigates to `/family/resumen-dia`
- **THEN** the system displays the family layout with a placeholder page

#### Scenario: Parent visits account scaffold
- **WHEN** a parent user navigates to `/family/account`
- **THEN** the system displays the family layout with a placeholder page
