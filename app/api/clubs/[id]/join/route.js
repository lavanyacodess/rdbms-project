import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { apiSuccess, handleApiError } from "@/lib/api";
import { numericParam } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(_request, { params }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const clubId = numericParam(id, "club ID");

    const clubs = await query("SELECT club_id FROM clubs WHERE club_id = ? LIMIT 1", [
      clubId,
    ]);
    if (!clubs.length) {
      throw new ApiError(404, "Club not found.");
    }

    const rows = await query(
      "SELECT role, status FROM club_members WHERE user_id = ? AND club_id = ? LIMIT 1",
      [user.userId, clubId],
    );
    const membership = rows[0];

    if (membership?.status === "APPROVED") {
      throw new ApiError(409, "You are already a member of this club.");
    }

    if (membership?.status === "PENDING") {
      throw new ApiError(409, "Your membership request is already pending.");
    }

    if (membership?.status === "REJECTED") {
      await query(
        "UPDATE club_members SET status = 'PENDING', joined_at = NOW() WHERE user_id = ? AND club_id = ?",
        [user.userId, clubId],
      );
      return apiSuccess({
        status: "PENDING",
        message: "Your membership request has been sent again.",
      });
    }

    try {
      await query(
        `INSERT INTO club_members (user_id, club_id, role, status, joined_at)
         VALUES (?, ?, 'MEMBER', 'PENDING', NOW())`,
        [user.userId, clubId],
      );
    } catch (error) {
      if (error?.code === "ER_DUP_ENTRY") {
        throw new ApiError(409, "Your membership request is already pending.");
      }
      throw error;
    }

    return apiSuccess(
      { status: "PENDING", message: "Membership request sent." },
      201,
    );
  } catch (error) {
    return handleApiError(error);
  }
}
