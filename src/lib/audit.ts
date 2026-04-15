import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function writeAudit(entry: {
  userId?: string | null;
  action: string;
  resource?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  if (!isDatabaseConfigured()) return;
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? undefined,
        action: entry.action,
        resource: entry.resource ?? undefined,
        metadata: entry.metadata ?? undefined,
        ip: entry.ip ?? undefined,
        userAgent: entry.userAgent ?? undefined,
      },
    });
  } catch (err) {
    console.error("audit log write failed", err);
  }
}
