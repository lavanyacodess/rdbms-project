"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function CreateAnnouncementForm({ clubId }) {
  const router = useRouter();
  const formId = useId();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle) {
      setError("Title is required.");
      return;
    }
    if (!cleanContent) {
      setError("Content is required.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          club_id: Number(clubId),
          title: cleanTitle,
          content: cleanContent,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Could not publish the announcement.");
      }

      setTitle("");
      setContent("");
      setSuccess("Announcement published successfully.");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not publish the announcement.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby={`${formId}-heading`}
      aria-busy={loading}
      className="border border-[var(--rule-strong)] bg-[var(--paper-raised)] p-5 sm:p-7"
    >
      <div className="flex items-start gap-3 border-b border-[var(--rule)] pb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--rule-strong)] bg-[var(--paper)] text-[var(--margin)]">
          <Icon name="megaphone" className="h-4 w-4" />
        </span>
        <div>
          <h2 id={`${formId}-heading`} className="text-lg font-bold text-[var(--ink)]">
            Publish an announcement
          </h2>
          <p className="mt-1 text-sm leading-6 text-[var(--ink-soft)]">
            Share an update with everyone browsing the public announcements board.
          </p>
        </div>
      </div>

      {error ? (
        <p className="form-error mt-4" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="form-success mt-4" role="status">
          {success}
        </p>
      ) : null}

      <div className="mt-5 space-y-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`${formId}-title`} className="label">
              Title
            </label>
            <span className="font-mono text-[0.7rem] tabular-nums text-[var(--ink-faint)]">
              {title.length}/150
            </span>
          </div>
          <input
            id={`${formId}-title`}
            name="title"
            type="text"
            className="input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={150}
            placeholder="e.g. Registrations open for Hack the Campus"
            required
            disabled={loading}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`${formId}-content`} className="label">
              Content
            </label>
            <span className="font-mono text-[0.7rem] tabular-nums text-[var(--ink-faint)]">
              {content.length}/5000
            </span>
          </div>
          <textarea
            id={`${formId}-content`}
            name="content"
            className="textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={5000}
            rows={5}
            placeholder="What should members know?"
            required
            disabled={loading}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="hint mt-0">Published immediately. Newest announcements appear first.</p>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="h-3.5 w-3.5 animate-spin border border-[var(--paper-raised)] border-t-transparent"
                  aria-hidden="true"
                />
                Publishing…
              </>
            ) : (
              <>
                <Icon name="megaphone" className="h-4 w-4" />
                Publish announcement
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
