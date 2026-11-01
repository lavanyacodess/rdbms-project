# CampusConnect Build Guide

This document is the shared contract for feature work. Read it before editing.

## Product

CampusConnect is a college club management app with two user experiences:

- **Student**: browse clubs, request membership, view/register for events, read announcements.
- **Club admin**: everything a student can do, plus manage a club, approve/reject members, create/manage events, and publish announcements.

There is no global super-admin. A user is an admin only for clubs where their
`club_members` row has `role = 'ADMIN'` and `status = 'APPROVED'`. Always enforce
this on the server.

## Stack and conventions

- Next.js 16 App Router, JavaScript (not TypeScript), React 19.
- Tailwind CSS v4 classes plus the shared component classes in `app/globals.css`.
- MySQL 8 + `mysql2/promise`. No ORM. Use parameterized SQL only.
- Server components read the database directly through `query` from `lib/db.js`.
- Client components call the route handlers under `app/api`.
- Dynamic route params and `searchParams` are **Promises** in Next.js 16. Always
  `const { id } = await params;` and `const filters = await searchParams;`.
- Add `export const dynamic = "force-dynamic";` to every page that reads cookies or MySQL.
- Use `Link` from `next/link`, not plain anchors, for internal navigation.
- Keep pages responsive and use the established visual language.

## Database

Tables: `users`, `clubs`, `club_members`, `events`, `event_registrations`,
`announcements`. See `db/schema.sql` for exact columns, enums, and foreign keys.
The app uses `dateStrings: true`, so DATETIME/TIMESTAMP values arrive as strings
such as `2026-11-06 09:00:00`.

Key columns:

- `users(user_id, name, email, password, department, year, created_at)`
- `clubs(club_id, club_name, description, category, created_at)`
- `club_members(user_id, club_id, role, status, joined_at)` — composite PK
- `events(event_id, club_id, created_by, event_name, description, event_date, venue, capacity, created_at)`
- `event_registrations(registration_id, event_id, user_id, registration_date, status)`
- `announcements(announcement_id, club_id, created_by, title, content, created_at)`

Rules:

- Approved member count = `club_members.status = 'APPROVED'`.
- Registered participant count = `event_registrations.status = 'REGISTERED'`.
- `event_registrations` has `UNIQUE(event_id, user_id)`. Cancelling sets
  `status = 'CANCELLED'`; registering again reuses the row.
- Passwords are bcrypt hashes. Never select or return password hashes to the client.
- All admin mutations must call `requireClubAdmin(userId, clubId)`.

## Shared server helpers

```js
import { query, getConnection } from "@/lib/db";
import {
  getSessionUser, requireUser, requireUserPage, isClubAdmin,
  requireClubAdmin, requireClubAdminPage, getAdminClubs,
} from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { apiSuccess, handleApiError } from "@/lib/api";
import {
  readJson, requiredString, optionalString, requiredEmail, requiredPassword,
  optionalInteger, requiredInteger, enumValue, parseDate, toMysqlDateTime, numericParam,
} from "@/lib/validation";
import { formatDate, formatDateTime, formatRelative, formatEventDate, initials, truncate, pluralize } from "@/lib/format";
import { safeNextPath } from "@/lib/paths";
```

`requireUser()` and `requireClubAdmin()` throw `ApiError`; use them inside a
`try/catch` and return `handleApiError(error)`.

`requireUserPage(nextPath)` redirects to login when signed out.
`requireClubAdminPage(userId, clubId)` redirects to the club page when not an admin.

## API route pattern

```js
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";
import { readJson, requiredString } from "@/lib/validation";

export async function POST(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const clubId = Number(id);
    const body = await readJson(request);
    const title = requiredString(body.title, "Title", { max: 150 });
    // validate, authorize, query with placeholders...
    return apiSuccess({ ... }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
```

Success response shapes can be module-specific but must be consistent. Errors are
`{ error: "message", details? }` with an appropriate status code.

## Shared UI

Use these component classes from `app/globals.css`:

`page-container`, `page-section`, `card`, `card-hover`, `btn`, `btn-primary`,
`btn-secondary`, `btn-ghost`, `btn-danger`, `btn-sm`, `btn-lg`, `input`, `textarea`,
`select`, `label`, `hint`, `field-error`, `form-error`, `form-success`, `badge-brand`,
`badge-green`, `badge-amber`, `badge-rose`, `badge-slate`, `chip`, `avatar`, `nav-link`,
`section-eyebrow`, `section-title`, `section-copy`, `stat-card`, `stat-value`,
`stat-label`, `empty-state`, `table-shell`, `table-base`, `gradient-text`, `animate-rise`.

Shared components:

- `components/PageHeader.js` — `{ eyebrow, title, description, actions, backHref, backLabel }`
- `components/ClubCard.js` — club row with `club_id, club_name, description, category, member_count, next_event_date, membership_status`
- `components/EventCard.js` — event row with `event_id, event_name, event_date, venue, description, club_name, capacity, registered_count, registration_status`; accepts `children` as the footer action
- `components/AnnouncementCard.js` — announcement row with `club_id, club_name, title, content, created_at, author_name`
- `components/EmptyState.js` — `{ icon, title, description, action }`
- `components/StatusBadge.js` — `{ status }`
- `components/Icons.js` — `<Icon name="..." />`; available names are in the file
- `components/LogoutButton.js`

Client forms should use `useState` for loading/error/success, `useRouter` from
`next/navigation`, call the API, then `router.refresh()` and/or `router.push()`.
Do not use `alert()` for primary feedback.

## Ownership and parallel work

Do not edit files owned by another module or shared foundation files unless there
is a genuine integration bug. If a shared file must change, make the smallest
possible edit and report it.

- **Lead**: `app/layout.js`, `app/page.js`, `app/globals.css`, `app/dashboard/page.js`,
  `components/Navbar.js`, `components/Footer.js`, `components/Icons.js`,
  `components/PageHeader.js`, `components/ClubCard.js`, `components/EventCard.js`,
  `components/AnnouncementCard.js`, `components/EmptyState.js`, `components/StatusBadge.js`,
  `lib/*`, `db/*`, `scripts/*`, README, final integration.
- **Auth agent**: `app/login/**`, `app/register/**`, `app/api/auth/**`,
  `components/auth/**`.
- **Clubs agent**: `app/clubs/**`, `app/api/clubs/**`, `components/clubs/**`.
- **Events agent**: `app/events/**`, `app/api/events/**`, `components/events/**`.
- **Announcements agent**: `app/announcements/**`, `app/api/announcements/**`,
  `components/announcements/**`.

Cross-module component contracts:

- `components/events/CreateEventForm.js` accepts `{ clubId }`.
- `components/announcements/CreateAnnouncementForm.js` accepts `{ clubId }`.
- `components/announcements/DeleteAnnouncementButton.js` accepts `{ announcementId }`.
- Clubs manage page may import those three components.
- Events manage UI may import `components/events/EditEventForm.js` and
  `components/events/DeleteEventButton.js` from its own folder.

## Quality bar

- Server-side validation on every mutation; no trusting client state.
- Empty, loading, error, pending, rejected, cancelled, and full-capacity states.
- Accessible labels, focus states, and semantic headings.
- Do not add payment, chat, attendance, or other out-of-scope features.
- Do not run `npm run build` or a full lint while other agents are writing; the
  lead runs final verification.
