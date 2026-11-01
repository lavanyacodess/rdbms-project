import Link from "next/link";
import { LogoMark } from "./Icons";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/60">
      <div className="page-container flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <LogoMark className="h-8 w-8" />
          <div>
            <p className="text-sm font-bold text-slate-900">CampusConnect</p>
            <p className="text-xs text-slate-500">Clubs, events, and campus life in one place.</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500" aria-label="Footer navigation">
          <Link href="/clubs" className="hover:text-brand-700">Clubs</Link>
          <Link href="/events" className="hover:text-brand-700">Events</Link>
          <Link href="/announcements" className="hover:text-brand-700">Announcements</Link>
          <Link href="/dashboard" className="hover:text-brand-700">Dashboard</Link>
        </nav>
        <p className="text-xs text-slate-400">Built with Next.js &amp; MySQL</p>
      </div>
    </footer>
  );
}
