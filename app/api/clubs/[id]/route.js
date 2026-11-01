import { query } from "@/lib/db";
import { requireUser, requireClubAdmin } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { apiSuccess, handleApiError } from "@/lib/api";
import {
  readJson,
  requiredString,
  optionalString,
  numericParam,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const clubId = numericParam(id, "club ID");

    const clubRows = await query(
      `SELECT c.club_id, c.club_name, c.description, c.category, c.created_at,
              (SELECT COUNT(*)
                 FROM club_members cm
                WHERE cm.club_id = c.club_id AND cm.status = 'APPROVED') AS member_count
         FROM clubs c
        WHERE c.club_id = ?
        LIMIT 1`,
      [clubId],
    );

    const club = clubRows[0];
    if (!club) {
      throw new ApiError(404, "Club not found.");
    }

    const [members, events, announcements] = await Promise.all([
      query(
        `SELECT u.user_id, u.name, u.department, u.year, cm.role, cm.joined_at
           FROM club_members cm
           JOIN users u ON u.user_id = cm.user_id
          WHERE cm.club_id = ? AND cm.status = 'APPROVED'
          ORDER BY cm.role DESC, u.name`,
        [clubId],
      ),
      query(
        `SELECT e.event_id, e.event_name, e.description, e.event_date, e.venue, e.capacity,
                (SELECT COUNT(*)
                   FROM event_registrations er
                  WHERE er.event_id = e.event_id AND er.status = 'REGISTERED') AS registered_count
           FROM events e
          WHERE e.club_id = ? AND e.event_date >= NOW()
          ORDER BY e.event_date`,
        [clubId],
      ),
      query(
        `SELECT a.announcement_id, a.club_id, a.title, a.content, a.created_at,
                u.name AS author_name
           FROM announcements a
           JOIN users u ON u.user_id = a.created_by
          WHERE a.club_id = ?
          ORDER BY a.created_at DESC`,
        [clubId],
      ),
    ]);

    return apiSuccess({ club, members, events, announcements });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const clubId = numericParam(id, "club ID");

    const existing = await query("SELECT club_id FROM clubs WHERE club_id = ? LIMIT 1", [
      clubId,
    ]);
    if (!existing.length) {
      throw new ApiError(404, "Club not found.");
    }

    await requireClubAdmin(user.userId, clubId);

    const body = await readJson(request);
    const clubName = requiredString(body?.club_name, "Club name", { max: 100 });
    const description = optionalString(body?.description, "Description", { max: 2000 });
    const category = optionalString(body?.category, "Category", { max: 50 });

    await query(
      "UPDATE clubs SET club_name = ?, description = ?, category = ? WHERE club_id = ?",
      [clubName, description, category, clubId],
    );

    const updatedRows = await query(
      `SELECT c.club_id, c.club_name, c.description, c.category, c.created_at,
              (SELECT COUNT(*)
                 FROM club_members cm
                WHERE cm.club_id = c.club_id AND cm.status = 'APPROVED') AS member_count,
              (SELECT MIN(e.event_date)
                 FROM events e
                WHERE e.club_id = c.club_id AND e.event_date >= NOW()) AS next_event_date
         FROM clubs c
        WHERE c.club_id = ?
        LIMIT 1`,
      [clubId],
    );

    const updatedClub = updatedRows[0];
    if (!updatedClub) {
      throw new ApiError(404, "Club not found.");
    }

    return apiSuccess({ club: updatedClub });
  } catch (error) {
    return handleApiError(error);
  }
}
