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
  return `You are a local Tulum travel expert. Create a detailed ${days}-day itinerary for Tulum, Mexico.

TRAVELER PROFILE:
- Duration: ${days} days
- Interests: ${interests.join(", ")}
- Budget: ${budget} (low/medium/high)
- Group Type: ${groupType} (solo/couple/family/friends)

REQUIREMENTS:
1. Provide specific place names (real venues in Tulum)
2. Include mix of popular spots and hidden gems
3. Consider realistic timing and distances
4. Include morning, afternoon, and evening activities
5. Suggest specific restaurants and beach clubs
6. Add cenote recommendations
7. Include cultural/historical sites
8. Provide transportation tips between locations

FORMAT YOUR RESPONSE AS JSON ONLY, no other text:
{
  "title": "Your Tulum Adventure",
  "summary": "Brief overview of the itinerary",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "9:00 AM",
          "duration": "2 hours",
          "title": "Activity name",
          "location": "Specific place name",
          "description": "What to do and why",
          "tips": ["Tip 1", "Tip 2"],
          "estimated_cost": "$20-40",
          "coordinates": {"lat": 20.2114, "lng": -87.4654}
        }
      ]
    }
  ],
  "tips": ["General tip 1", "General tip 2"],
  "estimated_total_cost": "$500-800"
}

Respond with valid JSON only.`;
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const days = Number(body.days) || 3;
    const interests = Array.isArray(body.interests) ? body.interests : [];
    const budget = typeof body.budget === "string" ? body.budget : "medium";
    const groupType = typeof body.groupType === "string" ? body.groupType : "couple";

    if (interests.length === 0) {
      return NextResponse.json(
        { success: false, error: "Select at least one interest" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(getApiKey());
    const model = genAI.getGenerativeModel({ model: getModel() });
    const prompt = buildPrompt({ days, interests, budget, groupType });
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
    return NextResponse.json({
      success: true,
      itinerary,
      rawText: text,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to generate itinerary";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
