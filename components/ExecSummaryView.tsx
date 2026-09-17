"use client";

import type { SynthesisResult } from "@/lib/gemini";
import { statusTone } from "./status";
import { EditableText, EditableSelect, EditedChip, DeleteButton } from "./Editable";

type UpdateFn = (mutator: (draft: SynthesisResult) => void) => void;

const EXEC_STATUSES = ["On track", "At risk", "Off track"] as const;
const MOMENTUM = ["Accelerating", "Steady", "Slowing"] as const;

export default function ExecSummaryView({ result, updateResult }: { result: SynthesisResult; updateResult: UpdateFn }) {
  const { execSummary, momentum, momentumReason } = result;
  const scalars = new Set(result.editedScalars ?? []);

  function markScalar(draft: SynthesisResult, key: string) {
    draft.editedScalars = draft.editedScalars ?? [];
    if (!draft.editedScalars.includes(key)) draft.editedScalars.push(key);
  }

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
      <div className="rounded-xl border border-gborder bg-gradient-to-br from-gaccent-tint/60 via-white to-ggreen-tint/40 p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gmuted">
            Leadership brief
          </h3>
          <div className="flex items-center gap-2">
            <EditableSelect
              value={momentum}
              options={MOMENTUM}
              tone={statusTone(momentum)}
              onCommit={(next) =>
                updateResult((d) => {
                  d.momentum = next as typeof d.momentum;
                  markScalar(d, "momentum");
                })
              }
            />
            <button
              onClick={copyBrief}
              className="rounded-lg border border-gborder bg-white px-3 py-1 text-xs font-medium text-gink transition hover:bg-gsurface focus:outline-none focus:ring-2 focus:ring-gaccent-tint"
            >
              Copy as Markdown
            </button>
          </div>
        </div>
        <p className="text-lg font-medium leading-snug text-gink">
          <EditableText
            value={execSummary.headline}
            multiline
            onCommit={(next) =>
              updateResult((d) => {
                d.execSummary.headline = next;
                markScalar(d, "headline");
              })
            }
          />
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1 text-sm text-gmuted">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#80868b]">Momentum:</span>
          <EditableSelect
            value={momentum}
            options={MOMENTUM}
            onCommit={(next) =>
              updateResult((d) => {
                d.momentum = next as typeof d.momentum;
                markScalar(d, "momentum");
              })
            }
          />
          {(scalars.has("momentum") || scalars.has("momentumReason")) && <EditedChip />}
          <EditableText
            value={momentumReason}
            onCommit={(next) =>
              updateResult((d) => {
                d.momentumReason = next;
                markScalar(d, "momentumReason");
              })
            }
          />
        </div>
      </div>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <h3 className="text-sm font-medium text-gink">Status by workstream</h3>
          <button
            onClick={() =>
              updateResult((d) => {
                d.execSummary.statusByWorkstream.push({ workstream: "New workstream", status: "On track", note: "", edited: true });
              })
            }
            className="rounded-full border border-gborder px-2 py-0.5 text-xs font-medium text-gmuted transition hover:border-gaccent hover:text-gaccent-hover focus:outline-none focus:ring-2 focus:ring-gaccent-tint"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {execSummary.statusByWorkstream.map((s, idx) => (
            <div
              key={idx}
              className="group/item flex flex-wrap items-center gap-2 rounded-lg border border-gborder bg-white px-3 py-2 text-sm transition hover:border-ggrid"
            >
              <EditableSelect
                value={s.status}
                options={EXEC_STATUSES}
                tone={statusTone(s.status)}
                onCommit={(next) =>
                  updateResult((d) => {
                    d.execSummary.statusByWorkstream[idx].status = next as typeof d.execSummary.statusByWorkstream[number]["status"];
                    d.execSummary.statusByWorkstream[idx].edited = true;
                  })
                }
              />
              <EditableText
                value={s.workstream}
                className="font-medium text-gink"
                onCommit={(next) =>
                  updateResult((d) => {
                    d.execSummary.statusByWorkstream[idx].workstream = next;
                    d.execSummary.statusByWorkstream[idx].edited = true;
                  })
                }
              />
              <EditableText
                value={s.note}
                className="flex-1 text-gmuted"
                onCommit={(next) =>
                  updateResult((d) => {
                    d.execSummary.statusByWorkstream[idx].note = next;
                    d.execSummary.statusByWorkstream[idx].edited = true;
                  })
                }
              />
              {s.edited && <EditedChip />}
              <DeleteButton
                onClick={() =>
                  updateResult((d) => {
                    d.execSummary.statusByWorkstream.splice(idx, 1);
                  })
                }
              />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-lg border border-gborder bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-medium text-gink">Top risks</h3>
            <button
              onClick={() =>
                updateResult((d) => {
                  d.execSummary.topRisks.push("");
                })
              }
              className="rounded-full border border-gborder px-2 py-0.5 text-xs font-medium text-gmuted transition hover:border-gaccent hover:text-gaccent-hover focus:outline-none focus:ring-2 focus:ring-gaccent-tint"
            >
              + Add
            </button>
          </div>
          <ul className="space-y-1 text-sm text-gink">
            {execSummary.topRisks.map((r, idx) => (
              <li key={idx} className="group/item flex items-start gap-1">
                <span className="mt-1.5">•</span>
                <div className="flex-1">
                  <EditableText
                    value={r}
                    onCommit={(next) =>
                      updateResult((d) => {
                        d.execSummary.topRisks[idx] = next;
                      })
                    }
                  />
                </div>
                <DeleteButton
                  onClick={() =>
                    updateResult((d) => {
                      d.execSummary.topRisks.splice(idx, 1);
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-gborder bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-medium text-gink">Asks</h3>
            <button
              onClick={() =>
                updateResult((d) => {
                  d.execSummary.asks.push("");
                })
              }
              className="rounded-full border border-gborder px-2 py-0.5 text-xs font-medium text-gmuted transition hover:border-gaccent hover:text-gaccent-hover focus:outline-none focus:ring-2 focus:ring-gaccent-tint"
            >
              + Add
            </button>
          </div>
          <ul className="space-y-1 text-sm text-gink">
            {execSummary.asks.map((a, idx) => (
              <li key={idx} className="group/item flex items-start gap-1">
                <span className="mt-1.5">•</span>
                <div className="flex-1">
                  <EditableText
                    value={a}
                    onCommit={(next) =>
                      updateResult((d) => {
                        d.execSummary.asks[idx] = next;
                      })
                    }
                  />
                </div>
                <DeleteButton
                  onClick={() =>
                    updateResult((d) => {
                      d.execSummary.asks.splice(idx, 1);
                    })
                  }
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
