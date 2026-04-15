import { getAuthSecretBytes } from "@/lib/auth-secret";
import { verifyUserJwt } from "@/lib/session-jwt";

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = await getAuthSecretBytes();
  const v = await verifyUserJwt(token, secret);
  return v.ok;
}

export async function getSessionFromToken(
  token: string | undefined,
): Promise<{ userId: string; email: string; role: string } | null> {
  if (!token) return null;
  const secret = await getAuthSecretBytes();
  const v = await verifyUserJwt(token, secret);
  if (!v.ok) return null;
  return { userId: v.userId, email: v.email, role: v.role };
}
