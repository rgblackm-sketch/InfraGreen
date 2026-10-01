import { redirect } from "next/navigation";

import { AdminDashboard, type DashboardProfessional, type DashboardProject } from "@/components/AdminDashboard";
import { isApprovedAdminEmail } from "@/lib/admin";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase-server";

export default async function AdminPage() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !isApprovedAdminEmail(user.email)) {
    redirect("/admin/login?error=unauthorized");
  }

  const serviceRoleClient = getSupabaseServiceRoleClient();

  const [projectsResult, professionalsResult] = await Promise.all([
    serviceRoleClient.from("projects").select("*").order("created_at", { ascending: false }),
    serviceRoleClient.from("professional_applications").select("*").order("created_at", { ascending: false }),
  ]);

  if (projectsResult.error || professionalsResult.error) {
    throw new Error(projectsResult.error?.message ?? professionalsResult.error?.message ?? "Unable to load admin data.");
  }

  return (
    <AdminDashboard
      initialData={{
        projects: (projectsResult.data ?? []) as DashboardProject[],
        professionals: (professionalsResult.data ?? []) as DashboardProfessional[],
        userEmail: user.email ?? "",
      }}
    />
  );
}
