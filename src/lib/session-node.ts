import { DEV_DEFAULT_ACCESS_CODE, MIN_ACCESS_CODE_LENGTH_PROD } from "@/lib/access-constants";
import { readAccessCodeRaw } from "@/lib/access-code";
import { deriveSessionKeyBytes } from "@/lib/derive-session-key";
import { signSessionJwt } from "@/lib/session-jwt";

function effectiveAccessCodeForSession(): string | null {
  const raw = readAccessCodeRaw();
  if (process.env.NODE_ENV === "production") {
    if (!raw || raw.length < MIN_ACCESS_CODE_LENGTH_PROD) return null;
    return raw;
  }
  return raw ?? DEV_DEFAULT_ACCESS_CODE;
}

export async function createSessionToken(): Promise<string | null> {
  const code = effectiveAccessCodeForSession();
  if (!code) return null;
  const bytes = await deriveSessionKeyBytes(code);
  return signSessionJwt(bytes);
}
