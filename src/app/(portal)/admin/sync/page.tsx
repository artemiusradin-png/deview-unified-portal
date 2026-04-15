import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { runStubSyncAction } from "../actions";

export default async function AdminSyncPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Sync job history requires a database.</p>;
  }

  const [sources, jobs] = await Promise.all([
    prisma.dataSource.findMany({ orderBy: { name: "asc" } }),
    prisma.syncJob.findMany({
      orderBy: { startedAt: "desc" },
      take: 50,
      include: { dataSource: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Queue stub sync</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
          Placeholder until ETL / connector workers run. Creates a completed job row and bumps{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">lastSyncAt</code>.
        </p>
        {sources.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Add a data source first.</p>
        ) : (
          <form action={runStubSyncAction} className="mt-4 flex flex-wrap items-end gap-2">
            <label className="text-xs">
              <span className="text-slate-600 dark:text-slate-400">Data source</span>
              <select name="dataSourceId" required className="mt-1 block min-w-[220px] rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950">
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">
              Run stub
            </button>
          </form>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent jobs</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Started</th>
                <th className="px-3 py-2">Source</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Records</th>
                <th className="px-3 py-2">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {j.startedAt.toISOString().replace("T", " ").slice(0, 19)}
                  </td>
                  <td className="px-3 py-2">{j.dataSource.name}</td>
                  <td className="px-3 py-2 font-mono">{j.status}</td>
                  <td className="px-3 py-2">{j.recordsProcessed ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{j.message ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
