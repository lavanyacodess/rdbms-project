import { createSession, verifyPassword } from "@/lib/auth";
import { query } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { handleApiError } from "@/lib/api";
import { readJson, requiredEmail } from "@/lib/validation";
import { safeNextPath } from "@/lib/paths";
import { authSuccess, requireObjectBody, toPublicUser } from "../_utils";

const GENERIC_ERROR = "Email or password is incorrect.";

// A valid bcrypt hash used only to keep the unknown-email path's timing close
// to the wrong-password path. The comparison result is intentionally ignored.
const DUMMY_HASH = "$2b$12$RnAPHtT.suyoc749pOLrJ.p.HwD7c7IKBCHarFCrZI02UcDXZAgru";

function loginPassword(value) {
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(400, "Password is required.");
  }
  if (value.length > 72) {
    throw new ApiError(400, "Password must be at most 72 characters.");
  }
  return value;
}

export async function POST(request) {
  try {
    const body = requireObjectBody(await readJson(request));
    const email = requiredEmail(body.email);
    const password = loginPassword(body.password);

    const rows = await query(
      `SELECT user_id, name, email, department, year, password
         FROM users
        WHERE email = ?
        LIMIT 1`,
      [email],
    );

    const record = rows[0] ?? null;
    const passwordMatches = await verifyPassword(
      password,
      record?.password || DUMMY_HASH,
    );

    if (!record || !passwordMatches) {
      throw new ApiError(401, GENERIC_ERROR);
    }

    await createSession(record);

    return authSuccess({
      user: toPublicUser(record),
      redirectTo: safeNextPath(body.next),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
