import Link from "next/link";
import { formatRelative, truncate } from "@/lib/format";
import { Icon } from "./Icons";

export default function AnnouncementCard({ announcement, showClub = true, full = false }) {
  return (
    <article className="card p-5 sm:p-6">
      <div className="flex items-start gap-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <Icon name="megaphone" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {showClub && announcement.club_name ? (
              <Link
                href={`/clubs/${announcement.club_id}`}
                className="badge-brand hover:bg-brand-100"
              >
                {announcement.club_name}
              </Link>
            ) : null}
            <span className="text-xs text-slate-400">
              {formatRelative(announcement.created_at)}
            </span>
          </div>
          <h3 className="mt-2 break-words font-bold leading-snug text-slate-950">
            {announcement.title}
          </h3>
          <p
            className={`mt-1.5 break-words text-sm leading-6 text-slate-600 ${
              full ? "whitespace-pre-line" : ""
            }`}
          >
            {full ? announcement.content : truncate(announcement.content, 230)}
          </p>
          {announcement.author_name ? (
            <p className="mt-3 text-xs text-slate-400">Posted by {announcement.author_name}</p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
