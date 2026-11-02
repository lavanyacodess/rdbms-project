"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Icon } from "@/components/Icons";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page-container page-section">
      <div className="paper-slip mx-auto max-w-2xl p-6 text-center sm:p-10">
        <span className="stamp stamp-red mx-auto">
          <Icon name="info" className="h-3 w-3" />
          Something went wrong
        </span>
        <h1 className="mt-5 text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[0.98] tracking-[-0.045em] text-[var(--ink)]">
          We hit an unexpected snag.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
          Try again. If the problem continues, make sure the database is running and the environment
          variables are configured.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
