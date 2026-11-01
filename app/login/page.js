import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { getSessionUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/paths";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
  description:
    "Sign in to CampusConnect to manage your clubs, register for events, and follow campus announcements.",
};

export default async function LoginPage({ searchParams }) {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const rawNext = Array.isArray(params?.next) ? params.next[0] : params?.next;
  const next = safeNextPath(rawNext);

  return (
    <AuthShell mode="login">
      <LoginForm next={next} />
    </AuthShell>
  );
}
