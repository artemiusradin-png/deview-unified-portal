import { env } from "node:process";
import {
  obfuscatedSessionSecretKey,
  pickFromEnvBag,
  readEnvViaDynamicEval,
} from "@/lib/session-secret-shared";
import { secretToBytes, signSessionJwt } from "@/lib/session-jwt";

const DEV_FALLBACK_SECRET = "development-only-session-secret-min-32-chars-x";

const SESSION_KEYS = [...new Set([["SESSION", "SECRET"].join("_"), obfuscatedSessionSecretKey()])];

function readSessionSecretNode(): string | undefined {
  const fromImported = pickFromEnvBag(env as Record<string, string | undefined>, SESSION_KEYS);
  if (fromImported) return fromImported;

  const fromProcess = pickFromEnvBag(process.env as Record<string, string | undefined>, SESSION_KEYS);
  if (fromProcess) return fromProcess;

  const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  const fromGlobal = pickFromEnvBag(g.process?.env, SESSION_KEYS);
  if (fromGlobal) return fromGlobal;

  return (
    readEnvViaDynamicEval(
      "return typeof process !== 'undefined' && process.env ? process.env['SESSION' + '_' + 'SECRET'] : undefined",
    ) ?? undefined
  );
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
