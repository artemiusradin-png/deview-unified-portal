import type { CustomerProfile, SearchResultRow } from "@/types/customer";
import { computeBorrowerRisk, type RiskLevel } from "@/lib/borrower-risk";

export type BorrowerGrade = "A" | "B" | "C" | "D";

export type RowFlags = {
  latePayment: boolean;
  defaulted: boolean;
  writeOff: boolean;
};

export function inferRowFlags(row: SearchResultRow): RowFlags {
  const s = row.status.toLowerCase();
  return {
    latePayment:
      s.includes("dpd") ||
      s.includes("late") ||
      s.includes("arrear") ||
      s.includes("watch") ||
      s.includes("special mention"),
    defaulted: s.includes("default") || s.includes("npl") || s.includes("non-performing"),
    writeOff: s.includes("write-off") || s.includes("written off") || s.includes("write off"),
  };
}

export function scoreRowHeuristic(row: SearchResultRow): number {
  const flags = inferRowFlags(row);
  let score = 0;
  if (row.blacklistFlag) score += 40;
  if (flags.writeOff) score += 35;
  if (flags.defaulted) score += 20;
  if (flags.latePayment) score += 12;
  if (row.status.toLowerCase().includes("pending")) score += 5;
  return Math.min(score, 100);
}

export function gradeFromScore(score: number): BorrowerGrade {
  if (score < 25) return "A";
  if (score < 45) return "B";
  if (score < 70) return "C";
  return "D";
}

export function riskStatusFromScore(score: number): RiskLevel {
  if (score >= 70) return "High Risk";
  if (score >= 45) return "Moderate Risk";
  return "Low Risk";
}

export function analysisFromProfile(profile: CustomerProfile) {
  const risk = computeBorrowerRisk(profile);
  return {
    score: risk.score,
    riskLevel: risk.level,
    grade: gradeFromScore(risk.score),
  };
}

export function extractApprovalDate(profile: CustomerProfile): Date | null {
  const dates = profile.approvalInfo
    .map((x) => safeDate(x.approvalDate || x.date))
    .filter((x): x is Date => x !== null)
    .sort((a, b) => b.getTime() - a.getTime());
  return dates[0] ?? safeDate(profile.searchRow.applyDate);
}

export function safeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}
