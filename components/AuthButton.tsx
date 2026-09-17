"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import type { AuthState } from "@/lib/supabase/useAuthSession";

type Props = {
  auth: AuthState;
};

export default function AuthButton({ auth }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onDocClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!auth.configured) return null;

  if (auth.loading) {
    return <span className="text-xs text-gmuted">Checking session…</span>;
  }

  if (auth.user) {
    const initial = (auth.user.email || "?").charAt(0).toUpperCase();
    return (
      <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 py-1 pl-1 pr-3 shadow-sm backdrop-blur-sm">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ggreen text-xs font-bold text-white">
          {initial}
        </span>
        <span className="max-w-[160px] truncate text-xs text-gink">{auth.user.email}</span>
        <button
          onClick={() => void auth.signOut()}
          className="rounded-full px-2 py-0.5 text-xs font-medium text-gmuted transition hover:bg-gsurface hover:text-gink"
        >
          Sign out
        </button>
      </div>
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    void auth.sendMagicLink(email);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-gink/20 bg-white/70 px-4 py-1.5 text-xs font-medium text-gink shadow-sm backdrop-blur-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-gaccent-tint"
      >
        Sign in
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-72 rounded-xl border border-gborder bg-white p-4 shadow-lg">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gmuted">
            Team sign-in
          </p>
          {auth.magicLinkState === "sent" ? (
            <p className="text-sm text-ggreen-dark">
              Magic link sent to <strong>{email}</strong> — check your inbox (and spam folder), then
              click the link to finish sign-in.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-lg border border-gborder px-3 py-2 text-sm text-gink placeholder:text-[#80868b] focus:border-gaccent focus:outline-none focus:ring-2 focus:ring-gaccent-tint"
              />
              <button
                type="submit"
                disabled={auth.magicLinkState === "sending"}
                className="w-full rounded-lg bg-gaccent px-3 py-2 text-sm font-medium text-white transition hover:bg-gaccent-hover disabled:opacity-50"
              >
                {auth.magicLinkState === "sending" ? "Sending…" : "Send magic link"}
              </button>
              {auth.magicLinkError && (
                <p className="text-xs text-gred-dark">{auth.magicLinkError}</p>
              )}
              <p className="text-xs text-gmuted">
                No password — we email you a one-time login link.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
