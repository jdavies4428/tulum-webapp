import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_MODEL = "gemini-2.0-flash";

function getModel(): string {
  return process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
}

function getApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  return key;
}

function buildPrompt(params: {
  days: number;
  interests: string[];
  budget: string;
  groupType: string;
}): string {
  const { days, interests, budget, groupType } = params;
  const dayEntries = Array.from(
    { length: days },
    (_, i) =>
      `{ "day": ${i + 1}, "title": "Day ${i + 1} title", "activities": [{ "time": "9:00 AM", "duration": "2 hours", "title": "Activity name", "location": "Place", "description": "What to do", "tips": ["Tip"], "estimated_cost": "$20-40" }] }`
  ).join(",\n    ");
  return `You are a local Tulum travel expert. Create a detailed ${days}-day itinerary for Tulum, Mexico.

TRAVELER PROFILE:
- Duration: ${days} days
- Interests: ${interests.join(", ")}
- Budget: ${budget} (low/medium/high)
- Group Type: ${groupType} (solo/couple/family/friends)

CRITICAL: Return EXACTLY ${days} day objects in the "days" array. Each day gets its own object with day number 1 through ${days}. Do not truncate.

REQUIREMENTS:
1. Provide specific place names (real venues in Tulum)
2. Include mix of popular spots and hidden gems
3. Consider realistic timing and distances
4. Include morning, afternoon, and evening activities for EACH day
5. Suggest specific restaurants and beach clubs
6. Add cenote recommendations
7. Include cultural/historical sites
8. Provide transportation tips between locations

FORMAT YOUR RESPONSE AS JSON ONLY, no other text. Structure:
{
  "title": "Your Tulum Adventure",
  "summary": "Brief overview",
  "days": [
    ${dayEntries}
  ],
  "tips": ["General tip 1", "General tip 2"],
  "estimated_total_cost": "$500-800"
}

Replace each placeholder with real content. Respond with valid JSON only.`;
}

function parseItinerary(text: string): Record<string, unknown> {
  let cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    cleaned = cleaned.slice(first, last + 1);
  }
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    return {
      title: "Your Tulum Itinerary",
      summary: "We couldn't structure the response. Here's what the AI suggested.",
      rawText: text,
      days: [],
      tips: [],
    };
  }
}

const VALID_BUDGETS = new Set(["low", "medium", "high"]);
const VALID_GROUP_TYPES = new Set(["solo", "couple", "family", "friends"]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const days = Math.min(14, Math.max(1, Number(body.days) || 3));
    const rawInterests = Array.isArray(body.interests) ? body.interests : [];
    const interests = rawInterests
      .filter((i: unknown): i is string => typeof i === "string")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .slice(0, 12);
    const budget = VALID_BUDGETS.has(body.budget) ? body.budget : "medium";
    const groupType = VALID_GROUP_TYPES.has(body.groupType) ? body.groupType : "couple";

    if (interests.length === 0) {
      return NextResponse.json(
        { success: false, error: "Select at least one interest" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(getApiKey());
    const model = genAI.getGenerativeModel({ model: getModel() });
    const prompt = buildPrompt({ days, interests, budget, groupType });

    // Use 1 retry with longer delay to avoid burst limits (429 can occur even when RPM/TPM are under quota)
    const maxRetries = 1;
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        if (!text) {
          return NextResponse.json(
            { success: false, error: "No response from AI" },
            { status: 500 }
          );
        }

        const itinerary = parseItinerary(text);
        return NextResponse.json({ success: true, itinerary });
      } catch (err) {
        lastError = err;
        const is429 =
          err instanceof Error &&
          (err.message.includes("429") || err.message.includes("Too Many Requests") || err.message.includes("Resource exhausted"));
        if (is429 && attempt < maxRetries) {
          const delayMs = 15000 + Math.random() * 5000; // 15–20s to avoid burst limits
          await new Promise((r) => setTimeout(r, delayMs));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  } catch (e) {
    const raw = e instanceof Error ? e.message : String(e);
    const isRateLimit = raw.includes("429") || raw.includes("Too Many Requests") || raw.includes("Resource exhausted");
    const msg = isRateLimit
      ? "Rate limit reached (this can happen after one request if the API was used recently). Please wait a minute and try again."
      : raw;
    return NextResponse.json({ success: false, error: msg }, { status: isRateLimit ? 429 : 500 });
  }
}
