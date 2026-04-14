import Link from "next/link";
import { searchCustomers } from "@/lib/mock-data";

type Props = { searchParams: Promise<{ q?: string }> };

export default async function ResultsPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const rows = searchCustomers(q);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Search results</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Query: <span className="font-mono text-slate-800 dark:text-slate-200">{q || "—"}</span> · {rows.length}{" "}
            match{rows.length === 1 ? "" : "es"}
          </p>
        </div>
        <form action="/results" method="get" className="flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Refine search…"
            className="w-full min-w-[200px] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 sm:w-64"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Go
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Loan type</th>
              <th className="px-3 py-2">Application #</th>
              <th className="px-3 py-2">Loan #</th>
              <th className="px-3 py-2">Apply date</th>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Mobile</th>
              <th className="px-3 py-2">Partaker</th>
              <th className="px-3 py-2">BL</th>
              <th className="px-3 py-2">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-3 py-8 text-center text-sm text-slate-500">
                  No records. Enter an ID, phone fragment, or name on the search page.
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
                    <Link href={`/profile/${row.id}`} className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100">
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.mobile}</td>
                  <td className="px-3 py-2">{row.partakerType}</td>
                  <td className="px-3 py-2">{row.blacklistFlag ? "Yes" : "—"}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{row.sourceSystem}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
