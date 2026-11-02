"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function RegisterEventButton({
  eventId,
  initialStatus = null,
  capacity = null,
  registeredCount = 0,
  isPast = false,
  size = "sm",
  fullWidth = false,
  className = "",
}) {
  const router = useRouter();
  const [statusOverride, setStatusOverride] = useState(null);
  const [countOverride, setCountOverride] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const status = statusOverride ?? initialStatus ?? null;
  const count = countOverride ?? (Number(registeredCount) || 0);

  const seatLimit =
    capacity === null || capacity === undefined || capacity === ""
      ? null
      : Number(capacity);
  const full = seatLimit !== null && count >= seatLimit;
  const registered = status === "REGISTERED";
  const sizeClass = size === "lg" ? "btn-lg" : size === "sm" ? "btn-sm" : "";
  const widthClass = fullWidth ? "w-full" : "";
  const wrapperClass = `flex flex-col gap-1.5 ${
    fullWidth ? "w-full items-stretch" : "items-end"
  } ${className}`;

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: registered ? "DELETE" : "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      if (registered) {
        setStatusOverride("CANCELLED");
        setCountOverride(Math.max(0, count - 1));
        setMessage("Registration cancelled.");
      } else {
        setStatusOverride("REGISTERED");
        setCountOverride(count + 1);
        setMessage("You are registered.");
      }
      if (typeof data.registered_count === "number") {
        setCountOverride(data.registered_count);
      }
      router.refresh();
    } catch (requestError) {
      setError(requestError.message || "Something went wrong. Please try again.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (isPast) {
    return (
      <div className={wrapperClass}>
        <button type="button" className={`btn btn-secondary ${sizeClass} ${widthClass}`} disabled>
          Event ended
        </button>
      </div>
    );
  }

  if (full && !registered) {
    return (
      <div className={wrapperClass}>
        <button type="button" className={`btn btn-secondary ${sizeClass} ${widthClass}`} disabled>
          Event full
        </button>
        {error ? (
          <span
            className={`font-mono text-[0.7rem] leading-5 text-[var(--margin)] ${
              fullWidth ? "" : "text-right"
            }`}
            role="alert"
          >
            {error}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <button
        type="button"
        className={`${registered ? "btn btn-secondary" : "btn btn-primary"} ${sizeClass} ${widthClass}`}
        onClick={handleClick}
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          registered ? (
            "Cancelling…"
          ) : (
            "Registering…"
          )
        ) : registered ? (
          <>
            <Icon name="close" className="h-3.5 w-3.5" />
            Cancel registration
          </>
        ) : (
          <>
            <Icon name="check" className="h-3.5 w-3.5" />
            Register
          </>
        )}
      </button>
      {message ? (
        <span
          className={`font-mono text-[0.7rem] leading-5 ${
            registered ? "text-[var(--approved)]" : "text-[var(--ink-soft)]"
          } ${fullWidth ? "" : "text-right"}`}
          role="status"
        >
          {message}
        </span>
      ) : null}
      {error ? (
        <span
          className={`font-mono text-[0.7rem] leading-5 text-[var(--margin)] ${
            fullWidth ? "" : "text-right"
          }`}
          role="alert"
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
