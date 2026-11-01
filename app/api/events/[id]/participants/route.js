import { query } from "@/lib/db";
import { requireUser, requireClubAdmin } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { apiSuccess, handleApiError } from "@/lib/api";
import { numericParam } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const eventId = numericParam(id, "event ID");

    const eventRows = await query(
      "SELECT event_id, club_id, event_name FROM events WHERE event_id = ? LIMIT 1",
      [eventId],
    );
    const event = eventRows[0];
    if (!event) {
      throw new ApiError(404, "Event not found.");
    }
    await requireClubAdmin(user.userId, event.club_id);

    const participants = await query(
      `SELECT u.user_id, u.name, u.email, u.department, u.year, r.registration_date
         FROM event_registrations r
         JOIN users u ON u.user_id = r.user_id
        WHERE r.event_id = ? AND r.status = 'REGISTERED'
        ORDER BY r.registration_date ASC, u.name ASC`,
      [eventId],
    );

    return apiSuccess({
      event: {
        event_id: event.event_id,
        event_name: event.event_name,
        club_id: event.club_id,
      },
      participants,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
