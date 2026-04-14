import Link from "next/link";

export default function SearchHomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Unified borrower view for <strong className="font-medium text-slate-800 dark:text-slate-200">deviewai.com</strong>
          — search once by <strong>HKID/ID</strong>, phone, or name; open a single profile combining internal sources
          (apply, partakers, credit, documents, financials, loan &amp; partaking history, approval, repayment, OCA/write-off).
          Designed for <strong>desktop and mobile</strong>. Staff filters (age, job) and company-scoped data per discovery
          workshop.
        </p>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Use the{" "}
          <Link href="/assistant" className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100">
            AI assistant
          </Link>{" "}
          for natural-language questions on a borrower record (e.g. which unit holds the facility, repayment status) —
          grounded on the open profile when you launch it from a customer page.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Global search</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">HKID / ID, phone number, or name (sample data).</p>
        <form action="/results" method="get" className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            name="q"
            type="search"
            placeholder="e.g. S1234567A, +659123…, Tan Wei Ming"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Search
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-500">
          Sample: <Link href="/results?q=Tan">Tan</Link>, <Link href="/results?q=S1234567A">S1234567A</Link>,{" "}
          <Link href="/results?q=blacklist">blacklist</Link>.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-50">Discovery checklist (from client Q&amp;A)</h2>
        <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600 dark:text-slate-400">
          <li>List all DBs to combine — names, formats, locations, screenshots.</li>
          <li>Daily manual updates today; working-day refresh target for MVP.</li>
          <li>Third-party data via email/Excel; internal formats aligned on HKID.</li>
          <li>Phone masking (leading digits); optional fixed-IP / company device access.</li>
          <li>Search audit: track who searched what (foundation in place for logging).</li>
        </ul>
      </div>
    </div>
  );
}
