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
    <section className="page-container page-section">
      <div className="auth-spread mx-auto grid max-w-6xl lg:grid-cols-[0.92fr_1.08fr]">
        <aside className="auth-cover hidden lg:flex lg:flex-col">
          <div className="auth-cover-inner flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-4">
              <Link
                href="/"
                className="flex w-fit items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--highlighter)]"
                aria-label="CampusConnect home"
              >
                <LogoMark className="h-10 w-10 text-[1.15rem]" />
                <span className="flex flex-col">
                  <span className="text-[1.05rem] font-extrabold leading-none tracking-[-0.045em] text-[var(--paper-raised)]">
                    CampusConnect
                  </span>
                  <span className="mt-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[rgba(248,249,243,0.58)]">
                    Campus field notes
                  </span>
                </span>
              </Link>
              <span className="stamp shrink-0 border-[var(--highlighter)] text-[var(--highlighter)]">
                <Icon name="sparkles" className="h-3 w-3" />
                {content.badge}
              </span>
            </div>

            <div className="mt-auto pt-16">
              <h2 className="max-w-sm text-[clamp(2rem,3.5vw,2.9rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[var(--paper-raised)]">
                {content.title}
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-7 text-[rgba(248,249,243,0.7)]">
                {content.description}
              </p>

              <ul className="mt-8 space-y-4">
                {content.points.map((point) => (
                  <li key={point.title} className="auth-point">
                    <span className="auth-point-icon" aria-hidden="true">
                      <Icon name={point.icon} className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--paper-raised)]">
                        {point.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-[rgba(248,249,243,0.62)]">
                        {point.copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="auth-aside-note">
              <div className="flex items-center gap-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-[var(--highlighter)]">
                <Icon name="shield" className="h-4 w-4" />
                Private by design
              </div>
              <p className="mt-2 text-xs leading-5 text-[rgba(248,249,243,0.62)]">
                Passwords are hashed with bcrypt, and your session is kept in an
                httpOnly cookie.
              </p>
            </div>

            <p className="mt-6 font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[rgba(248,249,243,0.52)]">
              Field note / {mode === "login" ? "01" : "02"}
            </p>
          </div>
        </aside>

        <div className="auth-form">
          <div className="mx-auto w-full max-w-xl">{children}</div>
        </div>
      </div>
    </section>
  );
}
