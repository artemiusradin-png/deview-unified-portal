import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { getServerSession } from "@/lib/auth-session";
import { isAdminRole } from "@/lib/rbac";

const mobileNavLink =
  "shrink-0 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 active:bg-slate-100 dark:text-slate-200 dark:active:bg-slate-800 min-h-[44px] flex items-center";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();

  return (
    <div className="flex min-h-full flex-1 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="hidden w-52 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex md:flex-col">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">DeView</p>
          <p className="text-sm font-semibold leading-tight">Data Portal</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
          <Link
            href="/"
            className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Dashboard
          </Link>
          <Link
            href="/results?q="
            className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Last results
          </Link>
          <Link
            href="/assistant"
            className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            AI assistant
          </Link>
          {session && isAdminRole(session.role) ? (
            <Link
              href="/admin"
              className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Admin
            </Link>
          ) : null}
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">Data Portal</span>
            <LogoutButton compact />
          </div>
          <nav
            className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 py-1.5 dark:border-slate-800"
            aria-label="Main navigation"
          >
            <Link href="/" className={mobileNavLink}>
              Home
            </Link>
            <Link href="/results?q=" className={mobileNavLink}>
              Results
            </Link>
            <Link href="/assistant" className={mobileNavLink}>
              Assistant
            </Link>
            {session && isAdminRole(session.role) ? (
              <Link href="/admin" className={mobileNavLink}>
                Admin
              </Link>
            ) : null}
          </nav>
        </header>
        <div className="flex-1 px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-4 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
