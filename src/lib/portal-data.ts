import type { CustomerRecord } from "@prisma/client";
import type { CustomerProfile, SearchResultRow } from "@/types/customer";
import {
  filterSearchRows,
  getAllSearchRows,
  getProfileById as getMockProfileById,
  profileToChatContext,
  searchCustomers as searchMockCustomers,
  type ResultFilters,
} from "@/lib/mock-data";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

type JsonRecord = Record<string, unknown>;

type SupabasePortalRow = {
  id?: unknown;
  status?: unknown;
  loan_type?: unknown;
  application_number?: unknown;
  loan_number?: unknown;
  apply_date?: unknown;
  id_number?: unknown;
  name?: unknown;
  mobile?: unknown;
  partaker_type?: unknown;
  blacklist_flag?: unknown;
  source_system?: unknown;
  age?: unknown;
  job?: unknown;
  company_unit?: unknown;
  apply_info?: unknown;
  partakers?: unknown;
  credit_ref?: unknown;
  documents?: unknown;
  mortgage?: unknown;
  dsr?: unknown;
  loan_history?: unknown;
  partaking_history?: unknown;
  approval_info?: unknown;
  repay_history?: unknown;
  repay_condition?: unknown;
  crm?: unknown;
  oca_write_off?: unknown;
};

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_REST_URL = SUPABASE_URL ? `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1` : "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim() || "";
const SUPABASE_TABLE = process.env.SUPABASE_PORTAL_TABLE?.trim() || "portal_customer_profiles";

function hasSupabaseConfig() {
  return Boolean(SUPABASE_REST_URL && SUPABASE_KEY);
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function getJsonArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function pick(record: JsonRecord, camelKey: string, snakeKey = camelKey) {
  return record[camelKey] ?? record[snakeKey];
}

function parseSearchRow(row: SupabasePortalRow): SearchResultRow {
  return {
    id: asString(row.id),
    status: asString(row.status),
    loanType: asString(row.loan_type),
    applicationNumber: asString(row.application_number),
    loanNumber: asString(row.loan_number),
    applyDate: asString(row.apply_date),
    idNumber: asString(row.id_number),
    name: asString(row.name),
    mobile: asString(row.mobile),
    partakerType: asString(row.partaker_type),
    blacklistFlag: asBoolean(row.blacklist_flag),
    sourceSystem: asString(row.source_system),
    age: asNumber(row.age),
    job: asString(row.job),
    companyUnit: asString(row.company_unit),
  };
}

function parseProfile(row: SupabasePortalRow): CustomerProfile {
  const applyInfo = isRecord(row.apply_info) ? row.apply_info : {};
  const creditRef = isRecord(row.credit_ref) ? row.credit_ref : {};
  const mortgage = isRecord(row.mortgage) ? row.mortgage : {};
  const dsr = isRecord(row.dsr) ? row.dsr : {};
  const repayCondition = isRecord(row.repay_condition) ? row.repay_condition : {};
  const ocaWriteOff = isRecord(row.oca_write_off) ? row.oca_write_off : {};

  return {
    id: asString(row.id),
    searchRow: parseSearchRow(row),
    applyInfo: {
      loanType: asString(pick(applyInfo, "loanType", "loan_type")),
      interestMethod: asString(pick(applyInfo, "interestMethod", "interest_method")),
      repayCycle: asString(pick(applyInfo, "repayCycle", "repay_cycle")),
      loanAmount: asString(pick(applyInfo, "loanAmount", "loan_amount")),
      totalTenor: asString(pick(applyInfo, "totalTenor", "total_tenor")),
      flatRate: asString(pick(applyInfo, "flatRate", "flat_rate")),
      effectiveRate: asString(pick(applyInfo, "effectiveRate", "effective_rate")),
      instalmentAmount: asString(pick(applyInfo, "instalmentAmount", "instalment_amount")),
      maxInterest: asString(pick(applyInfo, "maxInterest", "max_interest")),
      totalInterest: asString(pick(applyInfo, "totalInterest", "total_interest")),
      applyDate: asString(pick(applyInfo, "applyDate", "apply_date")),
      loanPurpose: asString(pick(applyInfo, "loanPurpose", "loan_purpose")),
      product: asString(pick(applyInfo, "product")),
      branch: asString(pick(applyInfo, "branch")),
      applicationDate: asString(pick(applyInfo, "applicationDate", "application_date")),
      status: asString(pick(applyInfo, "status")),
      applicantNote: asString(pick(applyInfo, "applicantNote", "applicant_note")),
      staff: asString(pick(applyInfo, "staff")),
      referralAgent: asString(pick(applyInfo, "referralAgent", "referral_agent")),
      referralAgentAddress: asString(pick(applyInfo, "referralAgentAddress", "referral_agent_address")),
      relation: asString(pick(applyInfo, "relation")),
      mainAvenue: asString(pick(applyInfo, "mainAvenue", "main_avenue")),
      mainPurpose: asString(pick(applyInfo, "mainPurpose", "main_purpose")),
      autopayBankInfo: asString(pick(applyInfo, "autopayBankInfo", "autopay_bank_info")),
      personalInfo: asString(pick(applyInfo, "personalInfo", "personal_info")),
      notes: asString(pick(applyInfo, "notes")),
    },
    partakers: getJsonArray(row.partakers)
      .filter(isRecord)
      .map((item) => ({
        name: asString(pick(item, "name")),
        partakerType: asString(pick(item, "partakerType", "partaker_type")),
        relation: asString(pick(item, "relation")),
        relationship: asString(pick(item, "relationship")),
        contact: asString(pick(item, "contact")),
        mobileNo: asString(pick(item, "mobileNo", "mobile_no")),
        homeNo: asString(pick(item, "homeNo", "home_no")),
        passport: asString(pick(item, "passport")),
        selected: asBoolean(pick(item, "selected")),
        linkedId: typeof pick(item, "linkedId", "linked_id") === "string" ? asString(pick(item, "linkedId", "linked_id")) : undefined,
      })),
    creditRef: {
      summary: asString(pick(creditRef, "summary")),
      indicators: asStringArray(pick(creditRef, "indicators")),
      items: getJsonArray(pick(creditRef, "items"))
        .filter(isRecord)
        .map((item) => ({
          creditor: asString(pick(item, "creditor")),
          creditType: asString(pick(item, "creditType", "credit_type")),
          loanAmount: asString(pick(item, "loanAmount", "loan_amount")),
          instalmentAmount: asString(pick(item, "instalmentAmount", "instalment_amount")),
          outstandingTenor: asString(pick(item, "outstandingTenor", "outstanding_tenor")),
          balanceAmount: asString(pick(item, "balanceAmount", "balance_amount")),
          debtor: asString(pick(item, "debtor")),
        })),
    },
    documents: getJsonArray(row.documents)
      .filter(isRecord)
      .map((item) => ({
        type: asString(pick(item, "type")),
        date: asString(pick(item, "date")),
        reference: asString(pick(item, "reference")),
      })),
    mortgage: {
      applicable: asBoolean(pick(mortgage, "applicable")),
      assetSummary: asString(pick(mortgage, "assetSummary", "asset_summary")),
      collateralRef: asString(pick(mortgage, "collateralRef", "collateral_ref")),
    },
    dsr: {
      income: asString(pick(dsr, "income")),
      expenditure: asString(pick(dsr, "expenditure")),
      ratio: asString(pick(dsr, "ratio")),
      notes: asString(pick(dsr, "notes")),
    },
    loanHistory: getJsonArray(row.loan_history)
      .filter(isRecord)
      .map((item) => ({
        status: asString(pick(item, "status")),
        applyNumber: asString(pick(item, "applyNumber", "apply_number")),
        loanNumber: asString(pick(item, "loanNumber", "loan_number")),
        repaidTenor: asNumber(pick(item, "repaidTenor", "repaid_tenor")),
        totalTenor: asNumber(pick(item, "totalTenor", "total_tenor")),
        loanAmount: asString(pick(item, "loanAmount", "loan_amount")),
        instalmentAmount: asString(pick(item, "instalmentAmount", "instalment_amount")),
        principalBalance: asString(pick(item, "principalBalance", "principal_balance")),
        interestBalance: asString(pick(item, "interestBalance", "interest_balance")),
        nextDueDate: asString(pick(item, "nextDueDate", "next_due_date")),
        detailNote: asString(pick(item, "detailNote", "detail_note")),
        product: asString(pick(item, "product")),
        period: asString(pick(item, "period")),
      })),
    partakingHistory: getJsonArray(row.partaking_history)
      .filter(isRecord)
      .map((item) => ({
        period: asString(pick(item, "period")),
        description: asString(pick(item, "description")),
        relatedApplication: asString(pick(item, "relatedApplication", "related_application")),
      })),
    approvalInfo: getJsonArray(row.approval_info)
      .filter(isRecord)
      .map((item) => ({
        stage: asString(pick(item, "stage")),
        approvalDate: asString(pick(item, "approvalDate", "approval_date")),
        approvalStaff: asString(pick(item, "approvalStaff", "approval_staff")),
        date: asString(pick(item, "date")),
        reviewer: asString(pick(item, "reviewer")),
        decision: asString(pick(item, "decision")),
        payoutDate: asString(pick(item, "payoutDate", "payout_date")),
        loanDate: asString(pick(item, "loanDate", "loan_date")),
        firstDueDate: asString(pick(item, "firstDueDate", "first_due_date")),
        firstRepayAmount: asString(pick(item, "firstRepayAmount", "first_repay_amount")),
        interestMethod: asString(pick(item, "interestMethod", "interest_method")),
        repayCycle: asString(pick(item, "repayCycle", "repay_cycle")),
        loanAmount: asString(pick(item, "loanAmount", "loan_amount")),
        totalTenor: asString(pick(item, "totalTenor", "total_tenor")),
        flatRate: asString(pick(item, "flatRate", "flat_rate")),
        effectiveRate: asString(pick(item, "effectiveRate", "effective_rate")),
        penaltySetting: asString(pick(item, "penaltySetting", "penalty_setting")),
        dsr: asString(pick(item, "dsr")),
        extendedInterestDay: asString(pick(item, "extendedInterestDay", "extended_interest_day")),
        extendedInterestAmount: asString(pick(item, "extendedInterestAmount", "extended_interest_amount")),
        notes: asString(pick(item, "notes")),
      })),
    repayHistory: getJsonArray(row.repay_history)
      .filter(isRecord)
      .map((item) => ({
        repayDate: asString(pick(item, "repayDate", "repay_date")) || asString(pick(item, "date")),
        repayNo: asString(pick(item, "repayNo", "repay_no")),
        repayType: asString(pick(item, "repayType", "repay_type")),
        tenor: asString(pick(item, "tenor")),
        repayAmount: asString(pick(item, "repayAmount", "repay_amount")) || asString(pick(item, "amount")),
        overdueInterest: asString(pick(item, "overdueInterest", "overdue_interest")),
        handlingFee: asString(pick(item, "handlingFee", "handling_fee")),
        receivedAmount: asString(pick(item, "receivedAmount", "received_amount")),
        tempAmount: asString(pick(item, "tempAmount", "temp_amount")),
        remarks: asString(pick(item, "remarks")),
        date: asString(pick(item, "date")),
        amount: asString(pick(item, "amount")),
        balanceAfter: asString(pick(item, "balanceAfter", "balance_after")),
        channel: asString(pick(item, "channel")),
      })),
    repayCondition: {
      terms: asString(pick(repayCondition, "terms")),
      state: asString(pick(repayCondition, "state")),
      nextRepayDate: asString(pick(repayCondition, "nextRepayDate", "next_repay_date")),
      nextRepayAmount: asString(pick(repayCondition, "nextRepayAmount", "next_repay_amount")),
      principalBalance: asString(pick(repayCondition, "principalBalance", "principal_balance")),
      interestBalance: asString(pick(repayCondition, "interestBalance", "interest_balance")),
      feeBalance: asString(pick(repayCondition, "feeBalance", "fee_balance")),
      overdueDays: asNumber(pick(repayCondition, "overdueDays", "overdue_days")),
      collectionNotes: asString(pick(repayCondition, "collectionNotes", "collection_notes")),
    },
    crm: getJsonArray(row.crm)
      .filter(isRecord)
      .map((item) => ({
        date: asString(pick(item, "date")),
        author: asString(pick(item, "author")),
        note: asString(pick(item, "note")),
      })),
    ocaWriteOff: {
      ocaRecords: asStringArray(pick(ocaWriteOff, "ocaRecords", "oca_records")),
      writeOffRecords: asStringArray(pick(ocaWriteOff, "writeOffRecords", "write_off_records")),
      recovery: asString(pick(ocaWriteOff, "recovery")),
    },
  };
}

function buildHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: "application/json",
  };
}

function dbRowToSearchRow(r: CustomerRecord): SearchResultRow {
  return {
    id: r.id,
    status: r.status,
    loanType: r.loanType,
    applicationNumber: r.applicationNumber,
    loanNumber: r.loanNumber,
    applyDate: r.applyDate,
    idNumber: r.hkid,
    name: r.name,
    mobile: r.rawMobile,
    partakerType: r.partakerType,
    blacklistFlag: r.blacklistFlag,
    sourceSystem: r.sourceSystem,
    age: r.age,
    job: r.job,
    companyUnit: r.companyUnit,
  };
}

function parseProfileFromRecord(r: CustomerRecord): CustomerProfile {
  const j = r.profileJson as unknown;
  if (j && typeof j === "object" && !Array.isArray(j)) {
    const p = j as CustomerProfile;
    if (typeof p.id === "string" && p.searchRow && typeof p.searchRow.idNumber === "string") {
      return p;
    }
  }
  const row = dbRowToSearchRow(r);
  return {
    id: r.id,
    searchRow: row,
    applyInfo: {
      loanType: r.loanType,
      product: "",
      branch: "",
      applicationDate: r.applyDate,
      status: r.status,
      applicantNote: "",
    },
    partakers: [],
    creditRef: { summary: "", indicators: [], items: [] },
    documents: [],
    mortgage: { applicable: false, assetSummary: "", collateralRef: "" },
    dsr: { income: "", expenditure: "", ratio: "", notes: "" },
    loanHistory: [],
    partakingHistory: [],
    approvalInfo: [],
    repayHistory: [],
    repayCondition: { terms: "", state: "", overdueDays: 0, collectionNotes: "" },
    crm: [],
    ocaWriteOff: { ocaRecords: [], writeOffRecords: [], recovery: "" },
  };
}

async function searchPrismaCustomers(query: string): Promise<SearchResultRow[]> {
  const q = query.trim();
  if (!q) return [];
  if (q.toLowerCase().includes("blacklist")) {
    const rows = await prisma.customerRecord.findMany({ where: { blacklistFlag: true } });
    return rows.map(dbRowToSearchRow);
  }
  const rows = await prisma.customerRecord.findMany({
    where: {
      OR: [
        { hkid: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { rawMobile: { contains: q, mode: "insensitive" } },
        { applicationNumber: { contains: q, mode: "insensitive" } },
        { loanNumber: { contains: q, mode: "insensitive" } },
      ],
    },
  });
  return rows.map(dbRowToSearchRow);
}

async function getPrismaProfileById(id: string): Promise<CustomerProfile | undefined> {
  const r = await prisma.customerRecord.findUnique({ where: { id } });
  return r ? parseProfileFromRecord(r) : undefined;
}

async function getPrismaProfileByIdNumber(idNumber: string): Promise<CustomerProfile | undefined> {
  const r = await prisma.customerRecord.findFirst({ where: { hkid: { equals: idNumber, mode: "insensitive" } } });
  return r ? parseProfileFromRecord(r) : undefined;
}

function buildSelect() {
  return [
    "id",
    "status",
    "loan_type",
    "application_number",
    "loan_number",
    "apply_date",
    "id_number",
    "name",
    "mobile",
    "partaker_type",
    "blacklist_flag",
    "source_system",
    "age",
    "job",
    "company_unit",
    "apply_info",
    "partakers",
    "credit_ref",
    "documents",
    "mortgage",
    "dsr",
    "loan_history",
    "partaking_history",
    "approval_info",
    "repay_history",
    "repay_condition",
    "crm",
    "oca_write_off",
  ].join(",");
}

async function fetchSupabaseRows(params: URLSearchParams) {
  const url = `${SUPABASE_REST_URL}/${SUPABASE_TABLE}?${params.toString()}`;
  const res = await fetch(url, {
    headers: buildHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase request failed (${res.status}): ${detail || "unknown error"}`);
  }

  return (await res.json()) as SupabasePortalRow[];
}

export async function searchCustomers(query: string) {
  if (isDatabaseConfigured()) {
    try {
      return await searchPrismaCustomers(query);
    } catch (error) {
      console.error("Prisma search failed, trying other connectors.", error);
    }
  }

  if (!hasSupabaseConfig()) {
    return searchMockCustomers(query);
  }

  const q = query.trim();
  if (!q) return [];

  try {
    const params = new URLSearchParams();
    params.set("select", buildSelect());

    if (q.toLowerCase().includes("blacklist")) {
      params.set("blacklist_flag", "eq.true");
    } else {
      const pattern = `*${q}*`;
      params.set(
        "or",
        `(` +
          [
            `name.ilike.${pattern}`,
            `id_number.ilike.${pattern}`,
            `mobile.ilike.${pattern}`,
            `application_number.ilike.${pattern}`,
            `loan_number.ilike.${pattern}`,
          ].join(",") +
          `)`,
      );
    }

    const rows = await fetchSupabaseRows(params);
    return rows.map(parseSearchRow);
  } catch (error) {
    console.error("Supabase search failed, falling back to mock data.", error);
    return searchMockCustomers(query);
  }
}

/** Cap for “show all” on dashboard / browse; raise when datasets grow. */
const LIST_ALL_LIMIT = 500;

async function listAllPrismaCustomers(): Promise<SearchResultRow[]> {
  const rows = await prisma.customerRecord.findMany({
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: LIST_ALL_LIMIT,
  });
  return rows.map(dbRowToSearchRow);
}

async function listAllSupabaseCustomers(): Promise<SearchResultRow[]> {
  const params = new URLSearchParams();
  params.set("select", buildSelect());
  params.set("order", "name.asc,id.asc");
  params.set("limit", String(LIST_ALL_LIMIT));
  const rows = await fetchSupabaseRows(params);
  return rows.map(parseSearchRow);
}

/** All customers for dashboard browse (ordered, capped). Uses Prisma → Supabase → mock. */
export async function listAllCustomers(): Promise<SearchResultRow[]> {
  if (isDatabaseConfigured()) {
    try {
      return await listAllPrismaCustomers();
    } catch (error) {
      console.error("Prisma list all failed, trying other connectors.", error);
    }
  }
  if (!hasSupabaseConfig()) {
    return getAllSearchRows();
  }
  try {
    return await listAllSupabaseCustomers();
  } catch (error) {
    console.error("Supabase list all failed, falling back to mock.", error);
    return getAllSearchRows();
  }
}

/** Look up a profile by HKID / NRIC / ID number (case-insensitive). Uses Prisma → Supabase → mock. */
export async function getProfileByIdNumber(idNumber: string) {
  if (isDatabaseConfigured()) {
    try {
      const p = await getPrismaProfileByIdNumber(idNumber);
      if (p) return p;
    } catch (error) {
      console.error("Prisma idNumber lookup failed, trying other connectors.", error);
    }
  }

  if (!hasSupabaseConfig()) {
    const rows = getAllSearchRows();
    const match = rows.find((r) => r.idNumber.toLowerCase() === idNumber.toLowerCase());
    return match ? getMockProfileById(match.id) : undefined;
  }

  try {
    const params = new URLSearchParams();
    params.set("select", buildSelect());
    params.set("id_number", `ilike.${idNumber}`);
    params.set("limit", "1");
    const rows = await fetchSupabaseRows(params);
    const row = rows[0];
    return row ? parseProfile(row) : undefined;
  } catch (error) {
    console.error("Supabase idNumber lookup failed.", error);
    return undefined;
  }
}

/** Look up a profile by ID number and surface connector errors to callers that need diagnostics. */
export async function getProfileByIdNumberStrict(idNumber: string) {
  if (isDatabaseConfigured()) {
    const p = await getPrismaProfileByIdNumber(idNumber);
    if (p) return p;
  }

  if (!hasSupabaseConfig()) {
    const rows = getAllSearchRows();
    const match = rows.find((r) => r.idNumber.toLowerCase() === idNumber.toLowerCase());
    return match ? getMockProfileById(match.id) : undefined;
  }

  const params = new URLSearchParams();
  params.set("select", buildSelect());
  params.set("id_number", `ilike.${idNumber}`);
  params.set("limit", "1");
  const rows = await fetchSupabaseRows(params);
  const row = rows[0];
  return row ? parseProfile(row) : undefined;
}

export async function getProfileById(id: string) {
  if (isDatabaseConfigured()) {
    try {
      const p = await getPrismaProfileById(id);
      if (p) return p;
    } catch (error) {
      console.error("Prisma profile lookup failed, trying other connectors.", error);
    }
  }

  if (!hasSupabaseConfig()) {
    return getMockProfileById(id);
  }

  try {
    const params = new URLSearchParams();
    params.set("select", buildSelect());
    params.set("id", `eq.${id}`);
    params.set("limit", "1");
    const rows = await fetchSupabaseRows(params);
    const row = rows[0];
    return row ? parseProfile(row) : undefined;
  } catch (error) {
    console.error("Supabase profile lookup failed, falling back to mock data.", error);
    return getMockProfileById(id);
  }
}

export { filterSearchRows, profileToChatContext, type ResultFilters };
