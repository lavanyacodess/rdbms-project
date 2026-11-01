"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function DeleteEventButton({ eventId, eventName }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/events/${eventId}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not delete the event. Please try again.");
      }
      router.push("/events");
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete the event. Please try again.");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        className="btn-danger btn-sm"
        onClick={() => {
          setConfirming(true);
          setError("");
        }}
      >
        <Icon name="trash" className="h-3.5 w-3.5" />
        Delete event
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5" role="alertdialog" aria-label="Confirm event deletion">
      <p className="text-sm font-semibold text-rose-800">
        Delete {eventName ? `“${eventName}”` : "this event"}?
      </p>
      <p className="mt-1 text-xs leading-5 text-rose-700">
        The event and all of its registrations will be permanently removed. This cannot be undone.
      </p>
      {error ? (
        <p className="field-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn-danger btn-sm" onClick={handleDelete} disabled={loading}>
          {loading ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          className="btn-secondary btn-sm"
          onClick={() => {
            setConfirming(false);
            setError("");
          }}
          disabled={loading}
        >
          Keep event
        </button>
      </div>
    </div>
  );
}
