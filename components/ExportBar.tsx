"use client";

import { useState } from "react";
import type { SynthesisResult } from "@/lib/gemini";
import { copyRichText, downloadMarkdown } from "@/lib/export";

export default function ExportBar({ result }: { result: SynthesisResult }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleCopy() {
    const rich = await copyRichText(result);
    setFeedback(rich ? "Copied — paste into email, Teams, or Notion" : "Copied as plain text (rich paste unsupported in this browser)");
    setTimeout(() => setFeedback(null), 4000);
  }

  function handleDownload() {
    downloadMarkdown(result);
    setFeedback("Markdown brief downloaded");
    setTimeout(() => setFeedback(null), 4000);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        onClick={() => void handleCopy()}
        className="rounded-lg bg-gink px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#3c4043] focus:outline-none focus:ring-2 focus:ring-gblue-tint"
      >
        Copy for email
      </button>
      <button
        onClick={handleDownload}
        className="rounded-lg border border-gborder bg-white px-4 py-1.5 text-sm font-medium text-gink transition hover:bg-gsurface focus:outline-none focus:ring-2 focus:ring-gblue-tint"
      >
        Download .md brief
      </button>
      {feedback && <span className="text-xs font-medium text-ggreen-dark">{feedback}</span>}
    </div>
  );
}
