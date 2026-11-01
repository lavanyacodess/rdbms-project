import { requireClubAdmin, requireUser } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";
import { query } from "@/lib/db";
import {
  numericParam,
  readJson,
  requiredInteger,
  requiredString,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

const announcementSelect = `
  SELECT a.announcement_id, a.club_id, a.created_by, a.title, a.content, a.created_at,
         c.club_name, u.name AS author_name
    FROM announcements a
    JOIN clubs c ON c.club_id = a.club_id
    JOIN users u ON u.user_id = a.created_by
`;

export async function GET(request) {
  try {
    const clubIdParam = new URL(request.url).searchParams.get("clubId");
    let clubId = null;

    if (clubIdParam !== null && clubIdParam.trim() !== "") {
      clubId = numericParam(clubIdParam.trim(), "clubId");
    }

    const announcements = await query(
      `${announcementSelect}
        ${clubId ? "WHERE a.club_id = ?" : ""}
        ORDER BY a.created_at DESC, a.announcement_id DESC`,
      clubId ? [clubId] : [],
    );

    return apiSuccess({ announcements });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const body = (await readJson(request)) ?? {};

    const clubId = requiredInteger(body.club_id, "Club", { min: 1 });
    await requireClubAdmin(user.userId, clubId);

    const title = requiredString(body.title, "Title", { max: 150 });
    const content = requiredString(body.content, "Content", { max: 5000 });

    const result = await query(
      `INSERT INTO announcements (club_id, created_by, title, content)
       VALUES (?, ?, ?, ?)`,
      [clubId, user.userId, title, content],
    );

    const rows = await query(
      `${announcementSelect} WHERE a.announcement_id = ? LIMIT 1`,
      [result.insertId],
    );

    return apiSuccess({ announcement: rows[0] }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
