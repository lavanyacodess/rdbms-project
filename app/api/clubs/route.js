import { query } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim().slice(0, 100);
    const category = (searchParams.get("category") || "").trim().slice(0, 50);

    const conditions = [];
    const params = [];

    if (user) {
      params.push(user.userId);
    }

    if (q) {
      conditions.push("(c.club_name LIKE ? OR c.description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }

    if (category) {
      conditions.push("c.category = ?");
      params.push(category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const membershipJoin = user
      ? "LEFT JOIN club_members cm ON cm.club_id = c.club_id AND cm.user_id = ?"
      : "";
    const membershipSelect = user
      ? "cm.status AS membership_status"
      : "NULL AS membership_status";

    const clubs = await query(
      `SELECT c.club_id, c.club_name, c.description, c.category, c.created_at,
              (SELECT COUNT(*)
                 FROM club_members cmc
                WHERE cmc.club_id = c.club_id AND cmc.status = 'APPROVED') AS member_count,
              (SELECT MIN(e.event_date)
                 FROM events e
                WHERE e.club_id = c.club_id AND e.event_date >= NOW()) AS next_event_date,
              ${membershipSelect}
         FROM clubs c
         ${membershipJoin}
         ${where}
        ORDER BY c.club_name`,
      params,
    );

    return apiSuccess({ clubs, count: clubs.length });
  } catch (error) {
    return handleApiError(error);
  }
}
