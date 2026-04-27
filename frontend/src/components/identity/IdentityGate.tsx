"use client";

import { useEffect, useState } from "react";
import { getSession, setSession, type PlayerSession } from "@/lib/identity";
import { PlayerAliasModal } from "./PlayerAliasModal";

interface Props {
  children: React.ReactNode;
}

export function IdentityGate({ children }: Props) {
  // null  → still loading (avoid flash)
  // false → no session, show modal
  // PlayerSession → session active, show app
  const [session, setSessionState] = useState<PlayerSession | null | false>(null);

  useEffect(() => {
    const existing = getSession();
    setSessionState(existing ?? false);
  }, []);

  const handleSuccess = (guestId: string, alias: string) => {
    setSession(guestId, alias);
    setSessionState({ guestId, alias });
  };

  // Loading (SSR hydration gap — show nothing to avoid layout shift)
  if (session === null) return null;

  // No session → show modal over a blank dark background
  if (session === false) {
    return (
      <div className="min-h-full flex-1 bg-[var(--background)]">
        <PlayerAliasModal onSuccess={handleSuccess} />
      </div>
    );
  }

  // Session active → render the full app
  return <>{children}</>;
}
