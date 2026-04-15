import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export default async function AdminAuditPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Audit events are stored when DATABASE_URL is set.</p>;
  }

  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { email: true } } },
  });

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Recent events (200)</h2>
      <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Action</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Resource</th>
              <th className="px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">
                  {r.createdAt.toISOString().replace("T", " ").slice(0, 19)}
                </td>
                <td className="px-3 py-2 font-mono text-slate-800 dark:text-slate-200">{r.action}</td>
                <td className="px-3 py-2">{r.user?.email ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400">{r.resource ?? "—"}</td>
                <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-400">{r.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
