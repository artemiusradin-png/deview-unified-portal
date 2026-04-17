"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AssistantClient } from "@/components/AssistantClient";
import { langText, useLanguage } from "@/components/LanguageSwitcher";

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18.5 14.25a.75.75 0 01.68.433l.387.97a1.5 1.5 0 001.023 1.023l.97.387a.75.75 0 010 1.4l-.97.387a1.5 1.5 0 00-1.023 1.023l-.387.97a.75.75 0 01-1.4 0l-.387-.97a1.5 1.5 0 00-1.023-1.023l-.97-.387a.75.75 0 010-1.4l.97-.387a1.5 1.5 0 001.023-1.023l.387-.97a.75.75 0 01.72-.433z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function DashboardSearchWithAssistant() {
  const { isZh } = useLanguage();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <>
      <form
        action="/results"
        method="get"
        className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row sm:items-stretch sm:gap-3"
      >
        <input
          name="q"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          placeholder={langText(isZh, "HKID, phone, or name", "HKID、電話或姓名")}
          className="min-h-[48px] w-full min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none ring-slate-400 focus:ring-2 sm:max-w-xl sm:py-2.5 sm:text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <div className="flex min-h-[48px] w-full shrink-0 gap-2 sm:w-auto sm:min-h-0">
          <button
            type="submit"
            className="min-h-[48px] flex-1 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800 sm:min-h-0 sm:flex-initial sm:px-5 sm:py-2.5 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {langText(isZh, "Search", "搜尋")}
          </button>
          <button
            type="button"
            id={`${panelId}-trigger`}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
            className="group relative flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-violet-600 to-violet-700 px-3 py-3 text-sm font-semibold text-white shadow-md shadow-violet-600/25 ring-1 ring-violet-500/30 hover:from-violet-500 hover:to-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:min-h-0 sm:flex-initial sm:px-4 sm:py-2.5 dark:shadow-violet-900/40 dark:ring-violet-400/20"
          >
            <SparklesIcon className="size-4 shrink-0 opacity-95" />
            <span className="truncate sm:max-w-[9.5rem]">
              {open ? langText(isZh, "Hide assistant", "隱藏助手") : langText(isZh, "AI assistant", "AI 助手")}
            </span>
            <span
              className="absolute -right-0.5 -top-0.5 flex size-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950"
              aria-hidden
            />
          </button>
        </div>
      </form>

      <div
        id={panelId}
        role="region"
        aria-labelledby={`${panelId}-trigger`}
        hidden={!open}
        className="mt-4 rounded-xl border border-violet-200/80 bg-gradient-to-b from-white to-violet-50/40 p-4 shadow-sm dark:border-violet-900/50 dark:from-slate-900 dark:to-violet-950/20 sm:p-5"
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-violet-100 pb-3 dark:border-violet-900/40">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">
              {langText(isZh, "On this page", "此頁")}
            </p>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
              {isZh ? (
                <>
                  一般平台及需求問題。開啟{" "}
                  <Link
                    href="/assistant"
                    className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
                  >
                    客戶檔案 → 助手
                  </Link>{" "}
                  後，回答會以該紀錄為依據。
                </>
              ) : (
                <>
                  General portal and discovery questions. Open a{" "}
                  <Link
                    href="/assistant"
                    className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300"
                  >
                    customer profile → assistant
                  </Link>{" "}
                  to ground answers on that record.
                </>
              )}
            </p>
          </div>
          <Link
            href="/assistant"
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {langText(isZh, "Full-screen tab", "全屏分頁")}
          </Link>
        </div>
        <AssistantClient initialContext={null} variant="embedded" />
      </div>
    </>
  );
}
