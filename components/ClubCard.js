import Link from "next/link";
import { formatDate, initials, pluralize, truncate } from "@/lib/format";
import { Icon } from "./Icons";

export default function ClubCard({ club }) {
  const status = club.membership_status;
  const nextEvent = club.next_event_date;

  return (
    <article className="club-card group relative">
      <div className="flex items-start justify-between gap-3">
        <span className="club-mark" aria-hidden="true">
          {initials(club.club_name)}
        </span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {club.category ? <span className="tag">{club.category}</span> : null}
          {status === "APPROVED" ? <span className="stamp stamp-green">Joined</span> : null}
          {status === "PENDING" ? <span className="stamp stamp-amber">Pending</span> : null}
          {status === "REJECTED" ? <span className="stamp stamp-red">Rejected</span> : null}
        </div>
      </div>

      <h3 className="club-card-title">{club.club_name}</h3>
      <p className="club-card-copy">
        {truncate(club.description || "A new club waiting to meet you.", 145)}
      </p>

      <div className="club-card-foot">
        <div className="card-meta">
          <span>
            <Icon name="users" className="h-3.5 w-3.5" />
            {pluralize(Number(club.member_count || 0), "member")}
          </span>
          <span>
            <Icon name="calendar" className="h-3.5 w-3.5" />
            {nextEvent ? `Next: ${formatDate(nextEvent)}` : "No upcoming events"}
          </span>
        </div>
        <span className="link-arrow">
          View club
          <Icon name="arrowRight" className="h-3.5 w-3.5" />
        </span>
      </div>

      <Link
        href={`/clubs/${club.club_id}`}
        className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]"
      >
        <span className="sr-only">View {club.club_name}</span>
      </Link>
    </article>
  );
}
