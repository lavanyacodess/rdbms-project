"use client";

import { Icon } from "@/components/Icons";

const ACCOUNTS = [
  {
    role: "Club admin",
    icon: "shield",
    email: "admin@campusconnect.test",
    password: "Admin@123",
  },
  {
    role: "Student",
    icon: "graduation",
    email: "student@campusconnect.test",
    password: "Student@123",
  },
];

export default function DemoCredentials({ onSelect, disabled = false }) {
  return (
    <div className="demo-card mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="mono-label">Demo accounts</p>
        <span className="stamp stamp-green">
          <Icon name="sparkles" className="h-3 w-3" />
          Try it out
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        {ACCOUNTS.map((account) => (
          <button
            key={account.email}
            type="button"
            onClick={() => onSelect?.(account)}
            disabled={disabled}
            className="demo-row group disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink)]">
                <Icon name={account.icon} className="h-3.5 w-3.5 text-[var(--margin)]" />
                {account.role}
              </span>
              <span className="mt-1 block break-words font-mono text-[0.7rem] leading-5 text-[var(--ink-soft)]">
                {account.email} / {account.password}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink)] transition group-hover:text-[var(--margin)]">
              Use
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      <p className="hint">
        Pick an account to fill the form, then sign in to explore both experiences.
      </p>
    </div>
  );
}
