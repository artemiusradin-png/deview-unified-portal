"use client";

import Link from "next/link";
import { useState } from "react";
import type { CustomerProfile } from "@/types/customer";
import { RiskAnalysisCard } from "@/components/RiskAnalysisCard";
import { langText, useLanguage } from "@/components/LanguageSwitcher";
import { maskContactDisplay, maskPhoneDisplay } from "@/lib/mask-phone";

/** Client workshop labels A,B,C,F plus full lender modules. */
const tabs = [
  { id: "apply", label: "A · Apply info", labelZh: "A · 申請資料" },
  { id: "partakers", label: "B · Partakers", labelZh: "B · 關係人" },
  { id: "credit", label: "C · Credit ref", labelZh: "C · 信貸參考" },
  { id: "mortgage", label: "Mortgage / collateral", labelZh: "按揭 / 抵押" },
  { id: "dsr", label: "F · Income / DSR", labelZh: "F · 收入 / DSR" },
  { id: "loans", label: "Loan history", labelZh: "貸款紀錄" },
  { id: "partaking", label: "Partaking history", labelZh: "參與紀錄" },
  { id: "approval", label: "Approval info", labelZh: "批核資料" },
  { id: "repay", label: "Repay history", labelZh: "還款紀錄" },
  { id: "repayCond", label: "Repay condition", labelZh: "還款狀況" },
  { id: "oca", label: "OCA / Write-off", labelZh: "OCA / 撇帳" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function ProfileModules({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  const [tab, setTab] = useState<TabId>("apply");
  const [completionChecks, setCompletionChecks] = useState(
    profile.searchRow.completionChecks ?? {
      apply: false,
      partakers: false,
      credit: false,
      income: false,
      review: false,
    },
  );
  const row = profile.searchRow;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Customer360</p>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{row.name}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              HKID/ID <span className="font-mono text-slate-800 dark:text-slate-200">{row.idNumber}</span> ·{" "}
              {langText(isZh, "Passport", "護照")}{" "}
              <span className="font-mono">{row.passportNumber || "—"}</span> ·{" "}
              {langText(isZh, "Mobile", "手機")}{" "}
              <span className="font-mono">{maskPhoneDisplay(row.mobile)}</span> ·{" "}
              <span className="font-mono">{row.applicationNumber}</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {langText(isZh, "Loan", "貸款")} <span className="font-mono">{row.loanNumber}</span> ·{" "}
              {langText(isZh, "Age", "年齡")} {row.age} · {row.job} · {row.companyUnit}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              TE Ref. Enquiry: <span className="font-mono">{row.teRefEnquiry || "N/A"}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                className="rounded border border-slate-300 px-2 py-1 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                TE Ref. Enquiry
              </button>
              {(["A", "B", "C", "D", "E"] as const).map((label, i) => {
                const key = i === 0 ? "apply" : i === 1 ? "partakers" : i === 2 ? "credit" : i === 3 ? "income" : "review";
                return (
                  <label key={label} className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 dark:border-slate-700">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(completionChecks[key as keyof typeof completionChecks])}
                      onChange={(e) => setCompletionChecks((prev) => ({ ...prev, [key]: e.target.checked }))}
                    />
                  </label>
                );
              })}
            </div>
            <Link
              href={`/assistant?customer=${profile.id}`}
              className="mt-2 inline-block text-xs font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
            >
              {langText(isZh, "AI assistant with this record →", "用此紀錄 AI 助手 →")}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              {row.status}
            </span>
            {row.blacklistFlag ? (
              <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-900 dark:bg-red-950 dark:text-red-200">
                {langText(isZh, "Blacklist", "黑名單")}
              </span>
            ) : null}
            <span className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 dark:border-slate-700 dark:text-slate-400">
              {row.sourceSystem}
            </span>
            {row.completionChecks ? (
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">
                A-E {completionChecks.apply && completionChecks.partakers && completionChecks.credit && completionChecks.income && completionChecks.review ? "done" : "pending"}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <RiskAnalysisCard profile={profile} />

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
              {langText(isZh, t.label, t.labelZh)}
              {t.id === "loans" ? (
                <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                  {profile.loanHistory.length}
                </span>
              ) : null}
              {t.id === "partaking" ? (
                <span className="ml-1 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                  {profile.partakingHistory.length}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {tab === "apply" ? <Apply profile={profile} /> : null}
          {tab === "partakers" ? <Partakers profile={profile} /> : null}
          {tab === "credit" ? <Credit profile={profile} /> : null}
          {tab === "mortgage" ? <Mortgage profile={profile} /> : null}
          {tab === "dsr" ? <Dsr profile={profile} /> : null}
          {tab === "loans" ? <Loans profile={profile} /> : null}
          {tab === "partaking" ? <Partaking profile={profile} /> : null}
          {tab === "approval" ? <Approval profile={profile} /> : null}
          {tab === "repay" ? <Repay profile={profile} /> : null}
          {tab === "repayCond" ? <RepayCond profile={profile} /> : null}
          {tab === "oca" ? <Oca profile={profile} /> : null}
        </div>
      </div>
    </div>
  );
}

function Apply({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  const a = profile.applyInfo;
  const get = (v?: string) => v || "—";
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-3">
      <Detail label={langText(isZh, "Loan type", "貸款類型")} value={get(a.loanType || a.product)} />
      <Detail label={langText(isZh, "Interest method", "計息方式")} value={get(a.interestMethod)} />
      <Detail label={langText(isZh, "Repay cycle", "還款週期")} value={get(a.repayCycle)} />
      <Detail label={langText(isZh, "Loan amount", "貸款金額")} value={get(a.loanAmount)} />
      <Detail label={langText(isZh, "Total tenor", "總期數")} value={get(a.totalTenor)} />
      <Detail label={langText(isZh, "Instalment amount", "分期金額")} value={get(a.instalmentAmount)} />
      <Detail label={langText(isZh, "Flat rate", "平息")} value={get(a.flatRate)} />
      <Detail label={langText(isZh, "Effective rate", "實際利率")} value={get(a.effectiveRate)} />
      <Detail label={langText(isZh, "Max interest", "最高利息")} value={get(a.maxInterest)} />
      <Detail label={langText(isZh, "Total interest", "總利息")} value={get(a.totalInterest)} />
      <Detail label={langText(isZh, "Apply date", "申請日期")} value={get(a.applyDate || a.applicationDate)} />
      <Detail label={langText(isZh, "Loan purpose", "貸款用途")} value={get(a.loanPurpose)} />
      <Detail label={langText(isZh, "Status", "狀態")} value={a.status} />
      <Detail label={langText(isZh, "Branch", "分行")} value={get(a.branch)} />
      <Detail label={langText(isZh, "Staff", "職員")} value={get(a.staff)} />
      <Detail label={langText(isZh, "Referral agent", "轉介代理")} value={get(a.referralAgent)} />
      <Detail label={langText(isZh, "R.A. address", "代理地址")} value={get(a.referralAgentAddress)} className="sm:col-span-2" />
      <Detail label={langText(isZh, "Relation", "關係")} value={get(a.relation)} />
      <Detail label={langText(isZh, "Main avenue", "主要渠道")} value={get(a.mainAvenue)} />
      <Detail label={langText(isZh, "Main purpose", "主要目的")} value={get(a.mainPurpose)} />
      <Detail label={langText(isZh, "Autopay / bank", "自動轉帳 / 銀行")} value={get(a.autopayBankInfo)} className="sm:col-span-2" />
      <Detail label={langText(isZh, "Personal info", "個人資料")} value={get(a.personalInfo)} className="sm:col-span-2" />
      <Detail label={langText(isZh, "Notes", "備註")} value={get(a.notes || a.applicantNote)} className="sm:col-span-3" />
    </dl>
  );
}

function Partakers({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  const rows = profile.partakers;
  const partakerCsvUrl = `/api/profile/${profile.id}/partakers.csv`;
  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          {langText(isZh, "Structured partaker list with selectable rows.", "結構化關係人清單（可選列）。")}
        </p>
        <a href={partakerCsvUrl} className="text-xs underline">
          {langText(isZh, "Partaker list export", "關係人清單匯出")}
        </a>
      </div>
      {rows.length === 0 ? (
        <p className="text-slate-500">{langText(isZh, "No related partakers on file.", "未有相關關係人紀錄。")}</p>
      ) : (
        <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
          <table className="min-w-full text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 dark:bg-slate-800/50">
              <tr>
                <th className="px-2 py-2">{langText(isZh, "Partaker Type", "關係人類型")}</th>
                <th className="px-2 py-2">{langText(isZh, "Name", "姓名")}</th>
                <th className="px-2 py-2">{langText(isZh, "Mobile No.", "手機號碼")}</th>
                <th className="px-2 py-2">{langText(isZh, "Home No.", "住宅電話")}</th>
                <th className="px-2 py-2">{langText(isZh, "Passport", "護照 / 證件")}</th>
                <th className="px-2 py-2">{langText(isZh, "Relation", "關係")}</th>
                <th className="px-2 py-2">{langText(isZh, "Select", "選取")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((p, i) => (
                <tr key={i}>
                  <td className="px-2 py-2">{p.partakerType || p.relationship || "—"}</td>
                  <td className="px-2 py-2">{p.name}</td>
                  <td className="px-2 py-2">{maskContactDisplay(p.mobileNo || p.contact || "—")}</td>
                  <td className="px-2 py-2">{maskContactDisplay(p.homeNo || "—")}</td>
                  <td className="px-2 py-2 font-mono">{p.passport || "—"}</td>
                  <td className="px-2 py-2">{p.relation || p.relationship || "—"}</td>
                  <td className="px-2 py-2">
                    <input type="checkbox" defaultChecked={Boolean(p.selected)} className="size-3.5" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Credit({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  const c = profile.creditRef;
  const rows = c.items ?? [];
  const totals = rows.reduce(
    (acc, row) => {
      const loan = parseCurrency(row.loanAmount);
      const balance = parseCurrency(row.balanceAmount);
      return { loan: acc.loan + loan, balance: acc.balance + balance };
    },
    { loan: 0, balance: 0 },
  );

  if (rows.length === 0) {
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

  return (
    <div className="space-y-3 text-sm">
      <p className="text-slate-600 dark:text-slate-400">{c.summary}</p>
      <div className="overflow-x-auto rounded border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 dark:bg-slate-800/50">
            <tr>
              <th className="px-2 py-2">{langText(isZh, "Bank / Creditor", "銀行 / 債權人")}</th>
              <th className="px-2 py-2">{langText(isZh, "Credit Type", "信貸類型")}</th>
              <th className="px-2 py-2">{langText(isZh, "Loan Amount", "貸款金額")}</th>
              <th className="px-2 py-2">{langText(isZh, "Instalment", "分期")}</th>
              <th className="px-2 py-2">{langText(isZh, "O/S Tenor", "未償期數")}</th>
              <th className="px-2 py-2">{langText(isZh, "Balance", "結餘")}</th>
              <th className="px-2 py-2">{langText(isZh, "Debtor", "債務人")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="px-2 py-2">{r.creditor}</td>
                <td className="px-2 py-2">{r.creditType}</td>
                <td className="px-2 py-2">{r.loanAmount}</td>
                <td className="px-2 py-2">{r.instalmentAmount}</td>
                <td className="px-2 py-2">{r.outstandingTenor}</td>
                <td className="px-2 py-2">{r.balanceAmount}</td>
                <td className="px-2 py-2">{r.debtor}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-slate-200 bg-slate-50 text-xs dark:border-slate-700 dark:bg-slate-800/50">
            <tr>
              <td className="px-2 py-2 font-semibold" colSpan={2}>
                {langText(isZh, "Totals", "合計")}
              </td>
              <td className="px-2 py-2 font-semibold">{formatCurrency(totals.loan)}</td>
              <td className="px-2 py-2">—</td>
              <td className="px-2 py-2">—</td>
              <td className="px-2 py-2 font-semibold">{formatCurrency(totals.balance)}</td>
              <td className="px-2 py-2">—</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Mortgage({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  const m = profile.mortgage;
  return (
    <div className="space-y-3">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Detail label={langText(isZh, "Applicable", "適用")} value={m.applicable ? langText(isZh, "Yes", "是") : langText(isZh, "No", "否")} />
        <Detail label={langText(isZh, "Collateral ref", "抵押參考")} value={m.collateralRef} />
        <Detail label={langText(isZh, "Asset summary", "資產摘要")} value={m.assetSummary} className="sm:col-span-2" />
      </dl>
      <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
        File Created / Modified Time
      </button>
    </div>
  );
}

function Dsr({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  const d = profile.dsr;
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <Detail label={langText(isZh, "Income", "收入")} value={d.income} />
      <Detail label={langText(isZh, "Expenditure", "支出")} value={d.expenditure} />
      <Detail label="DSR" value={d.ratio} />
      <Detail label={langText(isZh, "Notes", "備註")} value={d.notes} className="sm:col-span-2" />
    </dl>
  );
}

function Loans({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-xs uppercase text-slate-500">
        <tr>
          <th className="pb-2">{langText(isZh, "Status", "狀態")}</th>
          <th className="pb-2">{langText(isZh, "Apply #", "申請編號")}</th>
          <th className="pb-2">{langText(isZh, "Loan #", "貸款編號")}</th>
          <th className="pb-2">{langText(isZh, "Repaid / Tenor", "已還 / 期數")}</th>
          <th className="pb-2">{langText(isZh, "Loan Amount", "貸款金額")}</th>
          <th className="pb-2">{langText(isZh, "Instalment", "分期金額")}</th>
          <th className="pb-2">{langText(isZh, "Principal Bal.", "本金結餘")}</th>
          <th className="pb-2">{langText(isZh, "Interest Bal.", "利息結餘")}</th>
          <th className="pb-2">{langText(isZh, "Next Due", "下次到期")}</th>
          <th className="pb-2">{langText(isZh, "Detail", "詳情")}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {profile.loanHistory.map((l, i) => (
          <tr key={i}>
            <td className="py-2">{l.status}</td>
            <td className="py-2 font-mono text-xs">{l.applyNumber || profile.searchRow.applicationNumber}</td>
            <td className="py-2 font-mono text-xs">{l.loanNumber}</td>
            <td className="py-2">
              {l.repaidTenor || 0} / {l.totalTenor || "—"}
            </td>
            <td className="py-2">{l.loanAmount || "—"}</td>
            <td className="py-2">{l.instalmentAmount || "—"}</td>
            <td className="py-2">{l.principalBalance || "—"}</td>
            <td className="py-2">{l.interestBalance || "—"}</td>
            <td className="py-2 whitespace-nowrap text-slate-600 dark:text-slate-400">{l.nextDueDate || "—"}</td>
            <td className="py-2">
              <Link
                href={`/profile/${profile.id}/loan/${encodeURIComponent(l.loanNumber)}`}
                className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                {langText(isZh, "Detail", "詳情")}
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Partaking({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  return (
    <div className="space-y-3">
      <ul className="space-y-3 text-sm">
        {profile.partakingHistory.length === 0 ? (
          <li className="text-slate-500">{langText(isZh, "No partaking history.", "未有參與紀錄。")}</li>
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
      <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
        File Created / Modified Time
      </button>
    </div>
  );
}

function Approval({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  const dsrValue = parseFloat((profile.dsr.ratio || "").replace("%", "").trim());
  const dsrHigh = Number.isFinite(dsrValue) && dsrValue >= 80;
  return (
    <div className="space-y-3 text-sm">
      <div className={`rounded border p-2 text-xs ${dsrHigh ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"}`}>
        DSR: {profile.dsr.ratio || "—"} {dsrHigh ? "⚠ exceeds threshold" : ""}
      </div>
      {profile.approvalInfo.map((a, i) => (
        <div key={i} className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
          <p className="font-medium">
            {a.stage} ·{" "}
            <span className="text-slate-600 dark:text-slate-400">{a.approvalDate || a.date || "—"}</span>
          </p>
          <p className="text-slate-700 dark:text-slate-300">{a.decision}</p>
          <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            <Detail label={langText(isZh, "Approval staff", "批核職員")} value={a.approvalStaff || a.reviewer || "—"} />
            <Detail label={langText(isZh, "Payout date", "放款日期")} value={a.payoutDate || "—"} />
            <Detail label={langText(isZh, "Loan date", "貸款日期")} value={a.loanDate || "—"} />
            <Detail label={langText(isZh, "First due date", "首次到期日")} value={a.firstDueDate || "—"} />
            <Detail label={langText(isZh, "First repay amount", "首期還款")} value={a.firstRepayAmount || "—"} />
            <Detail label={langText(isZh, "Interest method", "計息方式")} value={a.interestMethod || "—"} />
            <Detail label={langText(isZh, "Repay cycle", "還款週期")} value={a.repayCycle || "—"} />
            <Detail label={langText(isZh, "Loan amount", "貸款金額")} value={a.loanAmount || "—"} />
            <Detail label={langText(isZh, "Total tenor", "總期數")} value={a.totalTenor || "—"} />
            <Detail label={langText(isZh, "Flat / effective rate", "平息 / 實際利率")} value={`${a.flatRate || "—"} / ${a.effectiveRate || "—"}`} />
            <Detail label={langText(isZh, "Penalty setting", "罰息設定")} value={a.penaltySetting || "—"} />
            <Detail label="DSR" value={a.dsr || "—"} />
            <Detail label={langText(isZh, "Extended interest", "延長利息")} value={`${a.extendedInterestDay || "—"} / ${a.extendedInterestAmount || "—"}`} />
          </dl>
          <p className="mt-2 text-xs text-slate-500">{a.notes}</p>
        </div>
      ))}
    </div>
  );
}

function Repay({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  return (
    <div className="space-y-3">
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase text-slate-500">
        <tr>
          <th className="pb-2">{langText(isZh, "Repay Date", "還款日期")}</th>
          <th className="pb-2">{langText(isZh, "Repay No.", "還款編號")}</th>
          <th className="pb-2">{langText(isZh, "Repay Type", "還款類型")}</th>
          <th className="pb-2">{langText(isZh, "Tenor", "期數")}</th>
          <th className="pb-2">{langText(isZh, "Repay Amount", "還款金額")}</th>
          <th className="pb-2">{langText(isZh, "O.D. Interest", "逾期利息")}</th>
          <th className="pb-2">{langText(isZh, "Handling Fee", "手續費")}</th>
          <th className="pb-2">{langText(isZh, "Rec'd Amount", "實收金額")}</th>
          <th className="pb-2">{langText(isZh, "Temp. Amount", "暫收金額")}</th>
          <th className="pb-2">{langText(isZh, "Remarks", "備註")}</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {profile.repayHistory.map((r, i) => (
          <tr key={i}>
            <td className="py-2 whitespace-nowrap">{r.repayDate || r.date || "—"}</td>
            <td className="py-2">{r.repayNo || "—"}</td>
            <td className="py-2">{r.repayType || r.channel || "—"}</td>
            <td className="py-2">{r.tenor || "—"}</td>
            <td className="py-2">{r.repayAmount || r.amount || "—"}</td>
            <td className="py-2">{r.overdueInterest || "—"}</td>
            <td className="py-2">{r.handlingFee || "—"}</td>
            <td className="py-2">{r.receivedAmount || r.amount || "—"}</td>
            <td className="py-2">{r.tempAmount || "—"}</td>
            <td className="py-2">{r.remarks || r.balanceAfter || "—"}</td>
          </tr>
        ))}
        </tbody>
      </table>
      <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
        File Created / Modified Time
      </button>
    </div>
  );
}

function RepayCond({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
  const r = profile.repayCondition;
  return (
    <div className="space-y-3">
      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        <Detail label={langText(isZh, "Terms", "條款")} value={r.terms || "—"} className="sm:col-span-3" />
        <Detail label={langText(isZh, "State", "狀態")} value={r.state} />
        <Detail label={langText(isZh, "Overdue days", "逾期日數")} value={String(r.overdueDays)} />
        <Detail label={langText(isZh, "Next repay date", "下次還款日")} value={r.nextRepayDate || "—"} />
        <Detail label={langText(isZh, "Next repay amount", "下次還款金額")} value={r.nextRepayAmount || "—"} />
        <Detail label={langText(isZh, "Principal balance", "本金結餘")} value={r.principalBalance || "—"} />
        <Detail label={langText(isZh, "Interest balance", "利息結餘")} value={r.interestBalance || "—"} />
        <Detail label={langText(isZh, "Fee balance", "費用結餘")} value={r.feeBalance || "—"} />
        <Detail label={langText(isZh, "Collection notes", "催收備註")} value={r.collectionNotes} className="sm:col-span-3" />
      </dl>
      <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
        File Created / Modified Time
      </button>
    </div>
  );
}

function Oca({ profile }: { profile: CustomerProfile }) {
  const { isZh } = useLanguage();
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
        <p className="text-xs font-semibold uppercase text-slate-500">{langText(isZh, "Write-off", "撇帳")}</p>
        <ul className="mt-1 list-inside list-disc text-slate-700 dark:text-slate-300">
          {o.writeOffRecords.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </div>
      <p>
        <span className="font-medium">{langText(isZh, "Recovery", "追收")}: </span>
        {o.recovery}
      </p>
    </div>
  );
}

function parseCurrency(value: string) {
  const clean = value.replace(/[^0-9.-]/g, "");
  const n = Number(clean);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(amount: number) {
  return amount ? `SGD ${amount.toLocaleString("en-SG", { maximumFractionDigits: 2 })}` : "—";
}

function Detail({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}
