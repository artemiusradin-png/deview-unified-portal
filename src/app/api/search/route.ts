import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { getServerSession } from "@/lib/auth-session";
import { searchCustomers } from "@/lib/portal-data";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
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

  const looksLikeId = /^[a-z]\d{7}[a-z]$/i.test(q.replace(/[^a-z0-9]/gi, ""));
  if (isDatabaseConfigured() && q && looksLikeId) {
    const defaultCost = Number(process.env.TE_CREDIT_DEFAULT_COST_CENTS ?? 250);
    await prisma.tEInquiryCostLog.create({
      data: {
        query: q,
        idNumber: q,
        userId: session?.userId ?? null,
        userEmail: session?.email ?? null,
        costCents: Number.isFinite(defaultCost) ? Math.max(0, Math.round(defaultCost)) : 250,
      },
    });
  }

  return NextResponse.json({ results: rows, query: q });
}
