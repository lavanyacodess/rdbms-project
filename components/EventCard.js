import Link from "next/link";
import { formatEventDate, formatTime } from "@/lib/format";
import { Icon } from "./Icons";

export default function EventCard({ event, children, showClub = true }) {
  const date = formatEventDate(event.event_date);
  const registered = Number(event.registered_count || 0);
  const capacity = event.capacity == null ? null : Number(event.capacity);
  const full = capacity !== null && registered >= capacity;
  const registrationStatus = event.registration_status;

  return (
    <article className="event-card">
      <div className="flex gap-3.5">
        <div className="event-date-block" aria-hidden="true">
          <span className="month">{date.month}</span>
          <span className="day">{date.day}</span>
          <span className="weekday">{date.weekday}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {registrationStatus === "REGISTERED" ? (
              <span className="stamp stamp-green">Registered</span>
            ) : null}
            {full && registrationStatus !== "REGISTERED" ? (
              <span className="stamp stamp-red">Full</span>
            ) : null}
            {showClub && event.club_name ? <span className="tag">{event.club_name}</span> : null}
          </div>
          <h3 className="event-title">
            <Link href={`/events/${event.event_id}`}>{event.event_name}</Link>
          </h3>
          <div className="card-meta mt-2 flex-col items-start gap-1">
            <span>
              <Icon name="clock" className="h-3.5 w-3.5 shrink-0" />
              {formatTime(event.event_date)}
            </span>
            <span className="max-w-full">
              <Icon name="mapPin" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.venue || "Venue to be announced"}</span>
            </span>
          </div>
        </div>
      </div>

      {event.description ? (
        <p className="event-copy line-clamp-2">{event.description}</p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="event-card-foot">
        <span className="card-meta">
          {registered} registered
          {capacity !== null ? ` · ${capacity} seats` : " · Open capacity"}
        </span>
        {children || (
          <Link href={`/events/${event.event_id}`} className="btn btn-secondary btn-sm">
            Details
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
