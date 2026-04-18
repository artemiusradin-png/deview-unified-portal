import Link from "next/link";
import { subDays } from "./util";
import { getProfileById, listAllCustomers } from "@/lib/portal-data";
import { analysisFromProfile } from "@/lib/ops";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { markAlertReadAction } from "../actions";

export default async function AdminManagementPage() {
  const rows = await listAllCustomers();
  const computed = await Promise.all(
    rows.map(async (row) => {
      const profile = await getProfileById(row.id);
      if (!profile) return { grade: "D", risk: "High Risk" };
      const analysis = analysisFromProfile(profile);
      return { grade: analysis.grade, risk: analysis.riskLevel };
    }),
  );

  const gradeDist = new Map<string, number>();
  const riskDist = new Map<string, number>();
  for (const item of computed) {
    gradeDist.set(item.grade, (gradeDist.get(item.grade) ?? 0) + 1);
    riskDist.set(item.risk, (riskDist.get(item.risk) ?? 0) + 1);
  }

  const monthStart = subDays(new Date(), 30);
  const dbEnabled = isDatabaseConfigured();
  const [auditCount, noteCount, workflowOpen, inquirySpend, alerts] = dbEnabled
    ? await Promise.all([
        prisma.auditLog.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.borrowerCaseNote.count({ where: { createdAt: { gte: monthStart } } }),
        prisma.borrowerWorkflow.count({ where: { status: { notIn: ["closed", "approved"] } } }),
        prisma.tEInquiryCostLog.aggregate({
          where: { createdAt: { gte: monthStart } },
          _sum: { costCents: true },
        }),
        prisma.adminAlert.findMany({ where: { readAt: null }, orderBy: { createdAt: "desc" }, take: 10 }),
      ])
    : [0, 0, 0, { _sum: { costCents: 0 } }, []];

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-4">
        <Stat label="Total borrowers" value={String(rows.length)} />
        <Stat label="Review activity (30d)" value={String(auditCount)} />
        <Stat label="Open workflows" value={String(workflowOpen)} />
        <Stat label="TE inquiry spend (30d)" value={`$${((inquirySpend._sum.costCents ?? 0) / 100).toFixed(2)}`} />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Grade distribution</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {["A", "B", "C", "D"].map((grade) => (
              <li key={grade} className="flex items-center justify-between rounded border border-slate-100 px-2 py-1.5 dark:border-slate-800">
                <span>Grade {grade}</span>
                <strong>{gradeDist.get(grade) ?? 0}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Risk trend snapshot</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {["Low Risk", "Moderate Risk", "High Risk", "Written Off"].map((risk) => (
              <li key={risk} className="flex items-center justify-between rounded border border-slate-100 px-2 py-1.5 dark:border-slate-800">
                <span>{risk}</span>
                <strong>{riskDist.get(risk) ?? 0}</strong>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">Case notes added in last 30 days: {noteCount}</p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Sync / reminder alerts</h2>
          <Link href={`/api/admin/management-report?month=${new Date().toISOString().slice(0, 7)}`} className="text-xs underline">
            Export monthly report CSV
          </Link>
        </div>
        {alerts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No active alerts.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {alerts.map((alert) => (
              <li key={alert.id} className="rounded border border-red-200 bg-red-50 p-2 text-sm dark:border-red-900/40 dark:bg-red-950/20">
                <p className="font-medium text-red-900 dark:text-red-200">{alert.message}</p>
                <p className="text-xs text-red-700/90 dark:text-red-300/80">
                  {alert.source ?? "system"} · {alert.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </p>
                <form action={markAlertReadAction} className="mt-1">
                  <input type="hidden" name="alertId" value={alert.id} />
                  <button type="submit" className="text-xs underline">
                    Mark as read
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</p>
    </div>
  );
}
