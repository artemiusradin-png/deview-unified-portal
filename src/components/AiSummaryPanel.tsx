"use client";

import { useState } from "react";

type Props = { customerId: string };

export function AiSummaryPanel({ customerId }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "missing_api_key") {
          setError(
            "OpenAI key is not configured on the server. Add OPENAI_API_KEY in .env.local (local) or Vercel → Settings → Environment Variables.",
          );
          return;
        }
        setError(data.message ?? data.error ?? "Request failed");
        return;
      }
      setSummary(data.summary as string);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI case summary</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Uses ChatGPT on the server from consolidated record fields (demo).
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {loading ? "Generating…" : "Generate summary"}
        </button>
      </div>
      {error ? (
        <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p>
      ) : null}
      {summary ? (
        <div className="mt-3 whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200">
          {summary}
        </div>
      ) : null}
    </section>
  );
}
