import OpenAI from "openai";
import { NextResponse } from "next/server";
import { DISCOVERY_BRIEF } from "@/lib/discovery-brief";
import { getProfileByIdNumberStrict } from "@/lib/portal-data";
import { computeBorrowerRisk } from "@/lib/borrower-risk";
import type { CustomerProfile } from "@/types/customer";

export const runtime = "nodejs";

const MAX_BODY = 120_000;

type ChatMsg = { role: "user" | "assistant"; content: string };

const HKID_PATTERN = /\b[A-Z]{1,2}\d{6,8}[A-Z]\b/i;

// Prompts that should return structured JSON analysis cards
const STRUCTURED_TRIGGERS = [
  "risk", "credit", "summary", "summarize", "summarise", "missing",
  "approval", "oca", "write-off", "repayment", "next action", "recommend",
];

function wantsStructured(text: string): boolean {
  const lower = text.toLowerCase();
  return STRUCTURED_TRIGGERS.some((t) => lower.includes(t));
}

const STRUCTURED_SYSTEM_INSTRUCTION = `When INTERNAL_RECORD_JSON is provided AND the user asks about risk, credit, summary, missing documents, approval, OCA/write-off, repayment, or recommended actions, respond with ONLY a raw JSON object (no markdown, no code fences) in this exact schema:
{
  "heading": "short heading (4-8 words)",
  "overallStatus": "Low Risk" | "Moderate Risk" | "High Risk" | "Written Off",
  "recommendation": "one sentence action",
  "confidence": "XX% confidence",
  "bullets": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5"],
  "nextActions": ["action 1", "action 2", "action 3"],
  "reviewNote": "one sentence human review note",
  "sources": ["module names used, e.g. repayCondition, creditRef, ocaWriteOff"]
}
For all other questions, reply in plain text.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 503 });
  }

  let body: { messages?: ChatMsg[]; context?: string } = {};
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }
    body = JSON.parse(text) as { messages?: ChatMsg[]; context?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const messages = (body.messages?.filter((m) => m.role === "user" || m.role === "assistant") ?? []).slice(-24);
  if (messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser?.content?.trim()) {
    return NextResponse.json({ error: "No user message" }, { status: 400 });
  }

  // An explicit HKID in the user's latest message should always win over page context.
  // This supports asking from the general assistant or from a different open profile.
  let context = typeof body.context === "string" ? body.context.trim() : "";
  let resolvedProfile: CustomerProfile | null = null;

  const idMatch = lastUser.content.match(HKID_PATTERN);
  if (idMatch?.[0]) {
    const idNumber = idMatch[0].toUpperCase();
    try {
      const profile = await getProfileByIdNumberStrict(idNumber);
      if (profile) {
        resolvedProfile = profile;
        console.log(`[chat] auto-resolved context for ID: ${idNumber} → ${profile.searchRow.name}`);
        context = JSON.stringify(profile, null, 2);
      } else {
        console.log(`[chat] ID ${idNumber} not found in database`);
      }
    } catch (error) {
      console.error(
        `[chat] getProfileByIdNumber(${idNumber}) failed:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  // Pre-compute rule-based risk score to anchor LLM analysis
  let riskAnchor = "";
  if (resolvedProfile) {
    try {
      const risk = computeBorrowerRisk(resolvedProfile);
      riskAnchor =
        `\nPRE_COMPUTED_RISK (use as anchor — do not contradict without evidence from the record):\n` +
        `score=${risk.score}/100, level="${risk.level}", recommendation="${risk.recommendation}"\n` +
        `factors: ${JSON.stringify(risk.factors)}\n` +
        `strengths: ${JSON.stringify(risk.strengths)}\n` +
        `suggestedNextActions: ${JSON.stringify(risk.nextActions)}`;
    } catch {
      // non-fatal
    }
  }

  const isStructured = context ? wantsStructured(lastUser.content) : false;

  const systemParts = [
    "You are the internal deviewai.com portal assistant. Be concise and practical.",
    "Use only INTERNAL_RECORD_JSON when provided for borrower-specific facts; do not invent loans, companies, or repayment events.",
    "For credit rating or risk questions, provide a qualitative grade/risk assessment from the record. Do not call the pre-computed risk score a credit score, and do not invent external bureau scores.",
    "If data is missing, say so and name which module would hold it (e.g. repay history, OCA/write-off).",
    ...(isStructured ? [STRUCTURED_SYSTEM_INSTRUCTION] : []),
    "DISCOVERY_BRIEF:\n" + DISCOVERY_BRIEF,
  ];
  if (context) {
    systemParts.push("INTERNAL_RECORD_JSON:\n" + context + riskAnchor);
  }

  const openai = new OpenAI({ apiKey, timeout: 60_000, maxRetries: 1 });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemParts.join("\n\n") },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.25,
      max_tokens: 1000,
    });
    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return NextResponse.json({ error: "Empty reply" }, { status: 502 });
    }

    // Try to parse as structured card
    if (isStructured) {
      try {
        const card = JSON.parse(raw) as Record<string, unknown>;
        if (typeof card.heading === "string" && Array.isArray(card.bullets)) {
          return NextResponse.json({ reply: raw, structured: card });
        }
      } catch {
        // fall through to plain reply
      }
    }

    return NextResponse.json({ reply: raw });
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
