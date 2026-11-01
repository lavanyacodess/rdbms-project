import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { initials } from "@/lib/format";
import { Icon, LogoMark } from "./Icons";
import LogoutButton from "./LogoutButton";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <LogoMark />
            <span className="text-lg font-bold tracking-tight text-slate-950">
              Campus<span className="text-brand-600">Connect</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main navigation">
            <NavLinks />
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  <span className="avatar h-8 w-8 text-xs">{initials(user.name)}</span>
                  <span className="max-w-28 truncate">{user.name.split(" ")[0]}</span>
                </Link>
                <Link href="/dashboard" className="btn-secondary btn-sm">
                  <Icon name="dashboard" className="h-4 w-4" />
                  Dashboard
                </Link>
                <LogoutButton compact />
              </>
            ) : (
              <>
                <Link href="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary">
                  Get started
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          <details className="group relative md:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <Icon name="menu" className="h-5 w-5 group-open:hidden" />
              <Icon name="close" className="hidden h-5 w-5 group-open:block" />
              <span className="sr-only">Open navigation menu</span>
            </summary>
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10">
              <NavLinks mobile />
              <div className="my-2 h-px bg-slate-100" />
              {user ? (
                <div className="space-y-2 px-1">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5">
                    <span className="avatar h-9 w-9 text-xs">{initials(user.name)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="btn-primary w-full">
                    Dashboard
                  </Link>
                  <LogoutButton className="btn-secondary w-full" />
                </div>
              ) : (
                <div className="grid gap-2 px-1">
                  <Link href="/login" className="btn-secondary w-full">
                    Sign in
                  </Link>
                  <Link href="/register" className="btn-primary w-full">
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
