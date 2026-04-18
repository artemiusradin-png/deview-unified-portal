import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-session";
import { isAdminRole } from "@/lib/rbac";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

function monthRange(ym: string) {
  const start = new Date(`${ym}-01T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

function csvEscape(value: string) {
  const escaped = value.replace(/"/g, "\"\"");
  return /[",\n]/.test(value) ? `"${escaped}"` : escaped;
}

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL missing" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);
  const range = monthRange(month);
  if (!range) return NextResponse.json({ error: "Invalid month format (YYYY-MM)" }, { status: 400 });

  const [audits, notes, workflows, inquiries] = await Promise.all([
    prisma.auditLog.count({ where: { createdAt: { gte: range.start, lt: range.end } } }),
    prisma.borrowerCaseNote.count({ where: { createdAt: { gte: range.start, lt: range.end } } }),
    prisma.borrowerWorkflow.count(),
    prisma.tEInquiryCostLog.aggregate({
      where: { createdAt: { gte: range.start, lt: range.end } },
      _sum: { costCents: true },
      _count: { _all: true },
    }),
  ]);

  const rows = [
    ["metric", "value"],
    ["month", month],
    ["audit_events", String(audits)],
    ["case_notes", String(notes)],
    ["workflow_records", String(workflows)],
    ["te_inquiries", String(inquiries._count._all)],
    ["te_cost_cents", String(inquiries._sum.costCents ?? 0)],
  ];
  const body = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="management-report-${month}.csv"`,
    },
  });
}
