"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icons";

export default function LogoutButton({ className = "", compact = false }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      aria-label={compact ? "Sign out" : undefined}
      title={compact ? "Sign out" : undefined}
      className={
        className ||
        "inline-flex h-10 w-10 items-center justify-center border border-transparent text-[var(--ink-soft)] transition hover:border-[var(--rule)] hover:bg-[var(--paper-raised)] hover:text-[var(--ink)] disabled:opacity-50"
      }
    >
      <Icon name="logout" className="h-4 w-4" />
      {compact ? null : <span>{loading ? "Signing out…" : "Sign out"}</span>}
    </button>
  );
}
