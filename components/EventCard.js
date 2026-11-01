import Link from "next/link";
import { formatEventDate, formatTime, pluralize } from "@/lib/format";
import { Icon } from "./Icons";

export default function EventCard({ event, children, showClub = true }) {
  const date = formatEventDate(event.event_date);
  const registered = Number(event.registered_count || 0);
  const capacity = event.capacity == null ? null : Number(event.capacity);
  const full = capacity !== null && registered >= capacity;
  const registrationStatus = event.registration_status;

  return (
    <article className="card card-hover flex h-full flex-col p-5 sm:p-6">
      <div className="flex gap-4">
        <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-900/15">
          <span className="text-[10px] font-bold tracking-[0.16em] text-brand-100">{date.month}</span>
          <span className="text-2xl font-extrabold leading-none">{date.day}</span>
          <span className="mt-1 text-[10px] font-medium text-brand-100">{date.weekday}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {registrationStatus === "REGISTERED" ? (
              <span className="badge-green">Registered</span>
            ) : null}
            {full && registrationStatus !== "REGISTERED" ? (
              <span className="badge-rose">Full</span>
            ) : null}
            {showClub && event.club_name ? (
              <span className="badge-brand">{event.club_name}</span>
            ) : null}
          </div>
          <h3 className="mt-2 text-lg font-bold leading-snug text-slate-950">
            <Link href={`/events/${event.event_id}`} className="hover:text-brand-700">
              {event.event_name}
            </Link>
          </h3>
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            <p className="flex items-center gap-1.5">
              <Icon name="clock" className="h-3.5 w-3.5 shrink-0" />
              {formatTime(event.event_date)}
            </p>
            <p className="flex items-center gap-1.5">
              <Icon name="mapPin" className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.venue || "Venue to be announced"}</span>
            </p>
          </div>
        </div>
      </div>

      {event.description ? (
        <p className="mt-4 line-clamp-2 flex-1 text-sm leading-6 text-slate-600">
          {event.description}
        </p>
      ) : (
        <div className="flex-1" />
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">
          {registered} registered{capacity !== null ? ` · ${capacity} seats` : " · Open capacity"}
        </span>
        {children || (
          <Link href={`/events/${event.event_id}`} className="btn-secondary btn-sm">
            Details
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
