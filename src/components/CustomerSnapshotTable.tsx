import Link from "next/link";
import type { SearchResultRow } from "@/types/customer";
import { maskPhoneDisplay } from "@/lib/mask-phone";

type Props = {
  rows: SearchResultRow[];
  emptyMessage: string;
};

/** Card list for small screens; full table from md and up. */
export function CustomerSnapshotTable({ rows, emptyMessage }: Props) {
  return (
    <>
      <div className="md:hidden">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">{emptyMessage}</p>
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
                    {row.blacklistFlag ? "Blacklist" : row.status}
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
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Loan type</th>
              <th className="px-3 py-2">Application #</th>
              <th className="px-3 py-2">Loan #</th>
              <th className="px-3 py-2">Apply date</th>
              <th className="px-3 py-2">HKID / ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Age</th>
              <th className="px-3 py-2">Job</th>
              <th className="px-3 py-2">Mobile</th>
              <th className="px-3 py-2">Unit</th>
              <th className="px-3 py-2">Partaker</th>
              <th className="px-3 py-2">BL</th>
              <th className="px-3 py-2">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-3 py-8 text-center text-sm text-slate-500">
                  {emptyMessage}
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
                  <td className="px-3 py-2">{row.blacklistFlag ? "Yes" : "—"}</td>
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
