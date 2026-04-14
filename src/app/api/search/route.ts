import { NextResponse } from "next/server";
import { searchCustomers } from "@/lib/mock-data";
import { clampSearchQuery } from "@/lib/validation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = clampSearchQuery(searchParams.get("q") ?? "");
  const rows = searchCustomers(q);
  return NextResponse.json({ results: rows, query: q });
}
