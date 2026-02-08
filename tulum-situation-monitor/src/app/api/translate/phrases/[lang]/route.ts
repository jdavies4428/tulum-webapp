import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

const PHRASE_CATEGORIES: { id: string; emoji: string; label: string; phrases: string[] }[] = [
  {
    id: "friendly",
    emoji: "👋",
    label: "Friendly",
    phrases: [
      "Hello",
      "Good morning",
      "Good afternoon",
      "Good evening",
      "How are you?",
      "Nice to meet you",
      "Goodbye",
      "See you later",
      "You're welcome",
      "Have a nice day",
      "Excuse me",
      "Sorry",
      "Please",
      "Thank you very much",
    ],
  },
  {
    id: "eating",
    emoji: "🍽️",
    label: "Eating",
    phrases: [
      "Can I have the menu?",
      "Water, please",
      "The check, please",
      "Is this vegetarian?",
      "I'm allergic to...",
      "This is delicious",
      "A table for two, please",
      "I'd like to order...",
      "No ice, please",
      "Is there WiFi here?",
      "We're ready to order",
      "Can I have the bill?",
      "Do you have...?",
      "I'll have the same",
    ],
  },
  {
    id: "romantic",
    emoji: "💕",
    label: "Romantic",
    phrases: [
      "I love you",
      "You're beautiful",
      "Would you like to dance?",
      "Can I buy you a drink?",
      "You make me happy",
      "I like you",
      "Let's go somewhere",
      "You have a lovely smile",
      "I'd love to see you again",
      "You're very special",
    ],
  },
  {
    id: "getting-around",
    emoji: "🚕",
    label: "Getting Around",
    phrases: [
      "Where is the bathroom?",
      "How do I get to the beach?",
      "Can you call a taxi?",
      "How much to go to...?",
      "Where is...?",
      "Left or right?",
      "Is it far?",
      "Can you show me on the map?",
      "I'm looking for...",
      "Which way to the center?",
      "Stop here, please",
      "How long does it take?",
    ],
  },
  {
    id: "shopping",
    emoji: "🛒",
    label: "Shopping",
    phrases: [
      "How much does this cost?",
      "Do you have...?",
      "I'm just looking",
      "Can I try this on?",
      "Too expensive",
      "Do you have a smaller size?",
      "Do you have a larger size?",
      "I'll take it",
      "Do you take credit cards?",
      "Can you give me a discount?",
      "Where can I find...?",
      "What do you recommend?",
    ],
  },
  {
    id: "emergency",
    emoji: "🆘",
    label: "Emergency",
    phrases: [
      "I need help",
      "Call the police",
      "Call an ambulance",
      "Where is the hospital?",
      "I lost my passport",
      "I lost my phone",
      "Someone stole my...",
      "I don't feel well",
      "It's an emergency",
      "Can you help me?",
      "I need a doctor",
      "Where is the pharmacy?",
    ],
  },
  {
    id: "travel",
    emoji: "🌴",
    label: "Travel",
    phrases: [
      "Where is the beach?",
      "What time does it open?",
      "Do you speak English?",
      "I don't understand",
      "Can you repeat that?",
      "How do you say...?",
      "What's the best beach?",
      "Is the water safe to swim?",
      "Where can I rent...?",
      "Do you have sunscreen?",
      "Beautiful day!",
      "Recommend a good restaurant",
    ],
  },
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
    const allPhrases = PHRASE_CATEGORIES.flatMap((c) => c.phrases);

    const paramsUrl = new URLSearchParams({ key });
    const res = await fetch(`${TRANSLATE_URL}?${paramsUrl}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: allPhrases,
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

    let idx = 0;
    const categories = PHRASE_CATEGORIES.map((cat) => ({
      id: cat.id,
      emoji: cat.emoji,
      label: cat.label,
      phrases: cat.phrases.map((english) => ({
        english,
        translated: translations[idx++]?.translatedText ?? english,
      })),
    }));

    return NextResponse.json({
      success: true,
      categories,
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
