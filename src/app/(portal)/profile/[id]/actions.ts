"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getServerSession } from "@/lib/auth-session";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { isStaffOrAbove } from "@/lib/rbac";

async function requireUser() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

async function getMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  };
}

export async function addCaseNoteAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;
  const session = await requireUser();
  const customerId = String(formData.get("customerId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (!customerId || !note) throw new Error("Missing fields");

  await prisma.borrowerCaseNote.create({
    data: {
      customerId,
      note: note.slice(0, 2000),
      authorId: session.userId,
      authorName: session.email,
    },
  });
  const meta = await getMeta();
  await writeAudit({
    userId: session.userId,
    action: "profile.note.create",
    resource: customerId,
    metadata: { chars: note.length },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
  revalidatePath(`/profile/${customerId}`);
}

export async function addAttachmentAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;
  const session = await requireUser();
  const customerId = String(formData.get("customerId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  if (!customerId || !label || !url) throw new Error("Missing fields");
  if (!/^https?:\/\//i.test(url)) throw new Error("Attachment URL must start with http/https");

  await prisma.borrowerAttachment.create({
    data: {
      customerId,
      label: label.slice(0, 140),
      url: url.slice(0, 2000),
      uploadedBy: session.email,
    },
  });
  const meta = await getMeta();
  await writeAudit({
    userId: session.userId,
    action: "profile.attachment.create",
    resource: customerId,
    metadata: { label },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
  revalidatePath(`/profile/${customerId}`);
}

export async function updateWorkflowAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;
  const session = await requireUser();
  if (!isStaffOrAbove(session.role)) throw new Error("Forbidden");

  const customerId = String(formData.get("customerId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() || "new";
  const owner = String(formData.get("owner") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const reviewNotes = String(formData.get("reviewNotes") ?? "").trim();
  if (!customerId) throw new Error("Missing customer");
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;
  const before = await prisma.borrowerWorkflow.findUnique({ where: { customerId } });
  await prisma.borrowerWorkflow.upsert({
    where: { customerId },
    create: {
      customerId,
      status: status.slice(0, 60),
      owner: owner || null,
      dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
      reviewNotes: reviewNotes || null,
      updatedBy: session.email,
    },
    update: {
      status: status.slice(0, 60),
      owner: owner || null,
      dueDate: dueDate && !Number.isNaN(dueDate.getTime()) ? dueDate : null,
      reviewNotes: reviewNotes || null,
      updatedBy: session.email,
    },
  });
  if (before && before.status !== status) {
    await prisma.adminAlert.create({
      data: {
        level: "warning",
        source: "workflow",
        message: `Borrower ${customerId} status changed: ${before.status} → ${status}`,
      },
    });
  }
  const meta = await getMeta();
  await writeAudit({
    userId: session.userId,
    action: "profile.workflow.update",
    resource: customerId,
    metadata: { status, owner },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
  revalidatePath(`/profile/${customerId}`);
}

export async function logTeInquiryCostAction(formData: FormData) {
  if (!isDatabaseConfigured()) return;
  const session = await requireUser();
  const customerId = String(formData.get("customerId") ?? "").trim() || null;
  const idNumber = String(formData.get("idNumber") ?? "").trim() || null;
  const query = String(formData.get("query") ?? "").trim() || null;
  const costRaw = Number(formData.get("costCents") ?? 0);
  const costCents = Number.isFinite(costRaw) && costRaw >= 0 ? Math.round(costRaw) : 0;

  await prisma.tEInquiryCostLog.create({
    data: {
      customerId,
      idNumber,
      query,
      costCents,
      userId: session.userId,
      userEmail: session.email,
    },
  });
  const meta = await getMeta();
  await writeAudit({
    userId: session.userId,
    action: "te.inquiry.cost.log",
    resource: customerId ?? idNumber ?? "manual",
    metadata: { costCents, query },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });
  if (customerId) revalidatePath(`/profile/${customerId}`);
}
