"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { writeAudit } from "@/lib/audit";
import { getServerSession } from "@/lib/auth-session";
import { isAdminRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { runDataSourceSync } from "@/lib/sync";

async function auditMeta() {
  const h = await headers();
  return {
    ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: h.get("user-agent"),
  };
}

async function requireAdmin() {
  const s = await getServerSession();
  if (!s || !isAdminRole(s.role)) {
    throw new Error("Unauthorized");
  }
  return s;
}

async function requireStaffOrAdmin() {
  const s = await getServerSession();
  if (!s || (s.role !== "ADMIN" && s.role !== "STAFF")) {
    throw new Error("Unauthorized");
  }
  return s;
}

export async function createDataSourceAction(formData: FormData) {
  const s = await requireAdmin();
  const { ip, userAgent } = await auditMeta();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name required");
  const format = String(formData.get("format") ?? "").trim() || "unknown";
  await prisma.dataSource.create({
    data: {
      name,
      format,
      businessOwner: String(formData.get("businessOwner") ?? "").trim() || null,
      businessUnit: String(formData.get("businessUnit") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      accessMethod: String(formData.get("accessMethod") ?? "").trim() || null,
      refreshMethod: String(formData.get("refreshMethod") ?? "").trim() || null,
      refreshFrequency: String(formData.get("refreshFrequency") ?? "").trim() || null,
      status: String(formData.get("status") ?? "").trim() || "inventory",
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  await writeAudit({
    userId: s.userId,
    action: "admin.source.create",
    resource: name,
    ip,
    userAgent,
  });
  revalidatePath("/admin/sources");
}

export async function createUserAction(formData: FormData) {
  const s = await requireAdmin();
  const { ip, userAgent } = await auditMeta();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const name = String(formData.get("name") ?? "").trim() || null;
  const roleRaw = String(formData.get("role") ?? "STAFF").toUpperCase();
  if (!email || !password) throw new Error("Email and password required");
  const role =
    roleRaw === "ADMIN" ? Role.ADMIN : roleRaw === "VIEWER" ? Role.VIEWER : Role.STAFF;
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash, name, role },
  });
  await writeAudit({
    userId: s.userId,
    action: "admin.user.create",
    resource: email,
    metadata: { role },
    ip,
    userAgent,
  });
  revalidatePath("/admin/users");
}

export async function runStubSyncAction(formData: FormData) {
  const s = await requireStaffOrAdmin();
  const { ip, userAgent } = await auditMeta();
  const dataSourceId = String(formData.get("dataSourceId") ?? "").trim();
  const simulateFailure = String(formData.get("simulateFailure") ?? "") === "1";
  if (!dataSourceId) throw new Error("Source required");
  const result = await runDataSourceSync({
    dataSourceId,
    trigger: "manual",
    simulateFailure,
  });
  await writeAudit({
    userId: s.userId,
    action: "admin.sync.manual",
    resource: result.jobId,
    metadata: { dataSourceId, simulateFailure, result },
    ip,
    userAgent,
  });
  revalidatePath("/admin/sync");
  revalidatePath("/admin/sources");
  revalidatePath("/admin");
}

export async function markAlertReadAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("alertId") ?? "").trim();
  if (!id) throw new Error("Alert id required");
  await prisma.adminAlert.update({
    where: { id },
    data: { readAt: new Date() },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/management");
}
