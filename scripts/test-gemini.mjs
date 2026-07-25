// Quick check that the Gemini API key and model respond (run: node scripts/test-gemini.mjs).
import { readFileSync } from "node:fs";

const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const key = env.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.+)/)?.[1]?.trim();
if (!key) {
  console.error("GOOGLE_GENERATIVE_AI_API_KEY not found in .env.local");
  process.exit(1);
}

const model = process.argv[2] ?? "gemini-flash-lite-latest";
const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Respondé solo: ok" }] }],
    }),
  },
);

console.log("status:", res.status);
const data = await res.json();
console.log(data.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(data).slice(0, 400));
