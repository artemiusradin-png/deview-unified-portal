import { prisma } from "@/lib/prisma";

type SyncTrigger = "manual" | "scheduled";

export async function runDataSourceSync(params: {
  dataSourceId: string;
  trigger: SyncTrigger;
  simulateFailure?: boolean;
}) {
  const source = await prisma.dataSource.findUnique({ where: { id: params.dataSourceId } });
  if (!source) throw new Error("Data source not found");

  const startedAt = new Date();
  const job = await prisma.syncJob.create({
    data: {
      dataSourceId: source.id,
      status: "running",
      trigger: params.trigger,
      startedAt,
      message: `${params.trigger} sync started`,
    },
  });

  try {
    if (params.simulateFailure) {
      throw new Error("Simulated sync failure");
    }

    const recordsProcessed = await prisma.customerRecord.count();
    const finishedAt = new Date();
    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "completed",
        finishedAt,
        recordsProcessed,
        message: "Sync completed successfully.",
      },
    });
    await prisma.dataSource.update({
      where: { id: source.id },
      data: {
        status: "live",
        lastSyncStatus: "completed",
        lastSyncAt: finishedAt,
      },
    });
    return { ok: true as const, jobId: job.id, recordsProcessed };
  } catch (error) {
    const finishedAt = new Date();
    const msg = error instanceof Error ? error.message : "Unknown sync error";
    await prisma.syncJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        errorCode: "SYNC_FAILED",
        finishedAt,
        message: msg,
      },
    });
    await prisma.dataSource.update({
      where: { id: source.id },
      data: {
        status: "error",
        lastSyncStatus: "failed",
        lastSyncAt: finishedAt,
      },
    });
    await prisma.adminAlert.create({
      data: {
        level: "critical",
        source: source.name,
        message: `Sync failed for ${source.name}: ${msg}`,
      },
    });
    return { ok: false as const, jobId: job.id, error: msg };
  }
}

export async function runDailyTeCreditSync() {
  const sources = await prisma.dataSource.findMany({
    where: {
      OR: [
        { name: { contains: "TE Credit", mode: "insensitive" } },
        { refreshFrequency: { contains: "daily", mode: "insensitive" } },
      ],
    },
    orderBy: { name: "asc" },
  });
  const results = [];
  for (const source of sources) {
    const result = await runDataSourceSync({
      dataSourceId: source.id,
      trigger: "scheduled",
    });
    results.push({ sourceId: source.id, sourceName: source.name, ...result });
  }
  return results;
}
