"use client";

import { useEffect, useRef, useState } from "react";

type EditableTextProps = {
  value: string;
  onCommit: (next: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
};

export function EditableText({ value, onCommit, multiline = false, className = "", placeholder }: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== value) {
      onCommit(next);
    } else {
      setDraft(value);
    }
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    const shared =
      "w-full rounded border border-gblue bg-white px-1.5 py-0.5 text-inherit [font:inherit] text-gink focus:outline-none focus:ring-2 focus:ring-gblue-tint";
    return multiline ? (
      <textarea
        ref={inputRef as React.Ref<HTMLTextAreaElement>}
        value={draft}
        rows={3}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
        }}
        className={shared}
      />
    ) : (
      <input
        ref={inputRef as React.Ref<HTMLInputElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
        className={shared}
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      title="Click to edit"
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter") setEditing(true);
      }}
      className={`cursor-text rounded transition hover:bg-gblue-tint/70 ${className}`}
    >
      {value || <span className="text-[#80868b]">{placeholder ?? "Click to edit"}</span>}
    </span>
  );
}

type EditableSelectProps = {
  value: string;
  options: readonly string[];
  onCommit: (next: string) => void;
  className?: string;
};

export function EditableSelect({ value, options, onCommit, className = "" }: EditableSelectProps) {
  const [editing, setEditing] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editing) selectRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <select
        ref={selectRef}
        value={value}
        onChange={(e) => {
          setEditing(false);
          if (e.target.value !== value) onCommit(e.target.value);
        }}
        onBlur={() => setEditing(false)}
        className="rounded border border-gblue bg-white px-1 py-0 text-xs text-gink focus:outline-none focus:ring-2 focus:ring-gblue-tint"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      title="Click to change"
      onClick={() => setEditing(true)}
      onKeyDown={(e) => {
        if (e.key === "Enter") setEditing(true);
      }}
      className={`cursor-pointer rounded transition hover:brightness-95 ${className}`}
    >
      {value}
    </span>
  );
}

export function EditedChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-ggreen-tint bg-ggreen-tint px-1.5 py-0 text-[10px] font-medium text-ggreen-dark">
      <span className="h-1 w-1 rounded-full bg-ggreen" />
      edited
    </span>
  );
}

export function DeleteButton({ onClick, label = "Delete item" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="ml-1 hidden shrink-0 rounded-full p-1 text-gmuted transition group-hover/item:block hover:bg-gred-tint hover:text-gred-dark focus:block focus:outline-none"
    >
      <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </button>
  );
}
