import { redirect } from "next/navigation";

import { AdminDashboard, type DashboardProfessional, type DashboardProject } from "@/components/AdminDashboard";
import { isApprovedAdminEmail } from "@/lib/admin";
import { PROJECT_PHOTO_BUCKET } from "@/lib/photo-rules";
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

  const projects = (projectsResult.data ?? []) as DashboardProject[];
  const allPaths = projects.flatMap((project) => project.photo_paths ?? []);
  const signedUrls = new Map<string, string>();

  if (allPaths.length > 0) {
    const { data: signed, error: signError } = await serviceRoleClient.storage
      .from(PROJECT_PHOTO_BUCKET)
      .createSignedUrls(allPaths, 60 * 60);
    if (signError) console.error("Failed to sign project photo URLs:", signError.message);
    signed?.forEach((item) => {
      if (item.path && item.signedUrl) signedUrls.set(item.path, item.signedUrl);
    });
  }

  const projectsWithPhotos = projects.map((project) => ({
    ...project,
    photo_urls: (project.photo_paths ?? [])
      .filter((path) => signedUrls.has(path))
      .map((path) => ({ path, url: signedUrls.get(path)! })),
  }));

  return (
    <AdminDashboard
      initialData={{
        projects: projectsWithPhotos,
        professionals: (professionalsResult.data ?? []) as DashboardProfessional[],
        userEmail: user.email ?? "",
      }}
    />
  );
}
