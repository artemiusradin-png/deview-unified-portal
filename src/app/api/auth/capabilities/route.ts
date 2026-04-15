import { NextResponse } from "next/server";
import { isDatabaseConfigured } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/** Public: tells the login UI whether email/password users exist (DATABASE_URL set). */
export async function GET() {
  return NextResponse.json({ databaseUsers: isDatabaseConfigured() });
}
