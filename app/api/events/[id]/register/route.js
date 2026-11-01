import { query, getConnection } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { apiSuccess, handleApiError } from "@/lib/api";
import { numericParam } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(_request, { params }) {
  let connection;
  try {
    const user = await requireUser();
    const { id } = await params;
    const eventId = numericParam(id, "event ID");

    connection = await getConnection();
    await connection.beginTransaction();

    const [eventRows] = await connection.execute(
      `SELECT event_id, capacity, (event_date < NOW()) AS is_past
         FROM events
        WHERE event_id = ?
        LIMIT 1
        FOR UPDATE`,
      [eventId],
    );
    const event = eventRows[0];
    if (!event) {
      throw new ApiError(404, "Event not found.");
    }
    if (Number(event.is_past) === 1) {
      throw new ApiError(409, "This event has already taken place.");
    }

    const [existingRows] = await connection.execute(
      `SELECT registration_id, status
         FROM event_registrations
        WHERE event_id = ? AND user_id = ?
        LIMIT 1
        FOR UPDATE`,
      [eventId, user.userId],
    );
    const existing = existingRows[0];
    if (existing?.status === "REGISTERED") {
      throw new ApiError(409, "You are already registered for this event.");
    }

    if (event.capacity !== null && event.capacity !== undefined) {
      const [countRows] = await connection.execute(
        `SELECT COUNT(*) AS registered_count
           FROM event_registrations
          WHERE event_id = ? AND status = 'REGISTERED'`,
        [eventId],
      );
      const currentCount = Number(countRows[0]?.registered_count || 0);
      if (currentCount >= Number(event.capacity)) {
        throw new ApiError(409, "This event is at full capacity.");
      }
    }

    if (existing) {
      await connection.execute(
        `UPDATE event_registrations
            SET status = 'REGISTERED', registration_date = CURRENT_TIMESTAMP
          WHERE registration_id = ?`,
        [existing.registration_id],
      );
    } else {
      await connection.execute(
        `INSERT INTO event_registrations (event_id, user_id, status)
         VALUES (?, ?, 'REGISTERED')`,
        [eventId, user.userId],
      );
    }

    const [countRows] = await connection.execute(
      `SELECT COUNT(*) AS registered_count
         FROM event_registrations
        WHERE event_id = ? AND status = 'REGISTERED'`,
      [eventId],
    );
    const registeredCount = Number(countRows[0]?.registered_count || 0);

    await connection.commit();

    return apiSuccess(
      {
        message: "You are registered for this event.",
        status: "REGISTERED",
        registered_count: registeredCount,
      },
      201,
    );
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback failures; the original error is more useful.
      }
    }
    return handleApiError(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const eventId = numericParam(id, "event ID");

    const result = await query(
      `UPDATE event_registrations
          SET status = 'CANCELLED'
        WHERE event_id = ? AND user_id = ? AND status = 'REGISTERED'`,
      [eventId, user.userId],
    );
    if (result.affectedRows === 0) {
      throw new ApiError(404, "You do not have an active registration for this event.");
    }

    const countRows = await query(
      `SELECT COUNT(*) AS registered_count
         FROM event_registrations
        WHERE event_id = ? AND status = 'REGISTERED'`,
      [eventId],
    );

    return apiSuccess({
      message: "Your registration has been cancelled.",
      status: "CANCELLED",
      registered_count: Number(countRows[0]?.registered_count || 0),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
