import {
  getAdminClubs,
  getCurrentUserRecord,
  getSessionUser,
} from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { authSuccess, toPublicUser } from "../_utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return authSuccess({ user: null, adminClubs: [] });
    }

    const record = await getCurrentUserRecord(session.userId);
    if (!record) {
      return authSuccess({ user: null, adminClubs: [] });
    }

    const adminClubs = await getAdminClubs(session.userId);
    return authSuccess({ user: toPublicUser(record), adminClubs });
  } catch (error) {
    return handleApiError(error);
  }
}
