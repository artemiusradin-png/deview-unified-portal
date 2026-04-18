import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/portal-data";
import { computeBorrowerRisk } from "@/lib/borrower-risk";
import { PrintButton } from "@/components/PrintButton";

type Props = { params: Promise<{ id: string }> };

export default async function PrintableProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const risk = computeBorrowerRisk(profile);
  const row = profile.searchRow;

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 text-sm print:max-w-none print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <Link href={`/profile/${id}`} className="text-xs text-slate-600 underline">
          ← Back to profile
        </Link>
        <PrintButton />
      </div>

      <section className="rounded border border-slate-200 p-4">
        <h1 className="text-lg font-semibold">Borrower Report</h1>
        <p className="mt-1 text-xs text-slate-600">
          {row.name} · {row.idNumber} · {row.loanNumber}
        </p>
      </section>

      <section className="grid gap-2 rounded border border-slate-200 p-4 sm:grid-cols-2">
        <Item label="Status" value={row.status} />
        <Item label="Loan type" value={row.loanType} />
        <Item label="Application number" value={row.applicationNumber} />
        <Item label="Company / unit" value={row.companyUnit} />
        <Item label="Risk level" value={risk.level} />
        <Item label="Risk score" value={`${risk.score}/100`} />
      </section>

      <section className="rounded border border-slate-200 p-4">
        <h2 className="font-semibold">Recommended actions</h2>
        <ul className="mt-2 list-inside list-disc space-y-1">
          {risk.nextActions.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>

      <section className="rounded border border-slate-200 p-4">
        <h2 className="font-semibold">Repayment and write-off context</h2>
        <p className="mt-2">State: {profile.repayCondition.state || "—"}</p>
        <p>Overdue days: {profile.repayCondition.overdueDays}</p>
        <p>Recovery: {profile.ocaWriteOff.recovery || "—"}</p>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium">{label}: </span>
      {value || "—"}
    </p>
  );
}
