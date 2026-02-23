import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { buildPulsePrompt } from "@/lib/concierge-prompts";
import type { ConciergeContext } from "@/lib/concierge-prompts";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { context: ConciergeContext };
    const { context } = body;

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    const pulsePrompt = buildPulsePrompt(context);

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: pulsePrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Understood. I will give a concise, specific Tulum recommendation." }],
        },
      ],
      generationConfig: {
        temperature: 0.85,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 200, // Force conciseness
      },
    });

    const result = await chat.sendMessageStream(
      "Give me your Tulum Pulse recommendation for right now."
    );

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              const data = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Pulse stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Pulse recommend error:", error);

    if (error?.status === 429 || error?.message?.includes("429")) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Failed: ${error?.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
