import { apiSuccess } from "@/lib/api";
import { ApiError } from "@/lib/errors";

export function toPublicUser(row) {
  return {
    id: row.user_id,
    name: row.name,
    email: row.email,
    department: row.department ?? null,
    year: row.year ?? null,
  };
}

export function requireObjectBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Request body must be a JSON object.");
  }
  return body;
}

export function authSuccess(data, status = 200) {
  const response = apiSuccess(data, status);
  response.headers.set("Cache-Control", "no-store");
  return response;
}
