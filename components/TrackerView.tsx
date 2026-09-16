"use client";

import type { SynthesisResult } from "@/lib/gemini";
import { Badge, statusTone } from "./status";

function groupByWorkstream<T extends { workstream: string }>(items: T[]): [string, T[]][] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.workstream || "General";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gink">
      {title}
      <span className="tnum rounded-full bg-[#f1f3f4] px-2 py-0.5 text-xs text-gmuted">{count}</span>
    </h3>
  );
}

function WorkstreamSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="mb-7">
      <SectionHeader title={title} count={count} />
      {children}
    </section>
  );
}

export default function TrackerView({ result }: { result: SynthesisResult }) {
  const actionsByWs = groupByWorkstream(result.actions);
  const questionsByWs = groupByWorkstream(result.openQuestions);

  return (
    <div className="space-y-2">
      <WorkstreamSection title="Action items" count={result.actions.length}>
        <div className="space-y-4">
          {actionsByWs.map(([ws, items]) => (
            <div key={ws}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gblue-hover">{ws}</p>
              <ul className="divide-y divide-ggrid overflow-hidden rounded-lg border border-gborder bg-white">
                {items.map((a, i) => (
                  <li key={i} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm transition hover:bg-gsurface">
                    <Badge label={a.priority} tone={statusTone(a.priority)} />
                    <span className="flex-1 text-gink">{a.description}</span>
                    <span className="tnum shrink-0 text-xs text-gmuted">
                      {a.owner} · due {a.due}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </WorkstreamSection>

      <WorkstreamSection title="Risks" count={result.risks.length}>
        <div className="grid gap-3 md:grid-cols-2">
          {result.risks.map((r, i) => (
            <div key={i} className="rounded-lg border border-gborder bg-white p-3 transition hover:border-ggrid">
              <div className="mb-1 flex items-center gap-2">
                <Badge label={r.severity} tone={statusTone(r.severity)} />
                <span className="text-xs font-medium uppercase tracking-wider text-gblue-hover">{r.workstream}</span>
              </div>
              <p className="text-sm text-gink">{r.description}</p>
              <p className="mt-1 text-xs text-gmuted">Mitigation: {r.mitigation}</p>
            </div>
          ))}
        </div>
      </WorkstreamSection>

      <WorkstreamSection title="Dependencies" count={result.dependencies.length}>
        <ul className="divide-y divide-ggrid overflow-hidden rounded-lg border border-gborder bg-white">
          {result.dependencies.map((d, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm transition hover:bg-gsurface">
              <Badge label={d.status} tone={statusTone(d.status)} />
              <span className="flex-1 text-gink">{d.description}</span>
              <span className="tnum shrink-0 text-xs text-gmuted">
                {d.dependsOn} → blocks {d.blocking}
              </span>
            </li>
          ))}
        </ul>
      </WorkstreamSection>

      <WorkstreamSection title="Decisions" count={result.decisions.length}>
        <ul className="divide-y divide-ggrid overflow-hidden rounded-lg border border-gborder bg-white">
          {result.decisions.map((d, i) => (
            <li key={i} className="px-3 py-2.5 text-sm transition hover:bg-gsurface">
              <span className="text-gink">{d.description}</span>
              <span className="tnum ml-2 text-xs text-gmuted">
                — {d.madeBy}, {d.date}
              </span>
            </li>
          ))}
        </ul>
      </WorkstreamSection>

      <WorkstreamSection title="Open questions" count={result.openQuestions.length}>
        <div className="space-y-4">
          {questionsByWs.map(([ws, items]) => (
            <div key={ws}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gblue-hover">{ws}</p>
              <ul className="list-inside list-disc space-y-1 rounded-lg border border-gborder bg-white px-3 py-2.5 text-sm text-gink">
                {items.map((q, i) => (
                  <li key={i}>
                    {q.question} <span className="text-xs text-gmuted">(raised by {q.raisedBy})</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </WorkstreamSection>
    </div>
  );
}
