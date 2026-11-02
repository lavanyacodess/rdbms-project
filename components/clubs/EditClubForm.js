"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/Icons";

export default function EditClubForm({ club }) {
  const router = useRouter();
  const [form, setForm] = useState({
    club_name: club.club_name || "",
    description: club.description || "",
    category: club.category || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/clubs/${club.club_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Could not save the club details.");
      }

      if (data.club) {
        setForm({
          club_name: data.club.club_name || "",
          description: data.club.description || "",
          category: data.club.category || "",
        });
      }

      setSuccess("Club details saved.");
      router.refresh();
    } catch (saveError) {
      setError(saveError.message || "Could not save the club details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="space-y-6">
      <div>
        <label htmlFor="club_name" className="label">
          Club name <span className="text-[var(--margin)]">*</span>
        </label>
        <input
          id="club_name"
          name="club_name"
          type="text"
          value={form.club_name}
          onChange={handleChange}
          className="input"
          maxLength={100}
          required
        />
        <p className="hint">Up to 100 characters. This is shown across CampusConnect.</p>
      </div>

      <div>
        <label htmlFor="club-category" className="label">
          Category
        </label>
        <input
          id="club-category"
          name="category"
          type="text"
          value={form.category}
          onChange={handleChange}
          className="input"
          maxLength={50}
          placeholder="e.g. Technical, Cultural, Entrepreneurship"
        />
        <p className="hint">Up to 50 characters. Leave blank if the club has no category.</p>
      </div>

      <div>
        <label htmlFor="club-description" className="label">
          Description
        </label>
        <textarea
          id="club-description"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="textarea"
          maxLength={2000}
          rows={5}
          placeholder="What does this club do, and who should join?"
        />
        <p className="hint">Up to 2,000 characters. Shown on the public club page.</p>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="form-success" role="status">
          {success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
          {!loading ? <Icon name="check" className="h-4 w-4" /> : null}
        </button>
        <p className="hint mt-0">Changes appear on the public page right away.</p>
      </div>
    </form>
  );
}
