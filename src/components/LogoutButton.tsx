"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const btnBase =
  "rounded-md border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800";

type LogoutButtonProps = {
  /** Narrow header layout with comfortable tap target (mobile top bar). */
  compact?: boolean;
};

export function LogoutButton({ compact }: LogoutButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function logout() {
    setPending(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const layout = compact
    ? "w-auto shrink-0 px-3 py-2.5 min-h-[44px]"
    : "w-full px-2 py-1.5 min-h-[40px]";

  return (
    <button type="button" onClick={logout} disabled={pending} className={`${btnBase} ${layout}`}>
      {pending ? "…" : "Sign out"}
    </button>
  );
}
