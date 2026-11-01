# CampusConnect

A college club management system built with **Next.js 16**, **React 19**, **Tailwind CSS 4**, **MySQL 8**, and **mysql2**.

Students can discover clubs, request membership, register for events, and follow club announcements. Club admins can manage their club, approve or reject membership requests, create and manage events, and publish announcements.

## Features

- Student registration and login with bcrypt password hashing and httpOnly JWT sessions.
- Role-based club administration enforced on the server.
- Club directory with search, category filters, club details, member lists, and join requests.
- Membership approval/rejection workflow for club admins.
- Event creation and management by club admins.
- Student event registration and cancellation with capacity checks.
- Event participant lists for club admins.
- Club-wise announcements with admin publish/delete controls.
- Student dashboard and club-admin dashboard.
- Responsive, accessible UI built with the Next.js App Router.

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4 |
| Runtime | Node.js 20.9+ |
| Database | MySQL 8.x |
| Database client | `mysql2/promise` |
| Auth | bcryptjs + signed JWT cookie (`jose`) |
| API | Next.js Route Handlers |

No ORM is used. SQL is written directly with parameterized queries so the relational model stays visible.

## Getting started

### 1. Prerequisites

- Node.js 20.9 or newer
- MySQL 8.x running locally (or a MySQL-compatible hosted database)

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your MySQL credentials:

```bash
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=campus_connect
JWT_SECRET=replace-with-a-long-random-secret
```

Generate a secure JWT secret with:

```bash
node -p "require('crypto').randomBytes(48).toString('hex')"
```

`.env.local` is ignored by Git. Never commit it.

### 4. Create and seed the database

```bash
npm run db:setup
```

This runs `scripts/init-db.js` and `scripts/seed.js`. The init script **recreates the tables** in the configured database, so use it for local development and demos.

If you only want to recreate the schema:

```bash
npm run db:init
npm run db:seed
```

Check the connection and row counts:

```bash
npm run db:check
```

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo accounts

The seed script creates these accounts:

| Role | Email | Password |
| --- | --- | --- |
| Club admin | `admin@campusconnect.test` | `Admin@123` |
| Student | `student@campusconnect.test` | `Student@123` |

Other seeded student accounts also use `Student@123`. The admin account is an approved admin of **IEEE Student Branch** and **Google Developer Group**; the E-Cell and Dance Club admins are other seeded users.

To make an existing account an admin of a club, use:

```bash
npm run admin:grant -- student@example.com 1
```

The second argument is the club id. The account must already be registered.

## Project structure

```text
app/
├── page.js                    # Landing page
├── login/                     # Student/admin login
├── register/                  # Student registration
├── dashboard/                 # Role-aware dashboard
├── clubs/                     # Club directory, detail, admin manage page
├── events/                    # Event listing and detail
├── announcements/             # Club-wise announcements
├── api/
│   ├── auth/                  # Register, login, logout, me
│   ├── clubs/                 # Club details, join, membership review
│   ├── events/                # Events, registration, participants
│   └── announcements/         # Announcement list, publish, delete
├── globals.css
└── layout.js
components/
├── auth/                      # Login and registration forms
├── clubs/                     # Join/edit/membership client components
├── events/                    # Create/edit/delete/register client components
├── announcements/             # Publish/delete client components
├── ClubCard.js
├── EventCard.js
├── AnnouncementCard.js
├── PageHeader.js
├── EmptyState.js
├── StatusBadge.js
├── Navbar.js
└── ...
lib/
├── db.js                      # mysql2 connection pool
├── auth.js                    # bcrypt, JWT session, RBAC helpers
├── api.js                     # JSON responses and error handling
├── validation.js              # Server-side validation helpers
├── format.js                  # Date/text formatting
└── paths.js                   # Safe internal redirects
db/
└── schema.sql
scripts/
├── init-db.js
├── seed.js
└── check-db.js
docs/
└── BUILD_GUIDE.md             # Architecture and module contracts
```

## Database design

The plan's `USER` entity is implemented as `users` because `USER` is a MySQL keyword and plural table names are clearer. The rest of the model follows the plan:

- `users` — students and club administrators.
- `clubs` — campus clubs.
- `club_members` — membership join table with `role` and `status` (`PENDING`, `APPROVED`, `REJECTED`). Composite primary key `(user_id, club_id)` prevents duplicate memberships.
- `events` — club events with optional capacity.
- `event_registrations` — student event registrations with a unique `(event_id, user_id)` constraint. Cancelling sets `status = 'CANCELLED'`.
- `announcements` — club announcements.

Foreign keys use `ON DELETE CASCADE` where dependent rows should disappear with their parent. The schema also includes indexes for common status/date lookups and CHECK constraints for year and capacity.

## Authorization model

- Authentication is stored in an httpOnly, SameSite=Lax JWT cookie.
- The JWT contains only the user id, name, and email; passwords are never placed in the session.
- There is no global super-admin in v1. Admin rights are per club:
  - `club_members.role = 'ADMIN'`
  - `club_members.status = 'APPROVED'`
- Every protected API route calls `requireUser()` and, for club-specific mutations, `requireClubAdmin(userId, clubId)`.
- Hiding a button in the UI is never treated as authorization.

## API overview

### Auth

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create a student account and session |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Clear the session |
| GET | `/api/auth/me` | Current user + admin clubs |

### Clubs

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/clubs` | List clubs with member counts |
| GET | `/api/clubs/[id]` | Club details |
| PATCH | `/api/clubs/[id]` | Update club (club admin) |
| POST | `/api/clubs/[id]/join` | Request membership |
| PATCH | `/api/clubs/[id]/members/[userId]` | Approve/reject membership (club admin) |

### Events

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/events` | List events, optionally by club |
| POST | `/api/events` | Create event (club admin) |
| GET | `/api/events/[id]` | Event details |
| PATCH | `/api/events/[id]` | Update event (club admin) |
| DELETE | `/api/events/[id]` | Delete event (club admin) |
| POST | `/api/events/[id]/register` | Register for an event |
| DELETE | `/api/events/[id]/register` | Cancel a registration |
| GET | `/api/events/[id]/participants` | Participant list (club admin) |

### Announcements

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/announcements` | List announcements, optionally by club |
| POST | `/api/announcements` | Publish an announcement (club admin) |
| DELETE | `/api/announcements/[id]` | Delete an announcement (club admin) |

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Node test suite for shared helpers |
| `npm run db:check` | Verify MySQL connectivity and seeded row counts |
| `npm run db:init` | Recreate the database schema |
| `npm run db:seed` | Insert demo data |
| `npm run db:setup` | Recreate the schema and seed demo data |
| `npm run admin:grant -- <email> <club_id>` | Promote an existing user to club admin |

## Main workflows to test

1. Register a new student, then sign out and sign back in.
2. Browse clubs, request to join one, and sign in as that club's admin to approve the request.
3. As a club admin, edit club details, create an event, and publish an announcement.
4. As a student, view the announcement, register for the event, and cancel the registration.
5. As the club admin, open the event and verify the registered participant list.
6. Try to access another club's manage page or API as a non-admin and verify access is denied.
7. Register for an event at full capacity and verify the server rejects the request.

## Deployment notes

- Deploy the Next.js app and MySQL database separately.
- Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET` in the hosting environment.
- Use a production MySQL user with only the privileges the app needs.
- `db/schema.sql` is intended for a fresh database and drops existing tables. For a live production database, use a migration tool or apply changes deliberately instead of running that file.
- Ensure the database connection supports TLS if your host requires it.
- The session cookie automatically becomes `Secure` when `NODE_ENV=production`, so serve the app over HTTPS.

## Scope

Version 1 intentionally excludes payment gateways, chat, attendance tracking, and a global super-admin. The focus is a clean, working core: authentication, clubs, events, and announcements.
