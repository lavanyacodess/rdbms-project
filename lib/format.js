export function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const normalized = String(value).includes("T")
    ? String(value)
    : String(value).replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(value, options = {}) {
  const date = toDate(value);
  if (!date) return "Date TBA";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return "Date TBA";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatTime(value) {
  const date = toDate(value);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatRelative(value) {
  const date = toDate(value);
  if (!date) return "";
  const diffMs = date.getTime() - Date.now();
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absMinutes < 60) return formatter.format(Math.round(diffMs / 60000), "minute");
  if (absMinutes < 1440) return formatter.format(Math.round(diffMs / 3600000), "hour");
  if (absMinutes < 43200) return formatter.format(Math.round(diffMs / 86400000), "day");
  return formatter.format(Math.round(diffMs / 2592000000), "month");
}

export function formatEventDate(value) {
  const date = toDate(value);
  if (!date) return { month: "TBA", day: "—", weekday: "", full: "Date TBA" };
  return {
    month: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(date).toUpperCase(),
    day: new Intl.DateTimeFormat("en-IN", { day: "2-digit" }).format(date),
    weekday: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date),
    full: formatDateTime(value),
  };
}

export function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function truncate(value, length = 150) {
  if (!value) return "";
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function isUpcoming(value) {
  const date = toDate(value);
  return Boolean(date && date.getTime() >= Date.now());
}

export function membershipLabel(status) {
  if (status === "APPROVED") return "Member";
  if (status === "PENDING") return "Request pending";
  if (status === "REJECTED") return "Request rejected";
  return null;
}
