import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db.js";
import { ApiError } from "./errors.js";

export const SESSION_COOKIE = "campus_session";
const SESSION_SECONDS = 60 * 60 * 24 * 7;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new ApiError(
      500,
      "Authentication is not configured. Set a JWT_SECRET of at least 32 characters in .env.local.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user) {
  const userId = user.userId ?? user.user_id;
  const token = await new SignJWT({
    name: user.name,
    email: user.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + SESSION_SECONDS)
    .sign(getJwtSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getSessionUser() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const secret = getJwtSecret();
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) return null;
    return {
      userId,
      name: String(payload.name || ""),
      email: String(payload.email || ""),
    };
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    throw new ApiError(401, "Please sign in to continue.");
  }
  return user;
}

export async function requireUserPage(nextPath = "/dashboard") {
  const user = await getSessionUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return user;
}

export async function isClubAdmin(userId, clubId) {
  const rows = await query(
    `SELECT 1
       FROM club_members
      WHERE user_id = ? AND club_id = ?
        AND role = 'ADMIN' AND status = 'APPROVED'
      LIMIT 1`,
    [userId, clubId],
  );
  return rows.length > 0;
}

export async function requireClubAdmin(userId, clubId) {
  if (!(await isClubAdmin(userId, clubId))) {
    throw new ApiError(403, "You do not have admin access to this club.");
  }
}

export async function requireClubAdminPage(userId, clubId) {
  if (!(await isClubAdmin(userId, clubId))) {
    redirect(`/clubs/${clubId}`);
  }
}

export async function getAdminClubs(userId) {
  return query(
    `SELECT c.club_id, c.club_name, c.category
       FROM clubs c
       JOIN club_members cm ON cm.club_id = c.club_id
      WHERE cm.user_id = ? AND cm.role = 'ADMIN' AND cm.status = 'APPROVED'
      ORDER BY c.club_name`,
    [userId],
  );
}

export async function getCurrentUserRecord(userId) {
  const rows = await query(
    `SELECT user_id, name, email, department, year, created_at
       FROM users WHERE user_id = ? LIMIT 1`,
    [userId],
  );
  return rows[0] ?? null;
}
