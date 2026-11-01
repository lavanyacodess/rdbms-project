import { query } from "@/lib/db";
import { getSessionUser, requireUser, requireClubAdmin } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { apiSuccess, handleApiError } from "@/lib/api";
import {
  readJson,
  requiredString,
  optionalString,
  optionalInteger,
  parseDate,
  toMysqlDateTime,
  numericParam,
} from "@/lib/validation";

export const dynamic = "force-dynamic";

const MAX_CAPACITY = 10000;

function assertBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "Request body must be a JSON object.");
  }
}

function readEventFields(body, { requireFuture = true } = {}) {
  const eventName = requiredString(body.event_name, "Event name", { max: 100 });
  const description = optionalString(body.description, "Description", { max: 2000 });
  const eventDate = parseDate(body.event_date, "Event date");
  if (requireFuture && eventDate.getTime() <= Date.now()) {
    throw new ApiError(400, "Event date must be in the future.");
  }
  const venue = optionalString(body.venue, "Venue", { max: 100 });
  const capacity = optionalInteger(body.capacity, "Capacity", { min: 1, max: MAX_CAPACITY });

  return {
    eventName,
    description,
    eventDate: toMysqlDateTime(eventDate),
    venue,
    capacity,
  };
}

async function getEvent(eventId) {
  const rows = await query(
    `SELECT e.event_id, e.club_id, e.created_by, e.event_name, e.description,
            e.event_date, e.venue, e.capacity, e.created_at,
            c.club_name, c.category,
            u.name AS creator_name,
            (SELECT COUNT(*)
               FROM event_registrations r
              WHERE r.event_id = e.event_id AND r.status = 'REGISTERED') AS registered_count,
            (e.event_date < NOW()) AS is_past
       FROM events e
       JOIN clubs c ON c.club_id = e.club_id
       JOIN users u ON u.user_id = e.created_by
      WHERE e.event_id = ?
      LIMIT 1`,
    [eventId],
  );
  return rows[0] ?? null;
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const eventId = numericParam(id, "event ID");
    const event = await getEvent(eventId);
    if (!event) {
      throw new ApiError(404, "Event not found.");
    }

    const user = await getSessionUser();
    let registrationStatus = null;
    if (user) {
      const rows = await query(
        `SELECT status
           FROM event_registrations
          WHERE event_id = ? AND user_id = ?
          LIMIT 1`,
        [eventId, user.userId],
      );
      registrationStatus = rows[0]?.status ?? null;
    }

    return apiSuccess({
      event: {
        ...event,
        capacity: event.capacity == null ? null : Number(event.capacity),
        registered_count: Number(event.registered_count || 0),
        is_past: Number(event.is_past) === 1,
        registration_status: registrationStatus,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const eventId = numericParam(id, "event ID");
    const existing = await getEvent(eventId);
    if (!existing) {
      throw new ApiError(404, "Event not found.");
    }
    await requireClubAdmin(user.userId, existing.club_id);

    const body = await readJson(request);
    assertBody(body);
    const fields = readEventFields(body, {
      requireFuture: Number(existing.is_past) !== 1,
    });

    const registeredCount = Number(existing.registered_count || 0);
    if (fields.capacity !== null && fields.capacity < registeredCount) {
      throw new ApiError(
        400,
        `Capacity cannot be less than the ${registeredCount} registered participant${
          registeredCount === 1 ? "" : "s"
        }.`,
      );
    }

    await query(
      `UPDATE events
          SET event_name = ?, description = ?, event_date = ?, venue = ?, capacity = ?
        WHERE event_id = ?`,
      [
        fields.eventName,
        fields.description,
        fields.eventDate,
        fields.venue,
        fields.capacity,
        eventId,
      ],
    );

    return apiSuccess({
      message: "Event updated successfully.",
      event: {
        event_id: eventId,
        club_id: existing.club_id,
        event_name: fields.eventName,
        description: fields.description,
        event_date: fields.eventDate,
        venue: fields.venue,
        capacity: fields.capacity,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const eventId = numericParam(id, "event ID");
    const existing = await getEvent(eventId);
    if (!existing) {
      throw new ApiError(404, "Event not found.");
    }
    await requireClubAdmin(user.userId, existing.club_id);

    await query("DELETE FROM events WHERE event_id = ?", [eventId]);

    return apiSuccess({ message: "Event deleted successfully." });
  } catch (error) {
    return handleApiError(error);
  }
}
