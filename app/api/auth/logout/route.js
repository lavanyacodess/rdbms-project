import { destroySession } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { authSuccess } from "../_utils";

export async function POST() {
  try {
    await destroySession();
    return authSuccess({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
