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
    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          Demo accounts
        </p>
        <span className="badge-brand">
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
            className="group flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-brand-300 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Icon name={account.icon} className="h-3.5 w-3.5 text-brand-600" />
                {account.role}
              </span>
              <span className="mt-1 block break-words font-mono text-xs leading-4 text-slate-500">
                {account.email} / {account.password}
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-brand-600 transition group-hover:text-brand-700">
              Use
              <Icon name="arrowRight" className="h-3.5 w-3.5" />
            </span>
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Pick an account to fill the form, then sign in to explore both experiences.
      </p>
    </div>
  );
}
