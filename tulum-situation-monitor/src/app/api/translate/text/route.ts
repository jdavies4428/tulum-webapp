import { NextRequest } from "next/server";
import { validateBody, errorResponse, successResponse, withErrorHandling } from "@/lib/api/utils";
import { translateTextSchema } from "@/lib/api/schemas";
import { validateServerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Validate server environment variables
  const serverEnv = validateServerEnv();
  const key = serverEnv.GOOGLE_TRANSLATE_API_KEY || serverEnv.GOOGLE_MAPS_API_KEY;

  // Validate request body
  const { text, targetLanguage, sourceLanguage } = await validateBody(
    translateTextSchema,
    request
  );

  // Call Google Translate API
  const params = new URLSearchParams({ key });
  const res = await fetch(`${TRANSLATE_URL}?${params}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: [text.trim()],
      target: targetLanguage,
      ...(sourceLanguage && sourceLanguage !== "auto" ? { source: sourceLanguage } : {}),
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Google Translate API error:", res.status, err);
    throw errorResponse("Translation service unavailable. Please try again.", 502);
  }

  const data = (await res.json()) as {
    data?: { translations?: Array<{ translatedText?: string }> };
  };
  const translated = data.data?.translations?.[0]?.translatedText ?? text.trim();

  return successResponse({
    success: true,
    original: text.trim(),
    translated,
    sourceLanguage: sourceLanguage || "auto",
    targetLanguage,
  });
});
