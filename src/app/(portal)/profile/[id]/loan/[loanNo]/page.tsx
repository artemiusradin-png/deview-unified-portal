import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/portal-data";

type Props = {
  params: Promise<{ id: string; loanNo: string }>;
};

export default async function LoanDetailPage({ params }: Props) {
  const { id, loanNo } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const loan = profile.loanHistory.find((x) => x.loanNumber === loanNo);
  if (!loan) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link href={`/profile/${id}`} className="text-xs text-slate-600 underline">
        ← Back to profile
      </Link>
      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Loan detail</h1>
        <p className="mt-1 text-xs text-slate-500">
          {profile.searchRow.name} · {loan.loanNumber}
        </p>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <Item label="Status" value={loan.status} />
          <Item label="Apply no." value={loan.applyNumber || profile.searchRow.applicationNumber} />
          <Item label="Loan no." value={loan.loanNumber} />
          <Item label="Repaid / tenor" value={`${loan.repaidTenor || 0} / ${loan.totalTenor || "—"}`} />
          <Item label="Loan amount" value={loan.loanAmount || "—"} />
          <Item label="Instalment amount" value={loan.instalmentAmount || "—"} />
          <Item label="Principal balance" value={loan.principalBalance || "—"} />
          <Item label="Interest balance" value={loan.interestBalance || "—"} />
          <Item label="Next due date" value={loan.nextDueDate || "—"} />
          <Item label="Product" value={loan.product || "—"} />
          <Item label="Period" value={loan.period || "—"} />
          <Item label="Detail note" value={loan.detailNote || "—"} />
        </dl>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}
