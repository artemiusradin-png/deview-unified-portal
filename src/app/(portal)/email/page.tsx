"use client";

import { useState } from "react";

/* ─── icons ────────────────────────────────────────────────────── */
function LockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function SparkleIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 1.5l2.09 6.41L20.5 10l-6.41 2.09L12 18.5l-2.09-6.41L3.5 10l6.41-2.09L12 1.5z" />
    </svg>
  );
}

function EnvelopeIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ChevronRightIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function UserIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function AlertIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ─── mock data ──────────────────────────────────────────────────── */
type EmailCategory = "important" | "review" | "junk" | "all";

const MOCK_EMAILS = [
  {
    id: 1,
    from: "Lee Kuan Hock",
    email: "lkh@gmail.com",
    subject: "Re: Loan repayment — LN-338821",
    preview: "I would like to request a restructuring of my current repayment schedule due to recent...",
    time: "10:42 AM",
    category: "important" as EmailCategory,
    read: false,
    aiScore: 94,
    linkedClient: "G11223348",
  },
  {
    id: 2,
    from: "Lam Chun Biu",
    email: "lcb_personal@outlook.com",
    subject: "Salary slip — April 2026",
    preview: "Please find attached my latest salary slip as requested for the income verification...",
    time: "9:15 AM",
    category: "important" as EmailCategory,
    read: false,
    aiScore: 88,
    linkedClient: "G706683",
  },
  {
    id: 3,
    from: "HSBC Business",
    email: "noreply@hsbc.com.hk",
    subject: "Monthly statement ready",
    preview: "Your account statement for April 2026 is now available in online banking...",
    time: "8:00 AM",
    category: "review" as EmailCategory,
    read: true,
    aiScore: 61,
    linkedClient: null,
  },
  {
    id: 4,
    from: "Kenny Tsui",
    email: "kenny@softmedia.hk",
    subject: "Approval sign-off — AF-260417-01",
    preview: "Hi, the approval for application AF-260417-01 has been processed. Please confirm...",
    time: "Yesterday",
    category: "important" as EmailCategory,
    read: true,
    aiScore: 97,
    linkedClient: "G706683",
  },
  {
    id: 5,
    from: "Promo Deals HK",
    email: "deals@promohk.net",
    subject: "🎉 Exclusive offer just for you!",
    preview: "Don't miss out — limited time deals on financial tools and CRM software...",
    time: "Yesterday",
    category: "junk" as EmailCategory,
    read: true,
    aiScore: 3,
    linkedClient: null,
  },
  {
    id: 6,
    from: "Chan Siu Ming",
    email: "chansiuping88@yahoo.com.hk",
    subject: "Question about my interest rate",
    preview: "Good afternoon, I am writing to enquire about the effective interest rate on my...",
    time: "Mon",
    category: "review" as EmailCategory,
    read: true,
    aiScore: 72,
    linkedClient: null,
  },
  {
    id: 7,
    from: "Credit Bureau HK",
    email: "alert@creditbureau.hk",
    subject: "Credit inquiry notice — G706683",
    preview: "A credit inquiry has been made against the profile G706683. Details enclosed...",
    time: "Mon",
    category: "important" as EmailCategory,
    read: true,
    aiScore: 91,
    linkedClient: "G706683",
  },
  {
    id: 8,
    from: "Newsletter Bot",
    email: "newsletter@fintech-weekly.com",
    subject: "FinTech Weekly Digest — Issue #214",
    preview: "This week in fintech: Hong Kong regulators announce new open banking framework...",
    time: "Sun",
    category: "junk" as EmailCategory,
    read: true,
    aiScore: 12,
    linkedClient: null,
  },
];

const CATEGORY_LABELS: Record<EmailCategory, string> = {
  all: "All",
  important: "Important",
  review: "Needs Review",
  junk: "Junk",
};

const CATEGORY_COLORS: Record<EmailCategory, string> = {
  all: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  important: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  review: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  junk: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
};

const CATEGORY_DOT: Record<EmailCategory, string> = {
  all: "bg-slate-400",
  important: "bg-blue-500",
  review: "bg-amber-400",
  junk: "bg-red-500",
};

const PROPOSED_ACTIONS = [
  {
    id: 1,
    icon: <UserIcon className="h-4 w-4" />,
    title: "Update client income record",
    description: "Salary slip attached — update employment income for G706683 (Lam Chun Biu) to HK$27,500/mo.",
    risk: "low",
  },
  {
    id: 2,
    icon: <AlertIcon className="h-4 w-4" />,
    title: "Flag repayment restructure request",
    description: "Client LN-338821 has requested schedule adjustment. Create a task for approval review.",
    risk: "medium",
  },
  {
    id: 3,
    icon: <EnvelopeIcon className="h-4 w-4" />,
    title: "Send confirmation reply",
    description: "Draft a reply to AF-260417-01 approval sign-off — confirm payout date 2026-04-17.",
    risk: "low",
  },
  {
    id: 4,
    icon: <CheckIcon className="h-4 w-4" />,
    title: "Log credit bureau inquiry",
    description: "Record TE credit inquiry event against profile G706683 in the client audit trail.",
    risk: "low",
  },
];

/* ─── locked overlay ─────────────────────────────────────────────── */
function LockedOverlay({ label = "Upgrade to Plan 2 to unlock" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-lg backdrop-blur-[3px] bg-white/60 dark:bg-slate-900/60">
      <div className="flex flex-col items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-5 py-4 shadow-lg dark:border-amber-800 dark:bg-slate-900">
        <LockIcon className="h-5 w-5 text-amber-400" />
        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{label}</p>
        <button
          type="button"
          className="mt-1 rounded-md bg-amber-400 px-3 py-1 text-[11px] font-bold text-white shadow-sm hover:bg-amber-500"
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}

/* ─── main page ──────────────────────────────────────────────────── */
export default function EmailPage() {
  const [activeCategory, setActiveCategory] = useState<EmailCategory>("all");
  const [selectedId, setSelectedId] = useState<number>(1);

  const filtered =
    activeCategory === "all"
      ? MOCK_EMAILS
      : MOCK_EMAILS.filter((e) => e.category === activeCategory);

  const selected = MOCK_EMAILS.find((e) => e.id === selectedId) ?? MOCK_EMAILS[0];

  const counts: Record<EmailCategory, number> = {
    all: MOCK_EMAILS.length,
    important: MOCK_EMAILS.filter((e) => e.category === "important").length,
    review: MOCK_EMAILS.filter((e) => e.category === "review").length,
    junk: MOCK_EMAILS.filter((e) => e.category === "junk").length,
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* ── page header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="h-5 w-5 text-slate-500" />
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              <span className="lang-en">AI Email Intelligence</span>
              <span className="lang-zh">AI 郵件分析</span>
            </h1>
            <span className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
              <LockIcon className="h-2.5 w-2.5" />
              Plan 2
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Emails are automatically classified and linked to client profiles by AI
          </p>
        </div>

        {/* connect mailbox button — locked */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-400 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
            disabled
          >
            <LockIcon className="h-3.5 w-3.5 text-amber-400" />
            Connect Mailbox
          </button>
        </div>
      </div>

      {/* ── stats bar ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["all", "important", "review", "junk"] as EmailCategory[]).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`relative flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all ${
              activeCategory === cat
                ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${CATEGORY_DOT[cat]}`} />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {CATEGORY_LABELS[cat]}
              </span>
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">{counts[cat]}</span>
          </button>
        ))}
      </div>

      {/* ── three-column workspace ── */}
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">

        {/* col 1 — email list */}
        <div className="relative flex w-64 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {CATEGORY_LABELS[activeCategory]} · {filtered.length}
            </p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((email) => (
              <button
                key={email.id}
                type="button"
                onClick={() => setSelectedId(email.id)}
                className={`w-full px-3 py-3 text-left transition-colors ${
                  selectedId === email.id
                    ? "bg-blue-50 dark:bg-blue-950"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`truncate text-xs font-semibold ${email.read ? "text-slate-600 dark:text-slate-300" : "text-slate-900 dark:text-slate-50"}`}>
                    {email.from}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-400">{email.time}</span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-slate-600 dark:text-slate-400">{email.subject}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${CATEGORY_COLORS[email.category]}`}>
                    {CATEGORY_LABELS[email.category]}
                  </span>
                  {!email.read && (
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                  {email.linkedClient && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                      {email.linkedClient}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          {/* auto-sync locked */}
          <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Auto-sync</span>
              <LockIcon className="h-3 w-3 text-amber-400" />
            </div>
          </div>
        </div>

        {/* col 2 — email detail + AI analysis */}
        <div className="relative flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto">

          {/* email header */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{selected.subject}</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  From: <span className="font-medium text-slate-700 dark:text-slate-300">{selected.from}</span>
                  {" "}‹{selected.email}›
                </p>
                <p className="text-xs text-slate-400">{selected.time}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CATEGORY_COLORS[selected.category]}`}>
                  {CATEGORY_LABELS[selected.category]}
                </span>
                {selected.linkedClient && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    Client · {selected.linkedClient}
                  </span>
                )}
              </div>
            </div>

            {/* email body preview */}
            <div className="relative mt-4 min-h-[96px] rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <p>{selected.preview}</p>
              <p className="mt-2 text-slate-400">[Full email body blurred — upgrade to read complete emails]</p>
              <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-transparent via-white/50 to-white/90 dark:via-slate-900/50 dark:to-slate-900/90" />
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                  <LockIcon className="h-3 w-3" /> Full content — Plan 2
                </span>
              </div>
            </div>

            {/* attachments row — locked */}
            <div className="relative mt-3 flex items-center gap-2 overflow-hidden rounded-md border border-dashed border-slate-200 px-3 py-2 dark:border-slate-700">
              <LockIcon className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] text-slate-400">Attachments — upgrade to access</span>
            </div>
          </div>

          {/* AI analysis panel */}
          <div className="relative rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center gap-2">
              <SparkleIcon className="h-4 w-4 text-violet-500" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">AI Analysis</h3>
              <LockIcon className="ml-auto h-3.5 w-3.5 text-amber-400" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {/* confidence score */}
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Priority Score</p>
                <div className="mt-1.5 flex items-end gap-1">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{selected.aiScore}</span>
                  <span className="mb-0.5 text-xs text-slate-400">/ 100</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-1.5 rounded-full ${selected.aiScore >= 80 ? "bg-blue-500" : selected.aiScore >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${selected.aiScore}%` }}
                  />
                </div>
              </div>

              {/* intent */}
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Detected Intent</p>
                <p className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {selected.category === "important" ? "Client Action Required" : selected.category === "review" ? "Informational / Review" : "Promotional / Ignore"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {selected.category === "important" ? "Loan / repayment event" : selected.category === "review" ? "Third-party notice" : "No action needed"}
                </p>
              </div>

              {/* client match */}
              <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Client Match</p>
                {selected.linkedClient ? (
                  <>
                    <p className="mt-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">{selected.linkedClient}</p>
                    <p className="mt-1 text-[11px] text-slate-400">Matched by HKID / loan ref</p>
                  </>
                ) : (
                  <p className="mt-1.5 text-xs text-slate-400">No client matched</p>
                )}
              </div>
            </div>

            {/* AI summary */}
            <div className="relative mt-3 min-h-[56px] overflow-hidden rounded-lg border border-violet-100 bg-violet-50 px-3 py-2.5 dark:border-violet-900 dark:bg-violet-950">
              <p className="text-[11px] leading-relaxed text-violet-700 dark:text-violet-300 blur-[3px] select-none">
                The sender appears to be an existing client requesting a review of their repayment schedule.
                Email references loan LN-338821 which is currently in "Repaying" status.
                Recommended action: escalate to account manager for repayment restructuring discussion.
                Sentiment: neutral-to-urgent. No legal threat language detected.
              </p>
              <LockedOverlay label="AI summary — Plan 2 only" />
            </div>
          </div>

          {/* reply composer — fully locked */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-500">AI Draft Reply</span>
              <LockIcon className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <div className="min-h-[72px] px-4 py-3">
              <p className="text-xs text-slate-300 blur-[2px] select-none dark:text-slate-700">
                Dear [Client Name], thank you for reaching out regarding your repayment schedule for LN-338821...
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 dark:border-slate-800">
              <span className="text-[10px] text-slate-400">Tone: Professional · Length: Medium</span>
              <button type="button" disabled className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-400 dark:bg-slate-800">
                <LockIcon className="h-3 w-3 text-amber-400" />
                Send Reply
              </button>
            </div>
            <LockedOverlay label="AI draft replies — Plan 2 only" />
          </div>
        </div>

        {/* col 3 — proposed actions */}
        <div className="relative flex w-64 shrink-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 px-3 py-2.5 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Proposed Actions</p>
              <LockIcon className="h-3 w-3 text-amber-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {PROPOSED_ACTIONS.map((action) => (
              <div key={action.id} className="relative px-3 py-3">
                <div className="flex items-start gap-2">
                  <span className={`mt-0.5 shrink-0 rounded-md p-1 ${action.risk === "medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
                    {action.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{action.title}</p>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-slate-400">{action.description}</p>
                  </div>
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    disabled
                    className="flex flex-1 items-center justify-center gap-1 rounded-md bg-blue-50 py-1 text-[10px] font-semibold text-blue-400 dark:bg-blue-950 dark:text-blue-600"
                  >
                    <LockIcon className="h-2.5 w-2.5 text-amber-400" />
                    Apply
                  </button>
                  <button
                    type="button"
                    disabled
                    className="flex flex-1 items-center justify-center gap-1 rounded-md bg-slate-50 py-1 text-[10px] font-medium text-slate-400 dark:bg-slate-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* action history — locked */}
          <div className="relative overflow-hidden border-t border-slate-100 dark:border-slate-800">
            <div className="px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Action History</p>
              <div className="mt-1.5 space-y-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 rounded bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            </div>
            <LockedOverlay label="History — Plan 2 only" />
          </div>
        </div>
      </div>

      {/* ── upgrade banner ── */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5 dark:border-amber-800 dark:bg-amber-950">
        <div className="flex items-center gap-3">
          <LockIcon className="h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-200">AI Email Intelligence is a Plan 2 feature</p>
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              Connect your mailbox, auto-classify emails, get AI summaries, and apply one-click profile updates.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-md bg-amber-400 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-500"
        >
          Upgrade to Plan 2
        </button>
      </div>
    </div>
  );
}
