import Link from "next/link";
import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { pluralize } from "@/lib/format";
import PageHeader from "@/components/PageHeader";
import ClubCard from "@/components/ClubCard";
import EmptyState from "@/components/EmptyState";
import ClubFilters from "@/components/clubs/ClubFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Clubs",
  description:
    "Browse campus clubs, explore categories, and request to join the communities that fit you.",
};

export default async function ClubsPage({ searchParams }) {
  const filters = (await searchParams) || {};
  const q = typeof filters.q === "string" ? filters.q.trim().slice(0, 100) : "";
  const category =
    typeof filters.category === "string" ? filters.category.trim().slice(0, 50) : "";

  const user = await getSessionUser();

  const conditions = [];
  const params = [];

  if (user) {
    params.push(user.userId);
  }

  if (q) {
    conditions.push("(c.club_name LIKE ? OR c.description LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }

  if (category) {
    conditions.push("c.category = ?");
    params.push(category);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const membershipJoin = user
    ? "LEFT JOIN club_members cm ON cm.club_id = c.club_id AND cm.user_id = ?"
    : "";
  const membershipSelect = user
    ? "cm.status AS membership_status"
    : "NULL AS membership_status";

  const [clubs, categoryRows] = await Promise.all([
    query(
      `SELECT c.club_id, c.club_name, c.description, c.category, c.created_at,
              (SELECT COUNT(*)
                 FROM club_members cmc
                WHERE cmc.club_id = c.club_id AND cmc.status = 'APPROVED') AS member_count,
              (SELECT MIN(e.event_date)
                 FROM events e
                WHERE e.club_id = c.club_id AND e.event_date >= NOW()) AS next_event_date,
              ${membershipSelect}
         FROM clubs c
         ${membershipJoin}
         ${where}
        ORDER BY c.club_name`,
      params,
    ),
    query(
      `SELECT DISTINCT category
         FROM clubs
        WHERE category IS NOT NULL AND category <> ''
        ORDER BY category`,
    ),
  ]);

  const categories = categoryRows.map((row) => row.category);
  const hasFilters = Boolean(q || category);

  return (
    <div className="page-container page-section">
      <PageHeader
        eyebrow="Club directory"
        title="Find your people"
        description="Every club on campus in one place. Search by name, filter by category, and find the community that feels like yours."
      />

      <ClubFilters q={q} category={category} categories={categories} />

      <div className="mt-6 mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{pluralize(clubs.length, "club")}</span>
          {q ? (
            <>
              {" "}
              matching <span className="font-medium text-slate-900">{q}</span>
            </>
          ) : null}
          {category ? (
            <>
              {" "}
              in <span className="font-medium text-slate-900">{category}</span>
            </>
          ) : null}
        </p>
        {hasFilters ? (
          <Link
            href="/clubs"
            className="text-sm font-semibold text-brand-700 transition hover:text-brand-800"
          >
            Clear filters
          </Link>
        ) : null}
      </div>

      {clubs.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <ClubCard key={club.club_id} club={club} />
          ))}
        </div>
      ) : hasFilters ? (
        <EmptyState
          icon="search"
          title="No clubs match your filters"
          description="Try a different search term or browse another category."
          action={
            <Link href="/clubs" className="btn-secondary">
              Clear filters
            </Link>
          }
        />
      ) : (
        <EmptyState
          icon="building"
          title="No clubs yet"
          description="Clubs will appear here once they are added to CampusConnect."
          action={
            <Link href="/" className="btn-secondary">
              Back to home
            </Link>
          }
        />
      )}
    </div>
  );
}
