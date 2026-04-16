import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/portal-data";
import { computeBorrowerRisk } from "@/lib/borrower-risk";
import { isValidCustomerId } from "@/lib/validation";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8192;

function clientError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

const STRUCTURED_INSTRUCTION = `You are an internal loan operations assistant. Analyse the customer record and respond with ONLY a raw JSON object (no markdown, no code fences) in this exact schema:
{
  "heading": "short heading (4-8 words)",
  "overallStatus": "Low Risk" | "Moderate Risk" | "High Risk" | "Written Off",
  "recommendation": "one sentence action for operations staff",
  "confidence": "XX% confidence",
  "bullets": ["finding 1", "finding 2", "finding 3", "finding 4", "finding 5"],
  "nextActions": ["action 1", "action 2", "action 3"],
  "reviewNote": "one sentence human review note",
  "sources": ["module names used, e.g. repayCondition, creditRef, ocaWriteOff"]
}
Do not invent facts. Use only the JSON provided. Neutral professional tone.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return clientError("Service unavailable", 503);
  }

  const len = request.headers.get("content-length");
  if (len && Number(len) > MAX_BODY_BYTES) {
    return clientError("Payload too large", 413);
  }

  let body: { customerId?: unknown } = {};
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return clientError("Payload too large", 413);
    }
    body = JSON.parse(text) as { customerId?: unknown };
  } catch {
    return clientError("Invalid JSON", 400);
  }

  if (!isValidCustomerId(body.customerId)) {
    return clientError("Invalid request", 400);
  }

  const profile = await getProfileById(body.customerId);
  if (!profile) {
    return clientError("Not found", 404);
  }

  // Pre-compute rule-based risk to anchor the LLM
  const risk = computeBorrowerRisk(profile);
  const riskAnchor =
    `PRE_COMPUTED_RISK (use as anchor):\n` +
    `score=${risk.score}/100, level="${risk.level}", recommendation="${risk.recommendation}"\n` +
    `factors: ${JSON.stringify(risk.factors)}\n` +
    `strengths: ${JSON.stringify(risk.strengths)}\n` +
    `suggestedNextActions: ${JSON.stringify(risk.nextActions)}`;

  const payload = {
    identity: profile.searchRow,
    applyInfo: profile.applyInfo,
    creditRef: profile.creditRef,
    repayCondition: profile.repayCondition,
    loanHistory: profile.loanHistory,
    approvalInfo: profile.approvalInfo,
    ocaWriteOff: profile.ocaWriteOff,
    dsr: profile.dsr,
    mortgage: profile.mortgage,
    crm: profile.crm.slice(0, 5),
  };

  const openai = new OpenAI({ apiKey, timeout: 45_000, maxRetries: 1 });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: STRUCTURED_INSTRUCTION },
        {
          role: "user",
          content: `${riskAnchor}\n\nCUSTOMER_RECORD:\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
      temperature: 0.25,
      max_tokens: 800,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      return clientError("Upstream error", 502);
    }

    // Parse structured JSON
    try {
      const card = JSON.parse(raw) as Record<string, unknown>;
      if (typeof card.heading === "string" && Array.isArray(card.bullets)) {
        return NextResponse.json({ structured: card });
      }
    } catch {
      // fallback: return plain summary
    }

    return NextResponse.json({ summary: raw });
  } catch {
    return clientError("Upstream error", 502);
  }
}
