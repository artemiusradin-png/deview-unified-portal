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
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
              <span className="lang-en">Search results</span>
              <span className="lang-zh">搜尋結果</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="lang-en">Query: </span>
              <span className="lang-zh">查詢：</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">{q || "—"}</span> · {rows.length}{" "}
              <span className="lang-en">match{rows.length === 1 ? "" : "es"}</span>
              <span className="lang-zh">個結果</span>
              {raw.length !== rows.length ? (
                <>
                  <span className="lang-en text-slate-500"> (filtered from {raw.length})</span>
                  <span className="lang-zh text-slate-500">（由 {raw.length} 筆篩選）</span>
                </>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              <span className="lang-en">Mobile numbers shown masked (leading digits only) per workshop notes.</span>
              <span className="lang-zh">按工作坊紀錄，手機號碼會被遮蔽（只顯示前段）。</span>
            </p>
          </div>
          <form
            action="/results"
            method="get"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-end lg:max-w-xl"
          >
            <input type="hidden" name="q" value={q} />
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium uppercase text-slate-500">
                <span className="lang-en">Age min</span>
                <span className="lang-zh">最低年齡</span>
              </label>
              <input
                name="ageMin"
                defaultValue={sp.ageMin}
                placeholder="e.g. 30"
                inputMode="numeric"
                className="min-h-[44px] w-full rounded border border-slate-300 bg-white px-2 py-2 text-base sm:w-20 sm:py-1.5 sm:text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[10px] font-medium uppercase text-slate-500">
                <span className="lang-en">Age max</span>
                <span className="lang-zh">最高年齡</span>
              </label>
              <input
                name="ageMax"
                defaultValue={sp.ageMax}
                placeholder="e.g. 65"
                inputMode="numeric"
                className="min-h-[44px] w-full rounded border border-slate-300 bg-white px-2 py-2 text-base sm:w-20 sm:py-1.5 sm:text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
              <label className="text-[10px] font-medium uppercase text-slate-500">
                <span className="lang-en">Job contains</span>
                <span className="lang-zh">職業包含</span>
              </label>
              <input
                name="job"
                defaultValue={sp.job}
                placeholder="e.g. Director"
                className="min-h-[44px] w-full rounded border border-slate-300 bg-white px-2 py-2 text-base sm:w-40 sm:py-1.5 sm:text-sm dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="col-span-2 flex flex-col gap-0.5 sm:col-span-1">
              <label className="text-[10px] font-medium uppercase text-slate-500">
                <span className="lang-en">Company / unit</span>
                <span className="lang-zh">公司 / 單位</span>
              </label>
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
              <span className="lang-en">Apply filters</span>
              <span className="lang-zh">套用篩選</span>
            </button>
          </form>
        </div>

        <form action="/results" method="get" className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Refine search / 調整搜尋"
            enterKeyHint="search"
            className="min-h-[48px] w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 sm:min-h-0 sm:max-w-md sm:py-2 sm:text-sm"
          />
          <button
            type="submit"
            className="min-h-[48px] shrink-0 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white sm:min-h-0 sm:py-2 dark:bg-slate-100 dark:text-slate-900"
          >
            <span className="lang-en">Go</span>
            <span className="lang-zh">搜尋</span>
          </button>
        </form>
      </div>

      <div className="mt-6">
        <CustomerSnapshotTable
          rows={rows}
          emptyMessage={
            q ? "No records match. Try another HKID, phone fragment, name, or adjust filters." : "Enter a search on the dashboard."
          }
          emptyMessageZh={q ? "沒有符合紀錄。請嘗試其他 HKID、電話片段、姓名，或調整篩選。" : "請先喺儀表板輸入搜尋。"}
        />
      </div>
    </div>
  );
}
