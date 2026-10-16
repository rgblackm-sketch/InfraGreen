"use server";

import { MAX_PHOTO_BYTES, MAX_PHOTOS, PROJECT_PHOTO_BUCKET, ALLOWED_PHOTO_TYPES, resolvePhotoType } from "@/lib/photo-rules";
import { createPhotoTicket } from "@/lib/photo-ticket";
import { getSupabaseServiceRoleClient } from "@/lib/supabase-server";

type PhotoMeta = { name: string; type: string; size: number };

export type PhotoUploadTargets =
  | {
      ok: true;
      bucket: string;
      ticket: string;
      uploads: { path: string; token: string; contentType: string }[];
    }
  | { ok: false; error: string };

/**
 * Validates the selected photos and issues one-time signed upload URLs (created with the
 * service-role key) into a private bucket. The browser uploads straight to Supabase Storage,
 * which avoids Vercel's ~4.5 MB request body limit for server functions.
 */
export async function createPhotoUploadTargets(photos: PhotoMeta[]): Promise<PhotoUploadTargets> {
  if (!Array.isArray(photos) || photos.length === 0) return { ok: false, error: "Add at least one photo." };
  if (photos.length > MAX_PHOTOS) return { ok: false, error: `Add up to ${MAX_PHOTOS} photos.` };

  const types: string[] = [];
  for (const photo of photos) {
    const type = resolvePhotoType(String(photo?.name ?? ""), String(photo?.type ?? ""));
    if (!type) return { ok: false, error: "Photos must be JPG, PNG, or HEIC images." };
    if (typeof photo.size !== "number" || photo.size <= 0 || photo.size > MAX_PHOTO_BYTES) {
      return { ok: false, error: "Each photo must be 10 MB or smaller." };
    }
    types.push(type);
  }

  try {
    const storage = getSupabaseServiceRoleClient().storage.from(PROJECT_PHOTO_BUCKET);
    const folder = crypto.randomUUID();
    const uploads = [];
    for (const [index, contentType] of types.entries()) {
      const path = `${folder}/${index + 1}.${ALLOWED_PHOTO_TYPES[contentType]}`;
      const { data, error } = await storage.createSignedUploadUrl(path);
      if (error || !data) throw error ?? new Error("No upload URL returned.");
      uploads.push({ path, token: data.token, contentType });
    }
    return { ok: true, bucket: PROJECT_PHOTO_BUCKET, ticket: createPhotoTicket(folder, uploads.map((u) => u.path)), uploads };
  } catch (error) {
    console.error("Failed to prepare photo uploads:", error);
    return { ok: false, error: "We couldn't prepare your photo upload. Please try again." };
  }
}
