import Link from "next/link";
import { Icon } from "@/components/Icons";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="page-container page-section">
      <div className="paper-slip mx-auto max-w-2xl p-6 text-center sm:p-10">
        <span className="stamp stamp-amber mx-auto">404 / Missing page</span>
        <div className="mt-5 flex justify-center">
          <span className="empty-state-icon">
            <Icon name="search" className="h-6 w-6" />
          </span>
        </div>
        <h1 className="mt-4 text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[var(--ink)]">
          We couldn&apos;t find that page.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
          The link may be broken, or the club, event, or page may have moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link href="/" className="btn btn-primary">
            Back home
          </Link>
          <Link href="/clubs" className="btn btn-secondary">
            Explore clubs
          </Link>
        </div>
      </div>
    </div>
  );
}
