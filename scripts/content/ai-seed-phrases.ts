/**
 * Append AI-suggested travel phrases to the pool (pending human review).
 * Requires OPENAI_API_KEY.
 *
 * Usage: npx tsx scripts/content/ai-seed-phrases.ts ja-jp train 12
 */
import type { CorridorId } from "../../src/lib/types";
import { appendPoolItems } from "../../src/lib/content-pipeline/pool-store";
import { WV_PHRASEBOOKS } from "../../src/lib/content-pipeline/wv-fetch";

const corridorId = process.argv[2] as CorridorId | undefined;
const situation = process.argv[3];
const countArg = process.argv[4];
const count = countArg ? Number(countArg) : 10;

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is required");
    process.exit(1);
  }
  if (!corridorId || !WV_PHRASEBOOKS[corridorId]) {
    console.error(
      "Usage: npx tsx scripts/content/ai-seed-phrases.ts <corridorId> <situation> [count]",
    );
    process.exit(1);
  }
  if (!situation) {
    console.error("situation hint required, e.g. train, airport, dietary");
    process.exit(1);
  }

  const targetLanguage = {
    "ja-jp": "Japanese",
    "ko-kr": "Korean",
    "th-th": "Thai",
    "vi-vn": "Vietnamese",
    "id-id": "Indonesian",
  }[corridorId];

  const prompt = `You are editing a travel phrase pool for tourists learning ${targetLanguage}.
Situation: ${situation}. Corridor: ${corridorId}.
Return JSON only: { "phrases": [ { "target": "...", "romanization": "...", "meaningEn": "...", "tags": [] } ] }
Rules: polite tourist register; ${count} items; short usable lines; meaningEn in English; no grammar lessons.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Output valid JSON only." },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI HTTP ${res.status}: ${text}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty OpenAI response");
  }

  const parsed = JSON.parse(content) as {
    phrases: {
      target: string;
      romanization?: string;
      meaningEn: string;
      tags?: string[];
    }[];
  };

  const inputs = parsed.phrases.map((p) => ({
    target: p.target,
    romanization: p.romanization,
    meaningEn: p.meaningEn,
    situationHints: [situation],
    tags: [...(p.tags ?? []), "ai-seed"],
    notes: "AI draft — requires human review",
  }));

  const { added, skipped } = await appendPoolItems(corridorId, inputs, "ai", {
    status: "pending",
  });
  console.log(`AI pool: added ${added.length}, skipped ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
