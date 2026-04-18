"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { AssistantClient } from "@/components/AssistantClient";
import { langText, useLanguage } from "@/components/LanguageSwitcher";

function AssistantIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5.75 6.75A2.75 2.75 0 018.5 4h7A2.75 2.75 0 0118.25 6.75v5.5A2.75 2.75 0 0115.5 15h-4.25l-3.58 3.06A.75.75 0 016.5 17.49V15A2.75 2.75 0 013.75 12.25v-5.5z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="M9 9.5h6M9 12h3.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 8l4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
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
            className={`group flex min-h-[48px] min-w-0 flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold shadow-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 sm:min-h-0 sm:flex-initial sm:px-3.5 sm:py-2.5 ${
              open
                ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800 dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500 dark:hover:bg-slate-800"
            }`}
          >
            <span
              className={`flex size-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold leading-none tracking-normal ${
                open
                  ? "border-white/20 bg-white/10 text-white dark:border-slate-900/15 dark:bg-slate-900/10 dark:text-slate-900"
                  : "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              }`}
              aria-hidden
            >
              AI
            </span>
            <AssistantIcon className="hidden size-4 shrink-0 opacity-80 sm:block" />
            <span className="truncate sm:max-w-[10.5rem]">
              {open ? langText(isZh, "Close assistant", "關閉助手") : langText(isZh, "AI assistant", "AI 助手")}
            </span>
            <ChevronIcon className={`size-4 shrink-0 opacity-70 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </form>

      <div
        id={panelId}
        role="region"
        aria-labelledby={`${panelId}-trigger`}
        hidden={!open}
        className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
      >
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <AssistantIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {langText(isZh, "AI assistant", "AI 助手")}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {langText(isZh, "General portal support", "一般平台支援")}
                </p>
              </div>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              {isZh ? (
                <>
                  可詢問平台及需求問題。由{" "}
                  <Link
                    href="/assistant"
                    className="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                  >
                    客戶檔案開啟助手
                  </Link>{" "}
                  後，回答會以該紀錄為依據。
                </>
              ) : (
                <>
                  Ask general portal and discovery questions. Launch it from a{" "}
                  <Link
                    href="/assistant"
                    className="font-medium text-slate-900 underline underline-offset-2 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                  >
                    customer profile
                  </Link>{" "}
                  to ground answers on that record.
                </>
              )}
            </p>
          </div>
          <Link
            href="/assistant"
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {langText(isZh, "Full-screen tab", "全屏分頁")}
          </Link>
        </div>
        <AssistantClient initialContext={null} variant="embedded" />
      </div>
    </>
  );
}
