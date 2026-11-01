"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function MembershipActions({ clubId, userId, memberName = "this student" }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  async function update(status) {
    setPendingStatus(status);
    setError("");
    setDone("");

    try {
      const response = await fetch(`/api/clubs/${clubId}/members/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not update this membership request.");
      }

      setDone(status === "APPROVED" ? "Approved" : "Rejected");
      router.refresh();
    } catch (updateError) {
      setError(updateError.message || "Could not update this membership request.");
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => update("APPROVED")}
          disabled={Boolean(pendingStatus)}
          aria-busy={pendingStatus === "APPROVED"}
          className="btn-primary btn-sm"
          aria-label={`Approve ${memberName}`}
        >
          <Icon name="check" className="h-3.5 w-3.5" />
          {pendingStatus === "APPROVED" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => update("REJECTED")}
          disabled={Boolean(pendingStatus)}
          aria-busy={pendingStatus === "REJECTED"}
          className="btn-secondary btn-sm"
          aria-label={`Reject ${memberName}`}
        >
          <Icon name="close" className="h-3.5 w-3.5" />
          {pendingStatus === "REJECTED" ? "Rejecting…" : "Reject"}
        </button>
      </div>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      {done ? (
        <span className="text-xs font-medium text-emerald-600" role="status">
          {done}
        </span>
      ) : null}
    </div>
  );
}
