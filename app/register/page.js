import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { getSessionUser } from "@/lib/auth";
import { safeNextPath } from "@/lib/paths";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create account",
  description:
    "Create your CampusConnect account to discover clubs, register for events, and stay up to date with campus announcements.",
};

export default async function RegisterPage({ searchParams }) {
  const user = await getSessionUser();
  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const rawNext = Array.isArray(params?.next) ? params.next[0] : params?.next;
  const next = safeNextPath(rawNext);

  return (
    <AuthShell mode="register">
      <RegisterForm next={next} />
    </AuthShell>
  );
}
