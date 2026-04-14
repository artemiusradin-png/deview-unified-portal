import OpenAI from "openai";
import { NextResponse } from "next/server";
import { DISCOVERY_BRIEF } from "@/lib/discovery-brief";

export const runtime = "nodejs";

const MAX_BODY = 120_000;

type ChatMsg = { role: "user" | "assistant"; content: string };

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

  const context = typeof body.context === "string" ? body.context.trim() : "";
  const systemParts = [
    "You are the internal deviewai.com portal assistant. Be concise and practical.",
    "Use only INTERNAL_RECORD_JSON when provided for borrower-specific facts; do not invent loans, companies, or repayment events.",
    "If data is missing, say so and name which module would hold it (e.g. repay history, OCA/write-off).",
    "DISCOVERY_BRIEF:\n" + DISCOVERY_BRIEF,
  ];
  if (context) {
    systemParts.push("INTERNAL_RECORD_JSON:\n" + context);
  }

  const openai = new OpenAI({ apiKey, timeout: 60_000, maxRetries: 1 });

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemParts.join("\n\n") },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.35,
      max_tokens: 900,
    });
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!reply) {
      return NextResponse.json({ error: "Empty reply" }, { status: 502 });
    }
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
