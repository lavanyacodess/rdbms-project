import { requireClubAdmin, requireUser } from "@/lib/auth";
import { apiSuccess, handleApiError } from "@/lib/api";
import { query } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { numericParam } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const announcementId = numericParam(id, "announcement ID");

    const rows = await query(
      `SELECT announcement_id, club_id
         FROM announcements
        WHERE announcement_id = ?
        LIMIT 1`,
      [announcementId],
    );

    const announcement = rows[0];
    if (!announcement) {
      throw new ApiError(404, "Announcement not found.");
    }

    await requireClubAdmin(user.userId, announcement.club_id);

    await query(`DELETE FROM announcements WHERE announcement_id = ?`, [
      announcementId,
    ]);

    return apiSuccess({ success: true, message: "Announcement deleted." });
  } catch (error) {
    return handleApiError(error);
  }
}
