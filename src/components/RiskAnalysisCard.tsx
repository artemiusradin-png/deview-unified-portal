"use client";

import { computeBorrowerRisk } from "@/lib/borrower-risk";
import type { CustomerProfile } from "@/types/customer";

function badgeClass(level: string) {
  if (level === "Written Off" || level === "High Risk")
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  if (level === "Moderate Risk")
    return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
}

function scoreBarClass(level: string) {
  if (level === "Written Off" || level === "High Risk") return "bg-red-500";
  if (level === "Moderate Risk") return "bg-amber-400";
  return "bg-emerald-500";
}

export function RiskAnalysisCard({ profile }: { profile: CustomerProfile }) {
  const risk = computeBorrowerRisk(profile);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Risk Analysis</p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-slate-50">
            {profile.searchRow.name}
          </h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(risk.level)}`}>
          {risk.level}
        </span>
      </div>

      {/* Score bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Risk score</span>
          <span className="font-medium text-slate-700 dark:text-slate-300">{risk.score} / 100</span>
        </div>
        <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-2 rounded-full transition-all ${scoreBarClass(risk.level)}`}
            style={{ width: `${risk.score}%` }}
          />
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Recommendation</p>
        <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">{risk.recommendation}</p>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {/* Risk factors */}
        {risk.factors.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">Risk factors</p>
            <ul className="mt-1 space-y-1">
              {risk.factors.map((f, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="mt-px text-red-400">▲</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Strengths */}
        {risk.strengths.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">Strengths</p>
            <ul className="mt-1 space-y-1">
              {risk.strengths.map((s, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <span className="mt-px text-emerald-500">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Next actions */}
      {risk.nextActions.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Recommended next actions
          </p>
          <ol className="mt-1.5 space-y-1">
            {risk.nextActions.map((a, i) => (
              <li key={i} className="text-xs text-amber-900 dark:text-amber-200">
                {i + 1}. {a}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
