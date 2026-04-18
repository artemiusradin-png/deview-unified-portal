import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/portal-data";
import { computeBorrowerRisk } from "@/lib/borrower-risk";

type Props = { params: Promise<{ id: string }> };

function csvEscape(value: string) {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, "\"\"");
  return needsQuotes ? `"${escaped}"` : escaped;
}

export async function GET(_: Request, { params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const risk = computeBorrowerRisk(profile);
  const row = profile.searchRow;
  const lines = [
    ["field", "value"],
    ["customerId", profile.id],
    ["name", row.name],
    ["idNumber", row.idNumber],
    ["applicationNumber", row.applicationNumber],
    ["loanNumber", row.loanNumber],
    ["status", row.status],
    ["loanType", row.loanType],
    ["companyUnit", row.companyUnit],
    ["riskLevel", risk.level],
    ["riskScore", String(risk.score)],
    ["recommendation", risk.recommendation],
    ["repayState", profile.repayCondition.state],
    ["overdueDays", String(profile.repayCondition.overdueDays)],
    ["recovery", profile.ocaWriteOff.recovery],
  ];

  const body = lines.map((line) => line.map(csvEscape).join(",")).join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="borrower-${id}.csv"`,
    },
  });
}
