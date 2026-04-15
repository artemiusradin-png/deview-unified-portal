import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { createUserAction } from "../actions";

export default async function AdminUsersPage() {
  if (!isDatabaseConfigured()) {
    return <p className="text-sm text-slate-600 dark:text-slate-400">Connect a database to manage users.</p>;
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Create user</h2>
        <form action={createUserAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-xs sm:col-span-2">
            <span className="text-slate-600 dark:text-slate-400">Email *</span>
            <input name="email" type="email" required className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs sm:col-span-2">
            <span className="text-slate-600 dark:text-slate-400">Password *</span>
            <input name="password" type="password" required className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Display name</span>
            <input name="name" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950" />
          </label>
          <label className="text-xs">
            <span className="text-slate-600 dark:text-slate-400">Role</span>
            <select name="role" className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950">
              <option value="STAFF">STAFF</option>
              <option value="VIEWER">VIEWER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900">
              Create
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Accounts</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-3 py-2 font-mono text-slate-800 dark:text-slate-200">{u.email}</td>
                  <td className="px-3 py-2">{u.name ?? "—"}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    {u.createdAt.toISOString().slice(0, 10)}
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
