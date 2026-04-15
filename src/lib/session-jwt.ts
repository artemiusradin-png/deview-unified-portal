import { SignJWT, jwtVerify } from "jose";

export async function signUserJwt(
  secret: Uint8Array,
  userId: string,
  email: string,
  role: string,
): Promise<string> {
  return new SignJWT({ email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export type VerifiedSession =
  | { ok: true; userId: string; email: string; role: string }
  | { ok: false };

export async function verifyUserJwt(token: string, secret: Uint8Array): Promise<VerifiedSession> {
  try {
    const { payload } = await jwtVerify(token, secret);
    const sub = payload.sub;
    if (!sub) return { ok: false };
    return {
      ok: true,
      userId: sub,
      email: typeof payload.email === "string" ? payload.email : "",
      role: typeof payload.role === "string" ? payload.role : "VIEWER",
    };
  } catch {
    return { ok: false };
  }
}
