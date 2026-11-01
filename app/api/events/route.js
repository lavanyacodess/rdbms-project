import { query } from "@/lib/db";
import { getSessionUser, requireUser, requireClubAdmin } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { apiSuccess, handleApiError } from "@/lib/api";
import {
  readJson,
  requiredString,
  optionalString,
  optionalInteger,
  requiredInteger,
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

function readEventFields(body) {
  const eventName = requiredString(body.event_name, "Event name", { max: 100 });
  const description = optionalString(body.description, "Description", { max: 2000 });
  const eventDate = parseDate(body.event_date, "Event date");
  if (eventDate.getTime() <= Date.now()) {
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

export async function GET(request) {
  try {
    const user = await getSessionUser();
    const { searchParams } = new URL(request.url);
    const clubIdParam = searchParams.get("clubId");
    const clubId = clubIdParam ? numericParam(clubIdParam, "club ID") : null;
    const searchQuery = (searchParams.get("q") || "").trim().slice(0, 100);
    const pastValue = (searchParams.get("past") || "").toLowerCase();
    const scopeValue = (searchParams.get("scope") || "").toLowerCase();
    const past = ["1", "true", "past"].includes(pastValue) || scopeValue === "past";

    const selectParams = [];
    let registrationSelect = "NULL AS registration_status";
    if (user) {
      registrationSelect = `(SELECT r.status
                                 FROM event_registrations r
                                WHERE r.event_id = e.event_id AND r.user_id = ?
                                LIMIT 1) AS registration_status`;
      selectParams.push(user.userId);
    }

    const where = [];
    const whereParams = [];
    if (clubId) {
      where.push("e.club_id = ?");
      whereParams.push(clubId);
    }
    if (searchQuery) {
      where.push("(e.event_name LIKE ? OR e.description LIKE ? OR e.venue LIKE ?)");
      const like = `%${searchQuery}%`;
      whereParams.push(like, like, like);
    }
    where.push(past ? "e.event_date < NOW()" : "e.event_date >= NOW()");

    const order = past ? "DESC" : "ASC";
    const limit = past ? 50 : 100;

    const rows = await query(
      `SELECT e.event_id, e.club_id, e.created_by, e.event_name, e.description,
              e.event_date, e.venue, e.capacity, e.created_at,
              c.club_name,
              (SELECT COUNT(*)
                 FROM event_registrations r
                WHERE r.event_id = e.event_id AND r.status = 'REGISTERED') AS registered_count,
              ${registrationSelect}
         FROM events e
         JOIN clubs c ON c.club_id = e.club_id
        WHERE ${where.join(" AND ")}
        ORDER BY e.event_date ${order}
        LIMIT ${limit}`,
      [...selectParams, ...whereParams],
    );

    return apiSuccess({
      events: rows.map((row) => ({
        ...row,
        capacity: row.capacity == null ? null : Number(row.capacity),
        registered_count: Number(row.registered_count || 0),
        registration_status: row.registration_status ?? null,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await requireUser();
    const body = await readJson(request);
    assertBody(body);

    const clubId = requiredInteger(body.club_id, "Club", { min: 1 });
    const clubRows = await query("SELECT club_id FROM clubs WHERE club_id = ? LIMIT 1", [clubId]);
    if (clubRows.length === 0) {
      throw new ApiError(404, "Club not found.");
    }
    await requireClubAdmin(user.userId, clubId);

    const fields = readEventFields(body);
    const result = await query(
      `INSERT INTO events (club_id, created_by, event_name, description, event_date, venue, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        clubId,
        user.userId,
        fields.eventName,
        fields.description,
        fields.eventDate,
        fields.venue,
        fields.capacity,
      ],
    );

    return apiSuccess(
      {
        message: "Event created successfully.",
        event: {
          event_id: result.insertId,
          club_id: clubId,
          created_by: user.userId,
          event_name: fields.eventName,
          description: fields.description,
          event_date: fields.eventDate,
          venue: fields.venue,
          capacity: fields.capacity,
        },
      },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
