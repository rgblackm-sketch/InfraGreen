"use server";

import { createClient } from "@supabase/supabase-js";

import { MAX_PHOTOS, PROJECT_PHOTO_BUCKET } from "@/lib/photo-rules";
import { readPhotoTicket } from "@/lib/photo-ticket";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";
import { verifyTurnstileToken } from "@/lib/turnstile";

export type SubmissionResult = { ok: true } | { ok: false; error: "captcha" | "server" };

function getAnonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase environment variables are missing.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function insertRow(
  table: "projects" | "professional_applications",
  row: Record<string, unknown>,
  turnstileToken: string | null,
  alreadyVerified = false,
): Promise<SubmissionResult> {
  if (!alreadyVerified && !(await verifyTurnstileToken(turnstileToken))) {
    return { ok: false, error: "captcha" };
  }

  try {
    const { error } = await getAnonClient().from(table).insert(row);
    if (error) {
      console.error(`Failed to insert into ${table}:`, error.message);
      return { ok: false, error: "server" };
    }
    return { ok: true };
  } catch (error) {
    console.error(`Failed to insert into ${table}:`, error);
    return { ok: false, error: "server" };
  }
}

async function verifyUploadedPhotos(ticket: string, photoPaths: string[]): Promise<string[] | null> {
  const issued = readPhotoTicket(ticket);
  if (!issued || !Array.isArray(photoPaths) || photoPaths.length === 0 || photoPaths.length > MAX_PHOTOS) return null;
  if (!photoPaths.every((path) => issued.paths.includes(path))) return null;

  const { data, error } = await getSupabaseServiceRoleClient().storage.from(PROJECT_PHOTO_BUCKET).list(issued.folder);
  if (error || !data) return null;
  const uploaded = new Set(data.map((file) => `${issued.folder}/${file.name}`));
  return photoPaths.every((path) => uploaded.has(path)) ? photoPaths : null;
}

export async function submitProject(
  row: Record<string, unknown>,
  turnstileToken: string | null,
  photos: { ticket: string; photoPaths: string[] },
) {
  if (!(await verifyTurnstileToken(turnstileToken))) {
    return { ok: false, error: "captcha" } as SubmissionResult;
  }

  let photoPaths: string[] | null = null;
  try {
    photoPaths = await verifyUploadedPhotos(String(photos?.ticket ?? ""), photos?.photoPaths ?? []);
  } catch (error) {
    console.error("Failed to verify project photos:", error);
  }
  if (!photoPaths) return { ok: false, error: "server" } as SubmissionResult;

  return insertRow("projects", { ...row, photo_paths: photoPaths }, null, true);
}

export async function submitProfessionalApplication(row: Record<string, unknown>, turnstileToken: string | null) {
  const { application_status: _ignored, ...rest } = row;
  void _ignored;
  return insertRow("professional_applications", { ...rest, application_status: "pending" }, turnstileToken);
}
