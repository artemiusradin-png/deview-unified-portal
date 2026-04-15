import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/portal-data";
import { isValidCustomerId } from "@/lib/validation";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 8192;

function clientError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

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

  const payload = {
    identity: profile.searchRow,
    applyInfo: profile.applyInfo,
    repayCondition: profile.repayCondition,
    loanHistory: profile.loanHistory,
    approvalInfo: profile.approvalInfo,
    ocaWriteOff: profile.ocaWriteOff,
    crm: profile.crm.slice(0, 5),
  };

  const openai = new OpenAI({ apiKey, timeout: 45_000, maxRetries: 1 });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an internal loan operations assistant. Summarize the customer record for staff: key status, repayment health, risks, approvals, and recovery/write-off context. Use short bullet points. Do not invent facts beyond the JSON. Neutral professional tone.",
        },
        {
          role: "user",
          content: `Summarize this internal customer JSON:\n${JSON.stringify(payload, null, 2)}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return clientError("Upstream error", 502);
    }

    return NextResponse.json({ summary: text });
  } catch {
    return clientError("Upstream error", 502);
  }
}
