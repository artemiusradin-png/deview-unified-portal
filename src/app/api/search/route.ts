import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { getServerSession } from "@/lib/auth-session";
import { searchCustomers } from "@/lib/portal-data";
import { clampSearchQuery } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = clampSearchQuery(searchParams.get("q") ?? "");
  const rows = await searchCustomers(q);

  const session = await getServerSession();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  await writeAudit({
    userId: session?.userId,
    action: "search",
    resource: q || "(empty)",
    metadata: { resultCount: rows.length },
    ip,
    userAgent: request.headers.get("user-agent"),
  });

  return NextResponse.json({ results: rows, query: q });
}
