import { NextResponse } from "next/server";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-cookie";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const base = sessionCookieOptions();
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: base.httpOnly,
    sameSite: base.sameSite,
    secure: base.secure,
    path: base.path,
    maxAge: 0,
  });
  return res;
}
