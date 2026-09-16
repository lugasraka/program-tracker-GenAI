"use client";

import type { SynthesisResult } from "@/lib/gemini";
import { statusTone } from "./status";
import { EditableText, EditableSelect, EditedChip, DeleteButton } from "./Editable";

type UpdateFn = (mutator: (draft: SynthesisResult) => void) => void;

const PRIORITIES = ["High", "Medium", "Low"] as const;
const DEP_STATUSES = ["On track", "At risk", "Blocked"] as const;

function groupByWorkstream<T extends { workstream: string }>(items: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.workstream || "General";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function SectionHeader({ title, count, onAdd }: { title: string; count: number; onAdd?: () => void }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <h3 className="flex items-center gap-2 text-sm font-medium text-gink">
        {title}
        <span className="tnum rounded-full bg-[#f1f3f4] px-2 py-0.5 text-xs text-gmuted">{count}</span>
      </h3>
      {onAdd && (
        <button
          onClick={onAdd}
          className="rounded-full border border-gborder px-2 py-0.5 text-xs font-medium text-gmuted transition hover:border-gblue hover:text-gblue-hover focus:outline-none focus:ring-2 focus:ring-gblue-tint"
        >
          + Add
        </button>
      )}
    </div>
  );
}

function WorkstreamSection({
  title,
  count,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  if (count === 0 && !onAdd) return null;
  return (
    <section className="mb-7">
      <SectionHeader title={title} count={count} onAdd={onAdd} />
      {children}
    </section>
  );
}

export default function TrackerView({ result, updateResult }: { result: SynthesisResult; updateResult: UpdateFn }) {
  const actionsByWs = groupByWorkstream(result.actions);
  const questionsByWs = groupByWorkstream(result.openQuestions);

  return (
    <div className="space-y-2">
      <WorkstreamSection
        title="Action items"
        count={result.actions.length}
        onAdd={() =>
          updateResult((d) => {
            d.actions.push({ description: "", owner: "Unassigned", due: "TBD", workstream: "General", priority: "Medium", edited: true });
          })
        }
      >
        <div className="space-y-4">
          {actionsByWs.map(([ws, items]) => (
            <div key={ws}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gblue-hover">{ws}</p>
              <ul className="divide-y divide-ggrid overflow-hidden rounded-lg border border-gborder bg-white">
                {items.map((a) => {
                  const idx = result.actions.indexOf(a);
                  return (
                    <li key={idx} className="group/item flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm transition hover:bg-gsurface">
                      <EditableSelect
                        value={a.priority}
                        options={PRIORITIES}
                        tone={statusTone(a.priority)}
                        onCommit={(next) =>
                          updateResult((d) => {
                            d.actions[idx].priority = next as typeof d.actions[number]["priority"];
                            d.actions[idx].edited = true;
                          })
                        }
                      />
                      {a.edited && <EditedChip />}
                      <EditableText
                        value={a.description}
                        className="flex-1 text-gink"
                        onCommit={(next) =>
                          updateResult((d) => {
                            d.actions[idx].description = next;
                            d.actions[idx].edited = true;
                          })
                        }
                      />
                      <span className="tnum shrink-0 text-xs text-gmuted">
                        <EditableText
                          value={a.owner}
                          onCommit={(next) =>
                            updateResult((d) => {
                              d.actions[idx].owner = next;
                              d.actions[idx].edited = true;
                            })
                          }
                        />
                        {" · due "}
                        <EditableText
                          value={a.due}
                          className="tnum"
                          onCommit={(next) =>
                            updateResult((d) => {
                              d.actions[idx].due = next;
                              d.actions[idx].edited = true;
                            })
                          }
                        />
                      </span>
                      <DeleteButton
                        onClick={() =>
                          updateResult((d) => {
                            d.actions.splice(idx, 1);
                          })
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </WorkstreamSection>

      <WorkstreamSection
        title="Risks"
        count={result.risks.length}
        onAdd={() =>
          updateResult((d) => {
            d.risks.push({ description: "", severity: "Medium", workstream: "General", mitigation: "TBD", edited: true });
          })
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          {result.risks.map((r, idx) => (
            <div key={idx} className="group/item rounded-lg border border-gborder bg-white p-3 transition hover:border-ggrid">
              <div className="mb-1 flex items-center gap-2">
                <EditableSelect
                  value={r.severity}
                  options={PRIORITIES}
                  tone={statusTone(r.severity)}
                  onCommit={(next) =>
                    updateResult((d) => {
                      d.risks[idx].severity = next as typeof d.risks[number]["severity"];
                      d.risks[idx].edited = true;
                    })
                  }
                />
                <EditableText
                  value={r.workstream}
                  className="text-xs font-medium uppercase tracking-wider text-gblue-hover"
                  onCommit={(next) =>
                    updateResult((d) => {
                      d.risks[idx].workstream = next;
                      d.risks[idx].edited = true;
                    })
                  }
                />
                {r.edited && <EditedChip />}
                <span className="flex-1" />
                <DeleteButton
                  onClick={() =>
                    updateResult((d) => {
                      d.risks.splice(idx, 1);
                    })
                  }
                />
              </div>
              <EditableText
                value={r.description}
                className="text-gink"
                multiline
                onCommit={(next) =>
                  updateResult((d) => {
                    d.risks[idx].description = next;
                    d.risks[idx].edited = true;
                  })
                }
              />
              <div className="mt-1 text-xs text-gmuted">
                Mitigation:{" "}
                <EditableText
                  value={r.mitigation}
                  onCommit={(next) =>
                    updateResult((d) => {
                      d.risks[idx].mitigation = next;
                      d.risks[idx].edited = true;
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </WorkstreamSection>

      <WorkstreamSection
        title="Dependencies"
        count={result.dependencies.length}
        onAdd={() =>
          updateResult((d) => {
            d.dependencies.push({ description: "", dependsOn: "TBD", blocking: "TBD", workstream: "General", status: "At risk", edited: true });
          })
        }
      >
        <ul className="divide-y divide-ggrid overflow-hidden rounded-lg border border-gborder bg-white">
          {result.dependencies.map((dep, idx) => (
            <li key={idx} className="group/item flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm transition hover:bg-gsurface">
              <EditableSelect
                value={dep.status}
                options={DEP_STATUSES}
                tone={statusTone(dep.status)}
                onCommit={(next) =>
                  updateResult((d) => {
                    d.dependencies[idx].status = next as typeof d.dependencies[number]["status"];
                    d.dependencies[idx].edited = true;
                  })
                }
              />
              {dep.edited && <EditedChip />}
              <EditableText
                value={dep.description}
                className="flex-1 text-gink"
                onCommit={(next) =>
                  updateResult((d) => {
                    d.dependencies[idx].description = next;
                    d.dependencies[idx].edited = true;
                  })
                }
              />
              <span className="tnum shrink-0 text-xs text-gmuted">
                <EditableText
                  value={dep.dependsOn}
                  onCommit={(next) =>
                    updateResult((d) => {
                      d.dependencies[idx].dependsOn = next;
                      d.dependencies[idx].edited = true;
                    })
                  }
                />
                {" → blocks "}
                <EditableText
                  value={dep.blocking}
                  onCommit={(next) =>
                    updateResult((d) => {
                      d.dependencies[idx].blocking = next;
                      d.dependencies[idx].edited = true;
                    })
                  }
                />
              </span>
              <DeleteButton
                onClick={() =>
                  updateResult((d) => {
                    d.dependencies.splice(idx, 1);
                  })
                }
              />
            </li>
          ))}
        </ul>
      </WorkstreamSection>

      <WorkstreamSection
        title="Decisions"
        count={result.decisions.length}
        onAdd={() =>
          updateResult((d) => {
            d.decisions.push({ description: "", madeBy: "Unassigned", date: "TBD", edited: true });
          })
        }
      >
        <ul className="divide-y divide-ggrid overflow-hidden rounded-lg border border-gborder bg-white">
          {result.decisions.map((dec, idx) => (
            <li key={idx} className="group/item px-3 py-2.5 text-sm transition hover:bg-gsurface">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <EditableText
                    value={dec.description}
                    className="text-gink"
                    multiline={dec.description.length > 80}
                    onCommit={(next) =>
                      updateResult((d) => {
                        d.decisions[idx].description = next;
                        d.decisions[idx].edited = true;
                      })
                    }
                  />
                </div>
                <span className="tnum shrink-0 text-xs text-gmuted">
                  —{" "}
                  <EditableText
                    value={dec.madeBy}
                    onCommit={(next) =>
                      updateResult((d) => {
                        d.decisions[idx].madeBy = next;
                        d.decisions[idx].edited = true;
                      })
                    }
                  />
                  {", "}
                  <EditableText
                    value={dec.date}
                    className="tnum"
                    onCommit={(next) =>
                      updateResult((d) => {
                        d.decisions[idx].date = next;
                        d.decisions[idx].edited = true;
                      })
                    }
                  />
                </span>
                {dec.edited && <EditedChip />}
                <DeleteButton
                  onClick={() =>
                    updateResult((d) => {
                      d.decisions.splice(idx, 1);
                    })
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      </WorkstreamSection>

      <WorkstreamSection
        title="Open questions"
        count={result.openQuestions.length}
        onAdd={() =>
          updateResult((d) => {
            d.openQuestions.push({ question: "", raisedBy: "Unassigned", workstream: "General", edited: true });
          })
        }
      >
        <div className="space-y-4">
          {questionsByWs.map(([ws, items]) => (
            <div key={ws}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gblue-hover">{ws}</p>
              <ul className="list-inside list-disc space-y-1 rounded-lg border border-gborder bg-white px-3 py-2.5 text-sm text-gink">
                {items.map((q) => {
                  const idx = result.openQuestions.indexOf(q);
                  return (
                    <li key={idx} className="group/item flex items-start gap-2">
                      <div className="flex-1">
                        <EditableText
                          value={q.question}
                          multiline={q.question.length > 80}
                          onCommit={(next) =>
                            updateResult((d) => {
                              d.openQuestions[idx].question = next;
                              d.openQuestions[idx].edited = true;
                            })
                          }
                        />
                        <span className="text-xs text-gmuted">
                          {" "}
                          (raised by{" "}
                          <EditableText
                            value={q.raisedBy}
                            onCommit={(next) =>
                              updateResult((d) => {
                                d.openQuestions[idx].raisedBy = next;
                                d.openQuestions[idx].edited = true;
                              })
                            }
                          />
                          )
                        </span>
                        {q.edited && <EditedChip />}
                      </div>
                      <DeleteButton
                        onClick={() =>
                          updateResult((d) => {
                            d.openQuestions.splice(idx, 1);
                          })
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </WorkstreamSection>
    </div>
  );
}
