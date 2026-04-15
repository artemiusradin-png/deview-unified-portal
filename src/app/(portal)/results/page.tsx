import { headers } from "next/headers";
import { CustomerSnapshotTable } from "@/components/CustomerSnapshotTable";
import { writeAudit } from "@/lib/audit";
import { getServerSession } from "@/lib/auth-session";
import { filterSearchRows, searchCustomers, type ResultFilters } from "@/lib/portal-data";

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
  const raw = await searchCustomers(q);
  const rows = filterSearchRows(raw, filters);

  const session = await getServerSession();
  const h = await headers();
  await writeAudit({
    userId: session?.userId,
    action: "search.page",
    resource: q || "(empty)",
    metadata: { resultCount: rows.length, filteredFrom: raw.length },
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  });

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
          <form
            action="/results"
            method="get"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end lg:max-w-xl"
          >
            <input type="hidden" name="q" value={q} />
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium uppercase text-slate-500">Age min</label>
              <input
                name="ageMin"
                defaultValue={sp.ageMin}
                placeholder="e.g. 30"
                inputMode="numeric"
                className="min-h-[44px] w-full rounded border border-slate-300 bg-white px-2 py-2 text-base sm:w-20 sm:py-1.5 sm:text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium uppercase text-slate-500">Age max</label>
              <input
                name="ageMax"
                defaultValue={sp.ageMax}
                placeholder="e.g. 65"
                inputMode="numeric"
                className="min-h-[44px] w-full rounded border border-slate-300 bg-white px-2 py-2 text-base sm:w-20 sm:py-1.5 sm:text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
              <label className="text-[10px] font-medium uppercase text-slate-500">Job contains</label>
              <input
                name="job"
                defaultValue={sp.job}
                placeholder="e.g. Director"
                className="min-h-[44px] w-full rounded border border-slate-300 bg-white px-2 py-2 text-base sm:w-40 sm:py-1.5 sm:text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
              <label className="text-[10px] font-medium uppercase text-slate-500">Company / unit</label>
              <input
                name="company"
                defaultValue={sp.company}
                placeholder="e.g. Unit A"
                className="min-h-[44px] w-full rounded border border-slate-300 bg-white px-2 py-2 text-base sm:w-32 sm:py-1.5 sm:text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <button
              type="submit"
              className="col-span-2 min-h-[44px] rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white sm:col-span-1 sm:w-auto dark:bg-slate-100 dark:text-slate-900"
            >
              Apply filters
            </button>
          </form>
        </div>

        <form action="/results" method="get" className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Refine search…"
            enterKeyHint="search"
            className="min-h-[48px] w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 sm:min-h-0 sm:max-w-md sm:py-2 sm:text-sm"
          />
          <button
            type="submit"
            className="min-h-[48px] shrink-0 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white sm:min-h-0 sm:py-2 dark:bg-slate-100 dark:text-slate-900"
          >
            Go
          </button>
        </form>
      </div>

      <div className="mt-6">
        <CustomerSnapshotTable
          rows={rows}
          emptyMessage={
            q ? "No records match. Try another HKID, phone fragment, name, or adjust filters." : "Enter a search on the dashboard."
          }
        />
      </div>
    </div>
  );
}
