import Link from "next/link";
import type { SearchResultRow } from "@/types/customer";
import { scoreRowHeuristic } from "@/lib/ops";

type FlagLevel = "Written Off" | "High Risk" | "Watch";

function flagLevel(row: SearchResultRow): FlagLevel | null {
  if (row.blacklistFlag) return "High Risk";
  const s = row.status.toLowerCase();
  if (s.includes("write") || s.includes("written")) return "Written Off";
  if (
    s.includes("special mention") ||
    s.includes("watch") ||
    s.includes("npl") ||
    s.includes("restructur") ||
    s.includes("recovery")
  )
    return "Watch";
  return null;
}

function levelBadge(level: FlagLevel) {
  if (level === "Written Off")
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  if (level === "High Risk")
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
}

function reasonSnippet(row: SearchResultRow, level: FlagLevel): string {
  if (row.blacklistFlag) return "Internal blacklist flag active";
  if (level === "Written Off") return `Status: ${row.status}`;
  return `Status: ${row.status}`;
}

function reasonSnippetZh(row: SearchResultRow, level: FlagLevel): string {
  if (row.blacklistFlag) return "內部黑名單標記已啟用";
  if (level === "Written Off") return `狀態：${row.status}`;
  return `狀態：${row.status}`;
}

function levelLabelZh(level: FlagLevel) {
  if (level === "Written Off") return "已撇帳";
  if (level === "High Risk") return "高風險";
  return "觀察";
}

type Props = {
  rows: SearchResultRow[];
  priorities?: Record<string, number>;
};

export function NeedsAttentionQueue({ rows, priorities = {} }: Props) {
  const flagged = rows
    .map((r) => ({ row: r, level: flagLevel(r), score: priorities[r.id] ?? scoreRowHeuristic(r) }))
    .filter((x): x is { row: SearchResultRow; level: FlagLevel; score: number } => x.level !== null);
  flagged.sort((a, b) => b.score - a.score);

  if (flagged.length === 0) return null;

  return (
    <section className="mt-5 space-y-2 sm:mt-6" aria-label="Needs attention">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          <span className="lang-en">Needs attention</span>
          <span className="lang-zh">需要跟進</span>
          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
            {flagged.length}
          </span>
        </h2>
        <p className="text-[11px] text-slate-500 sm:text-xs">
          <span className="lang-en">Blacklisted, written-off, or watch-list borrowers.</span>
          <span className="lang-zh">黑名單、已撇帳或觀察名單借款人。</span>
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {flagged.map(({ row, level, score }) => (
          <Link
            key={row.id}
            href={`/profile/${row.id}`}
            className="group flex flex-col gap-1.5 rounded-lg border border-slate-200 bg-white p-3 transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 group-hover:underline dark:text-slate-50">
                  {row.name}
                </p>
                <p className="font-mono text-xs text-slate-500">{row.idNumber}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${levelBadge(level)}`}>
                <span className="lang-en">{level}</span>
                <span className="lang-zh">{levelLabelZh(level)}</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              <span className="lang-en">{reasonSnippet(row, level)}</span>
              <span className="lang-zh">{reasonSnippetZh(row, level)}</span>
            </p>
            <p className="text-[11px] text-slate-400">
              {row.loanType} · {row.companyUnit} · score {score}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
