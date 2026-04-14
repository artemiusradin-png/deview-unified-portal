import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

export function secretToBytes(secret: string): Uint8Array {
  return encoder.encode(secret);
}

export async function signSessionJwt(secret: Uint8Array): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("portal")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifySessionJwt(token: string, secret: Uint8Array): Promise<boolean> {
  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
