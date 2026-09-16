import type { SynthesisResult } from "@/lib/gemini";

export function buildMarkdown(r: SynthesisResult): string {
  const lines: string[] = [];
  const today = new Date().toISOString().slice(0, 10);

  lines.push(`# ${r.programName} — Program Brief`);
  lines.push("");
  lines.push(`*Generated ${today} · AI-drafted synthesis — review before publishing*`);
  lines.push("");
  lines.push(`**Headline:** ${r.execSummary.headline}`);
  lines.push("");
  lines.push(`**Momentum:** ${r.momentum} — ${r.momentumReason}`);
  lines.push("");
  lines.push("## Status by workstream");
  lines.push("");
  lines.push("| Workstream | Status | Note |");
  lines.push("|---|---|---|");
  for (const s of r.execSummary.statusByWorkstream) {
    lines.push(`| ${s.workstream} | ${s.status} | ${s.note} |`);
  }
  lines.push("");
  lines.push("## Top risks");
  for (const risk of r.execSummary.topRisks) lines.push(`- ${risk}`);
  lines.push("");
  lines.push("## Asks");
  for (const ask of r.execSummary.asks) lines.push(`- ${ask}`);
  lines.push("");

  lines.push("## Action items");
  lines.push("");
  lines.push("| Priority | Action | Owner | Due | Workstream |");
  lines.push("|---|---|---|---|---|");
  for (const a of r.actions) {
    lines.push(`| ${a.priority} | ${a.description} | ${a.owner} | ${a.due} | ${a.workstream} |`);
  }
  lines.push("");

  lines.push("## Risks");
  lines.push("");
  lines.push("| Severity | Risk | Workstream | Mitigation |");
  lines.push("|---|---|---|---|");
  for (const risk of r.risks) {
    lines.push(`| ${risk.severity} | ${risk.description} | ${risk.workstream} | ${risk.mitigation} |`);
  }
  lines.push("");

  lines.push("## Dependencies");
  lines.push("");
  lines.push("| Status | Dependency | Depends on | Blocks | Workstream |");
  lines.push("|---|---|---|---|---|");
  for (const d of r.dependencies) {
    lines.push(`| ${d.status} | ${d.description} | ${d.dependsOn} | ${d.blocking} | ${d.workstream} |`);
  }
  lines.push("");

  lines.push("## Decisions");
  lines.push("");
  for (const d of r.decisions) lines.push(`- ${d.description} — ${d.madeBy}, ${d.date}`);
  lines.push("");

  lines.push("## Open questions");
  lines.push("");
  for (const q of r.openQuestions) lines.push(`- ${q.question} _(raised by ${q.raisedBy} · ${q.workstream})_`);
  lines.push("");

  return lines.join("\n");
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const STATUS_BG: Record<string, string> = {
  "On track": "#dcfce7",
  "At risk": "#fef3c7",
  "Off track": "#fee2e2",
  Blocked: "#fee2e2",
  Accelerating: "#dcfce7",
  Steady: "#fef3c7",
  Slowing: "#fee2e2",
  High: "#fee2e2",
  Medium: "#fef3c7",
  Low: "#f1f5f9",
};

function chip(value: string): string {
  const bg = STATUS_BG[value] ?? "#f1f5f9";
  return `<span style="background:${bg};border-radius:10px;padding:1px 8px;font-size:11px;font-weight:600;color:#334155">${esc(value)}</span>`;
}

function table(headers: string[], rows: string[][]): string {
  const th = headers.map((h) => `<th style="text-align:left;padding:6px 10px;background:#f1f5f9;border:1px solid #e2e8f0;font-size:12px">${esc(h)}</th>`).join("");
  const trs = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td style="padding:6px 10px;border:1px solid #e2e8f0;font-size:12px;vertical-align:top">${cell}</td>`).join("")}</tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;width:100%;margin:8px 0 16px"><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`;
}

export function buildRichTextHtml(r: SynthesisResult): string {
  const parts: string[] = [];
  parts.push(`<h2 style="margin:0 0 2px">${esc(r.programName)} — Program Brief</h2>`);
  parts.push(`<p style="margin:0 0 4px;font-size:12px;color:#64748b">AI-drafted synthesis — review before publishing</p>`);
  parts.push(`<p style="margin:10px 0"><strong>${esc(r.execSummary.headline)}</strong></p>`);
  parts.push(`<p style="margin:10px 0"><strong>Momentum:</strong> ${chip(r.momentum)} ${esc(r.momentumReason)}</p>`);

  parts.push("<h3>Status by workstream</h3>");
  parts.push(
    table(
      ["Workstream", "Status", "Note"],
      r.execSummary.statusByWorkstream.map((s) => [esc(s.workstream), chip(s.status), esc(s.note)])
    )
  );

  parts.push("<h3>Top risks</h3>");
  parts.push(`<ul style="margin:4px 0 16px;padding-left:20px">${r.execSummary.topRisks.map((x) => `<li style="font-size:13px">${esc(x)}</li>`).join("")}</ul>`);

  parts.push("<h3>Asks</h3>");
  parts.push(`<ul style="margin:4px 0 16px;padding-left:20px">${r.execSummary.asks.map((x) => `<li style="font-size:13px">${esc(x)}</li>`).join("")}</ul>`);

  parts.push("<h3>Action items</h3>");
  parts.push(
    table(
      ["Priority", "Action", "Owner", "Due", "Workstream"],
      r.actions.map((a) => [chip(a.priority), esc(a.description), esc(a.owner), esc(a.due), esc(a.workstream)])
    )
  );

  parts.push("<h3>Risks</h3>");
  parts.push(
    table(
      ["Severity", "Risk", "Workstream", "Mitigation"],
      r.risks.map((x) => [chip(x.severity), esc(x.description), esc(x.workstream), esc(x.mitigation)])
    )
  );

  parts.push("<h3>Dependencies</h3>");
  parts.push(
    table(
      ["Status", "Dependency", "Depends on", "Blocks", "Workstream"],
      r.dependencies.map((d) => [chip(d.status), esc(d.description), esc(d.dependsOn), esc(d.blocking), esc(d.workstream)])
    )
  );

  parts.push("<h3>Decisions</h3>");
  parts.push(`<ul style="margin:4px 0 16px;padding-left:20px">${r.decisions.map((d) => `<li style="font-size:13px">${esc(d.description)} — <em>${esc(d.madeBy)}, ${esc(d.date)}</em></li>`).join("")}</ul>`);

  parts.push("<h3>Open questions</h3>");
  parts.push(`<ul style="margin:4px 0 16px;padding-left:20px">${r.openQuestions.map((q) => `<li style="font-size:13px">${esc(q.question)} <em>(raised by ${esc(q.raisedBy)} · ${esc(q.workstream)})</em></li>`).join("")}</ul>`);

  return `<div style="font-family:Arial,sans-serif;color:#0f172a;max-width:760px">${parts.join("")}</div>`;
}

export async function copyRichText(r: SynthesisResult): Promise<boolean> {
  const html = buildRichTextHtml(r);
  const plain = buildMarkdown(r);
  try {
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([plain], { type: "text/plain" }),
        }),
      ]);
      return true;
    }
  } catch {
    // fall through to plain-text copy
  }
  await navigator.clipboard.writeText(plain);
  return false;
}

export function downloadMarkdown(r: SynthesisResult): void {
  const md = buildMarkdown(r);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tim-program-brief-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
