import Link from "next/link";
import { Icon, LogoMark } from "@/components/Icons";

const features = [
  {
    icon: "users",
    title: "Find your community",
    copy: "Explore every club on campus, learn what they do, and request to join the ones that feel like home.",
    color: "bg-brand-50 text-brand-700",
  },
  {
    icon: "calendar",
    title: "Never miss a moment",
    copy: "See upcoming workshops, hackathons, and cultural nights. Register in a click and keep your calendar full.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: "megaphone",
    title: "Stay in the loop",
    copy: "Club announcements live in one place, organized by club, so important updates never get lost in the noise.",
    color: "bg-emerald-50 text-emerald-700",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your student account",
    copy: "Sign up with your college email and tell us a little about your course and year.",
  },
  {
    number: "02",
    title: "Explore and join clubs",
    copy: "Browse clubs by category, read their stories, and send a membership request.",
  },
  {
    number: "03",
    title: "Show up and get involved",
    copy: "Register for events, follow announcements, and make the most of campus life.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="hero-grid absolute inset-0 -z-10" />
        <div className="page-container grid items-center gap-14 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="animate-rise">
            <span className="badge-brand">
              <Icon name="sparkles" className="h-3.5 w-3.5" />
              Your campus, connected
            </span>
            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Find your people.
              <br />
              <span className="gradient-text">Make campus happen.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              CampusConnect brings every club, event, and announcement into one simple place.
              Discover what&apos;s happening, join communities, and build a campus experience that
              feels like yours.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/register" className="btn-primary btn-lg">
                Join CampusConnect
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <Link href="/clubs" className="btn-secondary btn-lg">
                Explore clubs
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-emerald-600" />
                Student-first
              </span>
              <span className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-emerald-600" />
                Club admin tools
              </span>
              <span className="flex items-center gap-2">
                <Icon name="check" className="h-4 w-4 text-emerald-600" />
                One campus calendar
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg animate-rise lg:mx-0">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-brand-200/50 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />

            <div className="relative rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-2xl shadow-brand-950/10 backdrop-blur">
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <LogoMark className="h-9 w-9" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Good morning, Priya</p>
                      <p className="text-xs text-slate-500">Here&apos;s what&apos;s happening today</p>
                    </div>
                  </div>
                  <span className="avatar h-9 w-9 text-xs">PS</span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Icon name="users" className="h-4 w-4 text-brand-600" />
                      My clubs
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-950">03</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                      <Icon name="calendar" className="h-4 w-4 text-amber-600" />
                      Upcoming
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-950">05</p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Next event
                    </p>
                    <span className="badge-green">Registered</span>
                  </div>
                  <div className="mt-3 flex gap-3">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-600 text-white">
                      <span className="text-[10px] font-bold tracking-wide">NOV</span>
                      <span className="text-xl font-extrabold leading-none">06</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">Hack the Campus</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <Icon name="clock" className="h-3.5 w-3.5" />
                        9:00 AM
                        <span className="mx-1">·</span>
                        <Icon name="mapPin" className="h-3.5 w-3.5" />
                        Innovation Lab
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                      <Icon name="megaphone" className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        Registrations are open
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        IEEE Student Branch · 2 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:block">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-900">Membership approved</p>
                  <p className="text-[11px] text-slate-500">Welcome to GDG!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white/60">
        <div className="page-container grid gap-6 py-8 sm:grid-cols-3">
          {[
            ["One home for clubs", "From technical societies to cultural crews."],
            ["Built for busy students", "Find events and updates without the group-chat chaos."],
            ["Admin tools that work", "Approve members, publish news, and manage events."],
          ].map(([title, copy]) => (
            <div key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <Icon name="check" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">{title}</p>
                <p className="mt-0.5 text-sm text-slate-500">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="page-container page-section">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-eyebrow">Everything in one place</p>
          <h2 className="section-title mt-3">Campus life, minus the chaos</h2>
          <p className="section-copy mx-auto">
            No more scattered spreadsheets, missed posts, or five different sign-up links. Just a
            clean, shared space for clubs and students.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="card card-hover p-6">
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${feature.color}`}>
                <Icon name={feature.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-slate-950">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white sm:py-20">
        <div className="page-container">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-300">
                How it works
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Three steps from curious to connected.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Whether you are looking for your first club or running one, CampusConnect keeps the
                important parts simple.
              </p>
              <Link href="/register" className="btn-primary btn-lg mt-7">
                Get started free
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.07]"
                >
                  <span className="text-sm font-bold text-brand-300">{step.number}</span>
                  <div>
                    <h3 className="font-bold text-white">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container page-section">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 px-6 py-12 text-center text-white shadow-2xl shadow-brand-900/20 sm:px-12 sm:py-16">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Your next campus story starts here.
            </h2>
            <p className="mt-4 text-sm leading-6 text-brand-100 sm:text-base">
              Join students discovering clubs, showing up for events, and making campus feel a
              little more like home.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="btn bg-white text-brand-700 hover:bg-brand-50">
                Create your account
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="btn border border-white/25 bg-white/10 text-white hover:bg-white/15"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
