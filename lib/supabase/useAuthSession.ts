"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser, isSupabaseConfigured } from "./client";

export type AuthState = {
  configured: boolean;
  user: { id: string; email: string } | null;
  loading: boolean;
  magicLinkState: "idle" | "sending" | "sent" | "error";
  magicLinkError: string | null;
  sendMagicLink: (email: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

export function useAuthSession(): AuthState {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [magicLinkState, setMagicLinkState] = useState<AuthState["magicLinkState"]>("idle");
  const [magicLinkError, setMagicLinkError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ? { id: data.user.id, email: data.user.email ?? "" } : null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? "" } : null);
      setLoading(false);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  async function sendMagicLink(email: string): Promise<boolean> {
    const supabase = getSupabaseBrowser();
    if (!supabase) return false;
    setMagicLinkState("sending");
    setMagicLinkError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
      },
    });
    if (error) {
      setMagicLinkState("error");
      setMagicLinkError(error.message);
      return false;
    }
    setMagicLinkState("sent");
    return true;
  }

  async function signOut(): Promise<void> {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  }

  return {
    configured: isSupabaseConfigured,
    user,
    loading,
    magicLinkState,
    magicLinkError,
    sendMagicLink,
    signOut,
  };
}
