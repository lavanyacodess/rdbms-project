import Link from "next/link";
import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { getSessionUser, isClubAdmin } from "@/lib/auth";
import { formatDateTime, formatEventDate, initials, pluralize } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
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
          <Link href={`/clubs/${event.club_id}`} className="btn-secondary">
            <Icon name="building" className="h-4 w-4" />
            View club
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <section className="card overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-brand-500 via-violet-500 to-amber-400" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {past ? (
                <span className="badge-slate">Event ended</span>
              ) : full ? (
                <span className="badge-rose">Full</span>
              ) : (
                <span className="badge-green">Registration open</span>
              )}
              {registrationStatus === "REGISTERED" ? (
                <StatusBadge status="REGISTERED" />
              ) : null}
              {registrationStatus === "CANCELLED" ? (
                <StatusBadge status="CANCELLED" />
              ) : null}
              {event.category ? <span className="badge-slate">{event.category}</span> : null}
            </div>

            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-900/15">
                <span className="text-[11px] font-bold tracking-[0.18em] text-brand-100">
                  {date.month}
                </span>
                <span className="text-3xl font-extrabold leading-none">{date.day}</span>
                <span className="mt-1 text-[11px] font-medium text-brand-100">
                  {date.weekday}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold text-slate-950">
                  {formatDateTime(event.event_date)}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                  <Icon name="mapPin" className="h-4 w-4 shrink-0 text-slate-400" />
                  {event.venue || "Venue to be announced"}
                </p>
                <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-600">
                  <Icon name="building" className="h-4 w-4 shrink-0 text-slate-400" />
                  <Link
                    href={`/clubs/${event.club_id}`}
                    className="font-medium text-brand-700 hover:text-brand-800"
                  >
                    {event.club_name}
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-6">
              <h2 className="text-lg font-bold text-slate-950">About this event</h2>
              <p className="mt-2 whitespace-pre-line break-words text-sm leading-7 text-slate-600">
                {event.description ||
                  "The club has not added a description for this event yet."}
              </p>
            </div>
          </div>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24">
          <section className="card p-6" aria-labelledby="registration-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="registration-heading" className="text-lg font-bold text-slate-950">
                Registration
              </h2>
              {past ? (
                <span className="badge-slate">Closed</span>
              ) : full ? (
                <span className="badge-rose">Full</span>
              ) : (
                <span className="badge-green">Open</span>
              )}
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3">
                <span>Registered</span>
                <span className="font-bold text-slate-950">{registered}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Capacity</span>
                <span className="font-bold text-slate-950">
                  {capacity === null ? "No limit" : capacity}
                </span>
              </div>
            </div>

            {percent !== null ? (
              <div
                className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={capacity}
                aria-valuenow={Math.min(registered, capacity)}
                aria-label={`${registered} of ${capacity} seats filled`}
              >
                <div
                  className={`h-full rounded-full ${full ? "bg-rose-500" : "bg-brand-500"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            ) : null}

            <div className="mt-5">
              {past ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  This event has already taken place. Registration is closed.
                </div>
              ) : full && !user ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
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
                <div className="space-y-2">
                  <Link href={loginHref} className="btn-primary w-full">
                    Sign in to register
                  </Link>
                  <p className="hint text-center">
                    New to CampusConnect?{" "}
                    <Link href={registerHref} className="font-semibold text-brand-700">
                      Create an account
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>

            {registrationStatus === "REGISTERED" && !past ? (
              <p className="hint">You have a seat. You can cancel anytime before the event.</p>
            ) : null}
            {full && !past && user && registrationStatus !== "REGISTERED" ? (
              <p className="field-error">This event is at full capacity.</p>
            ) : null}
          </section>

          <section className="card p-6" aria-labelledby="event-details-heading">
            <h2 id="event-details-heading" className="text-lg font-bold text-slate-950">
              Event details
            </h2>
            <dl className="mt-4 space-y-3.5 text-sm">
              <div className="flex items-start gap-2.5">
                <Icon name="calendar" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="font-semibold text-slate-700">Date and time</dt>
                  <dd className="text-slate-600">{formatDateTime(event.event_date)}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="mapPin" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="font-semibold text-slate-700">Venue</dt>
                  <dd className="text-slate-600">{event.venue || "To be announced"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="user" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="font-semibold text-slate-700">Organized by</dt>
                  <dd className="text-slate-600">{event.creator_name}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon name="building" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div>
                  <dt className="font-semibold text-slate-700">Club</dt>
                  <dd>
                    <Link
                      href={`/clubs/${event.club_id}`}
                      className="font-medium text-brand-700 hover:text-brand-800"
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
        <section className="mt-12" aria-labelledby="admin-tools-heading">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Icon name="shield" className="h-5 w-5" />
            </span>
            <div>
              <p className="section-eyebrow">Club admin</p>
              <h2 id="admin-tools-heading" className="text-2xl font-bold text-slate-950">
                Manage this event
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Only approved admins of {event.club_name} can see this section.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)] xl:items-start">
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="text-lg font-bold text-slate-950">Edit event</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
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

              <div className="card p-6">
                <h3 className="text-lg font-bold text-slate-950">Danger zone</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
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

            <div className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Registered participants
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Only club admins can see participant contact details.
                  </p>
                </div>
                <span className="badge-brand">{pluralize(participants.length, "participant")}</span>
              </div>

              {participants.length > 0 ? (
                <div className="table-shell mt-5">
                  <div className="overflow-x-auto">
                  <table className="table-base min-w-[640px]">
                    <caption className="sr-only">
                      Registered participants for {event.event_name}
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Student</th>
                        <th scope="col">Email</th>
                        <th scope="col">Department</th>
                        <th scope="col">Year</th>
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
                              <span className="font-semibold text-slate-900">
                                {participant.name}
                              </span>
                            </div>
                          </td>
                          <td>
                            <a
                              href={`mailto:${participant.email}`}
                              className="text-brand-700 hover:underline"
                            >
                              {participant.email}
                            </a>
                          </td>
                          <td>{participant.department || "—"}</td>
                          <td>{participant.year ?? "—"}</td>
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
                <div className="mt-5 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-semibold text-slate-700">No registrations yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Registered students will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
