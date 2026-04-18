import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/portal-data";

type Props = { params: Promise<{ id: string }> };

function esc(value: string) {
  const escaped = value.replace(/"/g, "\"\"");
  return /[",\n]/.test(value) ? `"${escaped}"` : escaped;
}

export async function GET(_: Request, { params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rows = [
    ["partakerType", "name", "mobileNo", "homeNo", "passport", "relation", "selected"],
    ...profile.partakers.map((p) => [
      p.partakerType || p.relationship || "",
      p.name,
      p.mobileNo || p.contact || "",
      p.homeNo || "",
      p.passport || "",
      p.relation || p.relationship || "",
      p.selected ? "yes" : "no",
    ]),
  ];
  const body = rows.map((r) => r.map(esc).join(",")).join("\n");
  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="partakers-${id}.csv"`,
    },
  });
}
