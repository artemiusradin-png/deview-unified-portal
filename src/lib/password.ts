import { createHash, timingSafeEqual } from "crypto";

const MIN_PROD_PASSWORD_LENGTH = 16;

/** Same pattern as SESSION_SECRET — avoids Next.js inlining `process.env.*` at build time. */
function readPortalPassword(): string | undefined {
  const key = ["PORTAL", "DEMO", "PASSWORD"].join("_");
  const raw = process.env[key];
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim().replace(/^["']|["']$/g, "");
  return trimmed.length > 0 ? trimmed : undefined;
}

export function isProductionPortalPasswordConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const p = readPortalPassword();
  return typeof p === "string" && p.length >= MIN_PROD_PASSWORD_LENGTH;
}

/** Expected portal password. In production PORTAL_DEMO_PASSWORD must be set (≥16 chars). */
export function getExpectedPassword(): string {
  const fromEnv = readPortalPassword();
  if (process.env.NODE_ENV === "production") {
    return fromEnv ?? "";
  }
  return fromEnv ?? "deview-demo";
}

export function passwordsMatch(attempt: string, expected: string): boolean {
  const a = createHash("sha256").update(attempt, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}
