import { createHash, timingSafeEqual } from "crypto";

const MIN_PROD_PASSWORD_LENGTH = 16;

export function isProductionPortalPasswordConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const p = process.env.PORTAL_DEMO_PASSWORD;
  return typeof p === "string" && p.length >= MIN_PROD_PASSWORD_LENGTH;
}

/** Expected portal password. In production PORTAL_DEMO_PASSWORD must be set (≥16 chars). */
export function getExpectedPassword(): string {
  if (process.env.NODE_ENV === "production") {
    return process.env.PORTAL_DEMO_PASSWORD ?? "";
  }
  return process.env.PORTAL_DEMO_PASSWORD ?? "deview-demo";
}

export function passwordsMatch(attempt: string, expected: string): boolean {
  const a = createHash("sha256").update(attempt, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}
