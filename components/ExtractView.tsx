"use client";

export default function ExtractView() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-gborder bg-white py-16 text-gmuted">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gblue-tint border-t-gblue" />
      <p className="text-sm font-medium text-gink">
        Synthesizing program state — extracting decisions, actions, risks, dependencies…
      </p>
      <p className="max-w-md text-center text-xs text-gmuted">
        Structured extraction in progress. Output is schema-constrained: owners, dates, and
        severities come only from your input — unknowns are marked TBD, never guessed.
      </p>
    </div>
  );
}
