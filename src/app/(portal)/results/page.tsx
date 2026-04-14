import Link from "next/link";
import { filterSearchRows, searchCustomers, type ResultFilters } from "@/lib/mock-data";
import { maskPhoneDisplay } from "@/lib/mask-phone";

type Props = {
  searchParams: Promise<{ q?: string; ageMin?: string; ageMax?: string; job?: string; company?: string }>;
};

export default async function ResultsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const filters: ResultFilters = {
    ageMin: sp.ageMin,
    ageMax: sp.ageMax,
    job: sp.job,
    company: sp.company,
  };
  const raw = searchCustomers(q);
  const rows = filterSearchRows(raw, filters);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Search results</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Query: <span className="font-mono text-slate-800 dark:text-slate-200">{q || "—"}</span> · {rows.length}{" "}
              match{rows.length === 1 ? "" : "es"}
              {raw.length !== rows.length ? (
                <span className="text-slate-500"> (filtered from {raw.length})</span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-slate-500">Mobile numbers shown masked (leading digits only) per workshop notes.</p>
          </div>
          <form action="/results" method="get" className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="q" value={q} />
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium uppercase text-slate-500">Age min</label>
              <input
                name="ageMin"
                defaultValue={sp.ageMin}
                placeholder="e.g. 30"
                className="w-20 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium uppercase text-slate-500">Age max</label>
              <input
                name="ageMax"
                defaultValue={sp.ageMax}
                placeholder="e.g. 65"
                className="w-20 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium uppercase text-slate-500">Job contains</label>
              <input
                name="job"
                defaultValue={sp.job}
                placeholder="e.g. Director"
                className="w-32 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 sm:w-40"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium uppercase text-slate-500">Company / unit</label>
              <input
                name="company"
                defaultValue={sp.company}
                placeholder="e.g. Unit A"
                className="w-28 rounded border border-slate-300 bg-white px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-900 sm:w-32"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-slate-100 dark:text-slate-900"
            >
              Apply filters
            </button>
          </form>
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
                  {q ? "No records match. Try another HKID, phone fragment, name, or adjust filters." : "Enter a search on the dashboard."}
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
    </div>
  );
}
