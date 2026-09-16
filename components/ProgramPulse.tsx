"use client";

import type { SynthesisResult } from "@/lib/gemini";
import { statusTone } from "./status";
import { EditableText, EditableSelect, EditedChip } from "./Editable";

type UpdateFn = (mutator: (draft: SynthesisResult) => void) => void;

const MOMENTUM = ["Accelerating", "Steady", "Slowing"] as const;

export default function ProgramPulse({ result, updateResult }: { result: SynthesisResult; updateResult: UpdateFn }) {
  const { execSummary, momentum, momentumReason } = result;

  return (
    <section className="mb-4 rounded-xl border border-gborder bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gmuted">
          Program pulse
        </h2>
        <EditableSelect
          value={momentum}
          options={MOMENTUM}
          tone={statusTone(momentum)}
          onCommit={(next) =>
            updateResult((d) => {
              d.momentum = next as typeof d.momentum;
              d.editedScalars = d.editedScalars ?? [];
              if (!d.editedScalars.includes("momentum")) d.editedScalars.push("momentum");
            })
          }
        />
        {(result.editedScalars?.includes("momentum") || result.editedScalars?.includes("momentumReason")) && <EditedChip />}
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
      <div className="mt-2 text-xs text-gmuted">
        <EditableText
          value={momentumReason}
          onCommit={(next) =>
            updateResult((d) => {
              d.momentumReason = next;
              d.editedScalars = d.editedScalars ?? [];
              if (!d.editedScalars.includes("momentumReason")) d.editedScalars.push("momentumReason");
            })
          }
        />
      </div>
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
