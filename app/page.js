import Link from "next/link";
import { Icon } from "@/components/Icons";
import { query } from "@/lib/db";
import { formatEventDate, formatRelative, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

const features = [
  {
    icon: "users",
    title: "Find your community",
    copy: "Explore every club on campus, learn what they do, and request to join the ones that feel like home.",
  },
  {
    icon: "calendar",
    title: "Never miss a moment",
    copy: "See upcoming workshops, hackathons, and cultural nights. Register in a click and keep your calendar full.",
  },
  {
    icon: "megaphone",
    title: "Stay in the loop",
    copy: "Club announcements live in one place, organized by club, so important updates never get lost in the noise.",
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

function daysFromNow(days, hour = 18) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

const fallbackEvents = [
  {
    event_id: null,
    event_name: "Hack the Campus",
    event_date: daysFromNow(5, 9),
    venue: "Innovation Lab, Block C",
    club_name: "IEEE Student Branch",
    capacity: 80,
    registered_count: 3,
  },
  {
    event_id: null,
    event_name: "Build with AI",
    event_date: daysFromNow(8, 16),
    venue: "Seminar Hall 2",
    club_name: "Google Developer Group",
    capacity: 60,
    registered_count: 2,
  },
  {
    event_id: null,
    event_name: "Startup Pitch Night",
    event_date: daysFromNow(12, 17),
    venue: "Auditorium",
    club_name: "E-Cell",
    capacity: 150,
    registered_count: 2,
  },
];

const fallbackAnnouncement = {
  announcement_id: null,
  club_id: null,
  club_name: "IEEE Student Branch",
  title: "Registrations are open",
  created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
};

function formatSlipDate(value) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).formatToParts(value);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("weekday")} ${get("day")} ${get("month")}`.toUpperCase();
}

async function getHomeData() {
  try {
    const [eventRows, announcementRows, countRows] = await Promise.all([
      query(
        `SELECT e.event_id, e.event_name, e.event_date, e.venue, e.capacity,
                c.club_id, c.club_name,
                (SELECT COUNT(*)
                   FROM event_registrations r
                  WHERE r.event_id = e.event_id AND r.status = 'REGISTERED') AS registered_count
           FROM events e
           JOIN clubs c ON c.club_id = e.club_id
          WHERE e.event_date >= NOW()
          ORDER BY e.event_date ASC
          LIMIT 3`,
      ),
      query(
        `SELECT a.announcement_id, a.club_id, a.title, a.created_at, c.club_name
           FROM announcements a
           JOIN clubs c ON c.club_id = a.club_id
          ORDER BY a.created_at DESC
          LIMIT 1`,
      ),
      query(
        `SELECT (SELECT COUNT(*) FROM clubs) AS club_count,
                (SELECT COUNT(*) FROM events WHERE event_date >= NOW()) AS event_count`,
      ),
    ]);

    return {
      events: eventRows.length ? eventRows : fallbackEvents,
      announcement: announcementRows[0] ?? fallbackAnnouncement,
      clubCount: Number(countRows[0]?.club_count ?? 4),
      eventCount: Number(countRows[0]?.event_count ?? 5),
    };
  } catch {
    return {
      events: fallbackEvents,
      announcement: fallbackAnnouncement,
      clubCount: 4,
      eventCount: 5,
    };
  }
}

function eventHref(event) {
  return event.event_id ? `/events/${event.event_id}` : "/events";
}

export default async function HomePage() {
  const { events, announcement, clubCount, eventCount } = await getHomeData();
  const nextEvent = events[0] ?? fallbackEvents[0];
  const ticketDate = formatEventDate(nextEvent.event_date);
  const slipDate = formatSlipDate(new Date());
  const nextEventFull =
    nextEvent.capacity != null && Number(nextEvent.registered_count || 0) >= Number(nextEvent.capacity);

  return (
    <>
      <section className="page-container page-section">
        <div className="hero-grid">
          <div className="hero-copy">
            <h1 className="display-title">
              Find your people.
              <span className="highlight-block">
                <span className="highlight">Make campus happen.</span>
              </span>
            </h1>
            <p className="lede mt-6">
              CampusConnect brings every club, event, and announcement into one simple place.
              Discover what&apos;s happening, join communities, and build a campus experience that
              feels like yours.
            </p>
            <div className="hero-actions">
              <Link href="/register" className="btn btn-primary btn-lg">
                Join CampusConnect
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
              <Link href="/clubs" className="link-arrow">
                Explore clubs
                <Icon name="arrowRight" className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="check-list hero-proof">
              <li>
                <span className="check-box">
                  <Icon name="check" />
                </span>
                Student-first
              </li>
              <li>
                <span className="check-box">
                  <Icon name="check" />
                </span>
                Club admin tools
              </li>
              <li>
                <span className="check-box">
                  <Icon name="check" />
                </span>
                One campus calendar
              </li>
            </ul>
          </div>

          <div className="hero-slip-wrap">
            <article className="paper-slip taped hero-slip">
              <span className="tape" aria-hidden="true" />
              <header className="slip-head">
                <div>
                  <p className="mono-label">Today on campus</p>
                  <p className="slip-date">{slipDate}</p>
                </div>
                <span className="tag">Field notes</span>
              </header>

              <div className="slip-greeting">
                <span className="avatar" aria-hidden="true">
                  PS
                </span>
                <div>
                  <p>Priya Sharma</p>
                  <p>IEEE member · field notes</p>
                </div>
              </div>

              <dl className="slip-ledger">
                <div>
                  <dt>Clubs</dt>
                  <dd>{String(clubCount).padStart(2, "0")}</dd>
                </div>
                <div>
                  <dt>Upcoming</dt>
                  <dd>{String(eventCount).padStart(2, "0")}</dd>
                </div>
              </dl>

              <Link href={eventHref(nextEvent)} className="ticket group">
                <div className="ticket-date" aria-hidden="true">
                  <span>{ticketDate.month}</span>
                  <strong>{ticketDate.day}</strong>
                  <span>{ticketDate.weekday}</span>
                </div>
                <div className="ticket-body">
                  <p className="mono-label">Next event</p>
                  <p className="ticket-title group-hover:text-[var(--margin)]">
                    {nextEvent.event_name}
                  </p>
                  <p className="ticket-meta">
                    {formatTime(nextEvent.event_date)} · {nextEvent.venue || "Venue to be announced"}
                  </p>
                  <p className="ticket-meta">{nextEvent.club_name}</p>
                </div>
                <span className={`stamp ${nextEventFull ? "stamp-red" : "stamp-green"} self-start`}>
                  {nextEventFull ? "Full" : "Open"}
                </span>
              </Link>

              <div className="slip-note">
                <span className="check-box">
                  <Icon name="check" />
                </span>
                <div className="min-w-0">
                  <p className="truncate">{announcement.title}</p>
                  <p>
                    {announcement.club_name} · {formatRelative(announcement.created_at)}
                  </p>
                </div>
              </div>

              <span className="stamp stamp-green hero-stamp">
                <Icon name="check" className="h-3 w-3" />
                Membership approved
              </span>
            </article>
          </div>
        </div>

        <div className="term-rail">
          <div className="term-rail-head">
            <span className="margin-label">On the calendar</span>
            <Link href="/events" className="link-arrow">
              All events
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </Link>
          </div>
          {events.map((event) => {
            const date = formatEventDate(event.event_date);
            const full =
              event.capacity != null &&
              Number(event.registered_count || 0) >= Number(event.capacity);
            return (
              <Link key={`${event.event_name}-${event.event_date}`} href={eventHref(event)} className="term-row">
                <span className="term-row-date">
                  {date.day} {date.month}
                </span>
                <span className="term-row-main">
                  <strong>{event.event_name}</strong>
                  <span>
                    {event.club_name} · {event.venue || "Venue to be announced"}
                  </span>
                </span>
                <span className="term-row-status">
                  <span className={`stamp ${full ? "stamp-red" : "stamp-green"}`}>
                    {full ? "Full" : "Open"}
                  </span>
                  <Icon name="arrowRight" className="h-3.5 w-3.5 text-[var(--ink-faint)]" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="page-container page-section">
        <div className="spread-grid">
          <div>
            <h2 className="section-title">Campus life, minus the chaos</h2>
            <p className="body-copy mt-4">
              No more scattered spreadsheets, missed posts, or five different sign-up links. Just
              a clean, shared space for clubs and students.
            </p>
            <div className="note-card mt-7">
              <p className="mono-label">A note in the margin</p>
              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                One home for clubs, one calendar for events, and one place for the updates that
                matter.
              </p>
            </div>
          </div>

          <div>
            {features.map((feature) => (
              <article key={feature.title} className="feature-entry">
                <span className="feature-icon" aria-hidden="true">
                  <Icon name={feature.icon} className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-copy">{feature.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ink-sheet">
        <div className="page-container py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-16">
            <div>
              <h2 className="text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.02] tracking-[-0.04em] text-[var(--paper-raised)]">
                Three steps from curious to connected.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-[rgba(248,249,243,0.72)]">
                Whether you are looking for your first club or running one, CampusConnect keeps the
                important parts simple.
              </p>
              <Link href="/register" className="btn mt-7">
                Get started free
                <Icon name="arrowRight" className="h-4 w-4" />
              </Link>
            </div>

            <div>
              {steps.map((step) => (
                <div key={step.number} className="step-row">
                  <span className="step-number">{step.number}</span>
                  <div>
                    <h3 className="step-title">{step.title}</h3>
                    <p className="step-copy">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="page-container page-section">
        <div className="tearout">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="section-title">Your next campus story starts here.</h2>
              <p className="body-copy mt-3">
                Join students discovering clubs, showing up for events, and making campus feel a
                little more like home.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Create your account
                  <Icon name="arrowRight" className="h-4 w-4" />
                </Link>
                <Link href="/login" className="btn btn-secondary btn-lg">
                  Sign in
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center lg:pr-4" aria-hidden="true">
              <span className="stamp stamp-red rotate-[-4deg] px-3 py-2 text-[0.7rem]">
                CampusConnect
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
