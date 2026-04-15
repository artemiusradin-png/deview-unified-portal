const DEV_FALLBACK = "development-auth-secret-min-32-characters-x";

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

/** HS256 signing key bytes (UTF-8). Production: AUTH_SECRET ≥ 32 chars. */
export function getAuthSecretBytes(): Uint8Array {
  const s = readAuthSecretRaw();
  if (process.env.NODE_ENV === "production") {
    if (s.length < 32) {
      return new TextEncoder().encode("__invalid__");
    }
    return new TextEncoder().encode(s);
  }
  return new TextEncoder().encode(s || DEV_FALLBACK);
}

export function isProductionAuthSecretConfigured(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const s = readAuthSecretRaw();
  return s.length >= 32;
}
