import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-session";
import { writeAudit } from "@/lib/audit";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { isStaffOrAbove } from "@/lib/rbac";
import type { CustomerProfile } from "@/types/customer";

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_REST_URL = SUPABASE_URL ? `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1` : "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim() || "";
const SUPABASE_TABLE = process.env.SUPABASE_PORTAL_TABLE?.trim() || "portal_customer_profiles";

function hasSupabaseConfig() {
  return Boolean(SUPABASE_REST_URL && SUPABASE_KEY);
}

function toSupabasePayload(profile: CustomerProfile) {
  const applyInfoWithHeader = {
    ...profile.applyInfo,
    passportNumber: profile.searchRow.passportNumber ?? "",
    teRefEnquiry: profile.searchRow.teRefEnquiry ?? "",
    completionChecks: profile.searchRow.completionChecks ?? null,
  };

  return {
    status: profile.searchRow.status,
    loan_type: profile.searchRow.loanType,
    application_number: profile.searchRow.applicationNumber,
    loan_number: profile.searchRow.loanNumber,
    apply_date: profile.searchRow.applyDate,
    id_number: profile.searchRow.idNumber,
    name: profile.searchRow.name,
    mobile: profile.searchRow.mobile,
    partaker_type: profile.searchRow.partakerType,
    blacklist_flag: profile.searchRow.blacklistFlag,
    source_system: profile.searchRow.sourceSystem,
    age: profile.searchRow.age,
    job: profile.searchRow.job,
    company_unit: profile.searchRow.companyUnit,
    apply_info: applyInfoWithHeader,
    partakers: profile.partakers,
    credit_ref: profile.creditRef,
    documents: profile.documents,
    mortgage: profile.mortgage,
    dsr: profile.dsr,
    loan_history: profile.loanHistory,
    partaking_history: profile.partakingHistory,
    approval_info: profile.approvalInfo,
    repay_history: profile.repayHistory,
    repay_condition: profile.repayCondition,
    crm: profile.crm,
    oca_write_off: profile.ocaWriteOff,
  };
}

async function updateSupabaseProfile(id: string, profile: CustomerProfile) {
  const params = new URLSearchParams();
  params.set("id", `eq.${id}`);
  const res = await fetch(`${SUPABASE_REST_URL}/${SUPABASE_TABLE}?${params.toString()}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(toSupabasePayload(profile)),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase update failed (${res.status}): ${detail || "unknown error"}`);
  }
}

async function updatePrismaProfile(profile: CustomerProfile) {
  await prisma.customerRecord.update({
    where: { id: profile.id },
    data: {
      hkid: profile.searchRow.idNumber,
      name: profile.searchRow.name,
      rawMobile: profile.searchRow.mobile,
      status: profile.searchRow.status,
      loanType: profile.searchRow.loanType,
      applicationNumber: profile.searchRow.applicationNumber,
      loanNumber: profile.searchRow.loanNumber,
      applyDate: profile.searchRow.applyDate,
      partakerType: profile.searchRow.partakerType,
      blacklistFlag: profile.searchRow.blacklistFlag,
      sourceSystem: profile.searchRow.sourceSystem,
      age: profile.searchRow.age,
      job: profile.searchRow.job,
      companyUnit: profile.searchRow.companyUnit,
      profileJson: profile,
    },
  });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session || !isStaffOrAbove(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { profile?: CustomerProfile } | null;
  if (!body?.profile || typeof body.profile !== "object") {
    return NextResponse.json({ error: "Missing profile payload" }, { status: 400 });
  }
  if (body.profile.id !== id) {
    return NextResponse.json({ error: "Profile id mismatch" }, { status: 400 });
  }

  try {
    if (hasSupabaseConfig()) {
      await updateSupabaseProfile(id, body.profile);
    } else if (isDatabaseConfigured()) {
      await updatePrismaProfile(body.profile);
    } else {
      return NextResponse.json({ error: "No database connector configured" }, { status: 400 });
    }

    await writeAudit({
      userId: session.userId,
      action: "profile.edit.save",
      resource: id,
      metadata: { source: hasSupabaseConfig() ? "supabase" : "prisma" },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("profile update failed", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
