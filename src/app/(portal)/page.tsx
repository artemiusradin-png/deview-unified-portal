import Link from "next/link";
import { headers } from "next/headers";
import { CustomerSnapshotTable } from "@/components/CustomerSnapshotTable";
import { DashboardSearchWithAssistant } from "@/components/DashboardSearchWithAssistant";
import { NeedsAttentionQueue } from "@/components/NeedsAttentionQueue";
import { writeAudit } from "@/lib/audit";
import { getServerSession } from "@/lib/auth-session";
import { listAllCustomers } from "@/lib/portal-data";

export default async function SearchHomePage() {
  const allRows = await listAllCustomers();

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
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_min(100%,20rem)] lg:items-start lg:gap-8">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl dark:text-slate-50">
            <span className="lang-en">Dashboard</span>
            <span className="lang-zh">儀表板</span>
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400">
            <span className="lang-en">
              Unified borrower view for{" "}
              <strong className="font-medium text-slate-800 dark:text-slate-200">deviewai.com</strong> — search once by{" "}
              <strong>HKID/ID</strong>, phone, or name; open a single profile combining internal sources (apply, partakers,
              credit, documents, financials, loan &amp; partaking history, approval, repayment, OCA/write-off). Designed for{" "}
              <strong>desktop and mobile</strong>. Staff filters (age, job) and company-scoped data per discovery workshop.
            </span>
            <span className="lang-zh">
              為 <strong className="font-medium text-slate-800 dark:text-slate-200">deviewai.com</strong>{" "}
              提供統一借款人視圖，只需用 <strong>HKID/ID</strong>、電話或姓名搜尋一次，就可開啟整合內部資料來源嘅單一檔案
              （申請、關係人、信貸、文件、財務、貸款及參與紀錄、批核、還款、OCA/撇帳）。支援 <strong>桌面及手機</strong>
              ，並按工作坊要求提供員工篩選（年齡、職業）及公司範圍資料。
            </span>
          </p>
          <p className="mt-2 text-[13px] text-slate-600 sm:mt-3 sm:text-sm dark:text-slate-400">
            <span className="lang-en">
              Use the <strong className="font-medium text-slate-800 dark:text-slate-200">AI assistant</strong> beside global
              search below, or open the{" "}
              <Link href="/assistant" className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100">
                dedicated tab
              </Link>
              . Borrower-specific answers are grounded when you start the assistant from a customer profile.
            </span>
            <span className="lang-zh">
              可使用下方全域搜尋旁邊嘅 <strong className="font-medium text-slate-800 dark:text-slate-200">AI 助手</strong>
              ，或開啟{" "}
              <Link href="/assistant" className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100">
                專用分頁
              </Link>
              。如由客戶檔案啟動助手，回答會以該借款人紀錄為依據。
            </span>
          </p>
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-3 text-[13px] shadow-sm sm:p-4 sm:text-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">
            <span className="lang-en">Discovery checklist (from client Q&amp;A)</span>
            <span className="lang-zh">需求確認清單（客戶問答）</span>
          </h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><span className="lang-en">List all DBs to combine — names, formats, locations, screenshots.</span><span className="lang-zh">列出所有需要整合嘅資料庫，包括名稱、格式、位置及截圖。</span></li>
            <li><span className="lang-en">Daily manual updates today; working-day refresh target for MVP.</span><span className="lang-zh">現時每日人手更新；MVP 目標為工作日更新。</span></li>
            <li><span className="lang-en">Third-party data via email/Excel; internal formats aligned on HKID.</span><span className="lang-zh">第三方資料經電郵 / Excel 提供；內部格式以 HKID 對齊。</span></li>
            <li><span className="lang-en">Phone masking (leading digits); optional fixed-IP / company device access.</span><span className="lang-zh">電話號碼遮蔽（只顯示前段）；可選固定 IP / 公司裝置存取。</span></li>
            <li><span className="lang-en">Search audit: track who searched what (foundation in place for logging).</span><span className="lang-zh">搜尋審計：記錄邊個搜尋咗咩（已具備記錄基礎）。</span></li>
          </ul>
        </aside>
      </div>

      <div className="mt-0 pt-1">
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

        <NeedsAttentionQueue rows={allRows} />

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
