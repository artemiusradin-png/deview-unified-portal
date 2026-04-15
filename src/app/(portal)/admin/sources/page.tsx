import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { createDataSourceAction } from "../actions";

export default async function AdminSourcesPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Connect a database to manage sources.</p>;
  }

  const sources = await prisma.dataSource.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Add source</h2>
        <form action={createDataSourceAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Name *</span>
            <input name="name" required className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Format</span>
            <input name="format" placeholder="e.g. PostgreSQL, CSV" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Business owner</span>
            <input name="businessOwner" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Business unit</span>
            <input name="businessUnit" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs sm:col-span-2">
            <span className="text-slate-600 dark:text-slate-400">Location / path</span>
            <input name="location" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Access method</span>
            <input name="accessMethod" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Refresh method</span>
            <input name="refreshMethod" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Refresh frequency</span>
            <input name="refreshFrequency" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Status</span>
            <input name="status" placeholder="inventory | live | unknown" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs sm:col-span-2">
            <span className="text-slate-600 dark:text-slate-400">Notes</span>
            <textarea name="notes" rows={2} className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">
              Save source
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Inventory</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Format</th>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Last sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sources.map((s) => (
                <tr key={s.id}>
                  <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">{s.name}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{s.format}</td>
                  <td className="px-3 py-2">{s.businessUnit ?? "—"}</td>
                  <td className="px-3 py-2">{s.status}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {s.lastSyncAt ? s.lastSyncAt.toISOString().slice(0, 19) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
