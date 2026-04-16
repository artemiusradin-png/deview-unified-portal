"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

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
  "Credit risk analysis",
  "Summarize repayment history and current status",
  "Missing documents checklist",
  "OCA / write-off exposure",
  "Approval blockers",
  "Recommended next actions",
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

function StructuredCardView({ card }: { card: StructuredCard }) {
  return (
    <div className="mt-1 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800/60">
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
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Recommendation</p>
          <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{card.recommendation}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Confidence</p>
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
            Recommended next actions
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
            Sources: {card.sources.join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

export function AssistantClient({ initialContext, customerLabel, variant = "page" }: Props) {
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

  return (
    <div className={embedded ? "flex w-full flex-col gap-3" : "mx-auto flex max-w-2xl flex-col gap-4"}>
      {!embedded ? (
        <div>
          <Link href="/" className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400">
            ← Search
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-50">AI assistant</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Answers from your unified internal record when a profile is open, plus the discovery brief. Typical use: HKID /
            company / repayment questions (per client workshop).
          </p>
          {customerLabel ? (
            <p className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              Context: <span className="font-medium">{customerLabel}</span> — replies use this record only.
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Open the assistant from a customer profile to attach record JSON, or ask general questions about how the portal
              is meant to work.
            </p>
          )}
        </div>
      ) : customerLabel ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Context: <span className="font-medium">{customerLabel}</span> — replies use this record only.
        </p>
      ) : null}

      {/* Prompt chips */}
      <div className={`flex flex-wrap gap-2 ${embedded ? "gap-1.5" : ""}`}>
        {SUGGESTED.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={loading}
            className={
              embedded
                ? "rounded-full border border-slate-200/90 bg-white/90 px-2.5 py-1 text-left text-[11px] leading-snug text-slate-700 hover:bg-white disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800 sm:text-xs"
                : "rounded-full border border-slate-200 bg-white px-3 py-1 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* Message thread */}
      <div
        className={
          embedded
            ? "min-h-[220px] space-y-3 rounded-lg border border-slate-200/90 bg-white/90 p-3 dark:border-slate-700 dark:bg-slate-900/90 sm:min-h-[260px] sm:p-4"
            : "min-h-[280px] space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        }
      >
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Ask a question or tap a suggested prompt.</p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="text-sm leading-relaxed">
              <span className="font-semibold text-slate-500">{m.role === "user" ? "You" : "Assistant"}: </span>
              {m.role === "assistant" && m.structured ? (
                <StructuredCardView card={m.structured} />
              ) : (
                <span
                  className={`whitespace-pre-wrap ${m.role === "user" ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}
                >
                  {m.content}
                </span>
              )}
            </div>
          ))
        )}
        {loading ? <p className="text-xs text-slate-500">Thinking…</p> : null}
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this borrower or the portal…"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
        >
          Send
        </button>
      </form>
    </div>
  );
}
