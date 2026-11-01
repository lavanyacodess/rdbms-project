"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/Icons";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <Icon name="info" className="h-7 w-7" />
      </span>
      <p className="section-eyebrow mt-6">Something went wrong</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        We hit an unexpected snag.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
        Try again. If the problem continues, make sure the database is running and the environment
        variables are configured.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back home
        </Link>
      </div>
    </div>
  );
}
