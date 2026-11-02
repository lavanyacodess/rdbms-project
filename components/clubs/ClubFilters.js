import Link from "next/link";
import { Icon } from "@/components/Icons";

function buildHref(q, category) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  const queryString = params.toString();
  return queryString ? `/clubs?${queryString}` : "/clubs";
}

export default function ClubFilters({ q, category, categories }) {
  return (
    <section className="filter-bar" aria-label="Search and filter clubs">
      <form
        method="get"
        action="/clubs"
        role="search"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <div className="flex-1">
          <label htmlFor="club-search" className="label">
            Search clubs
          </label>
          <div className="relative">
            <Icon
              name="search"
              className="pointer-events-none absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-faint)]"
            />
            <input
              id="club-search"
              name="q"
              type="search"
              defaultValue={q}
              maxLength={100}
              className="input pl-7"
              placeholder="Search by club name or description"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1 sm:flex-none">
            <Icon name="search" className="h-3.5 w-3.5" />
            Search
          </button>
          {q || category ? (
            <Link href="/clubs" className="btn btn-ghost">
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={buildHref(q, "")}
          className="chip"
          aria-current={!category ? "page" : undefined}
        >
          All clubs
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={buildHref(q, item)}
            className="chip"
            aria-current={category === item ? "page" : undefined}
          >
            {item}
          </Link>
        ))}
      </div>
    </section>
  );
}
