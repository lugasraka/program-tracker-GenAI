"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import InputPanel from "@/components/InputPanel";
import ExtractView from "@/components/ExtractView";
import TrackerView from "@/components/TrackerView";
import TimelineView from "@/components/TimelineView";
import DependencyFlow from "@/components/DependencyFlow";
import ExecSummaryView from "@/components/ExecSummaryView";
import ProgramPulse from "@/components/ProgramPulse";
import ExportBar from "@/components/ExportBar";
import AuthButton from "@/components/AuthButton";
import SiteFooter, { GITHUB_URL, GithubIcon } from "@/components/SiteFooter";
import SavedList, { type SavedRow } from "@/components/SavedList";
import { useAuthSession } from "@/lib/supabase/useAuthSession";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { SynthesisResult } from "@/lib/gemini";

type Tab = "tracker" | "timeline" | "dependencies" | "summary" | "saved";

const STORAGE_KEY = "tim-hub-result";

export default function Home() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("tracker");
  const [savedId, setSavedId] = useState<string | null>(null);
  const auth = useAuthSession();

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

  function updateResult(mutator: (draft: SynthesisResult) => void) {
    setResult((prev) => {
      if (!prev) return prev;
      const draft = structuredClone(prev) as SynthesisResult;
      mutator(draft);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      return draft;
    });
  }

  function loadSaved(row: SavedRow) {
    setResult(row.result);
    setSavedId(row.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(row.result));
    setTab("tracker");
  }

  const [pendingShareId, setPendingShareId] = useState<string | null>(null);

  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("s");
    if (s) setPendingShareId(s);
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

  useEffect(() => {
    if (!pendingShareId || !auth.user) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let active = true;
    supabase
      .from("syntheses")
      .select("id, program_name, result")
      .eq("id", pendingShareId)
      .single()
      .then(({ data }) => {
        if (!active || !data?.result) return;
        setResult(data.result as SynthesisResult);
        setSavedId(data.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.result));
        setTab("tracker");
        setPendingShareId(null);
      });
    return () => {
      active = false;
    };
  }, [pendingShareId, auth.user]);

  return (
    <>
    <header className="relative">
      <Image
        src="/hero-contrail.jpg"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/55 to-white/90" />
      <div className="relative mx-auto flex max-w-[820px] flex-col px-4 pb-9 pt-4">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium text-gmuted shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-ggreen" />
            AI-drafted · review before publishing
          </span>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="View source on GitHub"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/70 text-gmuted shadow-sm backdrop-blur-sm transition hover:text-gink"
          >
            <GithubIcon />
          </a>
          <AuthButton auth={auth} />
        </div>
        <div className="mt-8 flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-md">
            <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
              <path d="M4 16 H14" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" />
              <path d="M6 22 H12" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 4" opacity="0.6" />
              <path d="M14 16 L24 16 M24 16 l-4 -3 v6 z" fill="#026da7" />
              <path d="M16 13 L20 16 L16 19" fill="none" stroke="#188038" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gink">TIM Program Hub</h1>
          <p className="mt-1 max-w-lg font-opensans text-sm leading-relaxed text-gmuted">
            GenAI copilot for program synthesis — Travel Impact Model &amp; contrail avoidance
          </p>
        </div>
      </div>
    </header>

    <main className="mx-auto max-w-[820px] px-4 pb-10">
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
          <ProgramPulse result={result} updateResult={updateResult} />
          <ExportBar
            result={result}
            userEmail={auth.user?.email ?? null}
            savedId={savedId}
            onSaved={setSavedId}
          />
          <div className="mb-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-x-5 border-b border-gborder">
              {(
                [
                  ["tracker", "Tracker"],
                  ["timeline", "Timeline"],
                  ["dependencies", "Dependencies"],
                  ["summary", "Exec Summary"],
                  ...(auth.configured
                    ? ([["saved", "Saved syntheses"]] as [Tab, string][])
                    : []),
                ] as [Tab, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`-mb-px border-b-2 pb-2 text-sm font-medium transition ${
                    tab === id
                      ? "border-dashed border-gaccent font-semibold text-gaccent-dark"
                      : "border-transparent text-gmuted hover:text-gink"
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
          {tab === "tracker" && <TrackerView result={result} updateResult={updateResult} />}
          {tab === "timeline" && <TimelineView result={result} />}
          {tab === "dependencies" && <DependencyFlow result={result} />}
          {tab === "summary" && <ExecSummaryView result={result} updateResult={updateResult} />}
          {tab === "saved" && (
            <SavedList
              userId={auth.user?.id ?? null}
              userEmail={auth.user?.email ?? null}
              currentSavedId={savedId}
              onOpen={loadSaved}
            />
          )}
        </section>
      )}

      {!isLoading && !result && (
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => {
              const el = document.getElementById("notes-input") as HTMLTextAreaElement | null;
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
              el?.focus({ preventScroll: true });
            }}
            className="rounded-xl border border-gborder bg-white p-4 text-left shadow-sm transition hover:border-gaccent hover:shadow-md"
          >
            <p className="text-sm font-semibold text-gink">Try a sample scenario</p>
            <p className="mt-1 text-xs leading-relaxed text-gmuted">
              Load a built-in weekly update, quarterly plan, or incident thread, then hit
              Synthesize.
            </p>
          </button>
          <div className="rounded-xl border border-gborder bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-gink">How it works</p>
            <p className="mt-1 text-xs leading-relaxed text-gmuted">
              Paste notes → Synthesize → get decisions, actions, risks, dependencies, and an exec
              brief you can copy for email.
            </p>
          </div>
          <a
            href="https://travelimpactmodel.org/about-tim"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-gborder bg-white p-4 shadow-sm transition hover:border-gaccent hover:shadow-md"
          >
            <p className="text-sm font-semibold text-gink">
              Learn about TIM
              <svg
                viewBox="0 0 16 16"
                className="ml-1 inline h-3 w-3 text-gmuted"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6.5 3.5h-3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3" />
                <path d="M9.5 2.5h4v4" />
                <path d="M13.5 2.5 8 8" />
              </svg>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-gmuted">
              The Travel Impact Model is Google&rsquo;s transparent flight-emissions model,
              powering Google Flights and its travel partners.
            </p>
          </a>
        </div>
      )}
    </main>
    <SiteFooter />
    </>
  );
}