import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

const COMMON_PHRASES = [
  "Hello",
  "Thank you",
  "How much does this cost?",
  "Where is the bathroom?",
  "I need help",
  "Do you speak English?",
  "Can I have the menu?",
  "Water, please",
  "The check, please",
  "How do I get to the beach?",
  "Is this vegetarian?",
  "I'm allergic to...",
  "What time does it open?",
  "Can you call a taxi?",
  "Where can I find...",
];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const key =
    process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        success: false,
        error:
          "GOOGLE_TRANSLATE_API_KEY not configured. Add it to .env.local and Vercel env vars.",
      },
      { status: 500 }
    );
  }

  const { lang } = await params;
  if (!lang) {
    return NextResponse.json(
      { success: false, error: "lang is required" },
      { status: 400 }
    );
  }

  try {
    const paramsUrl = new URLSearchParams({ key });
    const res = await fetch(`${TRANSLATE_URL}?${paramsUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: COMMON_PHRASES,
        target: lang,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Google Translate phrases error:", res.status, err);
      return NextResponse.json(
        {
          success: false,
          error: "Phrases service unavailable. Please try again.",
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      data?: { translations?: Array<{ translatedText?: string }> };
    };
    const translations = data.data?.translations ?? [];

    const phrases = COMMON_PHRASES.map((english, i) => ({
      english,
      translated: translations[i]?.translatedText ?? english,
    }));

    return NextResponse.json({
      success: true,
      phrases,
      language: lang,
    });
  } catch (error) {
    console.error("Phrases translation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to load phrases",
      },
      { status: 500 }
    );
  }
}
