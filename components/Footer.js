import Link from "next/link";
import { LogoMark } from "./Icons";

const links = [
  { href: "/clubs", label: "Clubs" },
  { href: "/events", label: "Events" },
  { href: "/announcements", label: "Announcements" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--rule-strong)]">
      <div className="page-container">
        <div className="flex flex-col gap-6 py-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-3">
            <LogoMark className="h-9 w-9 text-[1rem]" />
            <div>
              <p className="wordmark">CampusConnect</p>
              <p className="mt-1 max-w-sm text-sm leading-6 text-[var(--ink-soft)]">
                Clubs, events, and campus life in one place.
              </p>
            </div>
          </div>
          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-2"
            aria-label="Footer navigation"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.1em] text-[var(--ink-soft)] transition hover:text-[var(--margin)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--rule)] py-4">
          <p className="mono-label">Built with Next.js &amp; MySQL</p>
          <p className="mono-label">Campus field notes</p>
        </div>
      </div>
    </footer>
  );
}
