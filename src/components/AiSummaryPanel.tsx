"use client";

import { useState } from "react";

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

type Props = { customerId: string };

function badgeClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("written off") || s.includes("high"))
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  if (s.includes("moderate"))
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
}

export function AiSummaryPanel({ customerId }: Props) {
  const [card, setCard] = useState<StructuredCard | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setCard(null);
    setFallback(null);
    try {
      const res = await fetch("/api/ai-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json() as { structured?: StructuredCard; summary?: string; error?: string };
      if (!res.ok) {
        if (res.status === 503) {
          setError("AI summaries are unavailable — check OPENAI_API_KEY on the server.");
          return;
        }
        setError(typeof data.error === "string" ? data.error : "Request failed");
        return;
      }
      if (data.structured) {
        setCard(data.structured);
      } else if (data.summary) {
        setFallback(data.summary);
      }
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
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI case analysis</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            LLM analysis grounded on this record — risk, repayment, approvals, OCA.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {loading ? "Analysing…" : card ? "Refresh" : "Generate AI analysis"}
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700 dark:text-red-400">{error}</p> : null}

      {/* Structured card */}
      {card ? (
        <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
          {/* Heading + badge */}
          <div className="flex items-start justify-between gap-2">
            <strong className="text-sm text-slate-900 dark:text-slate-50">{card.heading}</strong>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass(card.overallStatus)}`}>
              {card.overallStatus}
            </span>
          </div>

          {/* Recommendation + confidence */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wide text-slate-400" style={{ fontSize: "10px" }}>Recommendation</p>
              <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{card.recommendation}</p>
            </div>
            <div>
              <p className="font-semibold uppercase tracking-wide text-slate-400" style={{ fontSize: "10px" }}>Confidence</p>
              <p className="mt-0.5 font-medium text-slate-800 dark:text-slate-200">{card.confidence}</p>
            </div>
          </div>

          {/* Bullet findings */}
          {card.bullets.length > 0 && (
            <ul className="space-y-1 border-t border-slate-100 pt-2 dark:border-slate-800">
              {card.bullets.map((b, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <span className="mt-px text-slate-400">•</span>
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* Next actions */}
          {card.nextActions.length > 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/30">
              <p className="mb-1 font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400" style={{ fontSize: "10px" }}>
                Recommended next actions
              </p>
              <ol className="space-y-0.5">
                {card.nextActions.map((a, i) => (
                  <li key={i} className="text-xs text-amber-900 dark:text-amber-200">
                    {i + 1}. {a}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Review note + sources */}
          <div className="border-t border-slate-100 pt-2 dark:border-slate-800">
            <p className="text-xs italic text-slate-500">{card.reviewNote}</p>
            {card.sources.length > 0 && (
              <p className="mt-0.5 text-slate-400" style={{ fontSize: "10px" }}>
                Sources: {card.sources.join(", ")}
              </p>
            )}
          </div>
        </div>
      ) : fallback ? (
        <div className="mt-3 whitespace-pre-wrap rounded-md border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200">
          {fallback}
        </div>
      ) : null}
    </section>
  );
}
