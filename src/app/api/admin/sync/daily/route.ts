import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/prisma";
import { runDailyTeCreditSync } from "@/lib/sync";

function authorized(request: Request) {
  const expected = process.env.SYNC_CRON_SECRET?.trim();
  if (!expected) return true;
  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${expected}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isDatabaseConfigured()) return NextResponse.json({ ok: true, skipped: "DATABASE_URL missing" });

  const results = await runDailyTeCreditSync();
  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    sources: results.length,
    results,
  });
}
