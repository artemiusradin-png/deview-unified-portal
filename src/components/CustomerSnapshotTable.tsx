import Link from "next/link";
import type { SearchResultRow } from "@/types/customer";
import { maskPhoneDisplay } from "@/lib/mask-phone";

type Props = {
  rows: SearchResultRow[];
  emptyMessage: string;
  emptyMessageZh?: string;
};

/** Card list for small screens; full table from md and up. */
export function CustomerSnapshotTable({ rows, emptyMessage, emptyMessageZh }: Props) {
  const empty = (
    <>
      <span className="lang-en">{emptyMessage}</span>
      <span className="lang-zh">{emptyMessageZh ?? emptyMessage}</span>
    </>
  );

  return (
    <>
      <div className="md:hidden">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">{empty}</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={`/profile/${row.id}`}
                  className="flex items-center justify-between gap-3 py-2.5 active:bg-slate-50 dark:active:bg-slate-800/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{row.name}</p>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {row.idNumber}
                      <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
                      {row.companyUnit}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      row.blacklistFlag
                        ? "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-200"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {row.blacklistFlag ? (
                      <>
                        <span className="lang-en">Blacklist</span>
                        <span className="lang-zh">黑名單</span>
                      </>
                    ) : (
                      row.status
                    )}
                  </span>
                </Link>
              </li>
            ))}
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
            {rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-3 py-8 text-center text-sm text-slate-500">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.loanType}</td>
                  <td className="px-3 py-2 font-mono">{row.applicationNumber}</td>
                  <td className="px-3 py-2 font-mono">{row.loanNumber}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.applyDate}</td>
                  <td className="px-3 py-2 font-mono">{row.idNumber}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/profile/${row.id}`}
                      className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{row.age}</td>
                  <td className="px-3 py-2 max-w-[140px] truncate" title={row.job}>
                    {row.job}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                    {maskPhoneDisplay(row.mobile)}
                  </td>
                  <td className="px-3 py-2">{row.companyUnit}</td>
                  <td className="px-3 py-2">{row.partakerType}</td>
                  <td className="px-3 py-2">
                    {row.blacklistFlag ? (
                      <>
                        <span className="lang-en">Yes</span>
                        <span className="lang-zh">是</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{row.sourceSystem}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
