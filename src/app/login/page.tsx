"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: password.trim() }),
    });
    setPending(false);
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      message?: string;
      retryAfter?: number;
    };
    if (!res.ok) {
      if (res.status === 503) {
        if (data.code === "PORTAL_PASSWORD") {
          setError(
            "Production: set PORTAL_DEMO_PASSWORD to at least 16 characters in Vercel, then redeploy. (Short passwords like deview-demo are rejected on purpose.)",
          );
          return;
        }
        if (data.code === "SESSION_SECRET") {
          setError(
            "The server still cannot read SESSION_SECRET. In Vercel → Settings → Environment Variables: (1) Name must be exactly SESSION_SECRET (all caps). (2) Value must be 32+ characters (openssl rand -hex 32 gives 64 hex chars). (3) Enable for Production. (4) Redeploy, ideally with “Clear build cache”.",
          );
          return;
        }
        setError(data.message ?? "Server configuration error. Check environment variables and redeploy.");
        return;
      }
      if (res.status === 429) {
        setError(`Too many sign-in attempts. Wait ${data.retryAfter ?? 60} seconds and try again.`);
        return;
      }
      if (res.status === 401) {
        setError("Incorrect password.");
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
    <main className="flex min-h-full flex-1 items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">deviewai.com</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">Unified Business Data Portal</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Internal access — sign in with the demo password.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-slate-400 focus:ring-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          Development default: <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">deview-demo</code>. In production,
          set <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">PORTAL_DEMO_PASSWORD</code> (16+ chars) and{" "}
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">SESSION_SECRET</code> (32+ chars).
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
