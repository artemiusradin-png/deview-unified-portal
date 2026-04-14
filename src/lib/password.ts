import { createHash, timingSafeEqual } from "crypto";
import { env } from "node:process";
import { normalizeEnvString } from "@/lib/session-secret-shared";

const MIN_PROD_PASSWORD_LENGTH = 16;

/** Node route handlers only — uses live Vercel env object. */
function readPortalPassword(): string | undefined {
  const record = env as Record<string, string | undefined>;
  const key = ["PORTAL", "DEMO", "PASSWORD"].join("_");
  const raw = record[key] ?? record["PORTAL_DEMO_PASSWORD"];
  if (typeof raw !== "string") return undefined;
  const t = normalizeEnvString(raw);
  return t.length > 0 ? t : undefined;
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
