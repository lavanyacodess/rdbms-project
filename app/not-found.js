import Link from "next/link";
import { Icon } from "@/components/Icons";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <Icon name="search" className="h-7 w-7" />
      </span>
      <p className="section-eyebrow mt-6">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        The link may be broken, or the club, event, or page may have moved.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn-primary">
          Back home
        </Link>
        <Link href="/clubs" className="btn-secondary">
          Explore clubs
        </Link>
      </div>
    </div>
  );
}
