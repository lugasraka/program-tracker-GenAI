# TIM Program Hub

A program management tool for Google Search Sustainable Journeys (Travel Impact Model, contrail avoidance, Search sustainability). Paste meeting notes, status docs, or chat logs, and it extracts decisions, action items, risks, dependencies, and a leadership brief.

**Live Demo:** [https://program-tracker-gen-ai.vercel.app/](https://program-tracker-gen-ai.vercel.app/)

![TIM Program Hub Screenshot](public/screenshot2.png)

## Features

- **Program pulse:** RAG status and momentum per workstream
- **Tracker:** decisions, action items with owners and due dates, risks with mitigations, cross-team dependencies, open questions
- **Timeline:** milestone swimlanes by workstream, TBD lane for undated items
- **Dependency flow:** upstream blockers and what they block
- **Exec summary:** one-sentence headline, per-workstream statuses, concrete asks
- **Exports and editing:** rich-text copy for email, Markdown download, every field editable inline with an edited tag
- **Team sharing (optional):** magic-link sign-in, shared workspace, share links

Extraction is constrained to a typed JSON schema via Gemini structured output. Missing owners, dates, or risks default to `TBD` rather than hallucinated values. Results are saved to browser `localStorage` and treated as review drafts.

## Getting started

1. Get an API key from [Google AI Studio](https://aistudio.google.com/apikey).
2. Create `.env.local` and add the key: `cp .env.local.example .env.local`
3. Install and run: `npm install && npm run dev`
4. Open [localhost:3000](http://localhost:3000), load a sample scenario or paste your own notes, then click **Synthesize** or press ⌘/Ctrl+Enter.

Free tier caps synthesis at about 20 requests per minute. If a request runs long or fails, wait a minute and retry.

## Team sharing (optional)

Backed by a free [Supabase](https://supabase.com) project (Postgres, magic-link auth, row-level security):

1. Run `supabase/migration.sql` in the Supabase SQL editor. The script is idempotent.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` and restart. Sign-in, **Save to team**, share links, and a **Saved syntheses** tab appear.

Signed-in teammates share one workspace: anyone can open and edit saved syntheses (last-write-wins), and only the author can delete. Share links use `/?s=<id>`. Without the Supabase variables, the sharing UI hides and the app behaves as before.

## Tech stack

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Gemini `gemini-3.6-flash` with structured JSON output
- Browser `localStorage`; optional Supabase for team sharing
- Deploy on Vercel; set `GEMINI_API_KEY` and the Supabase variables in project settings

## Planned improvements

- Sync action items to Google Sheets or GitHub Issues
- Delta tracking across syntheses
