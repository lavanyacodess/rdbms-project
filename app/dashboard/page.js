import Link from "next/link";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";
import EventCard from "@/components/EventCard";
import { Icon } from "@/components/Icons";
import SectionHeading from "@/components/clubs/SectionHeading";
import { getCurrentUserRecord, requireUserPage } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatRelative, initials, pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireUserPage("/dashboard");
  const user = await getCurrentUserRecord(session.userId);

  const [memberships, adminWorkspaces, upcomingEvents, announcements, registeredEventCount, pendingRequests] =
    await Promise.all([
      query(
        `SELECT cm.club_id, cm.role, cm.status, c.club_name, c.category, c.description,
                (SELECT COUNT(*) FROM club_members m
                  WHERE m.club_id = c.club_id AND m.status = 'APPROVED') AS member_count
           FROM club_members cm
           JOIN clubs c ON c.club_id = cm.club_id
          WHERE cm.user_id = ?
          ORDER BY FIELD(cm.status, 'APPROVED', 'PENDING', 'REJECTED'), c.club_name`,
        [session.userId],
      ),
      query(
        `SELECT c.club_id, c.club_name, c.category,
                (SELECT COUNT(*) FROM club_members m
                  WHERE m.club_id = c.club_id AND m.status = 'APPROVED') AS approved_members,
                (SELECT COUNT(*) FROM club_members m
                  WHERE m.club_id = c.club_id AND m.status = 'PENDING') AS pending_requests,
                (SELECT COUNT(*) FROM events e
                  WHERE e.club_id = c.club_id AND e.event_date >= NOW()) AS upcoming_events
           FROM clubs c
           JOIN club_members admin
             ON admin.club_id = c.club_id
            AND admin.user_id = ?
            AND admin.role = 'ADMIN'
            AND admin.status = 'APPROVED'
          ORDER BY c.club_name`,
        [session.userId],
      ),
      query(
        `SELECT e.event_id, e.event_name, e.event_date, e.venue, e.description,
                e.capacity, c.club_name, c.club_id,
                (SELECT COUNT(*) FROM event_registrations r
                  WHERE r.event_id = e.event_id AND r.status = 'REGISTERED') AS registered_count,
                er.status AS registration_status
           FROM events e
           JOIN clubs c ON c.club_id = e.club_id
           LEFT JOIN event_registrations er
             ON er.event_id = e.event_id AND er.user_id = ?
          WHERE e.event_date >= NOW()
          ORDER BY e.event_date ASC
          LIMIT 3`,
        [session.userId],
      ),
      query(
        `SELECT a.announcement_id, a.club_id, a.title, a.content, a.created_at,
                c.club_name, u.name AS author_name
           FROM announcements a
           JOIN clubs c ON c.club_id = a.club_id
           JOIN users u ON u.user_id = a.created_by
          ORDER BY a.created_at DESC
          LIMIT 3`,
      ),
      query(
        `SELECT COUNT(*) AS total
           FROM event_registrations er
           JOIN events e ON e.event_id = er.event_id
          WHERE er.user_id = ? AND er.status = 'REGISTERED' AND e.event_date >= NOW()`,
        [session.userId],
      ),
      query(
        `SELECT cm.user_id, cm.club_id, cm.joined_at, c.club_name,
                u.name, u.email, u.department, u.year
           FROM club_members cm
           JOIN users u ON u.user_id = cm.user_id
           JOIN clubs c ON c.club_id = cm.club_id
           JOIN club_members admin
             ON admin.club_id = cm.club_id
            AND admin.user_id = ?
            AND admin.role = 'ADMIN'
            AND admin.status = 'APPROVED'
          WHERE cm.status = 'PENDING'
          ORDER BY cm.joined_at ASC
          LIMIT 6`,
        [session.userId],
      ),
    ]);

  const approvedMemberships = memberships.filter((membership) => membership.status === "APPROVED");
  const pendingMemberships = memberships.filter((membership) => membership.status === "PENDING");
  const adminTotals = adminWorkspaces.reduce(
    (totals, workspace) => ({
      members: totals.members + Number(workspace.approved_members),
      pending: totals.pending + Number(workspace.pending_requests),
      events: totals.events + Number(workspace.upcoming_events),
    }),
    { members: 0, pending: 0, events: 0 },
  );

  const firstName = (user?.name || session.name || "there").split(" ")[0];
  const registeredTotal = Number(registeredEventCount[0]?.total || 0);

  return (
    <div className="page-container page-section">
      <section className="dash-head" aria-labelledby="dashboard-heading">
        <div>
          <div className="flex items-start gap-4">
            <span className="dash-avatar" aria-hidden="true">
              {initials(user?.name || session.name)}
            </span>
            <div className="min-w-0">
              <h1 id="dashboard-heading" className="page-title">
                {firstName}.
              </h1>
            </div>
          </div>

          <p className="body-copy mt-5 max-w-xl">
            {user?.department || "Your campus"}
            {user?.year ? ` · Year ${user.year}` : ""} · Here&apos;s what is happening around
            your clubs.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/clubs" className="btn btn-primary">
              <Icon name="users" className="h-4 w-4" />
              Explore clubs
            </Link>
            <Link href="/events" className="btn btn-secondary">
              <Icon name="calendar" className="h-4 w-4" />
              Browse events
            </Link>
          </div>
        </div>

        <div className="dash-ledger" aria-label="Your campus summary">
          <div className="dash-ledger-row">
            <span className="mono-label">My clubs</span>
            <span className="stat-value">{String(approvedMemberships.length).padStart(2, "0")}</span>
          </div>
          <div className="dash-ledger-row">
            <span className="mono-label">Registered events</span>
            <span className="stat-value">{String(registeredTotal).padStart(2, "0")}</span>
          </div>
          <div className="dash-ledger-row">
            <span className="mono-label">Pending requests</span>
            <span className="stat-value">{String(pendingMemberships.length).padStart(2, "0")}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--rule)] px-3 py-2.5">
            <span className="mono-label">Session</span>
            <span className="stamp stamp-green">
              <Icon name="check" className="h-3 w-3" />
              Signed in
            </span>
          </div>
        </div>
      </section>

      {adminWorkspaces.length > 0 ? (
        <section className="mt-12" aria-labelledby="admin-workspace-heading">
          <SectionHeading
            id="admin-workspace-heading"
            eyebrow="Admin workspace"
            title="You run the show"
            description="A quick view of your clubs, membership requests, and upcoming activity."
            badge={`${adminTotals.pending} pending`}
            badgeClass="stamp stamp-amber"
          />

          <div className="mb-4 flex flex-wrap gap-2">
            <span className="chip">
              <Icon name="users" className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
              {adminTotals.members} members
            </span>
            <span className="chip">
              <Icon name="clock" className="h-3.5 w-3.5 text-[var(--pending)]" />
              {adminTotals.pending} pending
            </span>
            <span className="chip">
              <Icon name="calendar" className="h-3.5 w-3.5 text-[var(--approved)]" />
              {adminTotals.events} upcoming
            </span>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {adminWorkspaces.map((workspace) => (
              <article key={workspace.club_id} className="workspace-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="tag">{workspace.category || "Club"}</span>
                    <h3 className="mt-2.5 text-base font-bold leading-tight text-[var(--ink)]">
                      {workspace.club_name}
                    </h3>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--rule-strong)] bg-[var(--paper)] text-[var(--margin)]">
                    <Icon name="shield" className="h-4 w-4" />
                  </span>
                </div>

                <div className="workspace-stats">
                  <div>
                    <p className="stat-value">{workspace.approved_members}</p>
                    <p className="stat-label">Members</p>
                  </div>
                  <div>
                    <p className="stat-value text-[var(--pending)]">{workspace.pending_requests}</p>
                    <p className="stat-label">Pending</p>
                  </div>
                  <div>
                    <p className="stat-value">{workspace.upcoming_events}</p>
                    <p className="stat-label">Events</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/clubs/${workspace.club_id}/manage`}
                    className="btn btn-primary btn-sm flex-1"
                  >
                    Manage club
                  </Link>
                  <Link
                    href={`/clubs/${workspace.club_id}/manage#events-heading`}
                    className="btn btn-secondary btn-sm"
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" />
                    Event
                  </Link>
                  <Link
                    href={`/clubs/${workspace.club_id}/manage#announcements-heading`}
                    className="btn btn-ghost btn-sm"
                  >
                    <Icon name="megaphone" className="h-3.5 w-3.5" />
                    Announce
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {pendingRequests.length > 0 ? (
            <div className="mt-5 table-shell">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule)] px-5 py-4">
                <div>
                  <h3 className="font-bold text-[var(--ink)]">Membership requests</h3>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--ink-soft)]">
                    Students waiting to join your clubs
                  </p>
                </div>
                <span className="stamp stamp-amber">{pendingRequests.length} waiting</span>
              </div>
              <div
                className="overflow-x-auto"
                tabIndex={0}
                role="region"
                aria-label="Pending membership requests for your clubs"
              >
                <table className="table-base">
                  <caption className="sr-only">Pending membership requests for your clubs</caption>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col" className="hidden md:table-cell">
                        Club
                      </th>
                      <th scope="col" className="hidden md:table-cell">
                        Course
                      </th>
                      <th scope="col" className="hidden md:table-cell">
                        Requested
                      </th>
                      <th scope="col" className="text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((request) => (
                      <tr key={`${request.club_id}-${request.user_id}`}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className="avatar h-8 w-8 text-[0.7rem]">
                              {initials(request.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--ink)]">{request.name}</p>
                              <p className="truncate text-xs text-[var(--ink-soft)]">
                                {request.email}
                              </p>
                              <p className="mt-0.5 text-xs font-medium text-[var(--margin)] md:hidden">
                                {request.club_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">{request.club_name}</td>
                        <td className="hidden text-xs md:table-cell">
                          {request.department || "—"}
                          {request.year ? ` · Y${request.year}` : ""}
                        </td>
                        <td className="hidden text-xs text-[var(--ink-soft)] md:table-cell">
                          {formatRelative(request.joined_at)}
                        </td>
                        <td className="text-right">
                          <Link
                            href={`/clubs/${request.club_id}/manage#requests-heading`}
                            className="btn btn-secondary btn-sm"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-12">
          <section aria-labelledby="my-clubs-heading">
            <div className="mb-5 grid gap-3 border-t border-[var(--rule-strong)] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end lg:grid-cols-[6.5rem_minmax(0,1fr)_auto]">
              <p className="margin-label hidden lg:block">Your community</p>
              <h2
                id="my-clubs-heading"
                className="text-2xl font-bold leading-tight text-[var(--ink)]"
              >
                My clubs
              </h2>
              <Link href="/clubs" className="link-arrow">
                Explore all
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </div>

            {approvedMemberships.length > 0 ? (
              <div>
                {approvedMemberships.map((membership) => (
                  <Link
                    key={membership.club_id}
                    href={`/clubs/${membership.club_id}`}
                    className="club-list-row group gap-3 pr-2"
                  >
                    <span className="club-monogram" aria-hidden="true">
                      {initials(membership.club_name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-[var(--ink)] transition group-hover:text-[var(--margin)]">
                        {membership.club_name}
                      </span>
                      <span className="mt-0.5 block font-mono text-[0.7rem] leading-5 text-[var(--ink-faint)]">
                        {membership.category || "Club"} ·{" "}
                        {pluralize(Number(membership.member_count), "member")}
                      </span>
                    </span>
                    <span className="stamp stamp-green">
                      {membership.role === "ADMIN" ? "Admin" : "Member"}
                    </span>
                    <Icon
                      name="arrowRight"
                      className="h-3.5 w-3.5 shrink-0 text-[var(--ink-faint)] transition group-hover:text-[var(--margin)]"
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="users"
                title="You haven't joined a club yet"
                description="Find a community that matches your interests and send your first membership request."
                action={
                  <Link href="/clubs" className="btn btn-primary">
                    Explore clubs
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </Link>
                }
              />
            )}

            {pendingMemberships.length > 0 ? (
              <div className="note-card mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="mono-label">Membership requests in progress</p>
                  <span className="stamp stamp-amber">Pending</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pendingMemberships.map((membership) => (
                    <span key={membership.club_id} className="tag">
                      {membership.club_name}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--ink-soft)]">
                  A club admin will review your request soon.
                </p>
              </div>
            ) : null}
          </section>

          <section aria-labelledby="upcoming-events-heading">
            <div className="mb-5 grid gap-3 border-t border-[var(--rule-strong)] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end lg:grid-cols-[6.5rem_minmax(0,1fr)_auto]">
              <p className="margin-label hidden lg:block">Save the date</p>
              <h2
                id="upcoming-events-heading"
                className="text-2xl font-bold leading-tight text-[var(--ink)]"
              >
                Upcoming events
              </h2>
              <Link href="/events" className="link-arrow">
                All events
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.event_id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="calendar"
                title="No upcoming events yet"
                description="Check back soon — clubs are always planning something new."
                action={
                  <Link href="/events" className="btn btn-secondary">
                    Browse events
                  </Link>
                }
              />
            )}
          </section>
        </div>

        <aside className="space-y-8">
          <section aria-labelledby="announcements-heading">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-t border-[var(--rule-strong)] pt-4">
              <h2
                id="announcements-heading"
                className="text-2xl font-bold leading-tight text-[var(--ink)]"
              >
                Announcements
              </h2>
              <Link href="/announcements" className="link-arrow">
                View all
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </div>
            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <AnnouncementCard key={announcement.announcement_id} announcement={announcement} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon="megaphone"
                title="No announcements yet"
                description="Club updates will appear here as soon as they are published."
              />
            )}
          </section>

          <section className="tearout">
            <h2 className="text-xl font-bold leading-tight text-[var(--ink)]">
              Make your mark
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              Clubs are built by the people who show up. Find a cause, a craft, or a community that
              feels like yours.
            </p>
            <Link href="/clubs" className="btn btn-secondary btn-sm mt-4">
              Find a club
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
