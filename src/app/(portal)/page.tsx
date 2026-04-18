import Link from "next/link";
import { headers } from "next/headers";
import { CustomerSnapshotTable } from "@/components/CustomerSnapshotTable";
import { DashboardSearchWithAssistant } from "@/components/DashboardSearchWithAssistant";
import { NeedsAttentionQueue } from "@/components/NeedsAttentionQueue";
import { writeAudit } from "@/lib/audit";
import { getServerSession } from "@/lib/auth-session";
import { getProfileById, listAllCustomers } from "@/lib/portal-data";
import { computeBorrowerRisk } from "@/lib/borrower-risk";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { runDashboardRefreshAction } from "./actions";
import { isStaffOrAbove } from "@/lib/rbac";

export default async function SearchHomePage() {
  const allRows = await listAllCustomers();
  const scored = await Promise.all(
    allRows.map(async (row) => {
      const profile = await getProfileById(row.id);
      if (!profile) return [row.id, 0] as const;
      return [row.id, computeBorrowerRisk(profile).score] as const;
    }),
  );
  const priorities = Object.fromEntries(scored);
  const syncSource = isDatabaseConfigured()
    ? await prisma.dataSource.findFirst({
        where: { OR: [{ name: { contains: "TE Credit", mode: "insensitive" } }, { refreshFrequency: { contains: "daily", mode: "insensitive" } }] },
        orderBy: { updatedAt: "desc" },
      })
    : null;

  const session = await getServerSession();
  const h = await headers();
  await writeAudit({
    userId: session?.userId,
    action: "dashboard.list_all",
    metadata: { count: allRows.length },
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mt-0 pt-1">
        <section className="mb-4 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Company databases</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
            <li>
              <Link
                href="/results?q=&company=Company%20A"
                className="block rounded border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Company A
              </Link>
            </li>
            <li>
              <Link
                href="/results?q=&company=Company%20B"
                className="block rounded border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Company B
              </Link>
            </li>
            <li>
              <Link
                href="/results?q=&company=Company%20C"
                className="block rounded border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Company C
              </Link>
            </li>
            <li>
              <Link
                href="/results?q=&company=Company%20D"
                className="block rounded border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Company D
              </Link>
            </li>
            <li>
              <Link
                href="/results?q=&company=Gaosheng%20Finance%20Co.%2C%20Ltd."
                className="block rounded border border-slate-200 px-2.5 py-1.5 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Company E
              </Link>
            </li>
          </ul>
        </section>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
          <span className="lang-en">Global search</span>
          <span className="lang-zh">全域搜尋</span>
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          <span className="lang-en">HKID / ID, phone number, or name (sample data).</span>
          <span className="lang-zh">HKID / ID、電話號碼或姓名（示範資料）。</span>
        </p>
        <DashboardSearchWithAssistant />
        <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:mt-3">
          <span className="lang-en">Sample: </span>
          <span className="lang-zh">例子：</span>
          <Link href="/results?q=Tan">Tan</Link>, <Link href="/results?q=S1234567A">S1234567A</Link>,{" "}
          <Link href="/results?q=blacklist">blacklist</Link>.
        </p>

        {syncSource ? (
          <section className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">TE Credit sync status</p>
                <p className="text-slate-500">
                  Last sync: {syncSource.lastSyncAt ? syncSource.lastSyncAt.toISOString().replace("T", " ").slice(0, 19) : "never"} ·
                  status: {syncSource.lastSyncStatus ?? syncSource.status}
                </p>
              </div>
              {session && isStaffOrAbove(session.role) ? (
                <form action={runDashboardRefreshAction}>
                  <input type="hidden" name="sourceId" value={syncSource.id} />
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
                  >
                    Manual refresh
                  </button>
                </form>
              ) : null}
            </div>
          </section>
        ) : null}

        <NeedsAttentionQueue rows={allRows} priorities={priorities} />

        <section className="mt-5 space-y-2 sm:mt-6" aria-label="All clients">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              <span className="lang-en">All clients</span>
              <span className="lang-zh">所有客戶</span>
            </h2>
            <p className="text-[11px] text-slate-500 sm:text-xs">
              {allRows.length} record{allRows.length === 1 ? "" : "s"}
              <span className="lang-en"> (sorted by name; large sources may be capped at 500)</span>
              <span className="lang-zh"> 筆紀錄（按姓名排序；大型來源可能上限為 500）</span>
            </p>
          </div>
          <p className="text-[11px] text-slate-500 sm:text-xs">
            <span className="lang-en"><span className="hidden sm:inline">Mobile numbers shown masked. </span>Tap a card to open the profile.</span>
            <span className="lang-zh"><span className="hidden sm:inline">手機號碼會被遮蔽。 </span>點擊卡片開啟檔案。</span>
          </p>
          <CustomerSnapshotTable
            rows={allRows}
            emptyMessage="No client records available from the current data source."
            emptyMessageZh="目前資料來源未有可用客戶紀錄。"
          />
        </section>
      </div>
    </div>
  );
}
