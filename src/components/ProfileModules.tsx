"use client";

import { useState } from "react";
import type { CustomerProfile } from "@/types/customer";
import { AiSummaryPanel } from "@/components/AiSummaryPanel";

const tabs = [
  { id: "apply", label: "Apply info" },
  { id: "partakers", label: "Partakers" },
  { id: "credit", label: "Credit ref" },
  { id: "documents", label: "Documents" },
  { id: "mortgage", label: "Mortgage" },
  { id: "dsr", label: "DSR" },
  { id: "loans", label: "Loan history" },
  { id: "partaking", label: "Partaking history" },
  { id: "approval", label: "Approval" },
  { id: "repay", label: "Repay history" },
  { id: "repayCond", label: "Repay condition" },
  { id: "crm", label: "CRM" },
  { id: "oca", label: "OCA / Write-off" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProfileModules({ profile }: { profile: CustomerProfile }) {
  const [tab, setTab] = useState<TabId>("apply");
  const row = profile.searchRow;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Customer360</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{row.name}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {row.idNumber} · {row.mobile} · {row.applicationNumber}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {row.status}
            </span>
            {row.blacklistFlag ? (
              <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-900 dark:bg-red-950 dark:text-red-200">
                Blacklist
              </span>
            ) : null}
            <span className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 dark:border-slate-700 dark:text-slate-400">
              {row.sourceSystem}
            </span>
          </div>
        </div>
      </div>

      <AiSummaryPanel customerId={profile.id} />

      <div className="flex flex-col gap-4 lg:flex-row">
        <nav className="flex shrink-0 flex-row flex-wrap gap-1 lg:w-48 lg:flex-col lg:flex-nowrap">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-2 py-1.5 text-left text-xs font-medium lg:text-sm ${
                tab === t.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {tab === "apply" ? <Apply profile={profile} /> : null}
          {tab === "partakers" ? <Partakers profile={profile} /> : null}
          {tab === "credit" ? <Credit profile={profile} /> : null}
          {tab === "documents" ? <Documents profile={profile} /> : null}
          {tab === "mortgage" ? <Mortgage profile={profile} /> : null}
          {tab === "dsr" ? <Dsr profile={profile} /> : null}
          {tab === "loans" ? <Loans profile={profile} /> : null}
          {tab === "partaking" ? <Partaking profile={profile} /> : null}
          {tab === "approval" ? <Approval profile={profile} /> : null}
          {tab === "repay" ? <Repay profile={profile} /> : null}
          {tab === "repayCond" ? <RepayCond profile={profile} /> : null}
          {tab === "crm" ? <Crm profile={profile} /> : null}
          {tab === "oca" ? <Oca profile={profile} /> : null}
        </div>
      </div>
    </div>
  );
}

function Apply({ profile }: { profile: CustomerProfile }) {
  const a = profile.applyInfo;
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <Detail label="Product / loan type" value={a.product} />
      <Detail label="Branch" value={a.branch} />
      <Detail label="Application date" value={a.applicationDate} />
      <Detail label="Status" value={a.status} />
      <Detail label="Notes" value={a.applicantNote} className="sm:col-span-2" />
    </dl>
  );
}

function Partakers({ profile }: { profile: CustomerProfile }) {
  return (
    <ul className="space-y-3 text-sm">
      {profile.partakers.length === 0 ? (
        <li className="text-slate-500">No related partakers on file.</li>
      ) : (
        profile.partakers.map((p, i) => (
          <li key={i} className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
            <p className="font-medium">{p.name}</p>
            <p className="text-slate-600 dark:text-slate-400">{p.relationship}</p>
            <p className="text-xs text-slate-500">{p.contact}</p>
            {p.linkedId ? <p className="mt-1 font-mono text-xs">Linked: {p.linkedId}</p> : null}
          </li>
        ))
      )}
    </ul>
  );
}

function Credit({ profile }: { profile: CustomerProfile }) {
  const c = profile.creditRef;
  return (
    <div className="space-y-2 text-sm">
      <p>{c.summary}</p>
      <ul className="list-inside list-disc text-slate-600 dark:text-slate-400">
        {c.indicators.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}

function Documents({ profile }: { profile: CustomerProfile }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase text-slate-500">
        <tr>
          <th className="pb-2">Type</th>
          <th className="pb-2">Date</th>
          <th className="pb-2">Reference</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {profile.documents.map((d, i) => (
          <tr key={i}>
            <td className="py-2">{d.type}</td>
            <td className="py-2 whitespace-nowrap">{d.date}</td>
            <td className="py-2 font-mono text-xs">{d.reference}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Mortgage({ profile }: { profile: CustomerProfile }) {
  const m = profile.mortgage;
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <Detail label="Applicable" value={m.applicable ? "Yes" : "No"} />
      <Detail label="Collateral ref" value={m.collateralRef} />
      <Detail label="Asset summary" value={m.assetSummary} className="sm:col-span-2" />
    </dl>
  );
}

function Dsr({ profile }: { profile: CustomerProfile }) {
  const d = profile.dsr;
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <Detail label="Income" value={d.income} />
      <Detail label="Expenditure" value={d.expenditure} />
      <Detail label="DSR" value={d.ratio} />
      <Detail label="Notes" value={d.notes} className="sm:col-span-2" />
    </dl>
  );
}

function Loans({ profile }: { profile: CustomerProfile }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase text-slate-500">
        <tr>
          <th className="pb-2">Loan #</th>
          <th className="pb-2">Product</th>
          <th className="pb-2">Status</th>
          <th className="pb-2">Period</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {profile.loanHistory.map((l, i) => (
          <tr key={i}>
            <td className="py-2 font-mono text-xs">{l.loanNumber}</td>
            <td className="py-2">{l.product}</td>
            <td className="py-2">{l.status}</td>
            <td className="py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">{l.period}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Partaking({ profile }: { profile: CustomerProfile }) {
  return (
    <ul className="space-y-3 text-sm">
      {profile.partakingHistory.length === 0 ? (
        <li className="text-slate-500">No partaking history.</li>
      ) : (
        profile.partakingHistory.map((p, i) => (
          <li key={i} className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
            <p className="font-medium">{p.period}</p>
            <p className="text-slate-600 dark:text-slate-400">{p.description}</p>
            <p className="font-mono text-xs text-slate-500">{p.relatedApplication}</p>
          </li>
        ))
      )}
    </ul>
  );
}

function Approval({ profile }: { profile: CustomerProfile }) {
  return (
    <ul className="space-y-3 text-sm">
      {profile.approvalInfo.map((a, i) => (
        <li key={i} className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
          <p className="font-medium">
            {a.stage} · <span className="text-slate-600 dark:text-slate-400">{a.date}</span>
          </p>
          <p className="text-slate-700 dark:text-slate-300">{a.reviewer}</p>
          <p className="text-slate-600 dark:text-slate-400">{a.decision}</p>
          <p className="mt-1 text-xs text-slate-500">{a.notes}</p>
        </li>
      ))}
    </ul>
  );
}

function Repay({ profile }: { profile: CustomerProfile }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase text-slate-500">
        <tr>
          <th className="pb-2">Date</th>
          <th className="pb-2">Amount</th>
          <th className="pb-2">Balance after</th>
          <th className="pb-2">Channel</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {profile.repayHistory.map((r, i) => (
          <tr key={i}>
            <td className="py-2 whitespace-nowrap">{r.date}</td>
            <td className="py-2">{r.amount}</td>
            <td className="py-2">{r.balanceAfter}</td>
            <td className="py-2">{r.channel}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RepayCond({ profile }: { profile: CustomerProfile }) {
  const r = profile.repayCondition;
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <Detail label="Terms" value={r.terms} className="sm:col-span-2" />
      <Detail label="State" value={r.state} />
      <Detail label="Overdue days" value={String(r.overdueDays)} />
      <Detail label="Collection notes" value={r.collectionNotes} className="sm:col-span-2" />
    </dl>
  );
}

function Crm({ profile }: { profile: CustomerProfile }) {
  return (
    <ul className="space-y-3 text-sm">
      {profile.crm.map((c, i) => (
        <li key={i} className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
          <p className="text-xs text-slate-500">
            {c.date} · {c.author}
          </p>
          <p className="mt-1">{c.note}</p>
        </li>
      ))}
    </ul>
  );
}

function Oca({ profile }: { profile: CustomerProfile }) {
  const o = profile.ocaWriteOff;
  return (
    <div className="space-y-4 text-sm">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">OCA</p>
        <ul className="mt-1 list-inside list-disc text-slate-700 dark:text-slate-300">
          {o.ocaRecords.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-slate-500">Write-off</p>
        <ul className="mt-1 list-inside list-disc text-slate-700 dark:text-slate-300">
          {o.writeOffRecords.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </div>
      <p>
        <span className="font-medium">Recovery: </span>
        {o.recovery}
      </p>
    </div>
  );
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}
