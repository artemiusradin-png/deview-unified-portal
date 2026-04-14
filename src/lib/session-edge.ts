import { normalizeEnvString } from "@/lib/session-secret-shared";
import { secretToBytes, verifySessionJwt } from "@/lib/session-jwt";

const DEV_FALLBACK_SECRET = "development-only-session-secret-min-32-chars-x";

/** Edge middleware: avoid node:process; dynamic key limits build-time inlining. */
function readSessionSecretEdge(): string | undefined {
  const key = ["SESSION", "SECRET"].join("_");
  const raw = process.env[key];
  if (typeof raw !== "string") return undefined;
  const t = normalizeEnvString(raw);
  return t.length > 0 ? t : undefined;
}

function getSecretBytes(): Uint8Array | null {
  const s = readSessionSecretEdge();
  if (process.env.NODE_ENV === "production") {
    if (!s || s.length < 32) return null;
    return secretToBytes(s);
  }
  return secretToBytes(s ?? DEV_FALLBACK_SECRET);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const bytes = getSecretBytes();
  if (!bytes) return false;
  return verifySessionJwt(token, bytes);
}
