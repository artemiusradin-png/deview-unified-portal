import type { CustomerProfile, SearchResultRow } from "@/types/customer";

/** Exported for DB seed — same records power mock fallback when DATABASE_URL is unset. */
export const profiles: CustomerProfile[] = [
  {
    id: "cust-001",
    searchRow: {
      id: "cust-001",
      status: "Active servicing",
      loanType: "Term loan",
      applicationNumber: "APP-2024-8891",
      loanNumber: "LN-778821",
      applyDate: "2024-06-12",
      idNumber: "S1234567A",
      name: "Tan Wei Ming",
      mobile: "+65 9123 4410",
      partakerType: "Primary borrower",
      blacklistFlag: false,
      sourceSystem: "Core LOS / Unit A",
      age: 44,
      job: "Director — SME",
      companyUnit: "Unit A",
    },
    applyInfo: {
      product: "Secured term — SME working capital",
      branch: "Central Operations",
      applicationDate: "2024-06-12",
      status: "Disbursed — performing",
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
    creditRef: {
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
      assetSummary: "Commercial unit — Lot 12-441, indexed valuation SGD 1.85M.",
      collateralRef: "COL-MTG-009821",
    },
    dsr: {
      income: "SGD 42,500 / month (stated)",
      expenditure: "SGD 18,200 / month (underwriting)",
      ratio: "42.8%",
      notes: "DSR within policy at approval; refreshed figures scheduled Q3.",
    },
    loanHistory: [
      {
        loanNumber: "LN-551002",
        product: "Revolving credit",
        status: "Closed — fully repaid",
        period: "2019-01 — 2023-08",
      },
      {
        loanNumber: "LN-778821",
        product: "Term loan",
        status: "Active",
        period: "2024-07 — present",
      },
    ],
    partakingHistory: [
      {
        period: "2021",
        description: "Guarantor on related corporate facility (since closed).",
        relatedApplication: "APP-2021-2201",
      },
    ],
    approvalInfo: [
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
        reviewer: "Ops — J. Koh",
        decision: "Released",
        notes: "All CPs satisfied.",
      },
    ],
    repayHistory: [
      { date: "2024-08-01", amount: "SGD 12,400", balanceAfter: "SGD 487,200", channel: "GIRO" },
      { date: "2024-09-01", amount: "SGD 12,400", balanceAfter: "SGD 474,800", channel: "GIRO" },
      { date: "2024-10-01", amount: "SGD 12,400", balanceAfter: "SGD 462,400", channel: "GIRO" },
    ],
    repayCondition: {
      terms: "Monthly amortising, 60 months, fixed coupon tier-1",
      state: "Current",
      overdueDays: 0,
      collectionNotes: "No active collection queue.",
    },
    crm: [
      { date: "2024-09-15", author: "Servicing — M. Rahim", note: "Annual review scheduled; no material changes reported." },
    ],
    ocaWriteOff: {
      ocaRecords: ["None on file for this borrower ID."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
  {
    id: "cust-002",
    searchRow: {
      id: "cust-002",
      status: "Special mention",
      loanType: "Invoice financing",
      applicationNumber: "APP-2023-4410",
      loanNumber: "LN-661902",
      applyDate: "2023-11-02",
      idNumber: "F887712C",
      name: "Priya Narayanan",
      mobile: "+65 9001 2210",
      partakerType: "Primary borrower",
      blacklistFlag: false,
      sourceSystem: "Legacy CRM / Unit B",
      age: 39,
      job: "Owner — trading",
      companyUnit: "Unit B",
    },
    applyInfo: {
      product: "Invoice financing — revolving",
      branch: "North Hub",
      applicationDate: "2023-11-02",
      status: "Restructuring discussion",
      applicantNote: "Cash-flow stress from anchor buyer payment delays.",
    },
    partakers: [
      { name: "Brightline Trading Pte Ltd", relationship: "Debtor / counterparty", contact: "ap@brightline.example" },
    ],
    creditRef: {
      summary: "Watchlist for concentration to single buyer; external bureau stable.",
      indicators: ["Elevated utilisation", "No prior defaults"],
    },
    documents: [
      { type: "Assignment deed", date: "2023-11-05", reference: "DOC-ASG-11002" },
    ],
    mortgage: { applicable: false, assetSummary: "Unsecured structure.", collateralRef: "—" },
    dsr: {
      income: "Variable — trailing 6-mo avg SGD 28,000",
      expenditure: "SGD 19,500",
      ratio: "69.6%",
      notes: "Under temporary forbearance metrics pending restructuring.",
    },
    loanHistory: [
      { loanNumber: "LN-661902", product: "Invoice financing", status: "Active — watch", period: "2023-11 — present" },
    ],
    partakingHistory: [],
    approvalInfo: [
      { stage: "Annual review", date: "2024-08-20", reviewer: "R. Santos", decision: "Continue with enhanced monitoring", notes: "Buyer payment behaviour to be reviewed monthly." },
    ],
    repayHistory: [
      { date: "2024-09-10", amount: "SGD 4,200", balanceAfter: "SGD 118,900", channel: "Bank transfer" },
    ],
    repayCondition: {
      terms: "Revolver — monthly interest, principal on invoice settlement",
      state: "1–30 DPD intermittent",
      overdueDays: 12,
      collectionNotes: "Soft calls logged; restructuring proposal in draft.",
    },
    crm: [
      { date: "2024-10-02", author: "Collections — L. Goh", note: "Borrower responsive; awaiting revised buyer payment plan." },
    ],
    ocaWriteOff: {
      ocaRecords: ["Legal review not initiated."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
  {
    id: "cust-003",
    searchRow: {
      id: "cust-003",
      status: "Written off",
      loanType: "Personal term",
      applicationNumber: "APP-2019-2201",
      loanNumber: "LN-330021",
      applyDate: "2019-04-18",
      idNumber: "G1122334B",
      name: "Lee Kuan Hock",
      mobile: "+65 8777 0091",
      partakerType: "Primary borrower",
      blacklistFlag: true,
      sourceSystem: "Recovery ledger / Unit C",
      age: 56,
      job: "Sales",
      companyUnit: "Unit C",
    },
    applyInfo: {
      product: "Unsecured personal term",
      branch: "East",
      applicationDate: "2019-04-18",
      status: "Closed — write-off",
      applicantNote: "Facility written off after prolonged default; legal file active.",
    },
    partakers: [],
    creditRef: {
      summary: "Historical file; bureau shows settled write-off flag.",
      indicators: ["Blacklist — internal", "External recovery firm engaged historically"],
    },
    documents: [
      { type: "Demand letter", date: "2020-03-01", reference: "DOC-DMD-003311" },
    ],
    mortgage: { applicable: false, assetSummary: "N/A", collateralRef: "—" },
    dsr: { income: "N/A", expenditure: "N/A", ratio: "N/A", notes: "File archived; figures not maintained post write-off." },
    loanHistory: [
      { loanNumber: "LN-330021", product: "Personal term", status: "Written off", period: "2019-05 — 2021-02" },
    ],
    partakingHistory: [
      { period: "2018", description: "Co-borrower on withdrawn application (not disbursed).", relatedApplication: "APP-2018-9011" },
    ],
    approvalInfo: [
      { stage: "Final write-off", date: "2021-02-14", reviewer: "Committee WO-12", decision: "Write-off approved", notes: "Recovery efforts exhausted per policy." },
    ],
    repayHistory: [
      { date: "2020-01-05", amount: "SGD 800", balanceAfter: "SGD 21,400", channel: "Cash deposit" },
    ],
    repayCondition: {
      terms: "N/A — closed",
      state: "Write-off",
      overdueDays: 999,
      collectionNotes: "Transferred to external counsel2021; sporadic trace activity.",
    },
    crm: [
      { date: "2023-01-10", author: "Recovery — external", note: "Skip trace update — no new employer verified." },
    ],
    ocaWriteOff: {
      ocaRecords: ["OCA ref OCA-2019-7712 — demand and filing logged."],
      writeOffRecords: ["WO-2021-0099 — principal SGD 21,400 + accrued charges."],
      recovery: "Lifetime recovery SGD 3,200; outstanding written balance carried.",
    },
  },
  {
    id: "cust-004",
    searchRow: {
      id: "cust-004",
      status: "Pending approval",
      loanType: "Bridging loan",
      applicationNumber: "APP-2025-1188",
      loanNumber: "LN-900114",
      applyDate: "2025-01-22",
      idNumber: "T5566778D",
      name: "Aisha Binte Rahman",
      mobile: "+65 8111 2204",
      partakerType: "Primary borrower",
      blacklistFlag: false,
      sourceSystem: "SME Intake / Unit D",
      age: 36,
      job: "Operations Manager",
      companyUnit: "Unit D",
    },
    applyInfo: {
      product: "Short-term bridging facility",
      branch: "South Hub",
      applicationDate: "2025-01-22",
      status: "Pending final approval",
      applicantNote: "Bridge requested ahead of expected receivables release next month.",
    },
    partakers: [
      {
        name: "Rahman Logistics Pte Ltd",
        relationship: "Employer / related company",
        contact: "ops@rahmanlogistics.example",
      },
      {
        name: "Mohd Firdaus",
        relationship: "Guarantor",
        contact: "+65 8111 2205",
      },
    ],
    creditRef: {
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
      collateralRef: "—",
    },
    dsr: {
      income: "SGD 11,800 / month",
      expenditure: "SGD 5,100 / month",
      ratio: "43.2%",
      notes: "Within underwriting range pending employer callback completion.",
    },
    loanHistory: [
      {
        loanNumber: "LN-900114",
        product: "Bridging loan",
        status: "Application",
        period: "2025-01 — present",
      },
    ],
    partakingHistory: [],
    approvalInfo: [
      {
        stage: "Credit analyst review",
        date: "2025-01-24",
        reviewer: "N. Lim",
        decision: "Recommend approve",
        notes: "Awaiting sign-off from final approver.",
      },
    ],
    repayHistory: [],
    repayCondition: {
      terms: "Not yet disbursed",
      state: "Pre-disbursement",
      overdueDays: 0,
      collectionNotes: "N/A",
    },
    crm: [
      {
        date: "2025-01-24",
        author: "Sales - H. Tan",
        note: "Customer confirmed use of funds for supplier settlement bridge.",
      },
    ],
    ocaWriteOff: {
      ocaRecords: ["None."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
  {
    id: "cust-005",
    searchRow: {
      id: "cust-005",
      status: "Active watchlist",
      loanType: "Merchant cash advance",
      applicationNumber: "APP-2024-7711",
      loanNumber: "LN-882004",
      applyDate: "2024-03-04",
      idNumber: "H7654321K",
      name: "Jason Ong",
      mobile: "+65 9333 8841",
      partakerType: "Primary borrower",
      blacklistFlag: false,
      sourceSystem: "Collections CRM / Unit E",
      age: 41,
      job: "Restaurant Owner",
      companyUnit: "Unit E",
    },
    applyInfo: {
      product: "Merchant cash advance",
      branch: "Retail Finance Desk",
      applicationDate: "2024-03-04",
      status: "Restructured - monitored",
      applicantNote: "Sales softened after mall renovation works reduced foot traffic.",
    },
    partakers: [
      {
        name: "Ong Mei Lin",
        relationship: "Spouse / emergency contact",
        contact: "+65 9333 8842",
      },
    ],
    creditRef: {
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
      collateralRef: "—",
    },
    dsr: {
      income: "Variable - avg SGD 16,200 / month",
      expenditure: "SGD 10,700 / month",
      ratio: "66.0%",
      notes: "Stress case remains elevated despite revised deduction schedule.",
    },
    loanHistory: [
      {
        loanNumber: "LN-882004",
        product: "Merchant cash advance",
        status: "Active - monitored",
        period: "2024-03 — present",
      },
    ],
    partakingHistory: [
      {
        period: "2022",
        description: "Guarantor for sibling business overdraft.",
        relatedApplication: "APP-2022-6670",
      },
    ],
    approvalInfo: [
      {
        stage: "Restructure approval",
        date: "2025-01-06",
        reviewer: "Workout Desk",
        decision: "Approved revised deduction schedule",
        notes: "Weekly monitoring required for first 8 weeks.",
      },
    ],
    repayHistory: [
      { date: "2025-01-15", amount: "SGD 2,100", balanceAfter: "SGD 38,400", channel: "Card settlements" },
      { date: "2025-01-22", amount: "SGD 1,950", balanceAfter: "SGD 36,450", channel: "Card settlements" },
    ],
    repayCondition: {
      terms: "Daily card settlement sweep with temporary reduced cap",
      state: "Under watch",
      overdueDays: 7,
      collectionNotes: "Escalate if two more weekly sweeps miss target.",
    },
    crm: [
      {
        date: "2025-01-23",
        author: "Collections - P. Dass",
        note: "Owner reported traffic improving; next review in one week.",
      },
    ],
    ocaWriteOff: {
      ocaRecords: ["Soft collection queue active."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
  {
    id: "cust-006",
    searchRow: {
      id: "cust-006",
      status: "Closed - repaid",
      loanType: "Equipment financing",
      applicationNumber: "APP-2022-5104",
      loanNumber: "LN-440773",
      applyDate: "2022-09-14",
      idNumber: "M3344556P",
      name: "Ng Sok Hoon",
      mobile: "+65 8770 1432",
      partakerType: "Primary borrower",
      blacklistFlag: false,
      sourceSystem: "Asset Finance / Unit F",
      age: 52,
      job: "Workshop Owner",
      companyUnit: "Unit F",
    },
    applyInfo: {
      product: "Equipment financing - CNC machine",
      branch: "Industrial Lending",
      applicationDate: "2022-09-14",
      status: "Closed after full repayment",
      applicantNote: "Facility settled early after increase in export orders.",
    },
    partakers: [
      {
        name: "Sok Hoon Engineering",
        relationship: "Borrowing business",
        contact: "admin@sokhoon-eng.example",
      },
    ],
    creditRef: {
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
    loanHistory: [
      {
        loanNumber: "LN-440773",
        product: "Equipment financing",
        status: "Closed - repaid",
        period: "2022-10 — 2024-11",
      },
    ],
    partakingHistory: [],
    approvalInfo: [
      {
        stage: "Initial approval",
        date: "2022-09-20",
        reviewer: "Asset Finance Committee",
        decision: "Approved",
        notes: "Standard asset charge and insurance conditions applied.",
      },
    ],
    repayHistory: [
      { date: "2024-09-03", amount: "SGD 4,500", balanceAfter: "SGD 8,900", channel: "Bank transfer" },
      { date: "2024-10-03", amount: "SGD 4,500", balanceAfter: "SGD 4,400", channel: "Bank transfer" },
      { date: "2024-11-03", amount: "SGD 4,400", balanceAfter: "SGD 0", channel: "Bank transfer" },
    ],
    repayCondition: {
      terms: "Monthly instalment - facility closed",
      state: "Closed",
      overdueDays: 0,
      collectionNotes: "No collection actions required.",
    },
    crm: [
      {
        date: "2024-11-05",
        author: "Servicing - C. Neo",
        note: "Discharge documents sent; customer thanked team and may reapply in H2.",
      },
    ],
    ocaWriteOff: {
      ocaRecords: ["None."],
      writeOffRecords: ["None."],
      recovery: "N/A",
    },
  },
];

export function getAllSearchRows(): SearchResultRow[] {
  return profiles.map((p) => p.searchRow);
}

export function searchCustomers(query: string): SearchResultRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  if (q === "blacklist" || q.includes("blacklist")) {
    return profiles.filter((p) => p.searchRow.blacklistFlag).map((p) => p.searchRow);
  }
  return profiles
    .map((p) => p.searchRow)
    .filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.idNumber.toLowerCase().includes(q) ||
        row.mobile.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
        row.applicationNumber.toLowerCase().includes(q) ||
        row.loanNumber.toLowerCase().includes(q),
    );
}

export function getProfileById(id: string): CustomerProfile | undefined {
  return profiles.find((p) => p.id === id);
}

export type ResultFilters = {
  ageMin?: string;
  ageMax?: string;
  job?: string;
  company?: string;
};

export function filterSearchRows(rows: SearchResultRow[], f: ResultFilters): SearchResultRow[] {
  let out = rows;
  const amin = f.ageMin?.trim() ? parseInt(f.ageMin, 10) : NaN;
  const amax = f.ageMax?.trim() ? parseInt(f.ageMax, 10) : NaN;
  if (!Number.isNaN(amin)) out = out.filter((r) => r.age >= amin);
  if (!Number.isNaN(amax)) out = out.filter((r) => r.age <= amax);
  if (f.job?.trim()) {
    const j = f.job.trim().toLowerCase();
    out = out.filter((r) => r.job.toLowerCase().includes(j));
  }
  if (f.company?.trim()) {
    const c = f.company.trim().toLowerCase();
    out = out.filter(
      (r) => r.companyUnit.toLowerCase().includes(c) || r.sourceSystem.toLowerCase().includes(c),
    );
  }
  return out;
}

/** Compact JSON for the AI assistant (internal data only). */
export function profileToChatContext(profile: CustomerProfile): string {
  const row = profile.searchRow;
  const payload = {
    hkid: row.idNumber,
    name: row.name,
    companyUnit: row.companyUnit,
    sourceSystem: row.sourceSystem,
    status: row.status,
    loanType: row.loanType,
    applicationNumber: row.applicationNumber,
    loanNumber: row.loanNumber,
    age: row.age,
    job: row.job,
    applyInfo: profile.applyInfo,
    repayCondition: profile.repayCondition,
    loanHistory: profile.loanHistory,
    repayHistory: profile.repayHistory.slice(-6),
    approvalInfo: profile.approvalInfo,
    partakers: profile.partakers,
    ocaWriteOff: profile.ocaWriteOff,
    crm: profile.crm.slice(0, 4),
  };
  return JSON.stringify(payload, null, 2);
}
