import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { initials } from "@/lib/format";
import { Icon, LogoMark } from "./Icons";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";

export default async function Navbar() {
  const user = await getSessionUser();

  return (
    <header className="site-header">
      <div className="page-container">
        <div className="flex min-h-[4.4rem] items-center justify-between gap-4 py-2.5">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
            aria-label="CampusConnect home"
          >
            <LogoMark className="h-10 w-10 text-[1.15rem]" />
            <span className="flex flex-col">
              <span className="wordmark">CampusConnect</span>
              <span className="mono-label mt-1 hidden text-[0.7rem] tracking-[0.18em] sm:block">
                Campus field notes
              </span>
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
                  className="flex items-center gap-2 border border-transparent px-1.5 py-1.5 transition hover:border-[var(--rule)] hover:bg-[var(--paper-raised)]"
                >
                  <span className="avatar h-8 w-8 text-[0.7rem]">{initials(user.name)}</span>
                  <span className="max-w-28 truncate font-mono text-[0.7rem] font-medium tracking-[0.04em] text-[var(--ink-soft)]">
                    {user.name.split(" ")[0]}
                  </span>
                </Link>
                <Link href="/dashboard" className="btn btn-secondary btn-sm">
                  <Icon name="dashboard" className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <LogoutButton compact />
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost">
                  Sign in
                </Link>
                <Link href="/register" className="btn btn-primary">
                  Get started
                  <Icon name="arrowRight" className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          <MobileMenu>
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center border border-[var(--rule-strong)] bg-[var(--paper-raised)] text-[var(--ink)] transition hover:bg-[var(--highlighter)] [&::-webkit-details-marker]:hidden">
              <Icon name="menu" className="h-5 w-5 group-open:hidden" />
              <Icon name="close" className="hidden h-5 w-5 group-open:block" />
              <span className="sr-only group-open:hidden">Open navigation menu</span>
              <span className="sr-only hidden group-open:inline">Close navigation menu</span>
            </summary>
            <nav
              className="paper-slip absolute right-0 mt-2 w-72 p-3"
              aria-label="Mobile navigation"
            >
              <NavLinks mobile />
              <div className="my-2 h-px bg-[var(--rule)]" />
              {user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border border-[var(--rule)] bg-[var(--paper)] p-2.5">
                    <span className="avatar h-9 w-9 text-xs">{initials(user.name)}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--ink)]">
                        {user.name}
                      </p>
                      <p className="truncate font-mono text-[0.7rem] text-[var(--ink-faint)]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="btn btn-primary w-full">
                    Dashboard
                  </Link>
                  <LogoutButton className="btn btn-secondary w-full" />
                </div>
              ) : (
                <div className="grid gap-2">
                  <Link href="/login" className="btn btn-secondary w-full">
                    Sign in
                  </Link>
                  <Link href="/register" className="btn btn-primary w-full">
                    Create account
                  </Link>
                </div>
              )}
            </nav>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
