"use client";

import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoutButton } from "@/components/LogoutButton";

const mobileNavLink =
  "shrink-0 rounded-md px-2 py-1.5 text-xs font-medium text-slate-700 active:bg-slate-100 dark:text-slate-200 dark:active:bg-slate-800 min-h-[36px] flex items-center";

type Props = {
  isAdmin: boolean;
  children: React.ReactNode;
};

export function PortalShell({ isAdmin, children }: Props) {
  const [sidebarHidden, setSidebarHidden] = useState(false);

  return (
    <div className="relative flex h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <button
        type="button"
        onClick={() => setSidebarHidden((v) => !v)}
        aria-label={sidebarHidden ? "Show sidebar menu" : "Hide sidebar menu"}
        className={`sidebar-toggle hidden items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 shadow-sm transition-[left,background-color,border-color] duration-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 md:flex ${!sidebarHidden ? "active" : ""}`}
        style={{ left: sidebarHidden ? "0.5rem" : "12rem" }}
      >
        <svg className={`ham hamRotate ham4 ${!sidebarHidden ? "active" : ""}`} viewBox="0 0 100 100" width="28" aria-hidden>
          <path className="line top" d="m 70,33 h -40 c 0,0 -8.5,-0.149796 -8.5,8.5 0,8.649796 8.5,8.5 8.5,8.5 h 20 v -20" />
          <path className="line middle" d="m 70,50 h -40" />
          <path className="line bottom" d="m 30,67 h 40 c 0,0 8.5,0.149796 8.5,-8.5 0,-8.649796 -8.5,-8.5 -8.5,-8.5 h -20 v 20" />
        </svg>
      </button>
      {!sidebarHidden ? (
        <aside className="hidden h-screen w-52 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex md:flex-col">
          <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            <p className="text-sm font-semibold leading-tight">
              <span className="lang-en">Data Portal</span>
              <span className="lang-zh">數據平台</span>
            </p>
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
              Powered by{" "}
              <a
                href="https://deviewai.com"
                target="_blank"
                rel="noreferrer"
                className="text-inherit no-underline hover:text-inherit"
              >
                DeView
              </a>
            </p>
          </div>
          <nav className="flex flex-1 flex-col gap-1 p-3 text-sm">
            <Link
              href="/"
              className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="lang-en">Dashboard</span>
              <span className="lang-zh">儀表板</span>
            </Link>
            <Link
              href="/results?q="
              className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="lang-en">Last results</span>
              <span className="lang-zh">最近結果</span>
            </Link>
            <Link
              href="/assistant"
              className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="lang-en">AI assistant</span>
              <span className="lang-zh">AI 助手</span>
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                className="rounded-md px-2 py-1.5 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span className="lang-en">Admin</span>
                <span className="lang-zh">管理</span>
              </Link>
            ) : null}
          </nav>
          <div className="space-y-3 border-t border-slate-200 p-3 dark:border-slate-800">
            <LanguageSwitcher />
            <LogoutButton />
          </div>
        </aside>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
          <div className="flex items-center justify-between gap-2 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))] md:hidden">
            <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
              <span className="lang-en">Data Portal</span>
              <span className="lang-zh">數據平台</span>
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher />
              <LogoutButton compact />
            </div>
          </div>
          <nav
            className="flex gap-1 overflow-x-auto border-t border-slate-100 px-2 py-1.5 dark:border-slate-800 md:hidden"
            aria-label="Main navigation"
          >
            <Link href="/" className={mobileNavLink}>
              <span className="lang-en">Home</span>
              <span className="lang-zh">首頁</span>
            </Link>
            <Link href="/results?q=" className={mobileNavLink}>
              <span className="lang-en">Results</span>
              <span className="lang-zh">結果</span>
            </Link>
            <Link href="/assistant" className={mobileNavLink}>
              <span className="lang-en">Assistant</span>
              <span className="lang-zh">助手</span>
            </Link>
            {isAdmin ? (
              <Link href="/admin" className={mobileNavLink}>
                <span className="lang-en">Admin</span>
                <span className="lang-zh">管理</span>
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
