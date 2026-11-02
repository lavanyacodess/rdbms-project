import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { initials, pluralize, truncate } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import EventCard from "@/components/EventCard";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";
import { Icon } from "@/components/Icons";
import JoinClubButton from "@/components/clubs/JoinClubButton";
import SectionHeading from "@/components/clubs/SectionHeading";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    return { title: "Club not found" };
  }

  const rows = await query(
    "SELECT club_name, description FROM clubs WHERE club_id = ? LIMIT 1",
    [clubId],
  );
  const club = rows[0];

  if (!club) {
    return { title: "Club not found" };
  }

  return {
    title: club.club_name,
    description: club.description
      ? truncate(club.description, 155)
      : `Learn more about ${club.club_name} and its upcoming events, members, and announcements.`,
  };
}

export default async function ClubDetailPage({ params }) {
  const { id } = await params;
  const clubId = Number(id);

  if (!Number.isInteger(clubId) || clubId <= 0) {
    notFound();
  }

  const user = await getSessionUser();

  const [clubRows, membershipRows] = await Promise.all([
    query(
      `SELECT c.club_id, c.club_name, c.description, c.category, c.created_at,
              (SELECT COUNT(*)
                 FROM club_members cm
                WHERE cm.club_id = c.club_id AND cm.status = 'APPROVED') AS member_count
         FROM clubs c
        WHERE c.club_id = ?
        LIMIT 1`,
      [clubId],
    ),
    user
      ? query(
          "SELECT role, status FROM club_members WHERE user_id = ? AND club_id = ? LIMIT 1",
          [user.userId, clubId],
        )
      : Promise.resolve([]),
  ]);

  const club = clubRows[0];
  if (!club) {
    notFound();
  }

  const [members, events, announcements] = await Promise.all([
    query(
      `SELECT u.user_id, u.name, u.department, u.year, cm.role, cm.joined_at
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

  const membership = membershipRows[0] ?? null;
  const canManage = membership?.role === "ADMIN" && membership?.status === "APPROVED";
  const loginHref = `/login?next=${encodeURIComponent(`/clubs/${clubId}`)}`;
  const memberCount = Number(club.member_count || 0);

  return (
    <div className="page-container page-section">
      <PageHeader
        backHref="/clubs"
        backLabel="All clubs"
        eyebrow={club.category || "Campus club"}
        title={club.club_name}
        description={
          club.description ||
          "This club has not added a description yet. Reach out to the club admin to learn more."
        }
        actions={
          <>
            {canManage ? (
              <Link href={`/clubs/${clubId}/manage`} className="btn btn-secondary">
                <Icon name="shield" className="h-3.5 w-3.5" />
                Manage club
              </Link>
            ) : null}
            {user ? (
              <JoinClubButton
                key={membership?.status || "NONE"}
                clubId={clubId}
                status={membership?.status || "NONE"}
              />
            ) : (
              <Link href={loginHref} className="btn btn-primary">
                Sign in to join
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            )}
          </>
        }
      />

      <div className="grid border-y border-[var(--rule-strong)] sm:grid-cols-3">
        <div className="flex items-center gap-3 py-4 sm:px-4 sm:first:pl-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink-soft)]">
            <Icon name="users" className="h-4 w-4" />
          </span>
          <div>
            <p className="stat-value">{memberCount}</p>
            <p className="stat-label">Approved members</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-[var(--rule)] py-4 sm:border-l sm:border-t-0 sm:px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink-soft)]">
            <Icon name="calendar" className="h-4 w-4" />
          </span>
          <div>
            <p className="stat-value">{events.length}</p>
            <p className="stat-label">Upcoming events</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-[var(--rule)] py-4 sm:border-l sm:border-t-0 sm:px-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--rule)] bg-[var(--paper-raised)] text-[var(--ink-soft)]">
            <Icon name="megaphone" className="h-4 w-4" />
          </span>
          <div>
            <p className="stat-value">{announcements.length}</p>
            <p className="stat-label">Announcements</p>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-12">
        <section aria-labelledby="events-heading">
          <SectionHeading
            id="events-heading"
            eyebrow="What's next"
            title="Upcoming events"
            description={`Events hosted by ${club.club_name}.`}
            badge={pluralize(events.length, "event")}
          />
          {events.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {events.map((event) => (
                <EventCard key={event.event_id} event={event} showClub={false} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="calendar"
              title="No upcoming events"
              description="This club has not scheduled anything yet. Check back soon."
            />
          )}
        </section>

        <section aria-labelledby="members-heading">
          <SectionHeading
            id="members-heading"
            eyebrow="Community"
            title="Members"
            description="Approved members of this club."
            badge={pluralize(memberCount, "member")}
          />
          {members.length ? (
            <div className="table-shell">
              <div
                className="overflow-x-auto"
                tabIndex={0}
                role="region"
                aria-label={`Members of ${club.club_name}`}
              >
                <table className="table-base md:min-w-[560px]">
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
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.user_id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className="avatar h-9 w-9 text-xs">
                              {initials(member.name)}
                            </span>
                            <span className="font-semibold text-[var(--ink)]">{member.name}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell">{member.department || "—"}</td>
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
              description="Be the first student to join this club."
            />
          )}
        </section>

        <section aria-labelledby="announcements-heading">
          <SectionHeading
            id="announcements-heading"
            eyebrow="Stay in the loop"
            title="Announcements"
            description={`Latest updates from ${club.club_name}.`}
            badge={pluralize(announcements.length, "announcement")}
          />
          {announcements.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {announcements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.announcement_id}
                  announcement={announcement}
                  showClub={false}
                  full
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="megaphone"
              title="No announcements yet"
              description="Club updates will appear here when the admin posts them."
            />
          )}
        </section>
      </div>
    </div>
  );
}
