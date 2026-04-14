import { NextResponse } from "next/server";
import { searchCustomers } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const rows = searchCustomers(q);
  return NextResponse.json({ results: rows, query: q });
}
