import Link from "next/link";
import { Icon, LogoMark } from "@/components/Icons";

const MODES = {
  login: {
    badge: "Member access",
    title: "Your campus is waiting.",
    description:
      "Sign in to pick up right where you left off — your clubs, your events, and the people who make campus feel like home.",
    points: [
      {
        icon: "users",
        title: "Your communities",
        copy: "Every club you have joined, plus the ones still waiting for you.",
      },
      {
        icon: "calendar",
        title: "Your calendar",
        copy: "Upcoming events and registrations in one clear view.",
      },
      {
        icon: "megaphone",
        title: "Your updates",
        copy: "Announcements from the clubs that matter to you.",
      },
    ],
  },
  register: {
    badge: "Join the community",
    title: "Your campus story starts here.",
    description:
      "Create your student account and find the clubs, events, and people that make campus feel like home.",
    points: [
      {
        icon: "graduation",
        title: "Build your profile",
        copy: "Add your department and year so clubs know who is joining.",
      },
      {
        icon: "users",
        title: "Find your people",
        copy: "Browse every club on campus and request to join the ones you love.",
      },
      {
        icon: "calendar",
        title: "Show up",
        copy: "Register for events and keep every opportunity in one place.",
      },
    ],
  },
};

export default function AuthShell({ mode = "login", children }) {
  const content = MODES[mode] ?? MODES.login;

  return (
    <section className="relative overflow-hidden">
      <div className="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div className="page-container py-10 sm:py-14">
        <div className="card mx-auto grid max-w-6xl overflow-hidden rounded-3xl shadow-2xl shadow-brand-950/10 lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 p-10 text-white lg:flex lg:flex-col xl:p-12">
            <div
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative flex flex-1 flex-col">
              <Link
                href="/"
                className="inline-flex w-fit items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700"
              >
                <LogoMark className="h-10 w-10" />
                <span className="text-lg font-bold tracking-tight">CampusConnect</span>
              </Link>

              <div className="mt-auto pt-16">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-50">
                  <Icon name="sparkles" className="h-3.5 w-3.5" />
                  {content.badge}
                </span>
                <p className="mt-6 max-w-sm text-3xl font-bold leading-tight xl:text-4xl">
                  {content.title}
                </p>
                <p className="mt-4 max-w-sm text-sm leading-6 text-brand-100">
                  {content.description}
                </p>

                <ul className="mt-8 space-y-4">
                  {content.points.map((point) => (
                    <li key={point.title} className="flex gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-inset ring-white/15">
                        <Icon name={point.icon} className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{point.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-brand-100">
                          {point.copy}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-50">
                  <Icon name="shield" className="h-4 w-4" />
                  Private by design
                </div>
                <p className="mt-2 text-xs leading-5 text-brand-100">
                  Passwords are hashed with bcrypt, and your session is kept in an
                  httpOnly cookie.
                </p>
              </div>
            </div>
          </aside>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto w-full max-w-xl">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
