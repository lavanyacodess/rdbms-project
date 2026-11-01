import { ApiError } from "./errors.js";

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "Request body must be valid JSON.");
  }
}

export function requiredString(value, label, { max = 255, min = 1 } = {}) {
  if (typeof value !== "string") {
    throw new ApiError(400, `${label} is required.`);
  }

  const clean = value.trim();
  if (clean.length < min) {
    throw new ApiError(400, `${label} must be at least ${min} character${min === 1 ? "" : "s"}.`);
  }
  if (clean.length > max) {
    throw new ApiError(400, `${label} must be at most ${max} characters.`);
  }
  return clean;
}

export function optionalString(value, label, { max = 1000 } = {}) {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") {
    throw new ApiError(400, `${label} must be text.`);
  }
  const clean = value.trim();
  if (!clean) return null;
  if (clean.length > max) {
    throw new ApiError(400, `${label} must be at most ${max} characters.`);
  }
  return clean;
}

export function requiredEmail(value) {
  const email = requiredString(value, "Email", { max: 100 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError(400, "Enter a valid email address.");
  }
  return email;
}

export function requiredPassword(value) {
  if (typeof value !== "string" || value.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }
  if (value.length > 72) {
    throw new ApiError(400, "Password must be at most 72 characters.");
  }
  return value;
}

export function optionalInteger(value, label, { min = 0, max = Number.MAX_SAFE_INTEGER } = {}) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new ApiError(400, `${label} must be a whole number between ${min} and ${max}.`);
  }
  return number;
}

export function requiredInteger(value, label, options = {}) {
  const number = optionalInteger(value, label, options);
  if (number === null) {
    throw new ApiError(400, `${label} is required.`);
  }
  return number;
}

export function enumValue(value, label, allowed) {
  if (!allowed.includes(value)) {
    throw new ApiError(400, `${label} must be one of: ${allowed.join(", ")}.`);
  }
  return value;
}

export function parseDate(value, label = "Date") {
  if (typeof value !== "string" || !value.trim()) {
    throw new ApiError(400, `${label} is required.`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(400, `Enter a valid ${label.toLowerCase()}.`);
  }
  return date;
}

export function toMysqlDateTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function numericParam(value, label = "ID") {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new ApiError(400, `Invalid ${label}.`);
  }
  return number;
}
