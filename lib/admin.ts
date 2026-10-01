export function getApprovedAdminEmails(): string[] {
  return (process.env.INFRAGREEN_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isApprovedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return getApprovedAdminEmails().includes(normalized);
}
