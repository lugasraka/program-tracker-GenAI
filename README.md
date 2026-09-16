# TIM Program Hub

A GenAI copilot for technical program management in the Google Search
**Sustainable Journeys** space (Travel Impact Model, contrail avoidance,
Search sustainability).

## The problem

Program synthesis is high-value PM grunt work: turning distributed,
unstructured updates — status docs, meeting notes, Slack threads — into
leadership-ready views of decisions, actions, risks, dependencies, and
exec comms takes hours every week.

## The solution

Paste any raw program input and get an auditable, schema-constrained
synthesis in seconds:

- **Program pulse strip** — RAG status per workstream + momentum, at a glance
- **Tracker** — decisions, action items (owner/due/priority), risks with
  mitigations, cross-team dependencies, open questions, grouped by workstream
- **Timeline** — Gantt-lite swimlanes with dated milestones, inline labels,
  and a legend for crowded items; undated items stay visible in a TBD lane
- **Dependency flow map** — upstream → blocked items, status-colored arrows
- **Exec summary** — ready-to-send leadership brief (headline, status, asks)
- **Exports** — "Copy for email" (rich text: formatted tables, paste straight
  into Gmail/Outlook/Teams/Notion) and a full Markdown brief download
- **Four seeded scenarios** — weekly status, quarterly planning, contrail
  trial readiness review, and a raw Slack incident thread (formal docs to
  messy chat logs)

Trust principles: output is constrained by a JSON schema (Gemini structured
output), extraction never invents owners, dates, or risks — unknowns are
marked `TBD` — and every result is explicitly *draft-for-review*, never
auto-published.

## How to use

1. Get a Gemini API key: https://aistudio.google.com/apikey
2. Copy `.env.local.example` to `.env.local` and set `GEMINI_API_KEY`
3. Run:

```bash
npm install
npm run dev
```

4. Open http://localhost:3000 — load an example program (or paste your own
   notes / upload a .txt or .md file), hit **Synthesize**, explore the four
   tabs, then use the export bar to share the brief.

## Under the hood

Next.js 14 + TypeScript + Tailwind, styled with a Google
Sustainable-Journeys-inspired theme (Google palette, Roboto, contrail motif;
no official Google assets). Gemini `gemini-3.6-flash` via the Interactions
API with schema-based structured output. localStorage persistence — no
backend DB.

## v2 ideas

- Sync extracted actions to Google Sheets / GitHub Issues
- Multi-document accumulation (delta vs. last week's synthesis)
- Edit-in-place before export; team sharing with auth
