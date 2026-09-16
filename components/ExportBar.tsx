"use client";

import { useState } from "react";
import type { SynthesisResult } from "@/lib/gemini";
import { copyRichText, downloadMarkdown } from "@/lib/export";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";

type Props = {
  result: SynthesisResult;
  userEmail: string | null;
  savedId: string | null;
  onSaved: (id: string) => void;
};

export default function ExportBar({ result, userEmail, savedId, onSaved }: Props) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackTone, setFeedbackTone] = useState<"green" | "red">("green");
  const [saving, setSaving] = useState(false);

  function show(text: string, tone: "green" | "red" = "green") {
    setFeedback(text);
    setFeedbackTone(tone);
    setTimeout(() => setFeedback(null), 5000);
  }

  async function handleCopy() {
    const rich = await copyRichText(result);
    show(rich ? "Copied — paste into email, Teams, or Notion" : "Copied as plain text (rich paste unsupported in this browser)");
  }

  function handleDownload() {
    downloadMarkdown(result);
    show("Markdown brief downloaded");
  }

  async function handleSave() {
    const supabase = getSupabaseBrowser();
    if (!isSupabaseConfigured || !supabase) {
      show("Team sharing not configured — see README setup steps", "red");
      return;
    }
    if (!userEmail) {
      show("Sign in first (top right) to save to the team space", "red");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        program_name: result.programName || "Untitled program",
        result,
      };
      const { data, error } = savedId
        ? await supabase.from("syntheses").update(payload).eq("id", savedId).select("id").single()
        : await supabase
            .from("syntheses")
            .insert({ ...payload, author_email: userEmail })
            .select("id")
            .single();
      if (error) throw error;
      onSaved(data.id);
      show("Saved to team space");
    } catch (e) {
      show(e instanceof Error ? `Save failed: ${e.message}` : "Save failed", "red");
    } finally {
      setSaving(false);
    }
  }

  async function handleCopyShareLink() {
    if (!savedId) {
      show("Save to the team space first to get a share link", "red");
      return;
    }
    const url = `${window.location.origin}/?s=${savedId}`;
    await navigator.clipboard.writeText(url);
    show("Share link copied — teammates just sign in and open it");
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <button
        onClick={() => void handleCopy()}
        className="rounded-lg bg-gink px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#3c4043] focus:outline-none focus:ring-2 focus:ring-gblue-tint"
      >
        Copy for email
      </button>
      <button
        onClick={handleDownload}
        className="rounded-lg border border-gborder bg-white px-4 py-1.5 text-sm font-medium text-gink transition hover:bg-gsurface focus:outline-none focus:ring-2 focus:ring-gblue-tint"
      >
        Download .md brief
      </button>
      {isSupabaseConfigured && (
        <>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="rounded-lg bg-gblue px-4 py-1.5 text-sm font-medium text-white transition hover:bg-gblue-hover disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gblue-tint"
          >
            {saving ? "Saving…" : savedId ? "Update in team space" : "Save to team"}
          </button>
          {savedId && (
            <button
              onClick={() => void handleCopyShareLink()}
              className="rounded-lg border border-gborder bg-white px-4 py-1.5 text-sm font-medium text-gink transition hover:bg-gsurface focus:outline-none focus:ring-2 focus:ring-gblue-tint"
            >
              Copy share link
            </button>
          )}
        </>
      )}
      {feedback && (
        <span className={`text-xs font-medium ${feedbackTone === "green" ? "text-ggreen-dark" : "text-gred-dark"}`}>
          {feedback}
        </span>
      )}
    </div>
  );
}
