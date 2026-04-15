import { readPortalAccessCodeFromEnv } from "@/lib/access-code-env";

const DEV_FALLBACK = "development-auth-secret-min-32-characters-x";
const ACCESS_CODE_JWT_PEPPER = "deview-portal:jwt-v1";

function readAuthSecretRaw(): string {
  const k = ["AUTH", "SECRET"].join("_");
  let s = typeof process.env[k] === "string" ? process.env[k]!.trim() : "";
  if (!s) {
    try {
      const v = new Function("return typeof process!=='undefined'&&process.env?process.env['AUTH'+'_'+'SECRET']:''")() as string;
      if (typeof v === "string") s = v.trim();
    } catch {
      /* empty */
    }
  }
  return s.replace(/^["']|["']$/g, "");
}

async function derivedKeyFromAccessCode(accessCode: string): Promise<Uint8Array> {
  const payload = ACCESS_CODE_JWT_PEPPER + "\0" + accessCode;
  const data = new TextEncoder().encode(payload);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

/**
 * HS256 key: AUTH_SECRET (≥32) if set, else derived from PORTAL_ACCESS_CODE (≥8).
 * Access-code-only deploys do not need a separate AUTH_SECRET.
 */
export async function getAuthSecretBytes(): Promise<Uint8Array> {
  const s = readAuthSecretRaw();
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(s || DEV_FALLBACK);
  }
  if (s.length >= 32) {
    return new TextEncoder().encode(s);
  }
  const code = readPortalAccessCodeFromEnv()?.trim();
  if (code && code.length >= 8) {
    return derivedKeyFromAccessCode(code);
  }
  return new TextEncoder().encode("__invalid__");
}

/** Production can sign cookies if AUTH_SECRET is long enough or PORTAL_ACCESS_CODE is set (8+). */
export function isProductionAuthSecretConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (readAuthSecretRaw().length >= 32) return true;
  const code = readPortalAccessCodeFromEnv()?.trim();
  return !!code && code.length >= 8;
}
