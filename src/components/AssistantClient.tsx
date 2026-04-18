"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { langText, useLanguage } from "@/components/LanguageSwitcher";

type Msg = {
  role: "user" | "assistant";
  content: string;
  structured?: StructuredCard | null;
};

type StructuredCard = {
  heading: string;
  overallStatus: string;
  recommendation: string;
  confidence: string;
  bullets: string[];
  nextActions: string[];
  reviewNote: string;
  sources: string[];
};

const SUGGESTED = [
  { en: "Credit risk analysis", zh: "信貸風險分析" },
  { en: "Summarize repayment history and current status", zh: "總結還款紀錄及現況" },
  { en: "Missing documents checklist", zh: "缺失文件清單" },
  { en: "OCA / write-off exposure", zh: "OCA / 撇帳風險" },
  { en: "Approval blockers", zh: "批核阻礙" },
  { en: "Recommended next actions", zh: "建議下一步" },
];

const WELCOME_PROMPTS = [
  { en: "Check if this borrower has approval blockers", zh: "檢查此借款人是否有批核阻礙" },
  { en: "Summarize current exposure and repayment risk", zh: "總結現有風險及還款風險" },
  { en: "List the documents needed before review", zh: "列出審批前所需文件" },
];

type Props = {
  initialContext: string | null;
  customerLabel?: string;
  /** Compact layout for dashboard embed; omits page chrome. */
  variant?: "page" | "embedded";
};

function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("written off") || s.includes("high")) {
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  }
  if (s.includes("moderate")) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  }
  return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
}

function AssistantMark({ className }: { className?: string }) {
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

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3.25 10h12.5M11.25 5.5L15.75 10l-4.5 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function StructuredCardView({ card }: { card: StructuredCard }) {
  const { isZh } = useLanguage();

  return (
    <div className="mt-2 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <strong className="text-slate-900 dark:text-slate-50">{card.heading}</strong>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(card.overallStatus)}`}>
          {card.overallStatus}
        </span>
      </div>

      {/* Recommendation + confidence */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {langText(isZh, "Recommendation", "建議")}
          </p>
          <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{card.recommendation}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {langText(isZh, "Confidence", "信心度")}
          </p>
          <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{card.confidence}</p>
        </div>
      </div>

      {/* Bullets */}
      {card.bullets.length > 0 && (
        <ul className="space-y-1 border-t border-slate-200 pt-2 dark:border-slate-700">
          {card.bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-slate-700 dark:text-slate-300">
              <span className="mt-px text-slate-400">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Next actions */}
      {card.nextActions.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            {langText(isZh, "Recommended next actions", "建議下一步")}
          </p>
          <ol className="space-y-0.5 pl-1">
            {card.nextActions.map((a, i) => (
              <li key={i} className="text-xs text-amber-900 dark:text-amber-200">
                {i + 1}. {a}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Review note + sources */}
      <div className="space-y-1 border-t border-slate-200 pt-2 dark:border-slate-700">
        <p className="text-xs italic text-slate-500 dark:text-slate-400">{card.reviewNote}</p>
        {card.sources.length > 0 && (
          <p className="text-[10px] text-slate-400">
            {langText(isZh, "Sources", "來源")}: {card.sources.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

export function AssistantClient({ initialContext, customerLabel, variant = "page" }: Props) {
  const { isZh } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const context = initialContext ?? "";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setError(null);
      const next: Msg[] = [...messages, { role: "user", content: trimmed }];
      setMessages(next);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: next.map((m) => ({ role: m.role, content: m.content })),
            context: context || undefined,
          }),
        });
        const data = await res.json() as { reply?: string; structured?: StructuredCard; error?: string };
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Request failed");
          return;
        }
        setMessages([
          ...next,
          {
            role: "assistant",
            content: data.reply ?? "",
            structured: data.structured ?? null,
          },
        ]);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, context],
  );

  const embedded = variant === "embedded";
  const hasContext = Boolean(customerLabel);
  const hasMessages = messages.length > 0;

  return (
    <div className={embedded ? "flex w-full flex-col gap-3" : "mx-auto flex max-w-4xl flex-col gap-4"}>
      {!embedded ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <AssistantMark className="size-5" />
              </span>
              <div className="min-w-0">
                <Link href="/" className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
                  ← {langText(isZh, "Back to dashboard", "返回儀表板")}
                </Link>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  {langText(isZh, "AI assistant", "AI 助手")}
                </h1>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {langText(
                    isZh,
                    "Ask borrower review questions, summarize repayment history, and surface practical next actions from the portal data.",
                    "查詢借款人審查問題、總結還款紀錄，並根據平台資料整理可執行下一步。",
                  )}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                hasContext
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                  : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {hasContext ? langText(isZh, "Record attached", "已連接紀錄") : langText(isZh, "General mode", "一般模式")}
            </span>
          </div>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-300">
            {customerLabel ? (
              <>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{langText(isZh, "Context", "背景")}:</span>{" "}
                <span>{customerLabel}</span>{" "}
                <span className="text-slate-500 dark:text-slate-400">
                  {langText(isZh, "Replies use this record plus internal portal guidance.", "回答會使用此紀錄及內部平台指引。")}
                </span>
              </>
            ) : (
              langText(
                isZh,
                "Open the assistant from a customer profile to attach a borrower record. In general mode, answers are limited to portal workflow and discovery guidance.",
                "由客戶檔案開啟助手可連接借款人紀錄。一般模式只會回答平台流程及需求指引。",
              )
            )}
          </div>
        </div>
      ) : customerLabel ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {langText(isZh, "Context", "背景")}: <span className="font-medium">{customerLabel}</span>{" "}
          {langText(isZh, "— replies use this record only.", "— 回答只會使用此紀錄。")}
        </p>
      ) : null}

      {/* Prompt chips */}
      <div className={`flex flex-wrap gap-2 ${embedded ? "gap-1.5" : "rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"}`}>
        {SUGGESTED.map((s) => (
          <button
            key={s.en}
            type="button"
            onClick={() => send(s.en)}
            disabled={loading}
            className={
              embedded
                ? "rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1 text-left text-[11px] leading-snug text-slate-700 hover:bg-white disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 sm:text-xs"
                : "rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
            }
          >
            {langText(isZh, s.en, s.zh)}
          </button>
        ))}
      </div>

      {/* Message thread */}
      <div
        className={
          embedded
            ? "min-h-[220px] space-y-3 rounded-lg border border-slate-200/90 bg-white/90 p-3 dark:border-slate-700 dark:bg-slate-900/90 sm:min-h-[260px] sm:p-4"
            : "min-h-[380px] space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
        }
      >
        {!hasMessages && !loading && !error ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <span className="flex size-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <AssistantMark className="size-6" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-50">
              {langText(isZh, "Start a review conversation", "開始審查對話")}
            </h2>
            <p className="mt-1 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              {langText(
                isZh,
                "Use a suggested prompt or ask a direct question about risk, repayment history, missing documents, or next actions.",
                "使用建議提示，或直接詢問風險、還款紀錄、缺失文件及下一步。",
              )}
            </p>
            <div className="mt-4 grid w-full max-w-2xl gap-2 sm:grid-cols-3">
              {WELCOME_PROMPTS.map((prompt) => (
                <button
                  key={prompt.en}
                  type="button"
                  onClick={() => send(prompt.en)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium leading-relaxed text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {langText(isZh, prompt.en, prompt.zh)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((m, i) => (
          <div key={i} className={`flex text-sm leading-relaxed ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 sm:max-w-[78%] ${
                m.role === "user"
                  ? "rounded-br-md bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200"
              }`}
            >
              <p className={`mb-1 text-[11px] font-semibold ${m.role === "user" ? "text-white/70 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"}`}>
                {m.role === "user" ? langText(isZh, "You", "你") : langText(isZh, "Assistant", "助手")}
              </p>
              {m.role === "assistant" && m.structured ? (
                <StructuredCardView card={m.structured} />
              ) : (
                <span className="whitespace-pre-wrap">{m.content}</span>
              )}
            </div>
          </div>
        ))}
        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
              <span className="font-medium">{langText(isZh, "Assistant", "助手")}</span>
              <span className="ml-2 text-slate-400">{langText(isZh, "Thinking...", "思考中...")}</span>
            </div>
          </div>
        ) : null}
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <form
        className={embedded ? "flex flex-col gap-2 sm:flex-row" : "flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row"}
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={langText(isZh, "Ask about this borrower or the portal…", "查詢此借款人或平台…")}
          className={
            embedded
              ? "flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              : "min-h-[44px] flex-1 rounded-md border border-transparent bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 placeholder:text-slate-400 focus:bg-white focus:ring-2 dark:bg-slate-950 dark:text-slate-100 dark:focus:bg-slate-950"
          }
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className={
            embedded
              ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
              : "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          }
        >
          <span>{langText(isZh, "Send", "發送")}</span>
          <SendIcon className="size-4" />
        </button>
      </form>
    </div>
  );
}
