import { unstable_noStore as noStore } from "next/cache";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-cookie";
import {
  getAccessCodeForAuth,
  isProductionAccessCodeConfigured,
  passwordsMatch,
} from "@/lib/access-code";
import { checkLoginRateLimit, clearLoginFailures, getClientIp, recordLoginFailure } from "@/lib/rate-limit";
import { createSessionToken } from "@/lib/session-node";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY_BYTES = 4096;

export async function POST(request: Request) {
  noStore();
  const len = request.headers.get("content-length");
  if (len && Number(len) > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  if (process.env.NODE_ENV === "production" && !isProductionAccessCodeConfigured()) {
    const isPreview = process.env.VERCEL_ENV === "preview";
    return NextResponse.json(
      {
        error: "Service unavailable",
        code: "ACCESS_CODE",
        message:
          "The server does not see PORTAL_ACCESS_CODE (or it is shorter than 8 characters). This is set in Vercel — it is not the same as typing text into the error box.",
        hint: isPreview
          ? "You are on a Preview deployment. In Vercel → Environment Variables, enable PORTAL_ACCESS_CODE for Preview, or use your Production domain (e.g. …vercel.app from the Production deployment)."
          : "Vercel → Settings → Environment Variables → add PORTAL_ACCESS_CODE (exact name), value 8+ characters, enable Production (and Preview if you use branch previews) → Save → Redeploy.",
      },
      { status: 503 },
    );
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
  const expected = getAccessCodeForAuth();

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
