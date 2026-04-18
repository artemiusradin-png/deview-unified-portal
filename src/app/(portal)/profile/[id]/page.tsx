import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { getServerSession } from "@/lib/auth-session";
import { getProfileById } from "@/lib/portal-data";
import { ProfileModules } from "@/components/ProfileModules";
import {
  addAttachmentAction,
  addCaseNoteAction,
  logTeInquiryCostAction,
  updateWorkflowAction,
} from "./actions";

type Props = { params: Promise<{ id: string }> };

export default async function ProfilePage({ params }: Props) {
  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) notFound();

  const session = await getServerSession();
  const h = await headers();
  await writeAudit({
    userId: session?.userId,
    action: "profile.view",
    resource: id,
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  });

  const dbEnabled = isDatabaseConfigured();
  const [notes, attachments, workflow, inquiryLogs] = dbEnabled
    ? await Promise.all([
        prisma.borrowerCaseNote.findMany({
          where: { customerId: id },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        prisma.borrowerAttachment.findMany({
          where: { customerId: id },
          orderBy: { uploadedAt: "desc" },
          take: 20,
        }),
        prisma.borrowerWorkflow.findUnique({ where: { customerId: id } }),
        prisma.tEInquiryCostLog.findMany({
          where: { customerId: id },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ])
    : [[], [], null, []];

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
        <span className="lang-en">← Back to search</span>
        <span className="lang-zh">← 返回搜尋</span>
      </Link>
      <div className="mt-4">
        <ProfileModules profile={profile} />
      </div>
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Internal case notes</h2>
          {dbEnabled ? (
            <>
              <form action={addCaseNoteAction} className="mt-3 space-y-2">
                <input type="hidden" name="customerId" value={id} />
                <textarea
                  name="note"
                  required
                  rows={3}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                  placeholder="Add a review note for the team..."
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  Save note
                </button>
              </form>
              <ul className="mt-3 space-y-2 text-sm">
                {notes.length === 0 ? (
                  <li className="text-slate-500">No notes yet.</li>
                ) : (
                  notes.map((n) => (
                    <li key={n.id} className="rounded border border-slate-100 p-2 dark:border-slate-800">
                      <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {n.authorName ?? "Unknown"} · {n.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Enable DATABASE_URL to store case notes.</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Workflow status</h2>
          {dbEnabled ? (
            <form action={updateWorkflowAction} className="mt-3 grid gap-2">
              <input type="hidden" name="customerId" value={id} />
              <label className="text-xs text-slate-500">
                Review status
                <select
                  name="status"
                  defaultValue={workflow?.status ?? "new"}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
                >
                  <option value="new">New</option>
                  <option value="in_review">In review</option>
                  <option value="waiting_docs">Waiting docs</option>
                  <option value="escalated">Escalated</option>
                  <option value="approved">Approved</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label className="text-xs text-slate-500">
                Owner
                <input
                  name="owner"
                  defaultValue={workflow?.owner ?? ""}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
              </label>
              <label className="text-xs text-slate-500">
                Due date
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={workflow?.dueDate ? workflow.dueDate.toISOString().slice(0, 10) : ""}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
              </label>
              <label className="text-xs text-slate-500">
                Team notes
                <textarea
                  name="reviewNotes"
                  defaultValue={workflow?.reviewNotes ?? ""}
                  rows={3}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
              </label>
              <button
                type="submit"
                className="w-fit rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
              >
                Update workflow
              </button>
            </form>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Enable DATABASE_URL to track workflow state.</p>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Document / screenshot attachments</h2>
          {dbEnabled ? (
            <>
              <form action={addAttachmentAction} className="mt-3 grid gap-2">
                <input type="hidden" name="customerId" value={id} />
                <input
                  name="label"
                  required
                  placeholder="Attachment label"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
                <input
                  name="url"
                  required
                  placeholder="https://... (storage link or screenshot URL)"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  Add attachment
                </button>
              </form>
              <ul className="mt-3 space-y-2 text-sm">
                {attachments.length === 0 ? (
                  <li className="text-slate-500">No attachments yet.</li>
                ) : (
                  attachments.map((a) => (
                    <li key={a.id} className="rounded border border-slate-100 p-2 dark:border-slate-800">
                      <a href={a.url} target="_blank" rel="noreferrer" className="font-medium text-slate-900 underline dark:text-slate-100">
                        {a.label}
                      </a>
                      <p className="mt-1 truncate text-[11px] text-slate-500">{a.url}</p>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Enable DATABASE_URL to store attachment references.</p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">TE Credit inquiry cost</h2>
          <p className="mt-1 text-xs text-slate-500">
            Log paid external TE inquiry calls for this borrower.
          </p>
          {dbEnabled ? (
            <>
              <form action={logTeInquiryCostAction} className="mt-3 grid gap-2">
                <input type="hidden" name="customerId" value={id} />
                <input type="hidden" name="idNumber" value={profile.searchRow.idNumber} />
                <label className="text-xs text-slate-500">
                  Query purpose
                  <input
                    name="query"
                    defaultValue="Borrower profile check"
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                  />
                </label>
                <label className="text-xs text-slate-500">
                  Cost (SGD cents)
                  <input
                    name="costCents"
                    type="number"
                    min={0}
                    defaultValue={300}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                  />
                </label>
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  Log inquiry cost
                </button>
              </form>
              <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {inquiryLogs.length === 0 ? (
                  <li>No inquiry cost entries yet.</li>
                ) : (
                  inquiryLogs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between rounded border border-slate-100 px-2 py-1 dark:border-slate-800">
                      <span>{log.query ?? "manual query"}</span>
                      <span>${(log.costCents / 100).toFixed(2)}</span>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Enable DATABASE_URL to track inquiry spend.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/profile/${id}/print`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Open printable report
            </Link>
            <Link
              href={`/api/profile/${id}/report.csv`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Export borrower CSV
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
