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
  const [draft, setDraft] = useState<CustomerProfile>({
    ...profile,
    searchRow: {
      ...profile.searchRow,
      completionChecks: profile.searchRow.completionChecks ?? {
        apply: false,
        partakers: false,
        credit: false,
        income: false,
        review: false,
      },
    },
    creditRef: {
      ...profile.creditRef,
      items: profile.creditRef.items ?? [],
    },
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const row = draft.searchRow;
  const completionChecks = row.completionChecks ?? {
    apply: false,
    partakers: false,
    credit: false,
    income: false,
    review: false,
  };

  async function saveProfile() {
    setSaveMessage(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/profile/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: draft }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      setSaveMessage(langText(isZh, "Saved to database.", "已儲存到資料庫。"));
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Customer360</p>
            <input
              value={row.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, name: e.target.value } }))}
              className="mt-1 w-full max-w-md rounded border border-slate-300 bg-white px-2 py-1 text-2xl font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
            />
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              HKID/ID{" "}
              <input
                value={row.idNumber}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, idNumber: e.target.value } }))}
                className="mx-1 w-36 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
              ·{" "}
              {langText(isZh, "Passport", "護照")}{" "}
              <input
                value={row.passportNumber || ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, passportNumber: e.target.value } }))}
                className="mx-1 w-36 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                placeholder="—"
              />
              ·{" "}
              {langText(isZh, "Mobile", "手機")}{" "}
              <input
                value={row.mobile}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, mobile: e.target.value } }))}
                className="mx-1 w-36 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
              />
              · <span className="font-mono">{maskPhoneDisplay(row.mobile)}</span> ·{" "}
              <input
                value={row.applicationNumber}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, applicationNumber: e.target.value } }))}
                className="w-40 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
              />
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {langText(isZh, "Loan", "貸款")}{" "}
              <input
                value={row.loanNumber}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, loanNumber: e.target.value } }))}
                className="w-40 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
              />{" "}
              · {langText(isZh, "Age", "年齡")}{" "}
              <input
                type="number"
                value={row.age}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    searchRow: { ...prev.searchRow, age: Number.parseInt(e.target.value || "0", 10) || 0 },
                  }))
                }
                className="w-16 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              />{" "}
              ·{" "}
              <input
                value={row.job}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, job: e.target.value } }))}
                className="w-28 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              />{" "}
              ·{" "}
              <input
                value={row.companyUnit}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, companyUnit: e.target.value } }))}
                className="w-36 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-950"
              />
            </p>
            <p className="mt-1 text-xs text-slate-500">
              TE Ref. Enquiry:{" "}
              <input
                value={row.teRefEnquiry || ""}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, teRefEnquiry: e.target.value } }))}
                className="w-48 rounded border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-xs dark:border-slate-700 dark:bg-slate-950"
                placeholder="N/A"
              />
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
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          searchRow: {
                            ...prev.searchRow,
                            completionChecks: {
                              ...(prev.searchRow.completionChecks ?? completionChecks),
                              [key]: e.target.checked,
                            },
                          },
                        }))
                      }
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
            <input
              value={row.status}
              onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, status: e.target.value } }))}
              className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            {row.blacklistFlag ? (
              <span className="rounded-full bg-red-100 px-2 py-1 font-medium text-red-900 dark:bg-red-950 dark:text-red-200">
                {langText(isZh, "Blacklist", "黑名單")}
              </span>
            ) : null}
            <label className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-1 text-red-800 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
              <input
                type="checkbox"
                checked={row.blacklistFlag}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, blacklistFlag: e.target.checked } }))}
              />
              BL
            </label>
            <span className="rounded-full border border-slate-200 px-2 py-1 text-slate-600 dark:border-slate-700 dark:text-slate-400">
              <input
                value={row.sourceSystem}
                onChange={(e) => setDraft((prev) => ({ ...prev, searchRow: { ...prev.searchRow, sourceSystem: e.target.value } }))}
                className="bg-transparent text-center outline-none"
              />
            </span>
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-1 text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-200">
              A-E {completionChecks.apply && completionChecks.partakers && completionChecks.credit && completionChecks.income && completionChecks.review ? "done" : "pending"}
            </span>
            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="rounded-lg bg-slate-900 px-3 py-1.5 font-semibold text-white disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900"
            >
              {saving ? langText(isZh, "Saving...", "儲存中...") : langText(isZh, "Save all changes", "儲存全部更改")}
            </button>
          </div>
        </div>
        {saveMessage ? <p className="mt-3 text-xs text-slate-500">{saveMessage}</p> : null}
      </div>

      <RiskAnalysisCard profile={draft} />

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
          {tab === "apply" ? (
            <Apply profile={draft} onChange={(applyInfo) => setDraft((prev) => ({ ...prev, applyInfo }))} />
          ) : null}
          {tab === "partakers" ? (
            <Partakers profile={draft} onChange={(partakers) => setDraft((prev) => ({ ...prev, partakers }))} />
          ) : null}
          {tab === "credit" ? (
            <Credit
              profile={draft}
              onChange={(creditRef) =>
                setDraft((prev) => ({
                  ...prev,
                  creditRef,
                }))
              }
            />
          ) : null}
          {tab === "mortgage" ? (
            <Mortgage profile={draft} onChange={(mortgage) => setDraft((prev) => ({ ...prev, mortgage }))} />
          ) : null}
          {tab === "dsr" ? <Dsr profile={draft} onChange={(dsr) => setDraft((prev) => ({ ...prev, dsr }))} /> : null}
          {tab === "loans" ? (
            <Loans profile={draft} onChange={(loanHistory) => setDraft((prev) => ({ ...prev, loanHistory }))} />
          ) : null}
          {tab === "partaking" ? (
            <Partaking profile={draft} onChange={(partakingHistory) => setDraft((prev) => ({ ...prev, partakingHistory }))} />
          ) : null}
          {tab === "approval" ? (
            <Approval profile={draft} onChange={(approvalInfo) => setDraft((prev) => ({ ...prev, approvalInfo }))} />
          ) : null}
          {tab === "repay" ? (
            <Repay profile={draft} onChange={(repayHistory) => setDraft((prev) => ({ ...prev, repayHistory }))} />
          ) : null}
          {tab === "repayCond" ? (
            <RepayCond profile={draft} onChange={(repayCondition) => setDraft((prev) => ({ ...prev, repayCondition }))} />
          ) : null}
          {tab === "oca" ? (
            <Oca profile={draft} onChange={(ocaWriteOff) => setDraft((prev) => ({ ...prev, ocaWriteOff }))} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Apply({ profile, onChange }: { profile: CustomerProfile; onChange: (applyInfo: CustomerProfile["applyInfo"]) => void }) {
  const { isZh } = useLanguage();
  const a = profile.applyInfo;
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-3">
      <Field label={langText(isZh, "Loan type", "貸款類型")} value={a.loanType || a.product || ""} onChange={(value) => onChange({ ...a, loanType: value })} />
      <Field label={langText(isZh, "Interest method", "計息方式")} value={a.interestMethod || ""} onChange={(value) => onChange({ ...a, interestMethod: value })} />
      <Field label={langText(isZh, "Repay cycle", "還款週期")} value={a.repayCycle || ""} onChange={(value) => onChange({ ...a, repayCycle: value })} />
      <Field label={langText(isZh, "Loan amount", "貸款金額")} value={a.loanAmount || ""} onChange={(value) => onChange({ ...a, loanAmount: value })} />
      <Field label={langText(isZh, "Total tenor", "總期數")} value={a.totalTenor || ""} onChange={(value) => onChange({ ...a, totalTenor: value })} />
      <Field label={langText(isZh, "Instalment amount", "分期金額")} value={a.instalmentAmount || ""} onChange={(value) => onChange({ ...a, instalmentAmount: value })} />
      <Field label={langText(isZh, "Flat rate", "平息")} value={a.flatRate || ""} onChange={(value) => onChange({ ...a, flatRate: value })} />
      <Field label={langText(isZh, "Effective rate", "實際利率")} value={a.effectiveRate || ""} onChange={(value) => onChange({ ...a, effectiveRate: value })} />
      <Field label={langText(isZh, "Max interest", "最高利息")} value={a.maxInterest || ""} onChange={(value) => onChange({ ...a, maxInterest: value })} />
      <Field label={langText(isZh, "Total interest", "總利息")} value={a.totalInterest || ""} onChange={(value) => onChange({ ...a, totalInterest: value })} />
      <Field label={langText(isZh, "Apply date", "申請日期")} value={a.applyDate || a.applicationDate || ""} onChange={(value) => onChange({ ...a, applyDate: value })} />
      <Field label={langText(isZh, "Loan purpose", "貸款用途")} value={a.loanPurpose || ""} onChange={(value) => onChange({ ...a, loanPurpose: value })} />
      <Field label={langText(isZh, "Status", "狀態")} value={a.status || ""} onChange={(value) => onChange({ ...a, status: value })} />
      <Field label={langText(isZh, "Branch", "分行")} value={a.branch || ""} onChange={(value) => onChange({ ...a, branch: value })} />
      <Field label={langText(isZh, "Staff", "職員")} value={a.staff || ""} onChange={(value) => onChange({ ...a, staff: value })} />
      <Field label={langText(isZh, "Referral agent", "轉介代理")} value={a.referralAgent || ""} onChange={(value) => onChange({ ...a, referralAgent: value })} />
      <Field label={langText(isZh, "R.A. address", "代理地址")} value={a.referralAgentAddress || ""} onChange={(value) => onChange({ ...a, referralAgentAddress: value })} className="sm:col-span-2" />
      <Field label={langText(isZh, "Relation", "關係")} value={a.relation || ""} onChange={(value) => onChange({ ...a, relation: value })} />
      <Field label={langText(isZh, "Main avenue", "主要渠道")} value={a.mainAvenue || ""} onChange={(value) => onChange({ ...a, mainAvenue: value })} />
      <Field label={langText(isZh, "Main purpose", "主要目的")} value={a.mainPurpose || ""} onChange={(value) => onChange({ ...a, mainPurpose: value })} />
      <Field label={langText(isZh, "Autopay / bank", "自動轉帳 / 銀行")} value={a.autopayBankInfo || ""} onChange={(value) => onChange({ ...a, autopayBankInfo: value })} className="sm:col-span-2" />
      <TextField label={langText(isZh, "Personal info", "個人資料")} value={a.personalInfo || ""} onChange={(value) => onChange({ ...a, personalInfo: value })} className="sm:col-span-2" />
      <TextField label={langText(isZh, "Notes", "備註")} value={a.notes || a.applicantNote || ""} onChange={(value) => onChange({ ...a, notes: value })} className="sm:col-span-3" />
    </div>
  );
}

function Partakers({ profile, onChange }: { profile: CustomerProfile; onChange: (partakers: CustomerProfile["partakers"]) => void }) {
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
                  <td className="px-2 py-2"><InlineInput value={p.partakerType || p.relationship || ""} onChange={(value) => onChange(updateList(rows, i, { ...p, partakerType: value }))} /></td>
                  <td className="px-2 py-2"><InlineInput value={p.name} onChange={(value) => onChange(updateList(rows, i, { ...p, name: value }))} /></td>
                  <td className="px-2 py-2">
                    <InlineInput
                      value={p.mobileNo || p.contact || ""}
                      onChange={(value) => onChange(updateList(rows, i, { ...p, mobileNo: value }))}
                      placeholder={maskContactDisplay(p.mobileNo || p.contact || "—")}
                    />
                  </td>
                  <td className="px-2 py-2"><InlineInput value={p.homeNo || ""} onChange={(value) => onChange(updateList(rows, i, { ...p, homeNo: value }))} placeholder={maskContactDisplay(p.homeNo || "—")} /></td>
                  <td className="px-2 py-2 font-mono"><InlineInput value={p.passport || ""} onChange={(value) => onChange(updateList(rows, i, { ...p, passport: value }))} /></td>
                  <td className="px-2 py-2"><InlineInput value={p.relation || p.relationship || ""} onChange={(value) => onChange(updateList(rows, i, { ...p, relation: value }))} /></td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={Boolean(p.selected)} onChange={(e) => onChange(updateList(rows, i, { ...p, selected: e.target.checked }))} className="size-3.5" />
                      <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-[10px] text-red-600">
                        Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...rows,
            { name: "", partakerType: "", relation: "", mobileNo: "", homeNo: "", passport: "", selected: false },
          ])
        }
        className="rounded border border-slate-300 px-2 py-1 text-xs"
      >
        + {langText(isZh, "Add partaker", "新增關係人")}
      </button>
    </div>
  );
}

function Credit({ profile, onChange }: { profile: CustomerProfile; onChange: (creditRef: CustomerProfile["creditRef"]) => void }) {
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

  return (
    <div className="space-y-3 text-sm">
      <TextField label={langText(isZh, "Summary", "摘要")} value={c.summary} onChange={(value) => onChange({ ...c, summary: value })} />
      <TextField
        label={langText(isZh, "Indicators (one line each)", "指標（每行一項）")}
        value={c.indicators.join("\n")}
        onChange={(value) => onChange({ ...c, indicators: value.split("\n").map((x) => x.trim()).filter(Boolean) })}
      />
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
                <td className="px-2 py-2"><InlineInput value={r.creditor} onChange={(value) => onChange({ ...c, items: updateList(rows, i, { ...r, creditor: value }) })} /></td>
                <td className="px-2 py-2"><InlineInput value={r.creditType} onChange={(value) => onChange({ ...c, items: updateList(rows, i, { ...r, creditType: value }) })} /></td>
                <td className="px-2 py-2"><InlineInput value={r.loanAmount} onChange={(value) => onChange({ ...c, items: updateList(rows, i, { ...r, loanAmount: value }) })} /></td>
                <td className="px-2 py-2"><InlineInput value={r.instalmentAmount} onChange={(value) => onChange({ ...c, items: updateList(rows, i, { ...r, instalmentAmount: value }) })} /></td>
                <td className="px-2 py-2"><InlineInput value={r.outstandingTenor} onChange={(value) => onChange({ ...c, items: updateList(rows, i, { ...r, outstandingTenor: value }) })} /></td>
                <td className="px-2 py-2"><InlineInput value={r.balanceAmount} onChange={(value) => onChange({ ...c, items: updateList(rows, i, { ...r, balanceAmount: value }) })} /></td>
                <td className="px-2 py-2">
                  <div className="flex items-center gap-1">
                    <InlineInput value={r.debtor} onChange={(value) => onChange({ ...c, items: updateList(rows, i, { ...r, debtor: value }) })} />
                    <button type="button" onClick={() => onChange({ ...c, items: rows.filter((_, idx) => idx !== i) })} className="text-[10px] text-red-600">
                      Del
                    </button>
                  </div>
                </td>
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
      <button
        type="button"
        onClick={() =>
          onChange({
            ...c,
            items: [
              ...rows,
              { creditor: "", creditType: "", loanAmount: "", instalmentAmount: "", outstandingTenor: "", balanceAmount: "", debtor: "" },
            ],
          })
        }
        className="rounded border border-slate-300 px-2 py-1 text-xs"
      >
        + {langText(isZh, "Add credit row", "新增信貸列")}
      </button>
    </div>
  );
}

function Mortgage({ profile, onChange }: { profile: CustomerProfile; onChange: (mortgage: CustomerProfile["mortgage"]) => void }) {
  const { isZh } = useLanguage();
  const m = profile.mortgage;
  return (
    <div className="space-y-3 text-sm">
      <label className="inline-flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" checked={m.applicable} onChange={(e) => onChange({ ...m, applicable: e.target.checked })} />
        {langText(isZh, "Applicable", "適用")}
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={langText(isZh, "Collateral ref", "抵押參考")} value={m.collateralRef} onChange={(value) => onChange({ ...m, collateralRef: value })} />
        <TextField label={langText(isZh, "Asset summary", "資產摘要")} value={m.assetSummary} onChange={(value) => onChange({ ...m, assetSummary: value })} className="sm:col-span-2" />
      </div>
      <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
        File Created / Modified Time
      </button>
    </div>
  );
}

function Dsr({ profile, onChange }: { profile: CustomerProfile; onChange: (dsr: CustomerProfile["dsr"]) => void }) {
  const { isZh } = useLanguage();
  const d = profile.dsr;
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-2">
      <Field label={langText(isZh, "Income", "收入")} value={d.income} onChange={(value) => onChange({ ...d, income: value })} />
      <Field label={langText(isZh, "Expenditure", "支出")} value={d.expenditure} onChange={(value) => onChange({ ...d, expenditure: value })} />
      <Field label="DSR" value={d.ratio} onChange={(value) => onChange({ ...d, ratio: value })} />
      <TextField label={langText(isZh, "Notes", "備註")} value={d.notes} onChange={(value) => onChange({ ...d, notes: value })} className="sm:col-span-2" />
    </div>
  );
}

function Loans({ profile, onChange }: { profile: CustomerProfile; onChange: (loanHistory: CustomerProfile["loanHistory"]) => void }) {
  const { isZh } = useLanguage();
  const rows = profile.loanHistory;
  return (
    <div className="space-y-3">
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
          {rows.map((l, i) => (
            <tr key={i}>
              <td className="py-2"><InlineInput value={l.status} onChange={(value) => onChange(updateList(rows, i, { ...l, status: value }))} /></td>
              <td className="py-2 font-mono text-xs"><InlineInput value={l.applyNumber || profile.searchRow.applicationNumber} onChange={(value) => onChange(updateList(rows, i, { ...l, applyNumber: value }))} /></td>
              <td className="py-2 font-mono text-xs"><InlineInput value={l.loanNumber} onChange={(value) => onChange(updateList(rows, i, { ...l, loanNumber: value }))} /></td>
              <td className="py-2 flex items-center gap-1">
                <InlineInput value={String(l.repaidTenor || 0)} onChange={(value) => onChange(updateList(rows, i, { ...l, repaidTenor: Number.parseInt(value || "0", 10) || 0 }))} className="w-12" />
                /
                <InlineInput value={String(l.totalTenor || "")} onChange={(value) => onChange(updateList(rows, i, { ...l, totalTenor: Number.parseInt(value || "0", 10) || 0 }))} className="w-12" />
              </td>
              <td className="py-2"><InlineInput value={l.loanAmount || ""} onChange={(value) => onChange(updateList(rows, i, { ...l, loanAmount: value }))} /></td>
              <td className="py-2"><InlineInput value={l.instalmentAmount || ""} onChange={(value) => onChange(updateList(rows, i, { ...l, instalmentAmount: value }))} /></td>
              <td className="py-2"><InlineInput value={l.principalBalance || ""} onChange={(value) => onChange(updateList(rows, i, { ...l, principalBalance: value }))} /></td>
              <td className="py-2"><InlineInput value={l.interestBalance || ""} onChange={(value) => onChange(updateList(rows, i, { ...l, interestBalance: value }))} /></td>
              <td className="py-2 whitespace-nowrap text-slate-600 dark:text-slate-400"><InlineInput value={l.nextDueDate || ""} onChange={(value) => onChange(updateList(rows, i, { ...l, nextDueDate: value }))} /></td>
              <td className="py-2">
                <div className="flex items-center gap-1">
                  <Link
                    href={`/profile/${profile.id}/loan/${encodeURIComponent(l.loanNumber)}`}
                    className="rounded border border-slate-300 px-2 py-1 text-[11px] font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
                  >
                    {langText(isZh, "Detail", "詳情")}
                  </Link>
                  <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-[10px] text-red-600">
                    Del
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() =>
          onChange([
            ...rows,
            { status: "", applyNumber: "", loanNumber: "", repaidTenor: 0, totalTenor: 0, loanAmount: "", instalmentAmount: "", principalBalance: "", interestBalance: "", nextDueDate: "" },
          ])
        }
        className="rounded border border-slate-300 px-2 py-1 text-xs"
      >
        + {langText(isZh, "Add loan history row", "新增貸款紀錄")}
      </button>
    </div>
  );
}

function Partaking({ profile, onChange }: { profile: CustomerProfile; onChange: (partakingHistory: CustomerProfile["partakingHistory"]) => void }) {
  const { isZh } = useLanguage();
  const rows = profile.partakingHistory;
  return (
    <div className="space-y-3">
      <ul className="space-y-3 text-sm">
        {rows.length === 0 ? (
          <li className="text-slate-500">{langText(isZh, "No partaking history.", "未有參與紀錄。")}</li>
        ) : (
          rows.map((p, i) => (
            <li key={i} className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
              <div className="grid gap-2 sm:grid-cols-3">
                <InlineInput value={p.period} onChange={(value) => onChange(updateList(rows, i, { ...p, period: value }))} />
                <InlineInput value={p.relatedApplication} onChange={(value) => onChange(updateList(rows, i, { ...p, relatedApplication: value }))} />
                <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-left text-[11px] text-red-600">
                  Delete row
                </button>
              </div>
              <InlineInput value={p.description} onChange={(value) => onChange(updateList(rows, i, { ...p, description: value }))} className="mt-2 w-full" />
            </li>
          ))
        )}
      </ul>
      <button
        type="button"
        onClick={() => onChange([...rows, { period: "", description: "", relatedApplication: "" }])}
        className="rounded border border-slate-300 px-2 py-1 text-xs"
      >
        + {langText(isZh, "Add partaking history row", "新增參與紀錄")}
      </button>
      <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
        File Created / Modified Time
      </button>
    </div>
  );
}

function Approval({ profile, onChange }: { profile: CustomerProfile; onChange: (approvalInfo: CustomerProfile["approvalInfo"]) => void }) {
  const { isZh } = useLanguage();
  const dsrValue = parseFloat((profile.dsr.ratio || "").replace("%", "").trim());
  const dsrHigh = Number.isFinite(dsrValue) && dsrValue >= 80;
  const rows = profile.approvalInfo;
  return (
    <div className="space-y-3 text-sm">
      <div className={`rounded border p-2 text-xs ${dsrHigh ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200" : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300"}`}>
        DSR: {profile.dsr.ratio || "—"} {dsrHigh ? "⚠ exceeds threshold" : ""}
      </div>
      {rows.map((a, i) => (
        <div key={i} className="rounded-md border border-slate-100 p-3 dark:border-slate-800">
          <div className="mb-2 grid gap-2 sm:grid-cols-3">
            <InlineInput value={a.stage} onChange={(value) => onChange(updateList(rows, i, { ...a, stage: value }))} />
            <InlineInput value={a.approvalDate || a.date || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, approvalDate: value }))} />
            <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-left text-[11px] text-red-600">
              Delete row
            </button>
          </div>
          <InlineInput value={a.decision} onChange={(value) => onChange(updateList(rows, i, { ...a, decision: value }))} className="mb-2 w-full" />
          <dl className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
            <Field label={langText(isZh, "Approval staff", "批核職員")} value={a.approvalStaff || a.reviewer || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, approvalStaff: value }))} />
            <Field label={langText(isZh, "Payout date", "放款日期")} value={a.payoutDate || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, payoutDate: value }))} />
            <Field label={langText(isZh, "Loan date", "貸款日期")} value={a.loanDate || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, loanDate: value }))} />
            <Field label={langText(isZh, "First due date", "首次到期日")} value={a.firstDueDate || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, firstDueDate: value }))} />
            <Field label={langText(isZh, "First repay amount", "首期還款")} value={a.firstRepayAmount || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, firstRepayAmount: value }))} />
            <Field label={langText(isZh, "Interest method", "計息方式")} value={a.interestMethod || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, interestMethod: value }))} />
            <Field label={langText(isZh, "Repay cycle", "還款週期")} value={a.repayCycle || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, repayCycle: value }))} />
            <Field label={langText(isZh, "Loan amount", "貸款金額")} value={a.loanAmount || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, loanAmount: value }))} />
            <Field label={langText(isZh, "Total tenor", "總期數")} value={a.totalTenor || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, totalTenor: value }))} />
            <Field label={langText(isZh, "Flat rate", "平息")} value={a.flatRate || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, flatRate: value }))} />
            <Field label={langText(isZh, "Effective rate", "實際利率")} value={a.effectiveRate || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, effectiveRate: value }))} />
            <Field label={langText(isZh, "Penalty setting", "罰息設定")} value={a.penaltySetting || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, penaltySetting: value }))} />
            <Field label="DSR" value={a.dsr || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, dsr: value }))} />
            <Field label={langText(isZh, "Extended interest day", "延長利息日數")} value={a.extendedInterestDay || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, extendedInterestDay: value }))} />
            <Field label={langText(isZh, "Extended interest amount", "延長利息金額")} value={a.extendedInterestAmount || ""} onChange={(value) => onChange(updateList(rows, i, { ...a, extendedInterestAmount: value }))} />
          </dl>
          <TextField label={langText(isZh, "Notes", "備註")} value={a.notes} onChange={(value) => onChange(updateList(rows, i, { ...a, notes: value }))} className="mt-2" />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([
            ...rows,
            { stage: "", decision: "", notes: "", approvalStaff: "", approvalDate: "", payoutDate: "", loanDate: "", firstDueDate: "", firstRepayAmount: "", interestMethod: "", repayCycle: "", loanAmount: "", totalTenor: "", flatRate: "", effectiveRate: "", penaltySetting: "", dsr: "", extendedInterestDay: "", extendedInterestAmount: "" },
          ])
        }
        className="rounded border border-slate-300 px-2 py-1 text-xs"
      >
        + {langText(isZh, "Add approval row", "新增批核列")}
      </button>
    </div>
  );
}

function Repay({ profile, onChange }: { profile: CustomerProfile; onChange: (repayHistory: CustomerProfile["repayHistory"]) => void }) {
  const { isZh } = useLanguage();
  const rows = profile.repayHistory;
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
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="py-2 whitespace-nowrap"><InlineInput value={r.repayDate || r.date || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, repayDate: value }))} /></td>
            <td className="py-2"><InlineInput value={r.repayNo || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, repayNo: value }))} /></td>
            <td className="py-2"><InlineInput value={r.repayType || r.channel || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, repayType: value }))} /></td>
            <td className="py-2"><InlineInput value={r.tenor || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, tenor: value }))} /></td>
            <td className="py-2"><InlineInput value={r.repayAmount || r.amount || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, repayAmount: value }))} /></td>
            <td className="py-2"><InlineInput value={r.overdueInterest || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, overdueInterest: value }))} /></td>
            <td className="py-2"><InlineInput value={r.handlingFee || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, handlingFee: value }))} /></td>
            <td className="py-2"><InlineInput value={r.receivedAmount || r.amount || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, receivedAmount: value }))} /></td>
            <td className="py-2"><InlineInput value={r.tempAmount || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, tempAmount: value }))} /></td>
            <td className="py-2">
              <div className="flex items-center gap-1">
                <InlineInput value={r.remarks || r.balanceAfter || ""} onChange={(value) => onChange(updateList(rows, i, { ...r, remarks: value }))} />
                <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-[10px] text-red-600">
                  Del
                </button>
              </div>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() =>
          onChange([
            ...rows,
            { repayDate: "", repayNo: "", repayType: "", tenor: "", repayAmount: "", overdueInterest: "", handlingFee: "", receivedAmount: "", tempAmount: "", remarks: "" },
          ])
        }
        className="rounded border border-slate-300 px-2 py-1 text-xs"
      >
        + {langText(isZh, "Add repay row", "新增還款列")}
      </button>
      <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
        File Created / Modified Time
      </button>
    </div>
  );
}

function RepayCond({ profile, onChange }: { profile: CustomerProfile; onChange: (repayCondition: CustomerProfile["repayCondition"]) => void }) {
  const { isZh } = useLanguage();
  const r = profile.repayCondition;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 text-sm sm:grid-cols-3">
        <TextField label={langText(isZh, "Terms", "條款")} value={r.terms || ""} onChange={(value) => onChange({ ...r, terms: value })} className="sm:col-span-3" />
        <Field label={langText(isZh, "State", "狀態")} value={r.state} onChange={(value) => onChange({ ...r, state: value })} />
        <Field label={langText(isZh, "Overdue days", "逾期日數")} value={String(r.overdueDays)} onChange={(value) => onChange({ ...r, overdueDays: Number.parseInt(value || "0", 10) || 0 })} />
        <Field label={langText(isZh, "Next repay date", "下次還款日")} value={r.nextRepayDate || ""} onChange={(value) => onChange({ ...r, nextRepayDate: value })} />
        <Field label={langText(isZh, "Next repay amount", "下次還款金額")} value={r.nextRepayAmount || ""} onChange={(value) => onChange({ ...r, nextRepayAmount: value })} />
        <Field label={langText(isZh, "Principal balance", "本金結餘")} value={r.principalBalance || ""} onChange={(value) => onChange({ ...r, principalBalance: value })} />
        <Field label={langText(isZh, "Interest balance", "利息結餘")} value={r.interestBalance || ""} onChange={(value) => onChange({ ...r, interestBalance: value })} />
        <Field label={langText(isZh, "Fee balance", "費用結餘")} value={r.feeBalance || ""} onChange={(value) => onChange({ ...r, feeBalance: value })} />
        <TextField label={langText(isZh, "Collection notes", "催收備註")} value={r.collectionNotes} onChange={(value) => onChange({ ...r, collectionNotes: value })} className="sm:col-span-3" />
      </div>
      <button type="button" className="rounded border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800">
        File Created / Modified Time
      </button>
    </div>
  );
}

function Oca({ profile, onChange }: { profile: CustomerProfile; onChange: (ocaWriteOff: CustomerProfile["ocaWriteOff"]) => void }) {
  const { isZh } = useLanguage();
  const o = profile.ocaWriteOff;
  return (
    <div className="space-y-4 text-sm">
      <TextField
        label="OCA"
        value={o.ocaRecords.join("\n")}
        onChange={(value) => onChange({ ...o, ocaRecords: value.split("\n").map((x) => x.trim()).filter(Boolean) })}
      />
      <TextField
        label={langText(isZh, "Write-off", "撇帳")}
        value={o.writeOffRecords.join("\n")}
        onChange={(value) => onChange({ ...o, writeOffRecords: value.split("\n").map((x) => x.trim()).filter(Boolean) })}
      />
      <Field label={langText(isZh, "Recovery", "追收")} value={o.recovery} onChange={(value) => onChange({ ...o, recovery: value })} />
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

function updateList<T>(list: T[], index: number, next: T) {
  return list.map((item, idx) => (idx === index ? next : item));
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
    </div>
  );
}

function TextField({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-0.5 w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
    </div>
  );
}

function InlineInput({
  value,
  onChange,
  placeholder,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full min-w-0 rounded border border-slate-300 bg-white px-1.5 py-1 text-[11px] dark:border-slate-700 dark:bg-slate-950 ${className}`}
    />
  );
}
