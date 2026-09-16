import { NextResponse } from "next/server";
import { synthesizeProgram } from "@/lib/gemini";

export const maxDuration = 60;

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
    return NextResponse.json(
      { error: `Synthesis failed: ${message}` },
      { status: 500 }
    );
  }
}
