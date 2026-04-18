"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth-session";
import { isDatabaseConfigured } from "@/lib/prisma";
import { isStaffOrAbove } from "@/lib/rbac";
import { runDataSourceSync } from "@/lib/sync";
import { writeAudit } from "@/lib/audit";

export async function runDashboardRefreshAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;
  const session = await getServerSession();
  if (!session || !isStaffOrAbove(session.role)) {
    throw new Error("Unauthorized");
  }

  const sourceId = String(formData.get("sourceId") ?? "").trim();
  if (!sourceId) throw new Error("Source id missing");
  const result = await runDataSourceSync({
    dataSourceId: sourceId,
    trigger: "manual",
  });
  const h = await headers();
  await writeAudit({
    userId: session.userId,
    action: "dashboard.sync.manual",
    resource: sourceId,
    metadata: result,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/sync");
}
