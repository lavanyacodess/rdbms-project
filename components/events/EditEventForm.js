"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildEventPayload,
  toDateTimeLocal,
  validateEventFields,
} from "./eventFormUtils";

function fieldsFromEvent(event) {
  return {
    event_name: event?.event_name || "",
    description: event?.description || "",
    event_date: toDateTimeLocal(event?.event_date),
    venue: event?.venue || "",
    capacity: event?.capacity == null ? "" : String(event.capacity),
  };
}

export default function EditEventForm({ event, allowPast = false }) {
  const router = useRouter();
  const formId = useId();
  const ids = {
    event_name: `${formId}-name`,
    description: `${formId}-description`,
    event_date: `${formId}-date`,
    venue: `${formId}-venue`,
    capacity: `${formId}-capacity`,
  };

  const [fields, setFields] = useState(() => fieldsFromEvent(event));
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

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

  function resetForm() {
    setFields(fieldsFromEvent(event));
    setErrors({});
    setError("");
    setSuccess("");
  }

  async function handleSubmit(submitEvent) {
    submitEvent.preventDefault();
    if (loading) return;
    setError("");
    setSuccess("");

    const nextErrors = validateEventFields(fields, { requireFuture: !allowPast });
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/events/${event.event_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildEventPayload(fields)),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not update the event. Please try again.");
      }

      setErrors({});
      setSuccess(data.message || "Event updated successfully.");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || "Could not update the event. Please try again.");
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
          onChange={(changeEvent) => updateField("event_name", changeEvent.target.value)}
          maxLength={100}
          required
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
            onChange={(changeEvent) => updateField("event_date", changeEvent.target.value)}
            required
            aria-invalid={Boolean(errors.event_date)}
            aria-describedby={errors.event_date ? `${ids.event_date}-error` : undefined}
          />
          {errors.event_date ? (
            <p id={`${ids.event_date}-error`} className="field-error">
              {errors.event_date}
            </p>
          ) : (
            <p className="hint">
              {allowPast
                ? "This event has already taken place. Update details or choose a new date."
                : "Choose a future date and time."}
            </p>
          )}
        </div>

        <div>
          <label htmlFor={ids.venue} className="label">
            Venue{" "}
            <span className="font-normal normal-case tracking-normal text-[var(--ink-faint)]">
              (optional)
            </span>
          </label>
          <input
            id={ids.venue}
            name="venue"
            type="text"
            className="input"
            value={fields.venue}
            onChange={(changeEvent) => updateField("venue", changeEvent.target.value)}
            maxLength={100}
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
          Capacity{" "}
          <span className="font-normal normal-case tracking-normal text-[var(--ink-faint)]">
            (optional)
          </span>
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
          onChange={(changeEvent) => updateField("capacity", changeEvent.target.value)}
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
          Description{" "}
          <span className="font-normal normal-case tracking-normal text-[var(--ink-faint)]">
            (optional)
          </span>
        </label>
        <textarea
          id={ids.description}
          name="description"
          className="textarea"
          value={fields.description}
          onChange={(changeEvent) => updateField("description", changeEvent.target.value)}
          maxLength={2000}
          rows={4}
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

      <div className="flex flex-wrap gap-2">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving changes…" : "Save changes"}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={resetForm}
          disabled={loading}
        >
          Reset
        </button>
      </div>
    </form>
  );
}
