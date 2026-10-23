import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const TICKET_TTL_MS = 30 * 60 * 1000;

function getKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
  return key;
}

function sign(payload: string) {
  return createHmac("sha256", getKey()).update(payload).digest("base64url");
}

/** A short-lived, signed proof that the server issued upload slots for this folder. */
export function createPhotoTicket(folder: string, paths: string[]) {
  const payload = Buffer.from(JSON.stringify({ folder, paths, exp: Date.now() + TICKET_TTL_MS })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readPhotoTicket(ticket: string): { folder: string; paths: string[] } | null {
  const [payload, signature] = ticket.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { folder: string; paths: string[]; exp: number };
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { folder: data.folder, paths: data.paths };
  } catch {
    return null;
  }
}
