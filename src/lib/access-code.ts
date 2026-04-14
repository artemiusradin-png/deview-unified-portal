import { createHash, timingSafeEqual } from "crypto";
import { env } from "node:process";
import { DEV_DEFAULT_ACCESS_CODE, MIN_ACCESS_CODE_LENGTH_PROD } from "@/lib/access-constants";
import { PORTAL_ACCESS_CODE_KEYS, readPortalAccessCodeFromEnv } from "@/lib/access-code-env";
import { pickFromEnvBag } from "@/lib/session-secret-shared";

export function readAccessCodeRaw(): string | undefined {
  const fromNode = pickFromEnvBag(env as Record<string, string | undefined>, PORTAL_ACCESS_CODE_KEYS);
  if (fromNode) return fromNode;
  return readPortalAccessCodeFromEnv();
}

export function getAccessCodeForAuth(): string {
  const raw = readAccessCodeRaw();
  if (process.env.NODE_ENV === "production") {
    return raw ?? "";
  }
  return raw ?? DEV_DEFAULT_ACCESS_CODE;
}

export function isProductionAccessCodeConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const s = readAccessCodeRaw();
  return !!s && s.length >= MIN_ACCESS_CODE_LENGTH_PROD;
}

export function passwordsMatch(attempt: string, expected: string): boolean {
  const a = createHash("sha256").update(attempt, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return a.length === b.length && timingSafeEqual(a, b);
}
