"use client";

import { useMemo } from "react";
import type { SynthesisResult } from "@/lib/gemini";

const STATUS_COLOR: Record<string, string> = {
  "On track": "#34A853",
  "At risk": "#f9ab00",
  Blocked: "#d93025",
};

type Edge = {
  from: string;
  to: string;
  status: string;
  description: string;
};

type Node = { label: string; col: 0 | 1 };

const VIEW_W = 1000;
const NODE_W = 300;
const LEFT_X = 40;
const RIGHT_X = VIEW_W - NODE_W - 40;
const ROW_H = 46;
const TOP = 30;

export default function DependencyFlow({ result }: { result: SynthesisResult }) {
  const { nodes, edges } = useMemo(() => build(result), [result]);

  if (edges.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gmuted">
        No cross-team dependencies extracted — a clean program state, or none declared in the input.
      </p>
    );
  }

  const nodeY = new Map<string, number>();
  nodes.forEach((n, i) => nodeY.set(n.label, TOP + 20 + i * ROW_H));

  const viewH = TOP + 20 + nodes.length * ROW_H + 30;

  const nodeX = (col: 0 | 1) => (col === 0 ? LEFT_X : RIGHT_X);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-gborder bg-white p-4 shadow-sm">
        <svg viewBox={`0 0 ${VIEW_W} ${viewH}`} className="w-full min-w-[720px]" role="img" aria-label="Dependency flow map">
          <text x={LEFT_X + NODE_W / 2} y={14} fontSize={12} fontWeight={500} fill="#5f6368" textAnchor="middle">
            DEPENDS ON (upstream)
          </text>
          <text x={RIGHT_X + NODE_W / 2} y={14} fontSize={12} fontWeight={500} fill="#5f6368" textAnchor="middle">
            BLOCKS (downstream)
          </text>

          {edges.map((e, i) => {
            const x1 = nodeX(0) + NODE_W;
            const y1 = (nodeY.get(e.from) ?? 0) + 18;
            const x2 = nodeX(1);
            const y2 = (nodeY.get(e.to) ?? 0) + 18;
            const midX = (x1 + x2) / 2;
            const color = STATUS_COLOR[e.status] ?? "#9aa0a6";
            return (
              <g key={i}>
                <path
                  d={`M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke={color}
                  strokeWidth={e.status === "Blocked" ? 2.5 : 1.75}
                  strokeDasharray={e.status === "At risk" ? "6 4" : undefined}
                  opacity={0.85}
                >
                  <title>{`${e.status}: ${e.description}`}</title>
                </path>
                <polygon points={`${x2 - 9},${y2 - 5} ${x2},${y2} ${x2 - 9},${y2 + 5}`} fill={color} />
              </g>
            );
          })}

          {nodes.map((n, i) => {
            const y = nodeY.get(n.label) ?? 0;
            const x = nodeX(n.col);
            return (
              <g key={i}>
                <rect x={x} y={y} width={NODE_W} height={36} rx={8} fill="#f8f9f9" stroke="#e0e0e0" />
                <text x={x + 12} y={y + 22} fontSize={12.5} fill="#202124">
                  {truncate(n.label, 40)}
                </text>
                <title>{n.label}</title>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs text-gmuted">
        <span className="font-medium uppercase tracking-wider text-[#80868b]">Status:</span>
        {(["On track", "At risk", "Blocked"] as const).map((s) => (
          <span key={s} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded" style={{ backgroundColor: STATUS_COLOR[s] }} />
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function build(result: SynthesisResult): { nodes: Node[]; edges: Edge[] } {
  const edges: Edge[] = result.dependencies.map((d) => ({
    from: d.dependsOn,
    to: d.blocking,
    status: d.status,
    description: d.description,
  }));

  const bothSides = new Set<string>();
  for (const e of edges) {
    if (edges.some((o) => o.to === e.from)) bothSides.add(e.from);
  }

  const left = new Set<string>();
  const right = new Set<string>();
  for (const e of edges) {
    if (bothSides.has(e.from)) {
      right.add(e.from);
    } else {
      left.add(e.from);
    }
    right.add(e.to);
  }

  const nodes: Node[] = [
    ...Array.from(left).sort().map((label): Node => ({ label, col: 0 as const })),
    ...Array.from(right).sort().map((label): Node => ({ label, col: 1 as const })),
  ];

  return { nodes, edges };
}
