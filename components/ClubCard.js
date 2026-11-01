import Link from "next/link";
import { formatDate, pluralize, truncate } from "@/lib/format";
import { Icon } from "./Icons";

export default function ClubCard({ club }) {
  const status = club.membership_status;
  const nextEvent = club.next_event_date;

  return (
    <article className="card card-hover group relative flex h-full flex-col overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-violet-500 to-amber-400" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon name="building" className="h-5 w-5" />
          </span>
          <div className="flex flex-wrap justify-end gap-2">
            {club.category ? <span className="badge-slate">{club.category}</span> : null}
            {status === "APPROVED" ? <span className="badge-green">Joined</span> : null}
            {status === "PENDING" ? <span className="badge-amber">Pending</span> : null}
            {status === "REJECTED" ? <span className="badge-rose">Rejected</span> : null}
          </div>
        </div>

        <h3 className="mt-4 text-lg font-bold text-slate-950 transition group-hover:text-brand-700">
          {club.club_name}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
          {truncate(club.description || "A new club waiting to meet you.", 145)}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Icon name="users" className="h-4 w-4 text-slate-400" />
            {pluralize(Number(club.member_count || 0), "member")}
          </span>
          {nextEvent ? (
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" className="h-4 w-4 text-slate-400" />
              Next: {formatDate(nextEvent)}
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Icon name="calendar" className="h-4 w-4 text-slate-400" />
              No upcoming events
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-700">View club</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-500 transition group-hover:bg-brand-600 group-hover:text-white">
            <Icon name="arrowRight" className="h-4 w-4" />
          </span>
        </div>
      </div>
      <Link
        href={`/clubs/${club.club_id}`}
        className="absolute inset-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <span className="sr-only">View {club.club_name}</span>
      </Link>
    </article>
  );
}
