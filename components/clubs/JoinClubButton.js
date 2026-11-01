"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function JoinClubButton({ clubId, status: initialStatus = "NONE" }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus || "NONE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleJoin() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not send your membership request.");
      }

      setStatus(data.status || "PENDING");
      setSuccess(data.message || "Your membership request has been sent.");
      router.refresh();
    } catch (joinError) {
      setError(joinError.message || "Could not send your membership request.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "APPROVED") {
    return (
      <span className="badge-green">
        <Icon name="check" className="h-3.5 w-3.5" />
        You&apos;re a member
      </span>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="space-y-2">
        <span className="badge-amber">
          <Icon name="clock" className="h-3.5 w-3.5" />
          Request pending
        </span>
        <p className="max-w-xs text-xs leading-5 text-slate-500">
          A club admin will review your request soon.
        </p>
        {success ? (
          <p className="text-xs font-medium text-emerald-600" role="status">
            {success}
          </p>
        ) : null}
        {error ? (
          <p className="field-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {status === "REJECTED" ? (
        <p className="max-w-xs text-xs leading-5 text-slate-500">
          Your previous request was not approved. You can ask to join again.
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleJoin}
        disabled={loading}
        aria-busy={loading}
        className="btn-primary"
      >
        {loading ? "Sending request…" : status === "REJECTED" ? "Request again" : "Request to join"}
        {!loading ? <Icon name="arrowRight" className="h-4 w-4" /> : null}
      </button>
      {success ? (
        <p className="form-success" role="status">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
