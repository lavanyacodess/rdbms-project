import Link from "next/link";
import { formatRelative, truncate } from "@/lib/format";
import { Icon } from "./Icons";

export default function AnnouncementCard({ announcement, showClub = true, full = false }) {
  return (
    <article className="announcement-card">
      <div className="announcement-head">
        <span className="announcement-icon" aria-hidden="true">
          <Icon name="megaphone" className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {showClub && announcement.club_name ? (
              <Link
                href={`/clubs/${announcement.club_id}`}
                className="tag transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
              >
                {announcement.club_name}
              </Link>
            ) : null}
            <span className="mono-label">{formatRelative(announcement.created_at)}</span>
          </div>
          <h3 className="announcement-title">{announcement.title}</h3>
          <p className={`announcement-copy ${full ? "whitespace-pre-line" : ""}`}>
            {full ? announcement.content : truncate(announcement.content, 230)}
          </p>
          {announcement.author_name ? (
            <p className="announcement-author">Posted by {announcement.author_name}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
