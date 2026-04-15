import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-cookie";
import {
  getAccessCodeForAuth,
  isProductionAccessCodeConfigured,
  passwordsMatch,
} from "@/lib/access-code";
import { isProductionAuthSecretConfigured } from "@/lib/auth-secret";
import { writeAudit } from "@/lib/audit";
import { checkLoginRateLimit, clearLoginFailures, getClientIp, recordLoginFailure } from "@/lib/rate-limit";
import { createUserSessionToken } from "@/lib/session-node";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;
const ACCESS_CODE_USER_ID = "access-code-session";
const ACCESS_CODE_EMAIL = "access@portal.local";

export async function POST(request: Request) {
  noStore();
  const len = request.headers.get("content-length");
  if (len && Number(len) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  if (process.env.NODE_ENV === "production" && !isProductionAuthSecretConfigured()) {
    const isPreview = process.env.VERCEL_ENV === "preview";
    return NextResponse.json(
      {
        error: "Service unavailable",
        code: "ACCESS_CODE",
        message: "Set PORTAL_ACCESS_CODE in Vercel (8+ characters). It is the only password staff use to sign in.",
        hint: isPreview
          ? "Enable PORTAL_ACCESS_CODE for the Preview environment too, or use Production."
          : "Vercel → Project → Settings → Environment Variables → PORTAL_ACCESS_CODE → Redeploy.",
      },
      { status: 503 },
    );
  }

  if (process.env.NODE_ENV === "production" && !isProductionAccessCodeConfigured()) {
    const isPreview = process.env.VERCEL_ENV === "preview";
    return NextResponse.json(
      {
        error: "Service unavailable",
        code: "ACCESS_CODE",
        message: "PORTAL_ACCESS_CODE is missing or shorter than 8 characters in this deployment.",
        hint: isPreview
          ? "Preview: enable PORTAL_ACCESS_CODE for Preview in Vercel."
          : "Add PORTAL_ACCESS_CODE for Production and redeploy.",
      },
      { status: 503 },
    );
  }

  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent");
  const limited = checkLoginRateLimit(ip);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts", retryAfter: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  let body: { password?: string } = {};
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    body = JSON.parse(text) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const attempt = (typeof body.password === "string" ? body.password : "").trim();
  if (!attempt) {
    return NextResponse.json({ error: "Access code required" }, { status: 400 });
  }

  const expected = getAccessCodeForAuth();

  if (!passwordsMatch(attempt, expected)) {
    await new Promise((r) => setTimeout(r, 120));
    recordLoginFailure(ip);
    await writeAudit({
      action: "auth.login.fail",
      metadata: { mode: "access_code" },
      ip,
      userAgent: ua,
    });
    return NextResponse.json({ error: "Invalid access code" }, { status: 401 });
  }

  const token = await createUserSessionToken(ACCESS_CODE_USER_ID, ACCESS_CODE_EMAIL, "STAFF");
  if (!token) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  clearLoginFailures(ip);
  await writeAudit({
    userId: null,
    action: "auth.login.success",
    metadata: { mode: "access_code" },
    ip,
    userAgent: ua,
  });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
