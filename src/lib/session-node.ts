import { env } from "node:process";
import { normalizeEnvString } from "@/lib/session-secret-shared";
import { secretToBytes, signSessionJwt } from "@/lib/session-jwt";

const DEV_FALLBACK_SECRET = "development-only-session-secret-min-32-chars-x";

/**
 * Route handlers (Node): use real `env` from node:process so Vercel runtime
 * variables are visible even when Turbopack/webpack snapshot `process.env` at build.
 */
function readSessionSecretNode(): string | undefined {
  const record = env as Record<string, string | undefined>;
  const key = ["SESSION", "SECRET"].join("_");
  const raw = record[key] ?? record["SESSION_SECRET"];
  if (typeof raw !== "string") return undefined;
  const t = normalizeEnvString(raw);
  return t.length > 0 ? t : undefined;
}

function getSecretBytes(): Uint8Array | null {
  const s = readSessionSecretNode();
  if (process.env.NODE_ENV === "production") {
    if (!s || s.length < 32) return null;
    return secretToBytes(s);
  }
  return secretToBytes(s ?? DEV_FALLBACK_SECRET);
}

export function isProductionSessionReady(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const s = readSessionSecretNode();
  return !!s && s.length >= 32;
}

export async function createSessionToken(): Promise<string | null> {
  const bytes = getSecretBytes();
  if (!bytes) return null;
  return signSessionJwt(bytes);
}
