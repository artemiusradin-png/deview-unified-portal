import Link from "next/link";
import { headers } from "next/headers";
import { CustomerSnapshotTable } from "@/components/CustomerSnapshotTable";
import { DashboardSearchWithAssistant } from "@/components/DashboardSearchWithAssistant";
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
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl dark:text-slate-50">Dashboard</h1>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600 sm:text-sm dark:text-slate-400">
            Unified borrower view for <strong className="font-medium text-slate-800 dark:text-slate-200">deviewai.com</strong>
            — search once by <strong>HKID/ID</strong>, phone, or name; open a single profile combining internal sources
            (apply, partakers, credit, documents, financials, loan &amp; partaking history, approval, repayment, OCA/write-off).
            Designed for <strong>desktop and mobile</strong>. Staff filters (age, job) and company-scoped data per discovery
            workshop.
          </p>
          <p className="mt-2 text-[13px] text-slate-600 sm:mt-3 sm:text-sm dark:text-slate-400">
            Use the <strong className="font-medium text-slate-800 dark:text-slate-200">AI assistant</strong> beside global
            search below, or open the{" "}
            <Link href="/assistant" className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100">
              dedicated tab
            </Link>
            . Borrower-specific answers are grounded when you start the assistant from a customer profile.
          </p>
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-3 text-[13px] shadow-sm sm:p-4 sm:text-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="font-semibold text-slate-900 dark:text-slate-50">Discovery checklist (from client Q&amp;A)</h2>
          <ul className="mt-2 list-inside list-disc space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>List all DBs to combine — names, formats, locations, screenshots.</li>
            <li>Daily manual updates today; working-day refresh target for MVP.</li>
            <li>Third-party data via email/Excel; internal formats aligned on HKID.</li>
            <li>Phone masking (leading digits); optional fixed-IP / company device access.</li>
            <li>Search audit: track who searched what (foundation in place for logging).</li>
          </ul>
        </aside>
      </div>

      <div className="mt-0 pt-1">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Global search</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">HKID / ID, phone number, or name (sample data).</p>
        <DashboardSearchWithAssistant />
        <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:mt-3">
          Sample: <Link href="/results?q=Tan">Tan</Link>, <Link href="/results?q=S1234567A">S1234567A</Link>,{" "}
          <Link href="/results?q=blacklist">blacklist</Link>.
        </p>

        <section className="mt-5 space-y-2 sm:mt-6" aria-label="All clients">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">All clients</h2>
            <p className="text-[11px] text-slate-500 sm:text-xs">
              {allRows.length} record{allRows.length === 1 ? "" : "s"}
              <span className="hidden sm:inline"> (sorted by name; large sources may be capped at 500)</span>
            </p>
          </div>
          <p className="text-[11px] text-slate-500 sm:text-xs">
            <span className="hidden sm:inline">Mobile numbers shown masked. </span>
            Tap a card to open the profile.
          </p>
          <CustomerSnapshotTable rows={allRows} emptyMessage="No client records available from the current data source." />
        </section>
      </div>
    </div>
  );
}
