import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-cookie";
import {
  getExpectedPassword,
  isProductionPortalPasswordConfigured,
  passwordsMatch,
} from "@/lib/password";
import { checkLoginRateLimit, clearLoginFailures, getClientIp, recordLoginFailure } from "@/lib/rate-limit";
import { createSessionToken, isProductionSessionReady } from "@/lib/session-node";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;

export async function POST(request: Request) {
  noStore();
  const len = request.headers.get("content-length");
  if (len && Number(len) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  if (process.env.NODE_ENV === "production") {
    if (!isProductionSessionReady()) {
      return NextResponse.json(
        {
          error: "Service unavailable",
          code: "SESSION_SECRET",
          message: "SESSION_SECRET must be set (32+ characters) in production.",
        },
        { status: 503 },
      );
    }
    if (!isProductionPortalPasswordConfigured()) {
      return NextResponse.json(
        {
          error: "Service unavailable",
          code: "PORTAL_PASSWORD",
          message: "PORTAL_DEMO_PASSWORD must be set to at least 16 characters in production.",
        },
        { status: 503 },
      );
    }
  }

  const ip = getClientIp(request);
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
  const expected = getExpectedPassword();

  if (!passwordsMatch(attempt, expected)) {
    await new Promise((r) => setTimeout(r, 120));
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await createSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  clearLoginFailures(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
