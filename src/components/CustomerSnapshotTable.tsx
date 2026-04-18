"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SearchResultRow } from "@/types/customer";
import { maskPhoneDisplay } from "@/lib/mask-phone";

type Props = {
  rows: SearchResultRow[];
  emptyMessage: string;
  emptyMessageZh?: string;
};

/** Card list for small screens; full table from md and up. */
export function CustomerSnapshotTable({ rows, emptyMessage, emptyMessageZh }: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const grouped = useMemo(() => {
    const byBorrower = new Map<string, SearchResultRow[]>();
    for (const row of rows) {
      const key = `${row.idNumber}::${row.name}`;
      const list = byBorrower.get(key) ?? [];
      list.push(row);
      byBorrower.set(key, list);
    }
    return [...byBorrower.entries()].map(([key, list]) => ({ key, primary: list[0], entries: list }));
  }, [rows]);

  const empty = (
    <>
      <span className="lang-en">{emptyMessage}</span>
      <span className="lang-zh">{emptyMessageZh ?? emptyMessage}</span>
    </>
  );

  return (
    <>
      <div className="md:hidden">
        {grouped.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">{empty}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {grouped.map(({ key, primary, entries }) => {
              const open = openGroups[key] ?? false;
              const hasMultiple = entries.length > 1;
              return (
              <li key={key}>
                <Link
                  href={`/profile/${primary.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 active:bg-slate-50 dark:active:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{primary.name}</p>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {primary.idNumber}
                      <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                      {primary.companyUnit}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      primary.blacklistFlag
                        ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {primary.blacklistFlag ? (
                      <>
                        <span className="lang-en">Blacklist</span>
                        <span className="lang-zh">黑名單</span>
                      </>
                    ) : (
                      primary.status
                    )}
                  </span>
                </Link>
                {hasMultiple ? (
                  <div className="pb-2">
                    <button
                      type="button"
                      onClick={() => setOpenGroups((prev) => ({ ...prev, [key]: !open }))}
                      className="text-xs text-slate-600 underline"
                    >
                      {open ? "Hide company/loan groups" : `Open toggle list (${entries.length} entries)`}
                    </button>
                    {open ? (
                      <ul className="mt-1 space-y-1">
                        {entries.map((entry) => (
                          <li key={entry.id} className="rounded border border-slate-100 px-2 py-1 text-xs dark:border-slate-800">
                            <Link href={`/profile/${entry.id}`} className="font-medium underline-offset-2 hover:underline">
                              {entry.companyUnit} · {entry.loanNumber}
                            </Link>
                            <span className="ml-2 text-slate-500">{entry.status}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            )})}
          </ul>
        )}
      </div>

      <div
        className="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white [-webkit-overflow-scrolling:touch] dark:border-slate-800 dark:bg-slate-900"
        role="region"
        aria-label="Client table"
      >
        <table className="min-w-[56rem] text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2"><span className="lang-en">Status</span><span className="lang-zh">狀態</span></th>
              <th className="px-3 py-2"><span className="lang-en">Loan type</span><span className="lang-zh">貸款類型</span></th>
              <th className="px-3 py-2"><span className="lang-en">Application #</span><span className="lang-zh">申請編號</span></th>
              <th className="px-3 py-2"><span className="lang-en">Loan #</span><span className="lang-zh">貸款編號</span></th>
              <th className="px-3 py-2"><span className="lang-en">Apply date</span><span className="lang-zh">申請日期</span></th>
              <th className="px-3 py-2">HKID / ID</th>
              <th className="px-3 py-2"><span className="lang-en">Name</span><span className="lang-zh">姓名</span></th>
              <th className="px-3 py-2"><span className="lang-en">Age</span><span className="lang-zh">年齡</span></th>
              <th className="px-3 py-2"><span className="lang-en">Job</span><span className="lang-zh">職業</span></th>
              <th className="px-3 py-2"><span className="lang-en">Mobile</span><span className="lang-zh">手機</span></th>
              <th className="px-3 py-2"><span className="lang-en">Unit</span><span className="lang-zh">單位</span></th>
              <th className="px-3 py-2"><span className="lang-en">Partaker</span><span className="lang-zh">關係人</span></th>
              <th className="px-3 py-2">BL</th>
              <th className="px-3 py-2"><span className="lang-en">Source</span><span className="lang-zh">來源</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            {grouped.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-3 py-8 text-center text-sm text-slate-500">
                  {empty}
                </td>
              </tr>
            ) : (
              grouped.flatMap(({ key, primary, entries }) => {
                const hasMultiple = entries.length > 1;
                const open = openGroups[key] ?? false;
                const base = (
                  <tr key={primary.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2">{primary.status}</td>
                    <td className="px-3 py-2">{primary.loanType}</td>
                    <td className="px-3 py-2 font-mono">{primary.applicationNumber}</td>
                    <td className="px-3 py-2 font-mono">{primary.loanNumber}</td>
                    <td className="px-3 py-2 whitespace-nowrap">{primary.applyDate}</td>
                    <td className="px-3 py-2 font-mono">{primary.idNumber}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/profile/${primary.id}`}
                        className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
                      >
                        {primary.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2">{primary.age}</td>
                    <td className="px-3 py-2 max-w-[140px] truncate" title={primary.job}>
                      {primary.job}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                      {maskPhoneDisplay(primary.mobile)}
                    </td>
                    <td className="px-3 py-2">{primary.companyUnit}</td>
                    <td className="px-3 py-2">{primary.partakerType}</td>
                    <td className="px-3 py-2">
                      {primary.blacklistFlag ? (
                        <>
                          <span className="lang-en">Yes</span>
                          <span className="lang-zh">是</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{primary.sourceSystem}</td>
                  </tr>
                );
                const toggler = hasMultiple ? (
                  <tr key={`${key}-toggle`} className="bg-slate-50/60 text-[11px] dark:bg-slate-800/30">
                    <td colSpan={14} className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => setOpenGroups((prev) => ({ ...prev, [key]: !open }))}
                        className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-white dark:border-slate-600 dark:hover:bg-slate-800"
                      >
                        {open ? "Hide grouped loans" : `Open toggle list (${entries.length} company/loan rows)`}
                      </button>
                    </td>
                  </tr>
                ) : null;
                const children =
                  hasMultiple && open
                    ? entries.map((entry) => (
                        <tr key={`${key}-${entry.id}`} className="bg-slate-50/30 text-[11px] dark:bg-slate-800/20">
                          <td className="px-3 py-2" colSpan={2}>
                            {entry.status}
                          </td>
                          <td className="px-3 py-2 font-mono">{entry.applicationNumber}</td>
                          <td className="px-3 py-2 font-mono">{entry.loanNumber}</td>
                          <td className="px-3 py-2">{entry.applyDate}</td>
                          <td className="px-3 py-2 font-mono">{entry.idNumber}</td>
                          <td className="px-3 py-2">
                            <Link href={`/profile/${entry.id}`} className="underline-offset-2 hover:underline">
                              {entry.companyUnit}
                            </Link>
                          </td>
                          <td className="px-3 py-2">{entry.age}</td>
                          <td className="px-3 py-2">{entry.job}</td>
                          <td className="px-3 py-2">{maskPhoneDisplay(entry.mobile)}</td>
                          <td className="px-3 py-2">{entry.companyUnit}</td>
                          <td className="px-3 py-2">{entry.partakerType}</td>
                          <td className="px-3 py-2">{entry.blacklistFlag ? "Yes" : "—"}</td>
                          <td className="px-3 py-2">{entry.sourceSystem}</td>
                        </tr>
                      ))
                    : [];
                return [base, ...(toggler ? [toggler] : []), ...children];
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
