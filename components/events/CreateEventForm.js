"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildEventPayload,
  currentDateTimeLocal,
  validateEventFields,
} from "./eventFormUtils";

const EMPTY_FIELDS = {
  event_name: "",
  description: "",
  event_date: "",
  venue: "",
  capacity: "",
};

export default function CreateEventForm({ clubId }) {
  const router = useRouter();
  const formId = useId();
  const ids = {
    event_name: `${formId}-name`,
    description: `${formId}-description`,
    event_date: `${formId}-date`,
    venue: `${formId}-venue`,
    capacity: `${formId}-capacity`,
  };

  const [fields, setFields] = useState(EMPTY_FIELDS);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [minDateTime] = useState(() => currentDateTimeLocal());

  function updateField(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    const nextErrors = validateEventFields(fields);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildEventPayload(fields, { club_id: clubId })),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not create the event. Please try again.");
      }

      setFields(EMPTY_FIELDS);
      setErrors({});
      setSuccess(data.message || "Event created successfully.");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || "Could not create the event. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
      {error ? (
        <div className="form-error" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="form-success" role="status">
          {success}
        </div>
      ) : null}

      <div>
        <label htmlFor={ids.event_name} className="label">
          Event name
        </label>
        <input
          id={ids.event_name}
          name="event_name"
          type="text"
          className="input"
          value={fields.event_name}
          onChange={(event) => updateField("event_name", event.target.value)}
          maxLength={100}
          required
          placeholder="e.g. Hack the Campus 2026"
          aria-invalid={Boolean(errors.event_name)}
          aria-describedby={errors.event_name ? `${ids.event_name}-error` : undefined}
        />
        {errors.event_name ? (
          <p id={`${ids.event_name}-error`} className="field-error">
            {errors.event_name}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={ids.event_date} className="label">
            Date and time
          </label>
          <input
            id={ids.event_date}
            name="event_date"
            type="datetime-local"
            className="input"
            value={fields.event_date}
            onChange={(event) => updateField("event_date", event.target.value)}
            min={minDateTime || undefined}
            suppressHydrationWarning
            required
            aria-invalid={Boolean(errors.event_date)}
            aria-describedby={errors.event_date ? `${ids.event_date}-error` : undefined}
          />
          {errors.event_date ? (
            <p id={`${ids.event_date}-error`} className="field-error">
              {errors.event_date}
            </p>
          ) : (
            <p className="hint">Pick a future date and time.</p>
          )}
        </div>

        <div>
          <label htmlFor={ids.venue} className="label">
            Venue <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id={ids.venue}
            name="venue"
            type="text"
            className="input"
            value={fields.venue}
            onChange={(event) => updateField("venue", event.target.value)}
            maxLength={100}
            placeholder="e.g. Innovation Lab"
            aria-invalid={Boolean(errors.venue)}
            aria-describedby={errors.venue ? `${ids.venue}-error` : undefined}
          />
          {errors.venue ? (
            <p id={`${ids.venue}-error`} className="field-error">
              {errors.venue}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor={ids.capacity} className="label">
          Capacity <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id={ids.capacity}
          name="capacity"
          type="number"
          inputMode="numeric"
          min="1"
          max="10000"
          step="1"
          className="input"
          value={fields.capacity}
          onChange={(event) => updateField("capacity", event.target.value)}
          placeholder="Leave blank for open capacity"
          aria-invalid={Boolean(errors.capacity)}
          aria-describedby={errors.capacity ? `${ids.capacity}-error` : undefined}
        />
        {errors.capacity ? (
          <p id={`${ids.capacity}-error`} className="field-error">
            {errors.capacity}
          </p>
        ) : (
          <p className="hint">Leave blank for open capacity.</p>
        )}
      </div>

      <div>
        <label htmlFor={ids.description} className="label">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id={ids.description}
          name="description"
          className="textarea"
          value={fields.description}
          onChange={(event) => updateField("description", event.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="What should students expect?"
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? `${ids.description}-error` : undefined}
        />
        {errors.description ? (
          <p id={`${ids.description}-error`} className="field-error">
            {errors.description}
          </p>
        ) : (
          <p className="hint">{fields.description.length}/2000 characters</p>
        )}
      </div>

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? "Creating event…" : "Create event"}
      </button>
    </form>
  );
}
