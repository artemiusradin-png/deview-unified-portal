import { readPortalAccessCodeFromEnv } from "@/lib/access-code-env";

const DEV_FALLBACK = "development-auth-secret-min-32-characters-x";
/** Pepper for deriving HS256 key from PORTAL_ACCESS_CODE when AUTH_SECRET is unset (access-code-only deploys). */
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

function hasDatabaseUrl(): boolean {
  return !!process.env.DATABASE_URL?.trim();
}

/** Same bytes as Node createHash("sha256").update(pepper).update("\\0").update(accessCode) when pepper/code are UTF-8. */
async function derivedKeyFromAccessCode(accessCode: string): Promise<Uint8Array> {
  const payload = ACCESS_CODE_JWT_PEPPER + "\0" + accessCode;
  const data = new TextEncoder().encode(payload);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

/**
 * HS256 signing key bytes.
 * Production: prefer AUTH_SECRET (≥32 chars). If unset and access-code-only (no DATABASE_URL),
 * derives a key from PORTAL_ACCESS_CODE (Edge-safe Web Crypto).
 */
export async function getAuthSecretBytes(): Promise<Uint8Array> {
  const s = readAuthSecretRaw();
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode(s || DEV_FALLBACK);
  }
  if (s.length >= 32) {
    return new TextEncoder().encode(s);
  }
  if (!hasDatabaseUrl()) {
    const code = readPortalAccessCodeFromEnv()?.trim();
    if (code && code.length >= 8) {
      return derivedKeyFromAccessCode(code);
    }
  }
  return new TextEncoder().encode("__invalid__");
}

/**
 * Production is ready to sign sessions if:
 * - AUTH_SECRET is set (≥32 chars), or
 * - access-code-only: no DATABASE_URL and PORTAL_ACCESS_CODE is set (≥8 chars).
 */
export function isProductionAuthSecretConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  if (readAuthSecretRaw().length >= 32) return true;
  if (hasDatabaseUrl()) return false;
  const code = readPortalAccessCodeFromEnv()?.trim();
  return !!code && code.length >= 8;
}
