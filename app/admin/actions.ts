"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isApprovedAdminEmail } from "@/lib/admin";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase-server";

const PROJECT_STATUSES = ["new", "reviewing", "matching", "connected", "completed", "closed"];
const APPLICATION_STATUSES = ["pending", "reviewing", "approved", "declined"];

async function ensureAdminAccess() {
  const supabase = await getSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user || !isApprovedAdminEmail(user.email)) {
    throw new Error("Unauthorized admin access.");
  }

  return user;
}

export async function signOutAdmin() {
  const supabase = await getSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function updateProjectStatus(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim().toLowerCase();

  if (!projectId || !status) {
    throw new Error("A project ID and status are required.");
  }

  if (!PROJECT_STATUSES.includes(status)) {
    throw new Error("Invalid project status.");
  }

  await ensureAdminAccess();

  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function updateProfessionalApplicationStatus(formData: FormData) {
  const applicationId = String(formData.get("applicationId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim().toLowerCase();

  if (!applicationId || !status) {
    throw new Error("An application ID and status are required.");
  }

  if (!APPLICATION_STATUSES.includes(status)) {
    throw new Error("Invalid application status.");
  }

  await ensureAdminAccess();

  const supabase = getSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("professional_applications")
    .update({ application_status: status })
    .eq("id", applicationId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}
