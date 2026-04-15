import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/auth-cookie";
import { getAuthSecretBytes } from "@/lib/auth-secret";
import { verifyUserJwt } from "@/lib/session-jwt";

export type ServerSession = { userId: string; email: string; role: string };

export async function getServerSession(): Promise<ServerSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const secret = await getAuthSecretBytes();
  const v = await verifyUserJwt(token, secret);
  if (!v.ok) return null;
  return { userId: v.userId, email: v.email, role: v.role };
}
