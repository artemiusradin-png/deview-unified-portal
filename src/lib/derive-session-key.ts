/**
 * PBKDF2 via Web Crypto — works in Node route handlers and Edge middleware.
 * Session signing key is derived from the same access code used at login.
 */
export async function deriveSessionKeyBytes(accessCode: string): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(accessCode), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: enc.encode("deview-portal-v1"),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  return new Uint8Array(bits);
}
