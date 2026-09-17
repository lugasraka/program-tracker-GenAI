"use client";

import { useEffect, useRef, useState } from "react";
import { sampleScenarios } from "@/lib/sampleData";

type Props = {
  input: string;
  onInputChange: (value: string) => void;
  onSynthesize: () => void;
  isLoading: boolean;
};

export default function InputPanel({ input, onInputChange, onSynthesize, isLoading }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const [isMac, setIsMac] = useState<boolean | null>(null);

  useEffect(() => {
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    setIsMac(/Mac|iPhone|iPad/i.test(ua));
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (!isLoading && input.trim().length > 0) onSynthesize();
    }
  }

  function loadSample(id: string, content: string) {
    setActiveSample(id);
    onInputChange(content);
  }

  async function handleFile(file: File) {
    const text = await file.text();
    setActiveSample(null);
    onInputChange(text);
  }

  return (
    <section className="rounded-xl border border-gborder bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gmuted">
            Example programs
          </span>
          {sampleScenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => loadSample(s.id, s.content)}
              title={s.description}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${
                activeSample === s.id
                  ? "border-gaccent bg-gaccent-tint text-gaccent-hover"
                  : "border-gaccent-tint bg-gaccent-tint/60 text-gaccent-hover hover:border-gaccent"
              }`}
            >
              {activeSample === s.id ? (
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                  <path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                  <path d="M6.5 1.5 7.6 4.4a1 1 0 0 0 .6.6l2.9 1.1-2.9 1.1a1 1 0 0 0-.6.6L6.5 10.7 5.4 7.8a1 1 0 0 0-.6-.6L1.9 6.1 4.8 5a1 1 0 0 0 .6-.6L6.5 1.5Z" />
                  <path d="M12.5 9.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7.7-1.9Z" opacity="0.7" />
                </svg>
              )}
              {s.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gmuted bg-white px-3 py-1.5 text-xs font-medium text-gmuted transition hover:border-gaccent hover:text-gaccent-hover focus:outline-none focus:ring-2 focus:ring-gaccent-tint"
        >
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M8 10.5V2.5M8 2.5 5 5.5M8 2.5 11 5.5" />
            <path d="M2.5 10.5v2a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-2" />
          </svg>
          Upload file (.txt / .md)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".txt,.md,.markdown,text/plain"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
            e.target.value = "";
          }}
        />
      </div>
      <textarea
        id="notes-input"
        value={input}
        onChange={(e) => {
          setActiveSample(null);
          onInputChange(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Paste a status update, meeting notes, transcript, or Slack thread. The copilot extracts decisions, actions, risks, dependencies, and drafts an exec summary."
        rows={10}
        className="w-full resize-y rounded-lg border border-gborder p-3 font-mono text-sm text-gink placeholder:text-[#80868b] focus:border-gaccent focus:outline-none focus:ring-2 focus:ring-gaccent-tint"
      />
      <div className="mt-3 flex items-center justify-between">
        <span className="tnum text-xs text-[#80868b]">
          {input.length.toLocaleString()} characters · treated as draft-for-review, never auto-published
        </span>
        <button
          onClick={onSynthesize}
          disabled={isLoading || input.trim().length === 0}
          className="inline-flex items-center gap-2 rounded-lg bg-gaccent px-5 py-2 text-sm font-medium text-white transition hover:bg-gaccent-hover focus:outline-none focus:ring-2 focus:ring-gaccent-tint disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          )}
          {isLoading ? "Synthesizing…" : "Synthesize"}
          {!isLoading && isMac !== null && (
            <span className="rounded border border-white/30 bg-white/15 px-1.5 py-0.5 text-[10px] font-normal">
              {isMac ? "⌘↵" : "Ctrl+↵"}
            </span>
          )}
        </button>
      </div>
    </section>
  );
}
