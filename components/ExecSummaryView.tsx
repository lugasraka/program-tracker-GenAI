"use client";

import type { SynthesisResult } from "@/lib/gemini";
import { Badge, statusTone } from "./status";

export default function ExecSummaryView({ result }: { result: SynthesisResult }) {
  const { execSummary, momentum, momentumReason } = result;

  function copyBrief() {
    const lines = [
      `# ${result.programName} — Exec Brief`,
      "",
      execSummary.headline,
      "",
      "## Status by workstream",
      ...execSummary.statusByWorkstream.map((s) => `- [${s.status}] ${s.workstream}: ${s.note}`),
      "",
      "## Top risks",
      ...execSummary.topRisks.map((r) => `- ${r}`),
      "",
      "## Asks",
      ...execSummary.asks.map((a) => `- ${a}`),
      "",
      `Momentum: ${momentum} — ${momentumReason}`,
    ];
    void navigator.clipboard.writeText(lines.join("\n"));
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-gborder bg-gradient-to-br from-gblue-tint/60 via-white to-ggreen-tint/40 p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gmuted">
            Leadership brief
          </h3>
          <div className="flex items-center gap-2">
            <Badge label={momentum} tone={statusTone(momentum)} />
            <button
              onClick={copyBrief}
              className="rounded-lg border border-gborder bg-white px-3 py-1 text-xs font-medium text-gink transition hover:bg-gsurface focus:outline-none focus:ring-2 focus:ring-gblue-tint"
            >
              Copy as Markdown
            </button>
          </div>
        </div>
        <p className="text-lg font-medium leading-snug text-gink">{execSummary.headline}</p>
        <p className="mt-1 text-sm text-gmuted">{momentumReason}</p>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-medium text-gink">Status by workstream</h3>
        <div className="space-y-2">
          {execSummary.statusByWorkstream.map((s, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-gborder bg-white px-3 py-2 text-sm transition hover:border-ggrid"
            >
              <Badge label={s.status} tone={statusTone(s.status)} />
              <span className="font-medium text-gink">{s.workstream}</span>
              <span className="flex-1 text-gmuted">{s.note}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-gborder bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-gink">Top risks</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-gink">
            {execSummary.topRisks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-gborder bg-white p-4">
          <h3 className="mb-2 text-sm font-medium text-gink">Asks</h3>
          <ul className="list-inside list-disc space-y-1 text-sm text-gink">
            {execSummary.asks.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
