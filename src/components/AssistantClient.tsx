"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Is this HKID in our database, and which company or unit holds the borrowing?",
  "Summarize repayment history and current borrowing status.",
  "What approval stages and conditions appear on file?",
  "Any OCA or write-off items I should know about?",
];

type Props = {
  initialContext: string | null;
  customerLabel?: string;
};

export function AssistantClient({ initialContext, customerLabel }: Props) {
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
            messages: next,
            context: context || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(typeof data.error === "string" ? data.error : "Request failed");
          return;
        }
        setMessages([...next, { role: "assistant", content: data.reply as string }]);
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, context],
  );

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
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

      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            disabled={loading}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-left text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="min-h-[280px] space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Ask a question or tap a suggested prompt.</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm leading-relaxed ${m.role === "user" ? "text-slate-900 dark:text-slate-100" : "text-slate-700 dark:text-slate-300"}`}
            >
              <span className="font-semibold text-slate-500">{m.role === "user" ? "You" : "Assistant"}: </span>
              <span className="whitespace-pre-wrap">{m.content}</span>
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
