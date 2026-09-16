"use client";

import { useMemo } from "react";
import type { SynthesisResult } from "@/lib/gemini";
import { parseDue, formatShort } from "@/lib/date";

const PRIORITY_FILL: Record<string, string> = {
  High: "#d93025",
  Medium: "#f9ab00",
  Low: "#9aa0a6",
};

type DatedAction = {
  description: string;
  owner: string;
  due: string;
  priority: string;
  date: Date;
};

type Lane = {
  workstream: string;
  rows: DatedAction[][];
};

type DotPlan = {
  label: string | null;
  legendNum: number | null;
};

type LegendEntry = {
  num: number;
  lane: string;
  item: DatedAction;
};

type Plan = {
  lanes: Lane[];
  legend: LegendEntry[];
  dotPlans: DotPlan[][][]; // [lane][row][dot]
  unscheduled: DatedAction[];
  min: Date;
  max: Date;
};

const VIEW_W = 1000;
const LABEL_W = 170;
const RIGHT_PAD = 30;
const CHART_W = VIEW_W - LABEL_W - RIGHT_PAD;
const TOP = 40;
const DOT_R = 7;
const SUB_ROW_H = 26;
const MIN_DOT_GAP = 18;
const LABEL_FONT_SIZE = 10;
const LABEL_CHAR_PX = 5.4;
const MIN_LABEL_PX = 64;

export default function TimelineView({ result }: { result: SynthesisResult }) {
  const plan = useMemo(() => computePlan(result), [result]);
  const { lanes, legend, dotPlans, unscheduled, min, max } = plan;

  if (lanes.length === 0 && unscheduled.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gmuted">
        No action items extracted yet — run Synthesize first.
      </p>
    );
  }

  if (lanes.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gmuted">
          No dated milestones found — all action items are undated and listed below.
        </p>
        <UnscheduledList items={unscheduled} />
      </div>
    );
  }

  const spanMs = Math.max(max.getTime() - min.getTime(), 1);
  const x = (d: Date) => LABEL_W + ((d.getTime() - min.getTime()) / spanMs) * CHART_W;

  const ticks: { x: number; label: string }[] = [];
  const cursor = new Date(min.getTime());
  cursor.setUTCDate(cursor.getUTCDate() + ((8 - cursor.getUTCDay()) % 7 || 0));
  while (cursor.getTime() <= max.getTime()) {
    const tx = x(new Date(cursor));
    if (tx > LABEL_W + 1) {
      ticks.push({ x: tx, label: formatShort(cursor) });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }

  const lanesHeight = lanes.reduce((acc, lane) => acc + lane.rows.length * SUB_ROW_H + 18, 0);
  const viewH = TOP + lanesHeight + 16;
  const nowX = (() => {
    const today = new Date();
    if (today >= min && today <= max) return x(today);
    return null;
  })();

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gborder bg-white p-4 shadow-sm">
        <svg viewBox={`0 0 ${VIEW_W} ${viewH}`} className="w-full min-w-[720px]" role="img" aria-label="Milestone timeline">
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={t.x} y1={TOP - 12} x2={t.x} y2={viewH - 12} stroke="#e8eaed" strokeWidth={1} />
              <text x={t.x + 4} y={14} fontSize={11} fill="#5f6368">
                {t.label}
              </text>
            </g>
          ))}
          {nowX !== null && (
            <line x1={nowX} y1={TOP - 12} x2={nowX} y2={viewH - 12} stroke="#1a73e8" strokeWidth={1.5} strokeDasharray="4 3" />
          )}
          {(() => {
            let y = TOP;
            return lanes.map((lane, li) => {
              const laneTop = y;
              y += lane.rows.length * SUB_ROW_H + 18;
              return (
                <g key={li}>
                  <text x={8} y={laneTop + 4} fontSize={12} fontWeight={500} fill="#1a73e8">
                    {lane.workstream}
                  </text>
                  <line x1={8} y1={laneTop + lane.rows.length * SUB_ROW_H + 4} x2={VIEW_W - 10} y2={laneTop + lane.rows.length * SUB_ROW_H + 4} stroke="#f1f3f4" strokeWidth={1} />
                  {lane.rows.map((row, ri) => {
                    const cy = laneTop + 10 + ri * SUB_ROW_H;
                    return (
                      <g key={ri}>
                        {row.map((a, ai) => {
                          const cx = x(a.date);
                          const dotPlan = dotPlans[li]?.[ri]?.[ai];
                          const legendNum = dotPlan?.legendNum ?? null;
                          const label = dotPlan?.label ?? null;
                          const labelX = cx + DOT_R + 6;
                          return (
                            <g key={ai}>
                              <circle cx={cx} cy={cy} r={DOT_R} fill={PRIORITY_FILL[a.priority] ?? PRIORITY_FILL.Low}>
                                <title>{`${a.description} — ${a.owner}, due ${a.due} [${a.priority}]`}</title>
                              </circle>
                              {legendNum !== null && (
                                <text x={cx} y={cy + 3.5} fontSize={9} fontWeight={700} fill="#ffffff" textAnchor="middle" pointerEvents="none">
                                  {legendNum}
                                </text>
                              )}
                              {label && (
                                <text x={labelX} y={cy + 3.5} fontSize={LABEL_FONT_SIZE} fill="#5f6368" pointerEvents="none">
                                  {label}
                                  <title>{`${a.description} — ${a.owner}, due ${a.due} [${a.priority}]`}</title>
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </g>
              );
            });
          })()}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gmuted">
        <span className="font-medium uppercase tracking-wider text-[#80868b]">Priority:</span>
        {(["High", "Medium", "Low"] as const).map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PRIORITY_FILL[p] }} />
            {p}
          </span>
        ))}
        {nowX !== null && (
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-3 w-0 border-l-2 border-dashed border-[#1a73e8]" />
            Today
          </span>
        )}
      </div>

      {legend.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-medium text-gink">
            Crowded items <span className="tnum ml-1 rounded-full bg-[#f1f3f4] px-2 py-0.5 text-xs text-gmuted">{legend.length}</span>
          </h3>
          <ul className="divide-y divide-ggrid overflow-hidden rounded-lg border border-gborder bg-white">
            {legend.map((e) => (
              <li key={e.num} className="flex flex-wrap items-baseline gap-2 px-3 py-2 text-sm">
                <span className="tnum inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: PRIORITY_FILL[e.item.priority] ?? PRIORITY_FILL.Low }}>
                  {e.num}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-gblue-hover">{e.lane}</span>
                <span className="flex-1 text-gink">{e.item.description}</span>
                <span className="tnum text-xs text-gmuted">
                  {e.item.owner} · due {e.item.due}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {unscheduled.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-medium text-gink">
            Unscheduled (TBD) <span className="tnum ml-1 rounded-full bg-[#f1f3f4] px-2 py-0.5 text-xs text-gmuted">{unscheduled.length}</span>
          </h3>
          <UnscheduledList items={unscheduled} />
        </div>
      )}
    </div>
  );
}

function UnscheduledList({ items }: { items: DatedAction[] }) {
  return (
    <ul className="divide-y divide-ggrid overflow-hidden rounded-lg border border-gborder bg-white">
      {items.map((a, i) => (
        <li key={i} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm transition hover:bg-gsurface">
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium" style={{ borderColor: `${PRIORITY_FILL[a.priority]}33`, color: PRIORITY_FILL[a.priority], backgroundColor: `${PRIORITY_FILL[a.priority]}0d` }}>
            {a.priority}
          </span>
          <span className="flex-1 text-gink">{a.description}</span>
          <span className="tnum text-xs text-gmuted">{a.owner}</span>
        </li>
      ))}
    </ul>
  );
}

function buildLanesAndDates(result: SynthesisResult): {
  lanes: Lane[];
  unscheduled: DatedAction[];
  min: Date;
  max: Date;
} {
  const datedByWs = new Map<string, DatedAction[]>();
  const unscheduled: DatedAction[] = [];
  let min: Date | null = null;
  let max: Date | null = null;

  for (const a of result.actions) {
    const parsed = parseDue(a.due);
    const item: DatedAction = {
      description: a.description,
      owner: a.owner,
      due: a.due,
      priority: a.priority,
      date: parsed?.date ?? new Date(0),
    };
    if (!parsed) {
      unscheduled.push(item);
      continue;
    }
    if (!min || item.date < min) min = item.date;
    if (!max || item.date > max) max = item.date;
    const ws = a.workstream || "General";
    if (!datedByWs.has(ws)) datedByWs.set(ws, []);
    datedByWs.get(ws)!.push(item);
  }

  if (min && max && min.getTime() === max.getTime()) {
    min = new Date(min.getTime() - 3 * 86400000);
    max = new Date(max.getTime() + 3 * 86400000);
  }

  const lanes: Lane[] = [];
  for (const [ws, items] of Array.from(datedByWs.entries()).sort((p, q) => p[0].localeCompare(q[0]))) {
    items.sort((p, q) => p.date.getTime() - q.date.getTime());
    const rows: DatedAction[][] = [];
    for (const item of items) {
      let placed = false;
      for (const row of rows) {
        const last = row[row.length - 1];
        if (xApprox(last.date, min!, max!) - xApprox(item.date, min!, max!) >= MIN_DOT_GAP) {
          row.push(item);
          placed = true;
          break;
        }
      }
      if (!placed) rows.push([item]);
    }
    lanes.push({ workstream: ws, rows });
  }

  return { lanes, unscheduled, min: min ?? new Date(), max: max ?? new Date() };
}

function computePlan(result: SynthesisResult): Plan {
  const { lanes, unscheduled, min, max } = buildLanesAndDates(result);
  const spanMs = Math.max(max.getTime() - min.getTime(), 1);
  const x = (d: Date) => LABEL_W + ((d.getTime() - min.getTime()) / spanMs) * CHART_W;
  const rightEdge = LABEL_W + CHART_W;

  const legend: LegendEntry[] = [];
  const dotPlans: DotPlan[][][] = [];

  lanes.forEach((lane, li) => {
    dotPlans[li] = [];
    lane.rows.forEach((row, ri) => {
      dotPlans[li][ri] = [];
      row.forEach((item, ai) => {
        const cx = x(item.date);
        const next = row[ai + 1];
        const nextX = next ? x(next.date) : rightEdge;
        const availPx = nextX - cx - DOT_R * 2 - 12;
        const fullText = `${item.owner}: ${item.description}`;
        const maxChars = Math.floor(availPx / LABEL_CHAR_PX);

        let dotPlan: DotPlan;
        if (availPx >= MIN_LABEL_PX && maxChars >= 12) {
          const label = maxChars >= fullText.length ? fullText : `${fullText.slice(0, maxChars - 1)}…`;
          const truncated = maxChars < fullText.length;
          if (truncated) {
            const num = legend.length + 1;
            legend.push({ num, lane: lane.workstream, item });
            dotPlan = { label, legendNum: num };
          } else {
            dotPlan = { label, legendNum: null };
          }
        } else {
          const num = legend.length + 1;
          legend.push({ num, lane: lane.workstream, item });
          dotPlan = { label: null, legendNum: num };
        }

        dotPlans[li][ri][ai] = dotPlan;
      });
    });
  });

  return { lanes, legend, dotPlans, unscheduled, min, max };
}

function xApprox(d: Date, min: Date, max: Date): number {
  const span = Math.max(max.getTime() - min.getTime(), 1);
  return ((d.getTime() - min.getTime()) / span) * CHART_W;
}
