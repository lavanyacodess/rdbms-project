import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { getSessionUser, isClubAdmin } from "@/lib/auth";
import { formatDateTime, formatEventDate, initials, pluralize } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/clubs/SectionHeading";
import StatusBadge from "@/components/StatusBadge";
import { Icon } from "@/components/Icons";
import RegisterEventButton from "@/components/events/RegisterEventButton";
import EditEventForm from "@/components/events/EditEventForm";
import DeleteEventButton from "@/components/events/DeleteEventButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Event details",
};

export default async function EventDetailPage({ params }) {
  const { id } = await params;
  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) {
    notFound();
  }

  const eventRows = await query(
    `SELECT e.event_id, e.club_id, e.created_by, e.event_name, e.description,
            e.event_date, e.venue, e.capacity, e.created_at,
            c.club_name, c.category,
            u.name AS creator_name,
            (SELECT COUNT(*)
               FROM event_registrations r
              WHERE r.event_id = e.event_id AND r.status = 'REGISTERED') AS registered_count,
            (e.event_date < NOW()) AS is_past
       FROM events e
       JOIN clubs c ON c.club_id = e.club_id
       JOIN users u ON u.user_id = e.created_by
      WHERE e.event_id = ?
      LIMIT 1`,
    [eventId],
  );
  const event = eventRows[0];
  if (!event) {
    notFound();
  }

  const user = await getSessionUser();
  let registrationStatus = null;
  let admin = false;

  if (user) {
    const [registrationRows, adminFlag] = await Promise.all([
      query(
        `SELECT status
           FROM event_registrations
          WHERE event_id = ? AND user_id = ?
          LIMIT 1`,
        [eventId, user.userId],
      ),
      isClubAdmin(user.userId, event.club_id),
    ]);
    registrationStatus = registrationRows[0]?.status ?? null;
    admin = adminFlag;
  }

  let participants = [];
  if (admin) {
    participants = await query(
      `SELECT u.user_id, u.name, u.email, u.department, u.year, r.registration_date
         FROM event_registrations r
         JOIN users u ON u.user_id = r.user_id
        WHERE r.event_id = ? AND r.status = 'REGISTERED'
        ORDER BY r.registration_date ASC, u.name ASC`,
      [eventId],
    );
  }

  const registered = Number(event.registered_count || 0);
  const capacity = event.capacity == null ? null : Number(event.capacity);
  const full = capacity !== null && registered >= capacity;
  const past = Number(event.is_past) === 1;
  const date = formatEventDate(event.event_date);
  const loginHref = `/login?next=${encodeURIComponent(`/events/${event.event_id}`)}`;
  const registerHref = `/register?next=${encodeURIComponent(`/events/${event.event_id}`)}`;
  const percent =
    capacity !== null && capacity > 0
      ? Math.min(100, Math.round((registered / capacity) * 100))
      : null;

  return (
    <div className="page-container page-section">
      <PageHeader
        eyebrow={event.club_name}
        title={event.event_name}
        backHref="/events"
        backLabel="All events"
        actions={
          <Link href={`/clubs/${event.club_id}`} className="btn btn-secondary">
            <Icon name="building" className="h-4 w-4" />
            View club
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_370px] lg:items-start">
        <article className="detail-sheet">
          <header className="detail-head">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {past ? (
                  <span className="stamp stamp-muted">Event ended</span>
                ) : full ? (
                  <span className="stamp stamp-red">Full</span>
                ) : (
                  <span className="stamp stamp-green">Registration open</span>
                )}
                {registrationStatus === "REGISTERED" ? (
                  <StatusBadge status="REGISTERED" />
                ) : null}
                {registrationStatus === "CANCELLED" ? (
                  <StatusBadge status="CANCELLED" />
                ) : null}
                {event.category ? <span className="tag">{event.category}</span> : null}
              </div>
              <span className="mono-label">
                Event file / {String(event.event_id).padStart(3, "0")}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="event-date-block" aria-hidden="true">
                <span className="month">{date.month}</span>
                <span className="day">{date.day}</span>
                <span className="weekday">{date.weekday}</span>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[0.72rem] font-semibold tracking-[0.03em] text-[var(--ink)]">
                  {formatDateTime(event.event_date)}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                  <Icon name="mapPin" className="h-4 w-4 shrink-0 text-[var(--ink-faint)]" />
                  {event.venue || "Venue to be announced"}
                </p>
                <p className="mt-1.5 flex items-center gap-2 text-sm text-[var(--ink-soft)]">
                  <Icon name="building" className="h-4 w-4 shrink-0 text-[var(--ink-faint)]" />
                  <Link
                    href={`/clubs/${event.club_id}`}
                    className="font-semibold text-[var(--ink)] underline decoration-[var(--rule-strong)] underline-offset-4 transition hover:text-[var(--margin)]"
                  >
                    {event.club_name}
                  </Link>
                </p>
              </div>
            </div>
          </header>

          <div className="detail-body">
            <h2 className="text-xl font-bold text-[var(--ink)]">About this event</h2>
            <p className="mt-3 whitespace-pre-line break-words text-[0.95rem] leading-7 text-[var(--ink-soft)]">
              {event.description ||
                "The club has not added a description for this event yet."}
            </p>

            <div className="mt-8 grid border-y border-[var(--rule)] sm:grid-cols-3">
              <div className="py-4 sm:pr-5">
                <p className="mono-label">Date and time</p>
                <p className="mt-1.5 text-sm font-semibold leading-6 text-[var(--ink)]">
                  {formatDateTime(event.event_date)}
                </p>
              </div>
              <div className="border-t border-[var(--rule)] py-4 sm:border-l sm:border-t-0 sm:px-5">
                <p className="mono-label">Venue</p>
                <p className="mt-1.5 text-sm font-semibold leading-6 text-[var(--ink)]">
                  {event.venue || "To be announced"}
                </p>
              </div>
              <div className="border-t border-[var(--rule)] py-4 sm:border-l sm:border-t-0 sm:pl-5">
                <p className="mono-label">Organized by</p>
                <p className="mt-1.5 text-sm font-semibold leading-6 text-[var(--ink)]">
                  {event.creator_name}
                </p>
              </div>
            </div>
          </div>
        </article>

        <aside className="order-first space-y-4 lg:order-none lg:sticky lg:top-24">
          <section className="detail-aside" aria-labelledby="registration-heading">
            <div className="detail-aside-title">
              <h2 id="registration-heading">Registration</h2>
              {past ? (
                <span className="stamp stamp-muted">Closed</span>
              ) : full ? (
                <span className="stamp stamp-red">Full</span>
              ) : (
                <span className="stamp stamp-green">Open</span>
              )}
            </div>

            <dl className="mt-4">
              <div className="flex items-baseline justify-between gap-3 border-b border-dotted border-[var(--rule-strong)] py-2">
                <dt className="mono-label">Registered</dt>
                <dd className="font-mono text-sm font-semibold text-[var(--ink)]">
                  {registered}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-3 border-b border-dotted border-[var(--rule-strong)] py-2">
                <dt className="mono-label">Capacity</dt>
                <dd className="font-mono text-sm font-semibold text-[var(--ink)]">
                  {capacity === null ? "No limit" : capacity}
                </dd>
              </div>
            </dl>

            {percent !== null ? (
              <div
                className="seat-meter mt-4"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={capacity}
                aria-valuenow={Math.min(registered, capacity)}
                aria-label={`${registered} of ${capacity} seats filled`}
              >
                <div
                  className={`seat-meter-fill ${full ? "seat-meter-fill-full" : ""}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            ) : null}

            <div className="mt-5">
              {past ? (
                <div className="border border-[var(--rule-strong)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--ink-soft)]">
                  This event has already taken place. Registration is closed.
                </div>
              ) : full && !user ? (
                <div className="border border-[var(--margin)] bg-[rgba(184,60,46,0.06)] px-4 py-3 text-sm leading-6 text-[var(--margin)]">
                  This event is at full capacity. Registration is closed.
                </div>
              ) : user ? (
                <RegisterEventButton
                  key={event.event_id}
                  eventId={event.event_id}
                  initialStatus={registrationStatus}
                  capacity={capacity}
                  registeredCount={registered}
                  size="lg"
                  fullWidth
                />
              ) : (
                <div className="space-y-3">
                  <Link href={loginHref} className="btn-primary btn-lg w-full">
                    Sign in to register
                  </Link>
                  <p className="hint text-center">
                    New to CampusConnect?{" "}
                    <Link
                      href={registerHref}
                      className="font-semibold text-[var(--margin)] underline underline-offset-4"
                    >
                      Create an account
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>

            {registrationStatus === "REGISTERED" && !past ? (
              <p className="hint">
                You have a seat. You can cancel anytime before the event.
              </p>
            ) : null}
            {full && !past && user && registrationStatus !== "REGISTERED" ? (
              <p className="field-error">This event is at full capacity.</p>
            ) : null}
          </section>

          <section
            className="detail-aside hidden lg:block"
            aria-labelledby="event-details-heading"
          >
            <h2 id="event-details-heading" className="detail-aside-title">
              Event details
            </h2>
            <dl className="mt-4 space-y-3.5">
              <div className="grid grid-cols-[1.15rem_minmax(0,1fr)] gap-2.5">
                <Icon name="calendar" className="mt-0.5 h-4 w-4 text-[var(--ink-faint)]" />
                <div>
                  <dt className="mono-label">Date and time</dt>
                  <dd className="mt-0.5 text-sm leading-6 text-[var(--ink-soft)]">
                    {formatDateTime(event.event_date)}
                  </dd>
                </div>
              </div>
              <div className="grid grid-cols-[1.15rem_minmax(0,1fr)] gap-2.5">
                <Icon name="mapPin" className="mt-0.5 h-4 w-4 text-[var(--ink-faint)]" />
                <div>
                  <dt className="mono-label">Venue</dt>
                  <dd className="mt-0.5 text-sm leading-6 text-[var(--ink-soft)]">
                    {event.venue || "To be announced"}
                  </dd>
                </div>
              </div>
              <div className="grid grid-cols-[1.15rem_minmax(0,1fr)] gap-2.5">
                <Icon name="user" className="mt-0.5 h-4 w-4 text-[var(--ink-faint)]" />
                <div>
                  <dt className="mono-label">Organized by</dt>
                  <dd className="mt-0.5 text-sm leading-6 text-[var(--ink-soft)]">
                    {event.creator_name}
                  </dd>
                </div>
              </div>
              <div className="grid grid-cols-[1.15rem_minmax(0,1fr)] gap-2.5">
                <Icon name="building" className="mt-0.5 h-4 w-4 text-[var(--ink-faint)]" />
                <div>
                  <dt className="mono-label">Club</dt>
                  <dd className="mt-0.5">
                    <Link
                      href={`/clubs/${event.club_id}`}
                      className="text-sm font-semibold text-[var(--ink)] underline decoration-[var(--rule-strong)] underline-offset-4 transition hover:text-[var(--margin)]"
                    >
                      {event.club_name}
                    </Link>
                  </dd>
                </div>
              </div>
            </dl>
          </section>
        </aside>
      </div>

      {admin ? (
        <section className="mt-14" aria-labelledby="admin-tools-heading">
          <SectionHeading
            id="admin-tools-heading"
            eyebrow="Club admin"
            title="Manage this event"
            description={`Only approved admins of ${event.club_name} can see this section.`}
            badge="Admin only"
            badgeClass="stamp stamp-red"
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)] xl:items-start">
            <div className="space-y-6">
              <div className="detail-sheet">
                <div className="detail-body">
                  <h3 className="text-lg font-bold text-[var(--ink)]">Edit event</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                    {past
                      ? "This event has already taken place. You can still update its details or reschedule it."
                      : "Update the details students see on this page."}
                  </p>
                  <div className="mt-5">
                    <EditEventForm
                      key={event.event_id}
                      event={event}
                      allowPast={past}
                    />
                  </div>
                </div>
              </div>

              <div className="danger-zone">
                <h3 className="text-lg font-bold text-[var(--ink)]">Danger zone</h3>
                <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                  Deleting the event also removes every registration.
                </p>
                <div className="mt-4">
                  <DeleteEventButton
                    key={event.event_id}
                    eventId={event.event_id}
                    eventName={event.event_name}
                  />
                </div>
              </div>
            </div>

            <div className="detail-sheet">
              <div className="detail-head">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--ink)]">
                      Registered participants
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
                      Only club admins can see participant contact details.
                    </p>
                  </div>
                  <span className="badge-brand">
                    {pluralize(participants.length, "participant")}
                  </span>
                </div>
              </div>

              <div className="detail-body">
                {participants.length > 0 ? (
                  <div className="table-shell">
                    <div
                      className="overflow-x-auto"
                      tabIndex={0}
                      role="region"
                      aria-label={`Registered participants for ${event.event_name}`}
                    >
                      <table className="table-base md:min-w-[640px]">
                        <caption className="sr-only">
                          Registered participants for {event.event_name}
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">Student</th>
                            <th scope="col" className="hidden md:table-cell">
                              Email
                            </th>
                            <th scope="col" className="hidden md:table-cell">
                              Department
                            </th>
                            <th scope="col" className="hidden md:table-cell">
                              Year
                            </th>
                            <th scope="col">Registered</th>
                          </tr>
                        </thead>
                        <tbody>
                          {participants.map((participant) => (
                            <tr key={participant.user_id}>
                              <td>
                                <div className="flex items-center gap-2.5">
                                  <span className="avatar h-8 w-8 text-[11px]">
                                    {initials(participant.name)}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block font-semibold text-[var(--ink)]">
                                      {participant.name}
                                    </span>
                                    <a
                                      href={`mailto:${participant.email}`}
                                      className="mt-0.5 block truncate font-mono text-[0.7rem] text-[var(--margin)] underline-offset-4 hover:underline md:hidden"
                                    >
                                      {participant.email}
                                    </a>
                                  </span>
                                </div>
                              </td>
                              <td className="hidden md:table-cell">
                                <a
                                  href={`mailto:${participant.email}`}
                                  className="text-[var(--margin)] underline-offset-4 hover:underline"
                                >
                                  {participant.email}
                                </a>
                              </td>
                              <td className="hidden md:table-cell">
                                {participant.department || "—"}
                              </td>
                              <td className="hidden md:table-cell">
                                {participant.year ?? "—"}
                              </td>
                              <td className="whitespace-nowrap">
                                {formatDateTime(participant.registration_date)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-[var(--rule-strong)] bg-[rgba(248,249,243,0.6)] px-4 py-8 text-center">
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      No registrations yet
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                      Registered students will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
