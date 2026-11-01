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
    <section className="card p-5 sm:p-6" aria-label="Search and filter clubs">
      <form
        method="get"
        action="/clubs"
        role="search"
        className="flex flex-col gap-3 sm:flex-row"
      >
        {category ? <input type="hidden" name="category" value={category} /> : null}
        <div className="relative flex-1">
          <label htmlFor="club-search" className="sr-only">
            Search clubs
          </label>
          <Icon
            name="search"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            id="club-search"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={100}
            className="input pl-10"
            placeholder="Search by club name or description"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 sm:flex-none">
            <Icon name="search" className="h-4 w-4" />
            Search
          </button>
          {q || category ? (
            <Link href="/clubs" className="btn-ghost">
              Reset
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={buildHref(q, "")}
          className={
            !category
              ? "chip border-brand-200 bg-brand-50 text-brand-700"
              : "chip transition hover:border-brand-200 hover:text-brand-700"
          }
          aria-current={!category ? "page" : undefined}
        >
          All clubs
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={buildHref(q, item)}
            className={
              category === item
                ? "chip border-brand-200 bg-brand-50 text-brand-700"
                : "chip transition hover:border-brand-200 hover:text-brand-700"
            }
            aria-current={category === item ? "page" : undefined}
          >
            {item}
          </Link>
        ))}
      </div>
    </section>
  );
}
