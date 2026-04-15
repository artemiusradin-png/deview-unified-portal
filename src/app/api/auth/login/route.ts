import { unstable_noStore as noStore } from "next/cache";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-cookie";
import {
  getAccessCodeForAuth,
  isProductionAccessCodeConfigured,
  passwordsMatch,
} from "@/lib/access-code";
import { isProductionAuthSecretConfigured } from "@/lib/auth-secret";
import { writeAudit } from "@/lib/audit";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
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
        code: "AUTH_SECRET",
        message:
          "Set AUTH_SECRET in the deployment environment (32+ characters). It is used to sign session cookies.",
        hint: isPreview
          ? "Preview deployments need AUTH_SECRET enabled for Preview in Vercel, or use Production."
          : "Vercel → Settings → Environment Variables → AUTH_SECRET → redeploy.",
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

  let body: { email?: string; password?: string } = {};
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    body = JSON.parse(text) as { email?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (isDatabaseConfigured()) {
    if (!emailRaw || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: emailRaw } });
    const okPass = user ? await bcrypt.compare(password, user.passwordHash) : false;

    if (!user || !okPass) {
      await new Promise((r) => setTimeout(r, 120));
      recordLoginFailure(ip);
      await writeAudit({
        action: "auth.login.fail",
        metadata: { email: emailRaw },
        ip,
        userAgent: ua,
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createUserSessionToken(user.id, user.email, user.role);
    if (!token) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    clearLoginFailures(ip);
    await writeAudit({
      userId: user.id,
      action: "auth.login.success",
      ip,
      userAgent: ua,
    });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  }

  if (process.env.NODE_ENV === "production" && !isProductionAccessCodeConfigured()) {
    const isPreview = process.env.VERCEL_ENV === "preview";
    return NextResponse.json(
      {
        error: "Service unavailable",
        code: "ACCESS_CODE",
        message:
          "No DATABASE_URL: portal runs in access-code mode. Set PORTAL_ACCESS_CODE (8+ characters) or configure DATABASE_URL with seeded users.",
        hint: isPreview
          ? "Preview: enable PORTAL_ACCESS_CODE for Preview, or attach a database and AUTH_SECRET."
          : "Add DATABASE_URL + run db seed, or set PORTAL_ACCESS_CODE for single shared code mode.",
      },
      { status: 503 },
    );
  }

  const attempt = password.trim();
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
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
