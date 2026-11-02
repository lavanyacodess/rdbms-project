import Link from "next/link";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { formatEventDate, formatTime, pluralize } from "@/lib/format";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/clubs/SectionHeading";
import { Icon } from "@/components/Icons";
import RegisterEventButton from "@/components/events/RegisterEventButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Events",
  description: "Browse upcoming and past CampusConnect club events.",
};

function normalizeEvent(row) {
  return {
    ...row,
    capacity: row.capacity == null ? null : Number(row.capacity),
    registered_count: Number(row.registered_count || 0),
    registration_status: row.registration_status ?? null,
  };
}

function EventActions({ event, user }) {
  const loginHref = `/login?next=${encodeURIComponent(`/events/${event.event_id}`)}`;
  const full =
    event.capacity !== null &&
    event.capacity !== undefined &&
    event.registered_count >= Number(event.capacity);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link href={`/events/${event.event_id}`} className="btn btn-ghost btn-sm">
        Details
      </Link>
      {user ? (
        <RegisterEventButton
          eventId={event.event_id}
          initialStatus={event.registration_status}
          capacity={event.capacity}
          registeredCount={event.registered_count}
        />
      ) : full ? (
        <button type="button" className="btn btn-secondary btn-sm" disabled>
          Event full
        </button>
      ) : (
        <Link href={loginHref} className="btn btn-secondary btn-sm">
          Sign in to register
        </Link>
      )}
    </div>
  );
}

export default async function EventsPage({ searchParams }) {
  const filters = (await searchParams) ?? {};
  const rawClub = Array.isArray(filters.club) ? filters.club[0] : filters.club;
  const parsedClub = Number(rawClub);
  const clubFilter = Number.isInteger(parsedClub) && parsedClub > 0 ? parsedClub : null;
  const rawSearch = Array.isArray(filters.q) ? filters.q[0] : filters.q;
  const searchQuery = typeof rawSearch === "string" ? rawSearch.trim().slice(0, 100) : "";

  const [user, clubs] = await Promise.all([
    getSessionUser(),
    query("SELECT club_id, club_name FROM clubs ORDER BY club_name ASC"),
  ]);

  const selectParams = user ? [user.userId] : [];
  const registrationSelect = user
    ? `(SELECT r.status
          FROM event_registrations r
         WHERE r.event_id = e.event_id AND r.user_id = ?
         LIMIT 1) AS registration_status`
    : "NULL AS registration_status";

  const where = [];
  const whereParams = [];
  if (clubFilter) {
    where.push("e.club_id = ?");
    whereParams.push(clubFilter);
  }
  if (searchQuery) {
    where.push("(e.event_name LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)");
    const like = `%${searchQuery}%`;
    whereParams.push(like, like, like);
  }
  const filterSql = where.length > 0 ? `AND ${where.join(" AND ")}` : "";

  const baseSql = `SELECT e.event_id, e.club_id, e.created_by, e.event_name, e.description,
                          e.event_date, e.venue, e.capacity, e.created_at,
                          c.club_name,
                          (SELECT COUNT(*)
                             FROM event_registrations r
                            WHERE r.event_id = e.event_id AND r.status = 'REGISTERED') AS registered_count,
                          ${registrationSelect}
                     FROM events e
                     JOIN clubs c ON c.club_id = e.club_id`;

  const [upcomingRows, pastRows] = await Promise.all([
    query(
      `${baseSql}
        WHERE e.event_date >= NOW() ${filterSql}
        ORDER BY e.event_date ASC
        LIMIT 100`,
      [...selectParams, ...whereParams],
    ),
    query(
      `${baseSql}
        WHERE e.event_date < NOW() ${filterSql}
        ORDER BY e.event_date DESC
        LIMIT 9`,
      [...selectParams, ...whereParams],
    ),
  ]);

  const upcoming = upcomingRows.map(normalizeEvent);
  const past = pastRows.map(normalizeEvent);
  const myRegistrations = upcoming.filter(
    (event) => event.registration_status === "REGISTERED",
  ).length;
  const selectedClub = clubs.find((club) => Number(club.club_id) === clubFilter);
  const hasFilters = Boolean(clubFilter || searchQuery);

  return (
    <div className="page-container page-section">
      <PageHeader
        eyebrow="Campus calendar"
        title="Events"
        description="Discover workshops, competitions, cultural nights, and more. Register for what excites you and keep track of everything coming up."
        actions={
          <Link href="/clubs" className="btn btn-secondary">
            <Icon name="building" className="h-3.5 w-3.5" />
            Browse clubs
          </Link>
        }
      />

      <form
        key={`${clubFilter ?? "all"}:${searchQuery}`}
        method="get"
        action="/events"
        role="search"
        aria-label="Filter events"
        className="filter-bar mb-6"
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px_auto] lg:items-end">
          <div>
            <label htmlFor="event-search" className="label">
              Search events
            </label>
            <div className="relative">
              <Icon
                name="search"
                className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
              />
              <input
                id="event-search"
                name="q"
                type="search"
                defaultValue={searchQuery}
                placeholder="Search by event, venue, or description"
                maxLength={100}
                className="input pl-7"
              />
            </div>
          </div>

          <div>
            <label htmlFor="event-club" className="label">
              Club
            </label>
            <select
              id="event-club"
              name="club"
              defaultValue={clubFilter ?? ""}
              className="select"
            >
              <option value="">All clubs</option>
              {clubs.map((club) => (
                <option key={club.club_id} value={club.club_id}>
                  {club.club_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              Apply filters
            </button>
            {hasFilters ? (
              <Link href="/events" className="btn btn-ghost">
                Clear
              </Link>
            ) : null}
          </div>
        </div>
      </form>

      <div className="summary-strip mb-8">
        <span className="chip">
          <Icon name="calendar" className="h-3.5 w-3.5 text-[var(--margin)]" />
          {pluralize(upcoming.length, "upcoming event")}
        </span>
        {user ? (
          <span className="chip">
            <Icon name="check" className="h-3.5 w-3.5 text-[var(--approved)]" />
            {myRegistrations === 0
              ? "No upcoming registrations"
              : `${pluralize(myRegistrations, "upcoming registration")} for you`}
          </span>
        ) : (
          <span className="chip">
            <Icon name="user" className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
            Sign in to register
          </span>
        )}
        {selectedClub ? <span className="badge-brand">{selectedClub.club_name}</span> : null}
        {searchQuery ? <span className="chip">Search: &ldquo;{searchQuery}&rdquo;</span> : null}
      </div>

      <section aria-labelledby="upcoming-events-heading">
        <SectionHeading
          id="upcoming-events-heading"
          eyebrow="Coming up"
          title="Upcoming events"
          badge={pluralize(upcoming.length, "event")}
        />

        {upcoming.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {upcoming.map((event) => (
              <EventCard key={event.event_id} event={event}>
                <EventActions event={event} user={user} />
              </EventCard>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="calendar"
            title={hasFilters ? "No events match your filters" : "No upcoming events yet"}
            description={
              hasFilters
                ? "Try another club or search term, or clear the filters to see everything on the calendar."
                : "Check back soon — clubs are always planning something new. In the meantime, explore clubs on campus."
            }
            action={
              hasFilters ? (
                <Link href="/events" className="btn btn-secondary">
                  Clear filters
                </Link>
              ) : (
                <Link href="/clubs" className="btn btn-primary">
                  Explore clubs
                </Link>
              )
            }
          />
        )}
      </section>

      <section className="mt-12" aria-labelledby="past-events-heading">
        <SectionHeading
          id="past-events-heading"
          eyebrow="Archive"
          title="Past events"
          description="A look back at events that have already taken place."
          badge={pluralize(past.length, "past event")}
        />

        {past.length > 0 ? (
          <div>
            {past.map((event) => {
              const date = formatEventDate(event.event_date);
              return (
                <div key={event.event_id} className="archive-row">
                  <span className="archive-date">
                    {date.day} {date.month}
                    <br />
                    {date.weekday}
                  </span>
                  <div className="min-w-0">
                    <Link href={`/events/${event.event_id}`} className="archive-title hover:text-[var(--margin)]">
                      {event.event_name}
                    </Link>
                    <p className="archive-meta">
                      {event.club_name} · {event.venue || "Venue to be announced"} ·{" "}
                      {formatTime(event.event_date)}
                    </p>
                    {event.description ? (
                      <p className="mt-1 line-clamp-1 text-xs leading-5 text-[var(--ink-soft)]">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                  <Link href={`/events/${event.event_id}`} className="btn btn-secondary btn-sm">
                    Details
                    <Icon name="arrowRight" className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon="clock"
            title="No past events to show"
            description={
              hasFilters
                ? "No past events match these filters."
                : "Once events wrap up, they will be listed here for reference."
            }
          />
        )}
      </section>
    </div>
  );
}
