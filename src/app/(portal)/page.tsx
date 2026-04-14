import Link from "next/link";

export default function SearchHomePage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Global search</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Search by ID number, phone, name, application or loan number (sample data).
      </p>
      <form action="/results" method="get" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          type="search"
          placeholder="e.g. Tan Wei Ming, S1234567A, +6591234410"
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          Search
        </button>
      </form>
      <p className="mt-6 text-xs text-slate-500">
        MVP scaffold: unified read model and modules per PRD. Replace mock data with your operational store and connectors.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        Try sample queries: <Link href="/results?q=Tan">Tan</Link>,{" "}
        <Link href="/results?q=S1234567A">S1234567A</Link>,{" "}
        <Link href="/results?q=blacklist">blacklist</Link>.
      </p>
    </div>
  );
}
