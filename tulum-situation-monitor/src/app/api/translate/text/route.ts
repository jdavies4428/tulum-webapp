import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

export async function POST(request: NextRequest) {
  const key =
    process.env.GOOGLE_TRANSLATE_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      {
        success: false,
        error: "No Google API key configured (GOOGLE_TRANSLATE_API_KEY or GOOGLE_MAPS_API_KEY)",
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { text, targetLanguage, sourceLanguage } = body as {
      text?: string;
      targetLanguage?: string;
      sourceLanguage?: string;
    };

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { success: false, error: "text is required" },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      return NextResponse.json(
        { success: false, error: "targetLanguage is required" },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({ key });
    const res = await fetch(`${TRANSLATE_URL}?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: [text.trim()],
        target: targetLanguage,
        ...(sourceLanguage && sourceLanguage !== "auto"
          ? { source: sourceLanguage }
          : {}),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Google Translate API error:", res.status, err);
      return NextResponse.json(
        {
          success: false,
          error: "Translation service unavailable. Please try again.",
        },
        { status: 502 }
      );
    }

    const data = (await res.json()) as {
      data?: { translations?: Array<{ translatedText?: string }> };
    };
    const translated =
      data.data?.translations?.[0]?.translatedText ?? text.trim();

    return NextResponse.json({
      success: true,
      original: text.trim(),
      translated,
      sourceLanguage: sourceLanguage || "auto",
      targetLanguage,
    });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Translation failed",
      },
      { status: 500 }
    );
  }
}
