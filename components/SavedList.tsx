"use client";

import { useEffect, useState } from "react";
import type { SynthesisResult } from "@/lib/gemini";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export type SavedRow = {
  id: string;
  program_name: string;
  result: SynthesisResult;
  created_by: string;
  author_email: string;
  updated_at: string;
};

type Props = {
  userId: string | null;
  userEmail: string | null;
  currentSavedId: string | null;
  onOpen: (row: SavedRow) => void;
};

export default function SavedList({ userId, userEmail, currentSavedId, onOpen }: Props) {
  const [rows, setRows] = useState<SavedRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowser();
    if (!supabase || !userEmail) return;

    setRows(null);
    setError(null);
    supabase
      .from("syntheses")
      .select("id, program_name, result, created_by, author_email, updated_at")
      .order("updated_at", { ascending: false })
      .then(({ data, error: e }) => {
        if (!active) return;
        if (e) setError(e.message);
        else setRows((data as SavedRow[]) ?? []);
      });

    return () => {
      active = false;
    };
  }, [userEmail]);

  async function handleDelete(id: string) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setDeleting(id);
    const { error: e } = await supabase.from("syntheses").delete().eq("id", id);
    if (!e) setRows((prev) => prev?.filter((r) => r.id !== id) ?? null);
    setDeleting(null);
  }

  if (!userEmail) {
    return (
      <p className="py-10 text-center text-sm text-gmuted">
        Sign in (top right) to see syntheses saved by your team.
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-10 text-center text-sm text-gred-dark">
        Failed to load saved syntheses: {error}
      </p>
    );
  }

  if (rows === null) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-gmuted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gaccent-tint border-t-gaccent" />
        <p className="text-sm">Loading team syntheses…</p>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-gmuted">
        No saved syntheses yet — run a synthesis and hit &ldquo;Save to team&rdquo;.
      </p>
    );
  }

  return (
    <ul className="overflow-hidden rounded-xl border border-gborder bg-white shadow-sm">
      {rows.map((row) => (
        <li key={row.id} className="group/item flex flex-wrap items-center gap-3 px-4 py-3 transition hover:bg-gsurface">
          <div className="flex-1">
            <button
              onClick={() => onOpen(row)}
              className="text-left text-sm font-medium text-gaccent-hover hover:underline"
            >
              {row.program_name}
            </button>
            <p className="tnum text-xs text-gmuted">
              {row.author_email || "Unknown author"} · updated{" "}
              {new Date(row.updated_at).toLocaleString()}
            </p>
          </div>
          {row.id === currentSavedId && (
            <span className="rounded-full border border-ggreen-tint bg-ggreen-tint px-2 py-0.5 text-[10px] font-medium text-ggreen-dark">
              open
            </span>
          )}
          {userId && row.created_by === userId && (
            <button
              onClick={() => void handleDelete(row.id)}
              disabled={deleting === row.id}
              className="rounded-full border border-gborder px-2 py-1 text-xs font-medium text-gmuted transition hover:border-gred hover:text-gred-dark disabled:opacity-40"
            >
              {deleting === row.id ? "Deleting…" : "Delete"}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
