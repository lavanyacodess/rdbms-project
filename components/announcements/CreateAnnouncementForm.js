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
      className="card p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <Icon name="megaphone" className="h-5 w-5" />
        </span>
        <div>
          <h2 id={`${formId}-heading`} className="text-lg font-bold text-slate-950">
            Publish an announcement
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
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

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor={`${formId}-title`} className="label">
              Title
            </label>
            <span className="text-xs tabular-nums text-slate-400">{title.length}/150</span>
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
            <span className="text-xs tabular-nums text-slate-400">
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
          <p className="hint">Published immediately. Newest announcements appear first.</p>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
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
