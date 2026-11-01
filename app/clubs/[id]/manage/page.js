import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { requireUserPage, requireClubAdminPage } from "@/lib/auth";
import {
  formatDate,
  formatDateTime,
  formatRelative,
  initials,
  pluralize,
  truncate,
} from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Icon } from "@/components/Icons";
import EditClubForm from "@/components/clubs/EditClubForm";
import MembershipActions from "@/components/clubs/MembershipActions";
import SectionHeading from "@/components/clubs/SectionHeading";
import CreateEventForm from "@/components/events/CreateEventForm";
import CreateAnnouncementForm from "@/components/announcements/CreateAnnouncementForm";
import DeleteAnnouncementButton from "@/components/announcements/DeleteAnnouncementButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage club",
};

export default async function ManageClubPage({ params }) {
  const { id } = await params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    notFound();
  }

  const user = await requireUserPage(`/clubs/${clubId}/manage`);

  const clubRows = await query(
    `SELECT c.club_id, c.club_name, c.description, c.category, c.created_at,
            (SELECT COUNT(*)
               FROM club_members cm
              WHERE cm.club_id = c.club_id AND cm.status = 'APPROVED') AS member_count
       FROM clubs c
      WHERE c.club_id = ?
      LIMIT 1`,
    [clubId],
  );

  const club = clubRows[0];
  if (!club) {
    notFound();
  }

  await requireClubAdminPage(user.userId, clubId);

  const [pendingRequests, approvedMembers, events, announcements] = await Promise.all([
    query(
      `SELECT cm.user_id, cm.joined_at, u.name, u.email, u.department, u.year
         FROM club_members cm
         JOIN users u ON u.user_id = cm.user_id
        WHERE cm.club_id = ? AND cm.status = 'PENDING'
        ORDER BY cm.joined_at ASC`,
      [clubId],
    ),
    query(
      `SELECT cm.user_id, cm.joined_at, u.name, u.email, u.department, u.year, cm.role
         FROM club_members cm
         JOIN users u ON u.user_id = cm.user_id
        WHERE cm.club_id = ? AND cm.status = 'APPROVED'
        ORDER BY cm.role DESC, u.name`,
      [clubId],
    ),
    query(
      `SELECT e.event_id, e.event_name, e.description, e.event_date, e.venue, e.capacity,
              (SELECT COUNT(*)
                 FROM event_registrations er
                WHERE er.event_id = e.event_id AND er.status = 'REGISTERED') AS registered_count
         FROM events e
        WHERE e.club_id = ? AND e.event_date >= NOW()
        ORDER BY e.event_date`,
      [clubId],
    ),
    query(
      `SELECT a.announcement_id, a.club_id, a.title, a.content, a.created_at,
              u.name AS author_name
         FROM announcements a
         JOIN users u ON u.user_id = a.created_by
        WHERE a.club_id = ?
        ORDER BY a.created_at DESC`,
      [clubId],
    ),
  ]);

  const stats = [
    {
      label: "Approved members",
      value: approvedMembers.length,
      icon: "users",
      color: "bg-brand-50 text-brand-600",
    },
    {
      label: "Pending requests",
      value: pendingRequests.length,
      icon: "clock",
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Upcoming events",
      value: events.length,
      icon: "calendar",
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Announcements",
      value: announcements.length,
      icon: "megaphone",
      color: "bg-violet-50 text-violet-600",
    },
  ];

  return (
    <div className="page-container page-section">
      <PageHeader
        backHref={`/clubs/${clubId}`}
        backLabel="Back to club page"
        eyebrow="Club admin"
        title={`Manage ${club.club_name}`}
        description="Update club details, review membership requests, and keep your events and announcements current."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between gap-3">
              <p className="stat-label">{stat.label}</p>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
              >
                <Icon name={stat.icon} className="h-4 w-4" />
              </span>
            </div>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-12">
        <section aria-labelledby="details-heading">
          <SectionHeading
            id="details-heading"
            eyebrow="Public profile"
            title="Club details"
            description="These details appear on the public club page."
          />
          <div className="card p-6 sm:p-8">
            <EditClubForm club={club} />
          </div>
        </section>

        <section aria-labelledby="requests-heading">
          <SectionHeading
            id="requests-heading"
            eyebrow="Membership"
            title="Pending requests"
            description="Approve or reject students waiting to join this club."
            badge={pluralize(pendingRequests.length, "request")}
            badgeClass="badge-amber"
          />
          {pendingRequests.length ? (
            <div className="table-shell">
              <div className="overflow-x-auto">
                <table className="table-base min-w-[760px]">
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Department</th>
                      <th scope="col">Year</th>
                      <th scope="col">Requested</th>
                      <th scope="col" className="text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.map((request) => (
                      <tr key={request.user_id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="avatar h-9 w-9 text-xs">
                              {initials(request.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{request.name}</p>
                              <p className="truncate text-xs text-slate-400">{request.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>{request.department || "—"}</td>
                        <td>{request.year ? `Year ${request.year}` : "—"}</td>
                        <td className="whitespace-nowrap">{formatDate(request.joined_at)}</td>
                        <td>
                          <div className="flex justify-end">
                            <MembershipActions
                              clubId={clubId}
                              userId={request.user_id}
                              memberName={request.name}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="check"
              title="No pending requests"
              description="New membership requests will appear here for review."
            />
          )}
        </section>

        <section aria-labelledby="members-heading">
          <SectionHeading
            id="members-heading"
            eyebrow="Community"
            title="Approved members"
            description="Everyone who currently has access to this club."
            badge={pluralize(approvedMembers.length, "member")}
          />
          {approvedMembers.length ? (
            <div className="table-shell">
              <div className="overflow-x-auto">
                <table className="table-base min-w-[720px]">
                  <thead>
                    <tr>
                      <th scope="col">Member</th>
                      <th scope="col">Department</th>
                      <th scope="col">Year</th>
                      <th scope="col">Role</th>
                      <th scope="col">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedMembers.map((member) => (
                      <tr key={member.user_id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="avatar h-9 w-9 text-xs">
                              {initials(member.name)}
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{member.name}</p>
                              <p className="truncate text-xs text-slate-400">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td>{member.department || "—"}</td>
                        <td>{member.year ? `Year ${member.year}` : "—"}</td>
                        <td>
                          {member.role === "ADMIN" ? (
                            <span className="badge-brand">Admin</span>
                          ) : (
                            <span className="badge-slate">Member</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap">{formatDate(member.joined_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="users"
              title="No approved members yet"
              description="Approve a membership request to start building the club."
            />
          )}
        </section>

        <section aria-labelledby="events-heading">
          <SectionHeading
            id="events-heading"
            eyebrow="Programming"
            title="Upcoming events"
            description="Events currently scheduled for this club."
            badge={pluralize(events.length, "event")}
          />
          {events.length ? (
            <div className="table-shell">
              <div className="overflow-x-auto">
                <table className="table-base min-w-[680px]">
                  <thead>
                    <tr>
                      <th scope="col">Event</th>
                      <th scope="col">Date &amp; time</th>
                      <th scope="col">Venue</th>
                      <th scope="col">Registered</th>
                      <th scope="col" className="text-right">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => {
                      const registered = Number(event.registered_count || 0);
                      return (
                        <tr key={event.event_id}>
                          <td>
                            <Link
                              href={`/events/${event.event_id}`}
                              className="font-semibold text-slate-900 transition hover:text-brand-700"
                            >
                              {event.event_name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap">
                            {formatDateTime(event.event_date)}
                          </td>
                          <td>{event.venue || "—"}</td>
                          <td className="whitespace-nowrap">
                            {registered}
                            {event.capacity != null ? ` / ${event.capacity}` : ""}
                          </td>
                          <td className="text-right">
                            <Link
                              href={`/events/${event.event_id}`}
                              className="btn-secondary btn-sm"
                            >
                              View event
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <EmptyState
              icon="calendar"
              title="No upcoming events"
              description="Create your first event below to get students on the calendar."
            />
          )}
          <div className="card mt-6 p-6 sm:p-8">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Icon name="calendar" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-950">Create an event</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add a new upcoming event for this club.
                </p>
              </div>
            </div>
            <CreateEventForm clubId={clubId} />
          </div>
        </section>

        <section aria-labelledby="announcements-heading">
          <SectionHeading
            id="announcements-heading"
            eyebrow="Communication"
            title="Announcements"
            description="Updates published to the club page."
            badge={pluralize(announcements.length, "announcement")}
          />
          {announcements.length ? (
            <ul className="space-y-3">
              {announcements.map((announcement) => (
                <li
                  key={announcement.announcement_id}
                  className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {formatRelative(announcement.created_at)}
                      </span>
                    </div>
                    <h3 className="mt-2 font-bold text-slate-950">{announcement.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {truncate(announcement.content, 240)}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Posted by {announcement.author_name}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <DeleteAnnouncementButton
                      announcementId={announcement.announcement_id}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              icon="megaphone"
              title="No announcements yet"
              description="Publish an update below to keep members informed."
            />
          )}
          <div className="mt-6">
            <CreateAnnouncementForm clubId={clubId} />
          </div>
        </section>
      </div>
    </div>
  );
}
