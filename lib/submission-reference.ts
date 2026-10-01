export function createSubmissionReference(prefix: "IG" | "IG-PRO") {
  const value = new Uint32Array(1);
  globalThis.crypto.getRandomValues(value);
  const digits = 100000 + (value[0] % 900000);

  return `${prefix}-2026-${digits}`;
}