import type { CustomerProfile } from "@/types/customer";

export type RiskLevel = "Low Risk" | "Moderate Risk" | "High Risk" | "Written Off";

export type BorrowerRiskSummary = {
  score: number;
  level: RiskLevel;
  recommendation: string;
  factors: string[];
  strengths: string[];
  nextActions: string[];
};

export function computeBorrowerRisk(profile: CustomerProfile): BorrowerRiskSummary {
  const { searchRow, repayCondition, ocaWriteOff, creditRef, dsr, loanHistory, mortgage, documents } = profile;

  let score = 0;
  const factors: string[] = [];
  const strengths: string[] = [];

  // Blacklist
  if (searchRow.blacklistFlag) {
    score += 40;
    factors.push("Borrower is on internal blacklist");
  }

  // Repayment state & DPD
  const state = (repayCondition.state ?? "").toLowerCase();
  if (state.includes("write-off") || state.includes("written")) {
    score += 35;
    factors.push("Loan status: Write-off");
  } else if (repayCondition.overdueDays >= 90) {
    score += 25;
    factors.push(`Severely overdue — ${repayCondition.overdueDays} DPD`);
  } else if (repayCondition.overdueDays >= 30) {
    score += 15;
    factors.push(`Overdue — ${repayCondition.overdueDays} DPD`);
  } else if (repayCondition.overdueDays > 0) {
    score += 8;
    factors.push(`Minor overdue — ${repayCondition.overdueDays} DPD`);
  } else if (state.includes("current")) {
    strengths.push("Loan currently performing — zero overdue days");
  }

  // OCA / write-off history
  const hasWriteOff = ocaWriteOff.writeOffRecords.some((r) => !r.toLowerCase().includes("none"));
  const hasOCA = ocaWriteOff.ocaRecords.some((r) => !r.toLowerCase().includes("none"));
  if (hasWriteOff) { score += 20; factors.push("Write-off record on file"); }
  if (hasOCA) { score += 10; factors.push("OCA / legal action record on file"); }

  // Credit indicators
  for (const ind of creditRef.indicators ?? []) {
    const lower = ind.toLowerCase();
    if (lower.includes("blacklist")) { score += 15; factors.push("Blacklist flag in credit record"); }
    else if (lower.includes("dispute")) { score += 8; factors.push("Active dispute noted in credit record"); }
    else if (lower.includes("default")) { score += 12; factors.push("Prior default in credit record"); }
    else { strengths.push(ind); }
  }

  // DSR
  const dsrRatio = parseFloat((dsr.ratio ?? "").replace("%", "").trim());
  if (!Number.isNaN(dsrRatio)) {
    if (dsrRatio >= 70) { score += 15; factors.push(`High DSR: ${dsr.ratio}`); }
    else if (dsrRatio >= 50) { score += 8; factors.push(`Elevated DSR: ${dsr.ratio}`); }
    else if (dsrRatio > 0) { strengths.push(`DSR within policy: ${dsr.ratio}`); }
  }

  // Collateral
  if (mortgage.applicable) {
    strengths.push("Secured by registered collateral");
  } else {
    score += 5;
  }

  // Prior clean facilities
  const closedClean = loanHistory.filter((l) => {
    const s = l.status.toLowerCase();
    return s.includes("fully repaid") || (s.includes("closed") && !s.includes("write-off"));
  });
  if (closedClean.length > 0) {
    strengths.push(`${closedClean.length} prior facilit${closedClean.length === 1 ? "y" : "ies"} closed without incident`);
  }

  score = Math.min(score, 100);

  let level: RiskLevel;
  if (state.includes("write-off") || searchRow.blacklistFlag) {
    level = "Written Off";
  } else if (score >= 55) {
    level = "High Risk";
  } else if (score >= 30) {
    level = "Moderate Risk";
  } else {
    level = "Low Risk";
  }

  const recommendation =
    level === "Written Off"
      ? "Block — do not extend new credit; recovery file only"
      : level === "High Risk"
        ? "Escalate for senior credit review before any decision"
        : level === "Moderate Risk"
          ? "Proceed with enhanced monitoring and caution"
          : "Suitable for standard credit processing";

  const nextActions = computeNextActions(profile, level, documents.length);

  return { score, level, recommendation, factors, strengths, nextActions };
}

function computeNextActions(
  profile: CustomerProfile,
  level: RiskLevel,
  documentCount: number,
): string[] {
  const { searchRow, repayCondition, ocaWriteOff } = profile;
  const actions: string[] = [];

  if (searchRow.blacklistFlag) {
    actions.push("Reject intake immediately — blacklisted borrower; escalate to compliance.");
  }
  if (repayCondition.state?.toLowerCase().includes("write-off")) {
    actions.push("Initiate recovery review — confirm outstanding write-off balance and recovery status with external counsel.");
  } else if (repayCondition.overdueDays > 0) {
    actions.push(`Review active collection queue — borrower is ${repayCondition.overdueDays} DPD; verify soft-call log.`);
  }
  if (ocaWriteOff.writeOffRecords.some((r) => !r.toLowerCase().includes("none"))) {
    actions.push("Confirm write-off record details with Recovery team before considering any new underwriting.");
  }
  if (documentCount === 0) {
    actions.push("No documents on file — obtain ID/KYC, financials, and security documents before proceeding.");
  }
  if (level === "Moderate Risk" && actions.length === 0) {
    actions.push("Schedule enhanced monitoring review within 30 days.");
    actions.push("Refresh DSR figures and confirm buyer/income payment behaviour.");
  }
  if (actions.length === 0) {
    actions.push("Proceed with standard human review and routine documentation controls.");
  }
  return actions.slice(0, 4);
}
