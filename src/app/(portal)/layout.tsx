import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
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
            Search
          </Link>
          <Link
            href="/results?q="
            className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Last results
          </Link>
        </nav>
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <LogoutButton />
        </div>
      </aside>
      <div className="flex min-h-full flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <span className="text-sm font-semibold">Data Portal</span>
          <div className="w-24">
            <LogoutButton />
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
