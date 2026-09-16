"use client";

import type { SynthesisResult } from "@/lib/gemini";
import { Badge, statusTone } from "./status";

export default function ProgramPulse({ result }: { result: SynthesisResult }) {
  const { execSummary, momentum, momentumReason } = result;

  return (
    <section className="mb-4 rounded-xl border border-gborder bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gmuted">
          Program pulse
        </h2>
        <Badge label={momentum} tone={statusTone(momentum)} />
      </div>
      <div className="flex flex-wrap gap-2">
        {execSummary.statusByWorkstream.map((s, i) => (
          <span
            key={i}
            title={s.note}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${pulseChip(s.status)}`}
          >
            <span className={`h-2 w-2 rounded-full ${dotColor(s.status)}`} />
            {s.workstream}
            <span className="text-[10px] font-semibold uppercase tracking-wide opacity-80">{s.status}</span>
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-gmuted">{momentumReason}</p>
    </section>
  );
}

function pulseChip(status: string): string {
  switch (status) {
    case "On track":
      return "border-ggreen-tint bg-ggreen-tint text-ggreen-dark";
    case "At risk":
      return "border-gyellow-tint bg-gyellow-tint text-gyellow-dark";
    case "Off track":
      return "border-gred-tint bg-gred-tint text-gred-dark";
    default:
      return "border-gborder bg-[#f1f3f4] text-gmuted";
  }
}

function dotColor(status: string): string {
  switch (status) {
    case "On track":
      return "bg-ggreen";
    case "At risk":
      return "bg-gyellow";
    case "Off track":
      return "bg-gred";
    default:
      return "bg-[#9aa0a6]";
  }
}
