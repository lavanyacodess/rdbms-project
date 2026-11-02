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
    { label: "Approved members", value: approvedMembers.length, icon: "users" },
    { label: "Pending requests", value: pendingRequests.length, icon: "clock" },
    { label: "Upcoming events", value: events.length, icon: "calendar" },
    { label: "Announcements", value: announcements.length, icon: "megaphone" },
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

      <div className="grid grid-cols-2 gap-px border border-[var(--rule-strong)] bg-[var(--rule)] xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[var(--paper-raised)] p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="stat-label">{stat.label}</p>
              <Icon name={stat.icon} className="h-4 w-4 shrink-0 text-[var(--ink-faint)]" />
            </div>
            <p className="stat-value mt-3">{stat.value}</p>
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
          <div className="border border-[var(--rule-strong)] bg-[var(--paper-raised)] p-5 sm:p-7">
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
              <div
                className="overflow-x-auto"
                tabIndex={0}
                role="region"
                aria-label={`Pending membership requests for ${club.club_name}`}
              >
                <table className="table-base md:min-w-[760px]">
                  <caption className="sr-only">
                    Pending membership requests for {club.club_name}
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col" className="hidden md:table-cell">
                        Department
                      </th>
                      <th scope="col" className="hidden md:table-cell">
                        Year
                      </th>
                      <th scope="col" className="hidden md:table-cell">
                        Requested
                      </th>
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
                              <p className="font-semibold text-[var(--ink)]">{request.name}</p>
                              <p className="truncate font-mono text-[0.7rem] text-[var(--ink-faint)]">
                                {request.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          {request.department || "—"}
                        </td>
                        <td className="hidden md:table-cell">
                          {request.year ? `Year ${request.year}` : "—"}
                        </td>
                        <td className="hidden whitespace-nowrap md:table-cell">
                          {formatDate(request.joined_at)}
                        </td>
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
              <div
                className="overflow-x-auto"
                tabIndex={0}
                role="region"
                aria-label={`Approved members of ${club.club_name}`}
              >
                <table className="table-base md:min-w-[720px]">
                  <caption className="sr-only">Approved members of {club.club_name}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Member</th>
                      <th scope="col" className="hidden md:table-cell">
                        Department
                      </th>
                      <th scope="col" className="hidden md:table-cell">
                        Year
                      </th>
                      <th scope="col">Role</th>
                      <th scope="col" className="hidden md:table-cell">
                        Joined
                      </th>
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
                              <p className="font-semibold text-[var(--ink)]">{member.name}</p>
                              <p className="truncate font-mono text-[0.7rem] text-[var(--ink-faint)]">
                                {member.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">
                          {member.department || "—"}
                        </td>
                        <td className="hidden md:table-cell">
                          {member.year ? `Year ${member.year}` : "—"}
                        </td>
                        <td>
                          {member.role === "ADMIN" ? (
                            <span className="badge-brand">Admin</span>
                          ) : (
                            <span className="badge-slate">Member</span>
                          )}
                        </td>
                        <td className="hidden whitespace-nowrap md:table-cell">
                          {formatDate(member.joined_at)}
                        </td>
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
              <div
                className="overflow-x-auto"
                tabIndex={0}
                role="region"
                aria-label={`Upcoming events for ${club.club_name}`}
              >
                <table className="table-base md:min-w-[680px]">
                  <caption className="sr-only">Upcoming events for {club.club_name}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Event</th>
                      <th scope="col">Date &amp; time</th>
                      <th scope="col" className="hidden md:table-cell">
                        Venue
                      </th>
                      <th scope="col" className="hidden md:table-cell">
                        Registered
                      </th>
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
                              className="font-semibold text-[var(--ink)] transition hover:text-[var(--margin)]"
                            >
                              {event.event_name}
                            </Link>
                          </td>
                          <td className="whitespace-nowrap">
                            {formatDateTime(event.event_date)}
                          </td>
                          <td className="hidden md:table-cell">{event.venue || "—"}</td>
                          <td className="hidden whitespace-nowrap md:table-cell">
                            {registered}
                            {event.capacity != null ? ` / ${event.capacity}` : ""}
                          </td>
                          <td className="text-right">
                            <Link
                              href={`/events/${event.event_id}`}
                              className="btn btn-secondary btn-sm"
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
          <div className="mt-6 border border-[var(--rule-strong)] bg-[var(--paper-raised)] p-5 sm:p-7">
            <div className="mb-5 flex items-start gap-3 border-b border-[var(--rule)] pb-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--rule-strong)] bg-[var(--paper)] text-[var(--margin)]">
                <Icon name="calendar" className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[var(--ink)]">Create an event</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
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
            <ul className="border-t border-[var(--rule-strong)]">
              {announcements.map((announcement) => (
                <li
                  key={announcement.announcement_id}
                  className="flex flex-col gap-3 border-b border-[var(--rule)] py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="min-w-0">
                    <span className="mono-label">{formatRelative(announcement.created_at)}</span>
                    <h3 className="mt-1 font-bold text-[var(--ink)]">{announcement.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                      {truncate(announcement.content, 240)}
                    </p>
                    <p className="mt-2 font-mono text-[0.7rem] text-[var(--ink-faint)]">
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
