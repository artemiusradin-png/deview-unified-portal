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
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            <span className="lang-en">Internal case notes</span>
            <span className="lang-zh">內部個案備註</span>
          </h2>
          {dbEnabled ? (
            <>
              <form action={addCaseNoteAction} className="mt-3 space-y-2">
                <input type="hidden" name="customerId" value={id} />
                <textarea
                  name="note"
                  required
                  rows={3}
                  className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                  placeholder="Add a review note for the team... / 為團隊新增審批備註..."
                />
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  <span className="lang-en">Save note</span>
                  <span className="lang-zh">儲存備註</span>
                </button>
              </form>
              <ul className="mt-3 space-y-2 text-sm">
                {notes.length === 0 ? (
                  <li className="text-slate-500">
                    <span className="lang-en">No notes yet.</span>
                    <span className="lang-zh">暫時未有備註。</span>
                  </li>
                ) : (
                  notes.map((n) => (
                    <li key={n.id} className="rounded border border-slate-100 p-2 dark:border-slate-800">
                      <p className="text-slate-800 dark:text-slate-200">{n.note}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {n.authorName ?? "Unknown / 未知"} · {n.createdAt.toISOString().slice(0, 19).replace("T", " ")}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              <span className="lang-en">Enable DATABASE_URL to store case notes.</span>
              <span className="lang-zh">請啟用 DATABASE_URL 以儲存個案備註。</span>
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            <span className="lang-en">Workflow status</span>
            <span className="lang-zh">工作流程狀態</span>
          </h2>
          {dbEnabled ? (
            <form action={updateWorkflowAction} className="mt-3 grid gap-2">
              <input type="hidden" name="customerId" value={id} />
              <label className="text-xs text-slate-500">
                <span className="lang-en">Review status</span>
                <span className="lang-zh">審批狀態</span>
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
                <span className="lang-en">Owner</span>
                <span className="lang-zh">負責人</span>
                <input
                  name="owner"
                  defaultValue={workflow?.owner ?? ""}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
              </label>
              <label className="text-xs text-slate-500">
                <span className="lang-en">Due date</span>
                <span className="lang-zh">到期日</span>
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={workflow?.dueDate ? workflow.dueDate.toISOString().slice(0, 10) : ""}
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
              </label>
              <label className="text-xs text-slate-500">
                <span className="lang-en">Team notes</span>
                <span className="lang-zh">團隊備註</span>
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
                <span className="lang-en">Update workflow</span>
                <span className="lang-zh">更新流程</span>
              </button>
            </form>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              <span className="lang-en">Enable DATABASE_URL to track workflow state.</span>
              <span className="lang-zh">請啟用 DATABASE_URL 以追蹤流程狀態。</span>
            </p>
          )}
        </div>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            <span className="lang-en">Document / screenshot attachments</span>
            <span className="lang-zh">文件／截圖附件</span>
          </h2>
          {dbEnabled ? (
            <>
              <form action={addAttachmentAction} className="mt-3 grid gap-2">
                <input type="hidden" name="customerId" value={id} />
                <input
                  name="label"
                  required
                  placeholder="Attachment label / 附件名稱"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
                <input
                  name="url"
                  required
                  placeholder="https://... (storage link or screenshot URL / 儲存連結或截圖網址)"
                  className="w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  className="w-fit rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-slate-100 dark:text-slate-900"
                >
                  <span className="lang-en">Add attachment</span>
                  <span className="lang-zh">新增附件</span>
                </button>
              </form>
              <ul className="mt-3 space-y-2 text-sm">
                {attachments.length === 0 ? (
                  <li className="text-slate-500">
                    <span className="lang-en">No attachments yet.</span>
                    <span className="lang-zh">暫時未有附件。</span>
                  </li>
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
            <p className="mt-2 text-sm text-slate-500">
              <span className="lang-en">Enable DATABASE_URL to store attachment references.</span>
              <span className="lang-zh">請啟用 DATABASE_URL 以儲存附件參考。</span>
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            <span className="lang-en">TE Credit inquiry cost</span>
            <span className="lang-zh">TE Credit 查詢成本</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            <span className="lang-en">Log paid external TE inquiry calls for this borrower.</span>
            <span className="lang-zh">記錄此借款人已付費的外部 TE 查詢。</span>
          </p>
          {dbEnabled ? (
            <>
              <form action={logTeInquiryCostAction} className="mt-3 grid gap-2">
                <input type="hidden" name="customerId" value={id} />
                <input type="hidden" name="idNumber" value={profile.searchRow.idNumber} />
                <label className="text-xs text-slate-500">
                  <span className="lang-en">Query purpose</span>
                  <span className="lang-zh">查詢用途</span>
                  <input
                    name="query"
                    defaultValue="Borrower profile check"
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-950"
                  />
                </label>
                <label className="text-xs text-slate-500">
                  <span className="lang-en">Cost (SGD cents)</span>
                  <span className="lang-zh">費用（新加坡分）</span>
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
                  <span className="lang-en">Log inquiry cost</span>
                  <span className="lang-zh">記錄查詢費用</span>
                </button>
              </form>
              <ul className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                {inquiryLogs.length === 0 ? (
                  <li>
                    <span className="lang-en">No inquiry cost entries yet.</span>
                    <span className="lang-zh">暫時未有查詢費用紀錄。</span>
                  </li>
                ) : (
                  inquiryLogs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between rounded border border-slate-100 px-2 py-1 dark:border-slate-800">
                      <span>{log.query ?? "manual query / 手動查詢"}</span>
                      <span>${(log.costCents / 100).toFixed(2)}</span>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-500">
              <span className="lang-en">Enable DATABASE_URL to track inquiry spend.</span>
              <span className="lang-zh">請啟用 DATABASE_URL 以追蹤查詢開支。</span>
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/profile/${id}/print`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="lang-en">Open printable report</span>
              <span className="lang-zh">開啟可列印報告</span>
            </Link>
            <Link
              href={`/api/profile/${id}/report.csv`}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="lang-en">Export borrower CSV</span>
              <span className="lang-zh">匯出借款人 CSV</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
