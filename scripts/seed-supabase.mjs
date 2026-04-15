import fs from "node:fs/promises";
import path from "node:path";

const cwd = process.cwd();
const envPath = path.join(cwd, ".env.local");
const envText = await fs.readFile(envPath, "utf8").catch(() => "");

for (const line of envText.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  if (!(key in process.env)) process.env[key] = value;
}

const SUPABASE_URL = process.env.SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim();
const SUPABASE_TABLE = process.env.SUPABASE_PORTAL_TABLE?.trim() || "portal_customer_profiles";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY in .env.local.");
  process.exit(1);
}

const rows = [
  {
    id: "cust-001",
    status: "Active servicing",
    loan_type: "Term loan",
    application_number: "APP-2024-8891",
    loan_number: "LN-778821",
    apply_date: "2024-06-12",
    id_number: "S1234567A",
    name: "Tan Wei Ming",
    mobile: "+65 9123 4410",
    partaker_type: "Primary borrower",
    blacklist_flag: false,
    source_system: "Core LOS / Unit A",
    age: 44,
    job: "Director - SME",
    company_unit: "Unit A",
    apply_info: {
      product: "Secured term - SME working capital",
      branch: "Central Operations",
      applicationDate: "2024-06-12",
      status: "Disbursed - performing",
      applicantNote: "Repeat borrower; prior facility closed 2023 without arrears.",
    },
    partakers: [
      {
        name: "Tan Hui Ling",
        relationship: "Spouse / guarantor",
        contact: "+65 9123 4411",
        linkedId: "cust-882",
      },
      {
        name: "Apex Supplies Pte Ltd",
        relationship: "Related corporate",
        contact: "finance@apex-supplies.example",
      },
    ],
    credit_ref: {
      summary: "Internal score band B+; two trade references verified Q2 2024.",
      indicators: ["No active disputes", "One settled facility 2019"],
    },
    documents: [
      { type: "ID / KYC", date: "2024-06-10", reference: "DOC-KYC-99102" },
      { type: "Financial statements", date: "2024-06-11", reference: "DOC-FIN-44021" },
      { type: "Charge / security", date: "2024-07-01", reference: "DOC-SEC-22011" },
    ],
    mortgage: {
      applicable: true,
      assetSummary: "Commercial unit - Lot 12-441, indexed valuation SGD 1.85M.",
      collateralRef: "COL-MTG-009821",
    },
    dsr: {
      income: "SGD 42,500 / month (stated)",
      expenditure: "SGD 18,200 / month (underwriting)",
      ratio: "42.8%",
      notes: "DSR within policy at approval; refreshed figures scheduled Q3.",
    },
    loan_history: [
      {
        loanNumber: "LN-551002",
        product: "Revolving credit",
        status: "Closed - fully repaid",
        period: "2019-01 - 2023-08",
      },
      {
        loanNumber: "LN-778821",
        product: "Term loan",
        status: "Active",
        period: "2024-07 - present",
      },
    ],
    partaking_history: [
      {
        period: "2021",
        description: "Guarantor on related corporate facility (since closed).",
        relatedApplication: "APP-2021-2201",
      },
    ],
    approval_info: [
      {
        stage: "Credit committee",
        date: "2024-06-28",
        reviewer: "Committee pack CC-441",
        decision: "Approved with standard covenants",
        notes: "Conditions: charge registration, insurance confirmation.",
      },
      {
        stage: "Operations disbursement",
        date: "2024-07-02",
        reviewer: "Ops - J. Koh",
        decision: "Released",
        notes: "All CPs satisfied.",
      },
    ],
    repay_history: [
      { date: "2024-08-01", amount: "SGD 12,400", balanceAfter: "SGD 487,200", channel: "GIRO" },
      { date: "2024-09-01", amount: "SGD 12,400", balanceAfter: "SGD 474,800", channel: "GIRO" },
      { date: "2024-10-01", amount: "SGD 12,400", balanceAfter: "SGD 462,400", channel: "GIRO" },
    ],
    repay_condition: {
      terms: "Monthly amortising, 60 months, fixed coupon tier-1",
      state: "Current",
      overdueDays: 0,
      collectionNotes: "No active collection queue.",
    },
    crm: [
      { date: "2024-09-15", author: "Servicing - M. Rahim", note: "Annual review scheduled; no material changes reported." },
    ],
    oca_write_off: {
      ocaRecords: ["None on file for this borrower ID."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
  {
    id: "cust-002",
    status: "Special mention",
    loan_type: "Invoice financing",
    application_number: "APP-2023-4410",
    loan_number: "LN-661902",
    apply_date: "2023-11-02",
    id_number: "F887712C",
    name: "Priya Narayanan",
    mobile: "+65 9001 2210",
    partaker_type: "Primary borrower",
    blacklist_flag: false,
    source_system: "Legacy CRM / Unit B",
    age: 39,
    job: "Owner - trading",
    company_unit: "Unit B",
    apply_info: {
      product: "Invoice financing - revolving",
      branch: "North Hub",
      applicationDate: "2023-11-02",
      status: "Restructuring discussion",
      applicantNote: "Cash-flow stress from anchor buyer payment delays.",
    },
    partakers: [{ name: "Brightline Trading Pte Ltd", relationship: "Debtor / counterparty", contact: "ap@brightline.example" }],
    credit_ref: {
      summary: "Watchlist for concentration to single buyer; external bureau stable.",
      indicators: ["Elevated utilisation", "No prior defaults"],
    },
    documents: [{ type: "Assignment deed", date: "2023-11-05", reference: "DOC-ASG-11002" }],
    mortgage: { applicable: false, assetSummary: "Unsecured structure.", collateralRef: "-" },
    dsr: {
      income: "Variable - trailing 6-mo avg SGD 28,000",
      expenditure: "SGD 19,500",
      ratio: "69.6%",
      notes: "Under temporary forbearance metrics pending restructuring.",
    },
    loan_history: [
      { loanNumber: "LN-661902", product: "Invoice financing", status: "Active - watch", period: "2023-11 - present" },
    ],
    partaking_history: [],
    approval_info: [
      { stage: "Annual review", date: "2024-08-20", reviewer: "R. Santos", decision: "Continue with enhanced monitoring", notes: "Buyer payment behaviour to be reviewed monthly." },
    ],
    repay_history: [{ date: "2024-09-10", amount: "SGD 4,200", balanceAfter: "SGD 118,900", channel: "Bank transfer" }],
    repay_condition: {
      terms: "Revolver - monthly interest, principal on invoice settlement",
      state: "1-30 DPD intermittent",
      overdueDays: 12,
      collectionNotes: "Soft calls logged; restructuring proposal in draft.",
    },
    crm: [{ date: "2024-10-02", author: "Collections - L. Goh", note: "Borrower responsive; awaiting revised buyer payment plan." }],
    oca_write_off: {
      ocaRecords: ["Legal review not initiated."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
  {
    id: "cust-003",
    status: "Written off",
    loan_type: "Personal term",
    application_number: "APP-2019-2201",
    loan_number: "LN-330021",
    apply_date: "2019-04-18",
    id_number: "G1122334B",
    name: "Lee Kuan Hock",
    mobile: "+65 8777 0091",
    partaker_type: "Primary borrower",
    blacklist_flag: true,
    source_system: "Recovery ledger / Unit C",
    age: 56,
    job: "Sales",
    company_unit: "Unit C",
    apply_info: {
      product: "Unsecured personal term",
      branch: "East",
      applicationDate: "2019-04-18",
      status: "Closed - write-off",
      applicantNote: "Facility written off after prolonged default; legal file active.",
    },
    partakers: [],
    credit_ref: {
      summary: "Historical file; bureau shows settled write-off flag.",
      indicators: ["Blacklist - internal", "External recovery firm engaged historically"],
    },
    documents: [{ type: "Demand letter", date: "2020-03-01", reference: "DOC-DMD-003311" }],
    mortgage: { applicable: false, assetSummary: "N/A", collateralRef: "-" },
    dsr: { income: "N/A", expenditure: "N/A", ratio: "N/A", notes: "File archived; figures not maintained post write-off." },
    loan_history: [{ loanNumber: "LN-330021", product: "Personal term", status: "Written off", period: "2019-05 - 2021-02" }],
    partaking_history: [{ period: "2018", description: "Co-borrower on withdrawn application (not disbursed).", relatedApplication: "APP-2018-9011" }],
    approval_info: [{ stage: "Final write-off", date: "2021-02-14", reviewer: "Committee WO-12", decision: "Write-off approved", notes: "Recovery efforts exhausted per policy." }],
    repay_history: [{ date: "2020-01-05", amount: "SGD 800", balanceAfter: "SGD 21,400", channel: "Cash deposit" }],
    repay_condition: {
      terms: "N/A - closed",
      state: "Write-off",
      overdueDays: 999,
      collectionNotes: "Transferred to external counsel2021; sporadic trace activity.",
    },
    crm: [{ date: "2023-01-10", author: "Recovery - external", note: "Skip trace update - no new employer verified." }],
    oca_write_off: {
      ocaRecords: ["OCA ref OCA-2019-7712 - demand and filing logged."],
      writeOffRecords: ["WO-2021-0099 - principal SGD 21,400 + accrued charges."],
      recovery: "Lifetime recovery SGD 3,200; outstanding written balance carried.",
    },
  },
  {
    id: "cust-004",
    status: "Pending approval",
    loan_type: "Bridging loan",
    application_number: "APP-2025-1188",
    loan_number: "LN-900114",
    apply_date: "2025-01-22",
    id_number: "T5566778D",
    name: "Aisha Binte Rahman",
    mobile: "+65 8111 2204",
    partaker_type: "Primary borrower",
    blacklist_flag: false,
    source_system: "SME Intake / Unit D",
    age: 36,
    job: "Operations Manager",
    company_unit: "Unit D",
    apply_info: {
      product: "Short-term bridging facility",
      branch: "South Hub",
      applicationDate: "2025-01-22",
      status: "Pending final approval",
      applicantNote: "Bridge requested ahead of expected receivables release next month.",
    },
    partakers: [
      { name: "Rahman Logistics Pte Ltd", relationship: "Employer / related company", contact: "ops@rahmanlogistics.example" },
      { name: "Mohd Firdaus", relationship: "Guarantor", contact: "+65 8111 2205" },
    ],
    credit_ref: {
      summary: "Internal review acceptable; bureau clean with moderate existing leverage.",
      indicators: ["No write-off history", "One active auto loan externally"],
    },
    documents: [
      { type: "Payslips", date: "2025-01-20", reference: "DOC-PAY-55102" },
      { type: "Bank statements", date: "2025-01-21", reference: "DOC-BNK-99120" },
    ],
    mortgage: {
      applicable: false,
      assetSummary: "Unsecured bridge supported by salary and receivables evidence.",
      collateralRef: "-",
    },
    dsr: {
      income: "SGD 11,800 / month",
      expenditure: "SGD 5,100 / month",
      ratio: "43.2%",
      notes: "Within underwriting range pending employer callback completion.",
    },
    loan_history: [{ loanNumber: "LN-900114", product: "Bridging loan", status: "Application", period: "2025-01 - present" }],
    partaking_history: [],
    approval_info: [
      { stage: "Credit analyst review", date: "2025-01-24", reviewer: "N. Lim", decision: "Recommend approve", notes: "Awaiting sign-off from final approver." },
    ],
    repay_history: [],
    repay_condition: {
      terms: "Not yet disbursed",
      state: "Pre-disbursement",
      overdueDays: 0,
      collectionNotes: "N/A",
    },
    crm: [{ date: "2025-01-24", author: "Sales - H. Tan", note: "Customer confirmed use of funds for supplier settlement bridge." }],
    oca_write_off: {
      ocaRecords: ["None."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
  {
    id: "cust-005",
    status: "Active watchlist",
    loan_type: "Merchant cash advance",
    application_number: "APP-2024-7711",
    loan_number: "LN-882004",
    apply_date: "2024-03-04",
    id_number: "H7654321K",
    name: "Jason Ong",
    mobile: "+65 9333 8841",
    partaker_type: "Primary borrower",
    blacklist_flag: false,
    source_system: "Collections CRM / Unit E",
    age: 41,
    job: "Restaurant Owner",
    company_unit: "Unit E",
    apply_info: {
      product: "Merchant cash advance",
      branch: "Retail Finance Desk",
      applicationDate: "2024-03-04",
      status: "Restructured - monitored",
      applicantNote: "Sales softened after mall renovation works reduced foot traffic.",
    },
    partakers: [{ name: "Ong Mei Lin", relationship: "Spouse / emergency contact", contact: "+65 9333 8842" }],
    credit_ref: {
      summary: "Internal score deteriorated after missed deductions in Q4 2024.",
      indicators: ["Two recent promise-to-pay arrangements", "No legal escalation yet"],
    },
    documents: [
      { type: "Merchant statements", date: "2024-12-15", reference: "DOC-MER-77701" },
      { type: "Restructure letter", date: "2025-01-08", reference: "DOC-RST-44002" },
    ],
    mortgage: {
      applicable: false,
      assetSummary: "Unsecured MCA structure.",
      collateralRef: "-",
    },
    dsr: {
      income: "Variable - avg SGD 16,200 / month",
      expenditure: "SGD 10,700 / month",
      ratio: "66.0%",
      notes: "Stress case remains elevated despite revised deduction schedule.",
    },
    loan_history: [
      { loanNumber: "LN-882004", product: "Merchant cash advance", status: "Active - monitored", period: "2024-03 - present" },
    ],
    partaking_history: [
      { period: "2022", description: "Guarantor for sibling business overdraft.", relatedApplication: "APP-2022-6670" },
    ],
    approval_info: [
      {
        stage: "Restructure approval",
        date: "2025-01-06",
        reviewer: "Workout Desk",
        decision: "Approved revised deduction schedule",
        notes: "Weekly monitoring required for first 8 weeks.",
      },
    ],
    repay_history: [
      { date: "2025-01-15", amount: "SGD 2,100", balanceAfter: "SGD 38,400", channel: "Card settlements" },
      { date: "2025-01-22", amount: "SGD 1,950", balanceAfter: "SGD 36,450", channel: "Card settlements" },
    ],
    repay_condition: {
      terms: "Daily card settlement sweep with temporary reduced cap",
      state: "Under watch",
      overdueDays: 7,
      collectionNotes: "Escalate if two more weekly sweeps miss target.",
    },
    crm: [{ date: "2025-01-23", author: "Collections - P. Dass", note: "Owner reported traffic improving; next review in one week." }],
    oca_write_off: {
      ocaRecords: ["Soft collection queue active."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
  {
    id: "cust-006",
    status: "Closed - repaid",
    loan_type: "Equipment financing",
    application_number: "APP-2022-5104",
    loan_number: "LN-440773",
    apply_date: "2022-09-14",
    id_number: "M3344556P",
    name: "Ng Sok Hoon",
    mobile: "+65 8770 1432",
    partaker_type: "Primary borrower",
    blacklist_flag: false,
    source_system: "Asset Finance / Unit F",
    age: 52,
    job: "Workshop Owner",
    company_unit: "Unit F",
    apply_info: {
      product: "Equipment financing - CNC machine",
      branch: "Industrial Lending",
      applicationDate: "2022-09-14",
      status: "Closed after full repayment",
      applicantNote: "Facility settled early after increase in export orders.",
    },
    partakers: [{ name: "Sok Hoon Engineering", relationship: "Borrowing business", contact: "admin@sokhoon-eng.example" }],
    credit_ref: {
      summary: "Strong historical repayment performance and good utilization discipline.",
      indicators: ["No arrears history", "Early settlement completed"],
    },
    documents: [
      { type: "Invoice for equipment", date: "2022-09-10", reference: "DOC-EQP-23019" },
      { type: "Discharge letter", date: "2024-11-03", reference: "DOC-DSC-55004" },
    ],
    mortgage: {
      applicable: true,
      assetSummary: "First charge over financed CNC unit.",
      collateralRef: "COL-AF-440773",
    },
    dsr: {
      income: "SGD 24,000 / month",
      expenditure: "SGD 9,800 / month",
      ratio: "40.8%",
      notes: "Historical DSR remained compliant throughout facility life.",
    },
    loan_history: [{ loanNumber: "LN-440773", product: "Equipment financing", status: "Closed - repaid", period: "2022-10 - 2024-11" }],
    partaking_history: [],
    approval_info: [
      {
        stage: "Initial approval",
        date: "2022-09-20",
        reviewer: "Asset Finance Committee",
        decision: "Approved",
        notes: "Standard asset charge and insurance conditions applied.",
      },
    ],
    repay_history: [
      { date: "2024-09-03", amount: "SGD 4,500", balanceAfter: "SGD 8,900", channel: "Bank transfer" },
      { date: "2024-10-03", amount: "SGD 4,500", balanceAfter: "SGD 4,400", channel: "Bank transfer" },
      { date: "2024-11-03", amount: "SGD 4,400", balanceAfter: "SGD 0", channel: "Bank transfer" },
    ],
    repay_condition: {
      terms: "Monthly instalment - facility closed",
      state: "Closed",
      overdueDays: 0,
      collectionNotes: "No collection actions required.",
    },
    crm: [{ date: "2024-11-05", author: "Servicing - C. Neo", note: "Discharge documents sent; customer thanked team and may reapply in H2." }],
    oca_write_off: {
      ocaRecords: ["None."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
];

const res = await fetch(`${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/${SUPABASE_TABLE}`, {
  method: "POST",
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=representation",
  },
  body: JSON.stringify(rows),
});

if (!res.ok) {
  console.error(`Supabase seed failed (${res.status})`);
  console.error(await res.text().catch(() => ""));
  process.exit(1);
}

const inserted = await res.json();
console.log(`Seeded ${Array.isArray(inserted) ? inserted.length : 0} rows into ${SUPABASE_TABLE}.`);
