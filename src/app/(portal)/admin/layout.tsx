import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth-session";
import { isAdminRole } from "@/lib/rbac";

export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session || !isAdminRole(session.role)) {
    redirect("/");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Administration</p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-50">Operations</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Signed in as <span className="font-mono text-slate-800 dark:text-slate-200">{session.email}</span>
        </p>
      </div>
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin"
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Overview
        </Link>
        <Link
          href="/admin/sources"
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Data sources
        </Link>
        <Link
          href="/admin/users"
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Users
        </Link>
        <Link
          href="/admin/audit"
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Audit log
        </Link>
        <Link
          href="/admin/sync"
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Sync jobs
        </Link>
        <Link
          href="/"
          className="rounded-md px-3 py-1.5 text-slate-600 underline-offset-2 hover:underline dark:text-slate-400"
        >
          ← Portal
        </Link>
      </nav>
      {children}
    </div>
  );
}
