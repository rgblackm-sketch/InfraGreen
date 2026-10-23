import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    console.warn("[turnstile] TURNSTILE_SECRET_KEY is not set; skipping bot verification.");
    return true;
  }

  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    const response = await fetch(VERIFY_URL, { method: "POST", body, cache: "no-store" });
    const result = (await response.json()) as { success?: boolean };
    return result.success === true;
  } catch (error) {
    console.error("[turnstile] Verification request failed:", error);
    return false;
  }
}
