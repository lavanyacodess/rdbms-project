"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function DeleteAnnouncementButton({ announcementId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  function startConfirming() {
    setError("");
    setConfirming(true);
  }

  function cancel() {
    setError("");
    setConfirming(false);
  }

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not delete the announcement.");
      }

      setConfirming(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete the announcement.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1.5">
      {confirming ? (
        <div
          className="flex flex-wrap items-center justify-end gap-2"
          role="group"
          aria-label="Confirm announcement deletion"
        >
          <span className="text-xs font-medium text-slate-500">Delete this announcement?</span>
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting…" : "Yes, delete"}
          </button>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={cancel}
            disabled={deleting}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          onClick={startConfirming}
        >
          <Icon name="trash" className="h-3.5 w-3.5" />
          Delete
        </button>
      )}

      {error ? (
        <p className="text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
