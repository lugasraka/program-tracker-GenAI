import { NextResponse } from "next/server";
import { synthesizeProgram } from "@/lib/gemini";

export const maxDuration = 60;

const RATE_LIMIT_RE = /\b429\b|quota exceeded|rate.?limit/i;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { input?: string };
    const input = (body.input ?? "").trim();
    if (!input) {
      return NextResponse.json({ error: "Input text is required." }, { status: 400 });
    }
    if (input.length > 50000) {
      return NextResponse.json(
        { error: "Input too long (max 50,000 characters)." },
        { status: 400 }
      );
    }

    const result = await synthesizeProgram(input);
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Synthesis failed:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (RATE_LIMIT_RE.test(message)) {
      return NextResponse.json(
        {
          error:
            "Gemini rate limit reached — the free tier allows about 20 requests per minute. Wait a minute and try again.",
        },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: `Synthesis failed: ${message}` },
      { status: 500 }
    );
  }
}
