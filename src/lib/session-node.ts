import { getAuthSecretBytes, isProductionAuthSecretConfigured } from "@/lib/auth-secret";
import { signUserJwt } from "@/lib/session-jwt";

export async function createUserSessionToken(userId: string, email: string, role: string): Promise<string | null> {
  if (process.env.NODE_ENV === "production" && !isProductionAuthSecretConfigured()) {
    return null;
  }
  const secret = getAuthSecretBytes();
  return signUserJwt(secret, userId, email, role);
}
