import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getProfileById } from "@/lib/mock-data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "missing_api_key",
        message: "Add OPENAI_API_KEY to your environment (e.g. Vercel project env or .env.local).",
      },
      { status: 503 },
    );
  }

  let body: { customerId?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const customerId = body.customerId;
  if (!customerId) {
    return NextResponse.json({ error: "customerId required" }, { status: 400 });
  }

  const profile = getProfileById(customerId);
  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const openai = new OpenAI({ apiKey });

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
    return NextResponse.json({ error: "Empty model response" }, { status: 502 });
  }

  return NextResponse.json({ summary: text });
}
