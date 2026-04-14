import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

const DEV_FALLBACK_SECRET = "development-only-session-secret-min-32-chars-x";

/** Production requires SESSION_SECRET (≥32 chars). Development falls back if unset. */
export function getSessionSecretBytes(): Uint8Array | null {
  const s = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!s || s.length < 32) return null;
    return encoder.encode(s);
  }
  return encoder.encode(s ?? DEV_FALLBACK_SECRET);
}

export function isProductionSessionReady(): boolean {
  if (process.env.NODE_ENV !== "production") return true;
  const s = process.env.SESSION_SECRET;
  return !!s && s.length >= 32;
}

export async function createSessionToken(): Promise<string | null> {
  const secret = getSessionSecretBytes();
  if (!secret) return null;
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("portal")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = getSessionSecretBytes();
  if (!secret) return false;
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
