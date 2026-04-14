import { createHash, timingSafeEqual } from "crypto";
import { env } from "node:process";
import {
  obfuscatedPortalPasswordKey,
  pickFromEnvBag,
  readEnvViaDynamicEval,
} from "@/lib/session-secret-shared";

const MIN_PROD_PASSWORD_LENGTH = 16;

const PORTAL_KEYS = [
  ...new Set([["PORTAL", "DEMO", "PASSWORD"].join("_"), obfuscatedPortalPasswordKey()]),
];

function readPortalPassword(): string | undefined {
  const fromImported = pickFromEnvBag(env as Record<string, string | undefined>, PORTAL_KEYS);
  if (fromImported) return fromImported;

  const fromProcess = pickFromEnvBag(process.env as Record<string, string | undefined>, PORTAL_KEYS);
  if (fromProcess) return fromProcess;

  const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  const fromGlobal = pickFromEnvBag(g.process?.env, PORTAL_KEYS);
  if (fromGlobal) return fromGlobal;

  return (
    readEnvViaDynamicEval(
      "return typeof process !== 'undefined' && process.env ? process.env['PORTAL' + '_' + 'DEMO' + '_' + 'PASSWORD'] : undefined",
    ) ?? undefined
  );
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
