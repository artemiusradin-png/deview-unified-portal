"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  /** null = still loading */
  const [databaseUsers, setDatabaseUsers] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/capabilities")
      .then((r) => r.json())
      .then((d: { databaseUsers?: boolean }) => setDatabaseUsers(!!d.databaseUsers))
      .catch(() => setDatabaseUsers(false));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    });
    setPending(false);
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      message?: string;
      hint?: string;
      retryAfter?: number;
    };
    if (!res.ok) {
      if (res.status === 503) {
        if (data.code === "ACCESS_CODE" || data.code === "AUTH_SECRET") {
          setError([data.message, data.hint].filter(Boolean).join(" "));
          return;
        }
        setError(data.message ?? "Server configuration error. Check AUTH_SECRET and DATABASE_URL.");
        return;
      }
      if (res.status === 429) {
        setError(`Too many sign-in attempts. Wait ${data.retryAfter ?? 60} seconds and try again.`);
        return;
      }
      if (res.status === 401) {
        setError(
          databaseUsers === false
            ? "Wrong password for access-code mode. Use the value of PORTAL_ACCESS_CODE exactly (local default: deview-demo). Seeded emails like staff@deviewai.local only work after you set DATABASE_URL and run db:seed."
            : "Invalid email or password.",
        );
        return;
      }
      if (res.status === 400) {
        setError(data.error ?? "Check your input.");
        return;
      }
      setError(data.message ?? data.error ?? "Sign-in failed.");
      return;
    }
    const dest = searchParams.get("from") || "/";
    router.push(dest);
    router.refresh();
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-slate-100 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">deviewai.com</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">Unified Business Data Portal</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Internal access — sign in with your portal account, or the shared access code when no database is configured.
        </p>
        {databaseUsers === false ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-medium">Access-code mode (no DATABASE_URL)</p>
            <p className="mt-1 text-amber-900/90 dark:text-amber-100/85">
              Put your <strong>PORTAL_ACCESS_CODE</strong> in the password field — for you that is{" "}
              <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/60">deview-demo</code>. The email field is
              ignored. Do not use ChangeMeStaff!1 here unless Postgres is connected and users are seeded.
            </p>
          </div>
        ) : databaseUsers === true ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
            <p className="font-medium">Database mode</p>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Use a seeded email and password (e.g. staff@deviewai.local + the password you set in{" "}
              <code className="rounded bg-white px-1 dark:bg-slate-950">npm run db:seed</code>).
            </p>
          </div>
        ) : null}
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Work email
            </label>
            <input
              id="email"
              type="text"
              inputMode="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@deviewai.local (optional in access-code mode)"
              className="mt-1 min-h-[48px] w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-slate-400 focus:ring-2 sm:min-h-0 sm:py-2 sm:text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Password or access code
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 min-h-[48px] w-full rounded-md border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 outline-none ring-slate-400 focus:ring-2 sm:min-h-0 sm:py-2 sm:text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="min-h-[48px] w-full rounded-md bg-slate-900 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 sm:min-h-0 sm:py-2 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          <strong className="font-medium text-slate-600 dark:text-slate-400">Database mode:</strong> use a seeded user
          (see README). <strong className="font-medium text-slate-600 dark:text-slate-400">Demo / no DB:</strong> leave
          email empty and enter the access code (
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">deview-demo</code> locally, or{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">PORTAL_ACCESS_CODE</code> on Vercel). Production
          requires <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">AUTH_SECRET</code> (32+ characters).
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-full flex-1 items-center justify-center bg-slate-100">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
