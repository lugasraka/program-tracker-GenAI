"use client";

import { useState, useEffect } from "react";
import InputPanel from "@/components/InputPanel";
import ExtractView from "@/components/ExtractView";
import TrackerView from "@/components/TrackerView";
import TimelineView from "@/components/TimelineView";
import DependencyFlow from "@/components/DependencyFlow";
import ExecSummaryView from "@/components/ExecSummaryView";
import ProgramPulse from "@/components/ProgramPulse";
import ExportBar from "@/components/ExportBar";
import type { SynthesisResult } from "@/lib/gemini";

type Tab = "tracker" | "timeline" | "dependencies" | "summary";

const STORAGE_KEY = "tim-hub-result";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("tracker");

  useEffect(() => {
    const cached = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (cached) {
      try {
        setResult(JSON.parse(cached) as SynthesisResult);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  async function handleSynthesize() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      setResult(data.result as SynthesisResult);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.result));
      setTab("tracker");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-10">
      <header className="mb-6 -mx-4 overflow-hidden">
        <div className="relative bg-gradient-to-r from-sky-50 via-white to-ggreen-tint/40 px-4 py-6">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 1200 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M -10 78 C 200 78, 300 42, 480 40 S 760 55, 920 34 S 1120 22, 1210 18"
              fill="none"
              stroke="#4285F4"
              strokeOpacity="0.25"
              strokeWidth="2"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />
            <path
              d="M -10 88 C 240 88, 360 62, 560 60 S 840 70, 1010 48 S 1160 36, 1210 34"
              fill="none"
              stroke="#34A853"
              strokeOpacity="0.2"
              strokeWidth="2"
              strokeDasharray="4 9"
              strokeLinecap="round"
            />
          </svg>
          <div className="relative flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
                  <path d="M4 16 H14" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
                  <path d="M6 22 H12" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" opacity="0.6" />
                  <path d="M14 16 L24 16 M24 16 l-4 -3 v6 z" fill="#4285F4" />
                  <path d="M16 13 L20 16 L16 19" fill="none" stroke="#188038" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gink">TIM Program Hub</h1>
                <p className="text-sm text-gmuted">
                  GenAI copilot for program synthesis — Travel Impact Model &amp; contrail avoidance
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gborder bg-white px-3 py-1 text-xs font-medium text-gmuted">
              <span className="h-1.5 w-1.5 rounded-full bg-ggreen" />
              AI-drafted · review before publishing
            </span>
          </div>
        </div>
      </header>

      <InputPanel
        input={input}
        onInputChange={setInput}
        onSynthesize={() => void handleSynthesize()}
        isLoading={isLoading}
      />

      {error && (
        <div className="mt-4 rounded-lg border border-gred-tint bg-gred-tint p-3 text-sm text-gred-dark">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mt-6">
          <ExtractView />
        </div>
      )}

      {!isLoading && result && (
        <section className="mt-6">
          <ProgramPulse result={result} />
          <ExportBar result={result} />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-1 rounded-lg bg-[#f1f3f4] p-1">
              {(
                [
                  ["tracker", "Tracker"],
                  ["timeline", "Timeline"],
                  ["dependencies", "Dependencies"],
                  ["summary", "Exec Summary"],
                ] as [Tab, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                    tab === id
                      ? "bg-white text-gblue-hover shadow-sm"
                      : "text-gmuted hover:text-gink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <span className="text-xs text-gmuted tnum">
              {result.programName} · AI output — review before publishing
            </span>
          </div>
          {tab === "tracker" && <TrackerView result={result} />}
          {tab === "timeline" && <TimelineView result={result} />}
          {tab === "dependencies" && <DependencyFlow result={result} />}
          {tab === "summary" && <ExecSummaryView result={result} />}
        </section>
      )}

      {!isLoading && !result && (
        <p className="mt-8 text-center text-sm text-gmuted">
          Load a sample scenario above, paste your own notes, then hit Synthesize.
        </p>
      )}
    </main>
  );
}
