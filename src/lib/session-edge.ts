import { DEV_DEFAULT_ACCESS_CODE, MIN_ACCESS_CODE_LENGTH_PROD } from "@/lib/access-constants";
import { readPortalAccessCodeFromEnv } from "@/lib/access-code-env";
import { deriveSessionKeyBytes } from "@/lib/derive-session-key";
import { verifySessionJwt } from "@/lib/session-jwt";

function effectiveAccessCodeForSession(): string | null {
  const raw = readPortalAccessCodeFromEnv();
  if (process.env.NODE_ENV === "production") {
    if (!raw || raw.length < MIN_ACCESS_CODE_LENGTH_PROD) return null;
    return raw;
  }
  return raw ?? DEV_DEFAULT_ACCESS_CODE;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const code = effectiveAccessCodeForSession();
  if (!code) return false;
  const bytes = await deriveSessionKeyBytes(code);
  return verifySessionJwt(token, bytes);
}
