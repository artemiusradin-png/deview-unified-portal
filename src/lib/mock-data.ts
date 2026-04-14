import type { CustomerProfile, SearchResultRow } from "@/types/customer";

const profiles: CustomerProfile[] = [
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
