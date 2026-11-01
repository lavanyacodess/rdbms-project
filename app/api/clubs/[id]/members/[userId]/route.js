import { query } from "@/lib/db";
import { requireUser, requireClubAdmin } from "@/lib/auth";
import { ApiError } from "@/lib/errors";
import { apiSuccess, handleApiError } from "@/lib/api";
import { readJson, enumValue, numericParam } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request, { params }) {
  try {
    const user = await requireUser();
    const { id, userId } = await params;
    const clubId = numericParam(id, "club ID");
    const targetUserId = numericParam(userId, "user ID");

    await requireClubAdmin(user.userId, clubId);

    const body = await readJson(request);
    const status = enumValue(body?.status, "Status", ["APPROVED", "REJECTED"]);

    if (targetUserId === user.userId) {
      throw new ApiError(400, "You cannot change your own membership.");
    }

    const rows = await query(
      "SELECT role, status FROM club_members WHERE user_id = ? AND club_id = ? LIMIT 1",
      [targetUserId, clubId],
    );
    const membership = rows[0];

    if (!membership) {
      throw new ApiError(404, "Membership request not found.");
    }

    if (membership.role === "ADMIN") {
      throw new ApiError(400, "Club admin memberships cannot be changed.");
    }

    await query(
      "UPDATE club_members SET status = ? WHERE user_id = ? AND club_id = ?",
      [status, targetUserId, clubId],
    );

    return apiSuccess({
      status,
      message: status === "APPROVED" ? "Membership approved." : "Membership request rejected.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
