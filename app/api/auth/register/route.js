import { createSession, hashPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { handleApiError } from "@/lib/api";
import {
  optionalInteger,
  optionalString,
  readJson,
  requiredEmail,
  requiredPassword,
  requiredString,
} from "@/lib/validation";
import { safeNextPath } from "@/lib/paths";
import { authSuccess, requireObjectBody, toPublicUser } from "../_utils";

const DUPLICATE_EMAIL_MESSAGE =
  "An account with this email already exists. Try signing in instead.";

export async function POST(request) {
  try {
    const body = requireObjectBody(await readJson(request));

    const name = requiredString(body.name, "Name", { max: 100, min: 2 });
    const email = requiredEmail(body.email);
    const password = requiredPassword(body.password);
    const department = optionalString(body.department, "Department", { max: 50 });
    const year = optionalInteger(body.year, "Year", { min: 1, max: 5 });

    const existing = await query(
      "SELECT user_id FROM users WHERE email = ? LIMIT 1",
      [email],
    );

    if (existing.length > 0) {
      throw new ApiError(409, DUPLICATE_EMAIL_MESSAGE);
    }

    const passwordHash = await hashPassword(password);

    let result;
    try {
      result = await query(
        `INSERT INTO users (name, email, password, department, year)
         VALUES (?, ?, ?, ?, ?)`,
        [name, email, passwordHash, department, year],
      );
    } catch (error) {
      // Covers the race between the duplicate check and the insert.
      if (error?.code === "ER_DUP_ENTRY") {
        throw new ApiError(409, DUPLICATE_EMAIL_MESSAGE);
      }
      throw error;
    }

    const user = {
      user_id: result.insertId,
      name,
      email,
      department,
      year,
    };

    await createSession(user);

    return authSuccess(
      {
        user: toPublicUser(user),
        redirectTo: safeNextPath(body.next),
      },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
