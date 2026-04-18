import Link from "next/link";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  if (!isDatabaseConfigured()) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100">
        <p className="font-medium">Database not configured</p>
        <p className="mt-1 text-amber-900/90 dark:text-amber-100/90">
          Set <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">DATABASE_URL</code>, run{" "}
          <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">npx prisma db push</code> and{" "}
          <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/50">npm run db:seed</code> to enable admin
          inventory, users, and audit storage. Customer search can still use mock or Supabase connectors.
        </p>
      </div>
    );
  }

  const [users, sources, jobs, audits, unreadAlerts] = await Promise.all([
    prisma.user.count(),
    prisma.dataSource.count(),
    prisma.syncJob.count(),
    prisma.auditLog.count(),
    prisma.adminAlert.count({ where: { readAt: null } }),
  ]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase text-slate-500">Users</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{users}</p>
        <Link href="/admin/users" className="mt-2 inline-block text-sm text-slate-600 underline dark:text-slate-400">
          Manage →
        </Link>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase text-slate-500">Data sources</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{sources}</p>
        <Link href="/admin/sources" className="mt-2 inline-block text-sm text-slate-600 underline dark:text-slate-400">
          Inventory →
        </Link>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase text-slate-500">Sync jobs</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{jobs}</p>
        <Link href="/admin/sync" className="mt-2 inline-block text-sm text-slate-600 underline dark:text-slate-400">
          View runs →
        </Link>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase text-slate-500">Audit events</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{audits}</p>
        <Link href="/admin/audit" className="mt-2 inline-block text-sm text-slate-600 underline dark:text-slate-400">
          Open log →
        </Link>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase text-slate-500">Open alerts</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-50">{unreadAlerts}</p>
        <Link href="/admin/management" className="mt-2 inline-block text-sm text-slate-600 underline dark:text-slate-400">
          Management →
        </Link>
      </div>
    </div>
  );
}
