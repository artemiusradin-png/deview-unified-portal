"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { LanguageSwitcher, langText, useLanguage } from "@/components/LanguageSwitcher";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isZh } = useLanguage();
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: accessCode }),
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
        setError([data.message, data.hint].filter(Boolean).join(" "));
        return;
      }
      if (res.status === 429) {
        setError(langText(isZh, `Too many attempts. Wait ${data.retryAfter ?? 60} seconds.`, `嘗試次數太多，請等候 ${data.retryAfter ?? 60} 秒。`));
        return;
      }
      if (res.status === 401) {
        setError(langText(isZh, "Wrong access code.", "存取碼不正確。"));
        return;
      }
      if (res.status === 400) {
        setError(data.error ?? langText(isZh, "Enter the access code.", "請輸入存取碼。"));
        return;
      }
      setError(data.message ?? data.error ?? langText(isZh, "Sign-in failed.", "登入失敗。"));
      return;
    }
    const dest = searchParams.get("from") || "/";
    router.push(dest);
    router.refresh();
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-slate-100 px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] dark:bg-slate-950">
      <div className="fixed right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">deviewai.com</p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
          <span className="lang-en">Unified Business Data Portal</span>
          <span className="lang-zh">統一業務數據平台</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          <span className="lang-en">Internal access — enter the shared access code for your environment.</span>
          <span className="lang-zh">內部系統存取，請輸入此環境共用嘅存取碼。</span>
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="access-code" className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="lang-en">Access code</span>
              <span className="lang-zh">存取碼</span>
            </label>
            <input
              id="access-code"
              type="password"
              autoComplete="current-password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder={langText(isZh, "e.g. deview-demo", "例如 deview-demo")}
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
            {pending ? langText(isZh, "Signing in…", "登入中…") : langText(isZh, "Sign in", "登入")}
          </button>
        </form>
        <p className="mt-4 text-xs text-slate-500">
          <span className="lang-en">Local default: </span>
          <span className="lang-zh">本機預設：</span>
          <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">deview-demo</code>
          <span className="lang-en">
            . On Vercel set <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">PORTAL_ACCESS_CODE</code> (8+
            characters) for production.
          </span>
          <span className="lang-zh">
            。正式環境請喺 Vercel 設定 <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">PORTAL_ACCESS_CODE</code>
            （最少 8 個字元）。
          </span>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-full flex-1 items-center justify-center bg-slate-100">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
