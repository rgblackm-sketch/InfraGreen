import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/AdminLoginForm";
import { isApprovedAdminEmail } from "@/lib/admin";
import { getSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }> | { error?: string };
}) {
  const resolvedParams = searchParams ? await searchParams : {};

  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user && isApprovedAdminEmail(user.email)) {
    redirect("/admin");
  }

  const errorMessage = resolvedParams.error === "unauthorized"
    ? "This account is not authorized for the InfraGreen admin dashboard."
    : undefined;

  return (
    <div className="admin-shell admin-shell--login">
      <div className="admin-login-bg" />
      <div className="admin-login-wrap">
        <AdminLoginForm errorMessage={errorMessage} />
      </div>
    </div>
  );
}
