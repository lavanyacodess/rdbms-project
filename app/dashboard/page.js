import Link from "next/link";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";
import EventCard from "@/components/EventCard";
import { Icon } from "@/components/Icons";
import { getCurrentUserRecord, requireUserPage } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatRelative, initials, pluralize } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard",
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

  return (
    <div className="page-container page-section">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl shadow-slate-950/15 sm:px-8 sm:py-10">
        <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="avatar h-11 w-11 text-sm ring-2 ring-white/15">
                {initials(user?.name || session.name)}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-300">{getGreeting()},</p>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{firstName}.</h1>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              {user?.department || "Your campus"}
              {user?.year ? ` · Year ${user.year}` : ""} · Here&apos;s what is happening around
              your clubs.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/clubs" className="btn bg-white text-slate-950 hover:bg-slate-100">
                <Icon name="users" className="h-4 w-4" />
                Explore clubs
              </Link>
              <Link
                href="/events"
                className="btn border border-white/15 bg-white/10 text-white hover:bg-white/15"
              >
                <Icon name="calendar" className="h-4 w-4" />
                Browse events
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: "My clubs", value: approvedMemberships.length, icon: "users" },
              { label: "Registered", value: Number(registeredEventCount[0]?.total || 0), icon: "calendar" },
              { label: "Pending", value: pendingMemberships.length, icon: "clock" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur"
              >
                <Icon name={stat.icon} className="h-4 w-4 text-brand-300" />
                <p className="mt-3 text-2xl font-bold">{stat.value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {adminWorkspaces.length > 0 ? (
        <section className="mt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="section-eyebrow">Admin workspace</p>
              <h2 className="section-title mt-1">You run the show</h2>
              <p className="section-copy">
                A quick view of your clubs, membership requests, and upcoming activity.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-500">
              <span className="chip">
                <Icon name="users" className="mr-1.5 h-3.5 w-3.5 text-brand-600" />
                {adminTotals.members} members
              </span>
              <span className="chip">
                <Icon name="clock" className="mr-1.5 h-3.5 w-3.5 text-amber-600" />
                {adminTotals.pending} pending
              </span>
              <span className="chip">
                <Icon name="calendar" className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                {adminTotals.events} upcoming
              </span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {adminWorkspaces.map((workspace) => (
              <article key={workspace.club_id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="badge-brand">{workspace.category || "Club"}</span>
                    <h3 className="mt-2.5 font-bold text-slate-950">{workspace.club_name}</h3>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name="shield" className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-slate-950">{workspace.approved_members}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      Members
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-600">{workspace.pending_requests}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      Pending
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-950">{workspace.upcoming_events}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      Events
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/clubs/${workspace.club_id}/manage`} className="btn-primary btn-sm flex-1">
                    Manage club
                  </Link>
                  <Link
                    href={`/clubs/${workspace.club_id}/manage#events-heading`}
                    className="btn-secondary btn-sm"
                  >
                    <Icon name="plus" className="h-3.5 w-3.5" />
                    Event
                  </Link>
                  <Link
                    href={`/clubs/${workspace.club_id}/manage#announcements-heading`}
                    className="btn-ghost btn-sm"
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
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h3 className="font-bold text-slate-950">Membership requests</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Students waiting to join your clubs
                  </p>
                </div>
                <span className="badge-amber">{pendingRequests.length} waiting</span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Club</th>
                      <th>Course</th>
                      <th>Requested</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((request) => (
                      <tr key={`${request.club_id}-${request.user_id}`}>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <span className="avatar h-8 w-8 text-[10px]">{initials(request.name)}</span>
                            <div>
                              <p className="font-semibold text-slate-900">{request.name}</p>
                              <p className="text-xs text-slate-500">{request.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>{request.club_name}</td>
                        <td className="text-xs">
                          {request.department || "—"}
                          {request.year ? ` · Y${request.year}` : ""}
                        </td>
                        <td className="text-xs text-slate-500">{formatRelative(request.joined_at)}</td>
                        <td className="text-right">
                          <Link
                            href={`/clubs/${request.club_id}/manage#requests-heading`}
                            className="btn-secondary btn-sm"
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

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-10">
          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow">Your community</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">My clubs</h2>
              </div>
              <Link href="/clubs" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                Explore all →
              </Link>
            </div>

            {approvedMemberships.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {approvedMemberships.map((membership) => (
                  <Link
                    key={membership.club_id}
                    href={`/clubs/${membership.club_id}`}
                    className="card card-hover flex items-center gap-4 p-4"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white">
                      <Icon name="building" className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-950">{membership.club_name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {membership.category || "Club"} · {pluralize(Number(membership.member_count), "member")}
                      </p>
                    </div>
                    <span className="badge-green">
                      {membership.role === "ADMIN" ? "Admin" : "Member"}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon="users"
                  title="You haven't joined a club yet"
                  description="Find a community that matches your interests and send your first membership request."
                  action={
                    <Link href="/clubs" className="btn-primary">
                      Explore clubs
                      <Icon name="arrowRight" className="h-4 w-4" />
                    </Link>
                  }
                />
              </div>
            )}

            {pendingMemberships.length > 0 ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <p className="text-sm font-semibold text-amber-900">Membership requests in progress</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {pendingMemberships.map((membership) => (
                    <span key={membership.club_id} className="badge-amber">
                      {membership.club_name}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-amber-700">
                  A club admin will review your request soon.
                </p>
              </div>
            ) : null}
          </section>

          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow">Save the date</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Upcoming events</h2>
              </div>
              <Link href="/events" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
                All events →
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.event_id} event={event} />
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon="calendar"
                  title="No upcoming events yet"
                  description="Check back soon — clubs are always planning something new."
                  action={
                    <Link href="/events" className="btn-secondary">
                      Browse events
                    </Link>
                  }
                />
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow">The latest</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">Announcements</h2>
              </div>
              <Link
                href="/announcements"
                className="text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                View all →
              </Link>
            </div>
            {announcements.length > 0 ? (
              <div className="mt-5 space-y-3">
                {announcements.map((announcement) => (
                  <AnnouncementCard key={announcement.announcement_id} announcement={announcement} />
                ))}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  icon="megaphone"
                  title="No announcements yet"
                  description="Club updates will appear here as soon as they are published."
                />
              </div>
            )}
          </section>

          <section className="card bg-gradient-to-br from-brand-50 to-white p-5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
              <Icon name="sparkles" className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-bold text-slate-950">Make your mark</h3>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">
              Clubs are built by the people who show up. Find a cause, a craft, or a community that
              feels like yours.
            </p>
            <Link href="/clubs" className="btn-secondary btn-sm mt-4">
              Find a club
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
