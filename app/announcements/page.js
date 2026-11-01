import Link from "next/link";
import AnnouncementCard from "@/components/AnnouncementCard";
import EmptyState from "@/components/EmptyState";
import { Icon } from "@/components/Icons";
import PageHeader from "@/components/PageHeader";
import { query } from "@/lib/db";
import { pluralize } from "@/lib/format";
import { numericParam } from "@/lib/validation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Announcements",
  description:
    "Read the latest announcements from every club on campus, organized club-wise.",
};

const announcementSelect = `
  SELECT a.announcement_id, a.club_id, a.created_by, a.title, a.content, a.created_at,
         c.club_name, u.name AS author_name
    FROM announcements a
    JOIN clubs c ON c.club_id = a.club_id
    JOIN users u ON u.user_id = a.created_by
`;

function parseClubFilter(value) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !raw.trim()) return null;

  try {
    return numericParam(raw.trim(), "club filter");
  } catch {
    return null;
  }
}

export default async function AnnouncementsPage({ searchParams }) {
  const filters = (await searchParams) ?? {};
  const requestedClubId = parseClubFilter(filters.club);

  // Only clubs that have at least one announcement are useful as filters.
  const clubs = await query(
    `SELECT c.club_id, c.club_name, COUNT(a.announcement_id) AS announcement_count
       FROM clubs c
       JOIN announcements a ON a.club_id = c.club_id
      GROUP BY c.club_id, c.club_name
      ORDER BY c.club_name`,
  );

  const selectedClub =
    requestedClubId === null
      ? null
      : (clubs.find((club) => Number(club.club_id) === requestedClubId) ?? null);

  const announcements = await query(
    `${announcementSelect}
      ${selectedClub ? "WHERE a.club_id = ?" : ""}
      ORDER BY a.created_at DESC, a.announcement_id DESC`,
    selectedClub ? [selectedClub.club_id] : [],
  );

  const totalAnnouncements = clubs.reduce(
    (total, club) => total + Number(club.announcement_count),
    0,
  );

  // With no filter, group the newest-first list by club. Map insertion order keeps
  // the club with the most recent announcement at the top.
  const groups = [];
  if (!selectedClub) {
    const byClub = new Map();
    for (const announcement of announcements) {
      const key = String(announcement.club_id);
      let group = byClub.get(key);

      if (!group) {
        group = {
          club_id: announcement.club_id,
          club_name: announcement.club_name,
          announcements: [],
        };
        byClub.set(key, group);
        groups.push(group);
      }

      group.announcements.push(announcement);
    }
  }

  return (
    <div className="page-container page-section">
      <PageHeader
        eyebrow="Club updates"
        title="Announcements"
        description="The latest news from every club on campus, organized club-wise so the updates you care about are easy to find."
        actions={
          <Link href="/clubs" className="btn-secondary">
            <Icon name="users" className="h-4 w-4" />
            Explore clubs
          </Link>
        }
      />

      <section aria-labelledby="club-filter-heading" className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="club-filter-heading" className="text-sm font-bold text-slate-800">
              Filter by club
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {pluralize(totalAnnouncements, "announcement")} across{" "}
              {pluralize(clubs.length, "club")}. Newest first.
            </p>
          </div>
          {selectedClub ? (
            <Link
              href="/announcements"
              className="text-xs font-semibold text-brand-700 transition hover:text-brand-800"
            >
              Clear filter
            </Link>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/announcements"
            className={chipClass(!selectedClub)}
            aria-current={!selectedClub ? "true" : undefined}
          >
            All announcements
            <CountPill value={totalAnnouncements} active={!selectedClub} />
          </Link>

          {clubs.map((club) => {
            const active = selectedClub
              ? Number(selectedClub.club_id) === Number(club.club_id)
              : false;

            return (
              <Link
                key={club.club_id}
                href={`/announcements?club=${club.club_id}`}
                className={chipClass(active)}
                aria-current={active ? "true" : undefined}
              >
                {club.club_name}
                <CountPill value={Number(club.announcement_count)} active={active} />
              </Link>
            );
          })}
        </div>
      </section>

      {announcements.length === 0 ? (
        selectedClub ? (
          <EmptyState
            icon="megaphone"
            title={`No announcements from ${selectedClub.club_name} yet`}
            description="This club has not published any updates yet. Check back soon or explore their profile for events and membership details."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/announcements" className="btn-secondary">
                  View all announcements
                </Link>
                <Link href={`/clubs/${selectedClub.club_id}`} className="btn-primary">
                  View club
                </Link>
              </div>
            }
          />
        ) : (
          <EmptyState
            icon="megaphone"
            title="No announcements yet"
            description="When club admins publish news, updates, and opportunities, they will appear here organized by club."
            action={
              <Link href="/clubs" className="btn-primary">
                Explore clubs
              </Link>
            }
          />
        )
      ) : selectedClub ? (
        <section aria-labelledby="selected-club-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="section-eyebrow">Club announcements</p>
              <h2
                id="selected-club-heading"
                className="mt-1 text-2xl font-bold text-slate-950"
              >
                {selectedClub.club_name}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {pluralize(announcements.length, "announcement")} · newest first
              </p>
            </div>
            <Link
              href={`/clubs/${selectedClub.club_id}`}
              className="btn-secondary btn-sm"
            >
              View club
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.announcement_id}
                announcement={announcement}
                full
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => (
            <section
              key={group.club_id}
              aria-labelledby={`club-announcements-${group.club_id}`}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon name="building" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2
                      id={`club-announcements-${group.club_id}`}
                      className="truncate text-lg font-bold text-slate-950"
                    >
                      <Link
                        href={`/clubs/${group.club_id}`}
                        className="transition hover:text-brand-700"
                      >
                        {group.club_name}
                      </Link>
                    </h2>
                    <p className="text-xs text-slate-500">
                      {pluralize(group.announcements.length, "announcement")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Link
                    href={`/announcements?club=${group.club_id}`}
                    className="btn-ghost btn-sm"
                  >
                    Filter
                  </Link>
                  <Link
                    href={`/clubs/${group.club_id}`}
                    className="btn-ghost btn-sm"
                  >
                    View club
                    <Icon name="arrowRight" className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.announcements.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.announcement_id}
                    announcement={announcement}
                    full
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function chipClass(active) {
  return `chip transition ${
    active
      ? "border-brand-300 bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200"
      : "hover:border-brand-200 hover:bg-brand-50/60 hover:text-brand-700"
  }`;
}

function CountPill({ value, active }) {
  return (
    <span
      className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
        active ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"
      }`}
    >
      {value}
    </span>
  );
}
