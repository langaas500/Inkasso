import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Goal = "dispute" | "payment-plan" | "understand";

type AnalyseRequest = {
  documentText: string;
  goal: Goal;
  paymentMonths?: number;
};

function pickJson(resp: any): any {
  if (typeof resp?.output_text === "string") {
    const t = resp.output_text.trim();
    if (t.startsWith("{") && t.endsWith("}")) return JSON.parse(t);
  }
  const out = resp?.output;
  if (Array.isArray(out)) {
    for (const item of out) {
      const content = item?.content;
      if (!Array.isArray(content)) continue;
      for (const c of content) {
        const text = c?.text;
        if (typeof text === "string") {
          const t = text.trim();
          if (t.startsWith("{") && t.endsWith("}")) return JSON.parse(t);
        }
      }
    }
  }
  throw new Error("Could not find JSON in OpenAI response");
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    const body = (await req.json()) as AnalyseRequest;

    const documentText = (body?.documentText ?? "").trim();
    const goal = body?.goal;
    const paymentMonths =
      typeof body?.paymentMonths === "number" && body.paymentMonths >= 1 && body.paymentMonths <= 12
        ? body.paymentMonths
        : 6;

    // Basic input limits
    const maxChars = 12000;
    const clipped = documentText.slice(0, maxChars);

    if (!clipped || clipped.length < 20) {
      return NextResponse.json({ error: "documentText must be at least 20 characters" }, { status: 400 });
    }
    if (!goal || !["dispute", "payment-plan", "understand"].includes(goal)) {
      return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
    }

    const schema = {
      type: "object",
      additionalProperties: false,
      required: [
        "who_demands_payment",
        "on_behalf_of",
        "amounts",
        "deadlines",
        "plain_summary",
        "recommendation",
        "next_step_explained",
        "draft_letter",
      ],
      properties: {
        who_demands_payment: { type: "string" },
        on_behalf_of: { type: "string" },
        amounts: {
          type: "object",
          additionalProperties: false,
          required: ["principal", "interest", "fees", "total", "currency_note"],
          properties: {
            principal: { type: ["number", "null"] },
            interest: { type: ["number", "null"] },
            fees: { type: ["number", "null"] },
            total: { type: ["number", "null"] },
            currency_note: { type: "string" },
          },
        },
        deadlines: {
          type: "object",
          additionalProperties: false,
          required: ["payment_deadline", "objection_deadline", "deadline_note"],
          properties: {
            payment_deadline: { type: "string" },
            objection_deadline: { type: "string" },
            deadline_note: { type: "string" },
          },
        },
        plain_summary: {
          type: "object",
          additionalProperties: false,
          required: ["what_this_is", "what_happens_if_nothing", "what_you_can_do_now"],
          properties: {
            what_this_is: { type: "string" },
            what_happens_if_nothing: { type: "string" },
            what_you_can_do_now: { type: "string" },
          },
        },
        recommendation: {
          type: "object",
          additionalProperties: false,
          required: ["type", "title", "reasoning"],
          properties: {
            type: { type: "string", enum: ["dispute", "payment-plan", "request-specification"] },
            title: { type: "string" },
            reasoning: { type: "string" },
          },
        },
        next_step_explained: {
          type: "object",
          additionalProperties: false,
          required: ["title", "steps"],
          properties: {
            title: { type: "string" },
            steps: { type: "array", minItems: 3, maxItems: 6, items: { type: "string" } },
          },
        },
        draft_letter: {
          type: "object",
          additionalProperties: false,
          required: ["subject", "body", "placeholders_used"],
          properties: {
            subject: { type: "string" },
            body: { type: "string" },
            placeholders_used: { type: "array", items: { type: "string" } },
          },
        },
      },
    } as const;

    const system = `
Du er en rolig, presis "inkasso-hjelper" i Norge.
Les teksten brukeren limer inn (inkassobrev/screenshot-tekst).
Regler:
- IKKE finn på fakta. Hvis noe ikke står der: skriv "ukjent" eller null.
- Ikke gi juridiske garantier. Praktisk, kort, menneskelig språk.
- Lag et utkast til tekst brukeren kan sende.

Mål:
- goal="payment-plan": lag betalingsplan-forespørsel og referer til valgt antall måneder (${paymentMonths}).
- goal="dispute": lag innsigelse (bestridelse) og be om spesifikasjon/dokumentasjon.
- goal="understand": lag krav om spesifikasjon (uten å innrømme kravet).

Plassholdere hvis mangler:
[referansenummer], [navn], [telefon], [epost]
`.trim();

    const user = `
BRUKERENS MÅL: ${goal}
VALGT BETALINGSPLAN (mnd): ${paymentMonths}

TEKST:
"""
${clipped}
"""
`.trim();

    const openaiResp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        text: {
          format: { type: "json_schema", strict: true, schema },
        },
      }),
    });

    if (!openaiResp.ok) {
      const err = await openaiResp.text();
      return NextResponse.json({ error: "OpenAI failed", details: err }, { status: 502 });
    }

    const raw = await openaiResp.json();
    const data = pickJson(raw);

    return NextResponse.json({ ok: true, data });
  } catch (e: any) {
    return NextResponse.json({ error: "Server error", details: e?.message ?? String(e) }, { status: 500 });
  }
}
