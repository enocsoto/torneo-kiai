import { useEffect, useMemo, useRef, useState } from "react";
import type { Warrior } from "@/lib/types";

const HOME_PICKS_STORAGE = "torneo-kiai-home-picks";

export function useHomePicks(warriors: Warrior[], loading: boolean) {
  const [aId, setAId] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);
  const lastRosterSig = useRef("");

  useEffect(() => {
    if (loading || warriors.length === 0) return;
    const sig = [...warriors.map((w) => w._id)].sort().join("|");
    if (lastRosterSig.current === sig) return;
    lastRosterSig.current = sig;
    try {
      const raw = sessionStorage.getItem(HOME_PICKS_STORAGE);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { a?: string | null; b?: string | null };
      const ids = new Set(warriors.map((w) => w._id));
      setAId(parsed.a && ids.has(parsed.a) ? parsed.a : null);
      setBId(parsed.b && ids.has(parsed.b) ? parsed.b : null);
    } catch {
      /* */
    }
  }, [loading, warriors]);

  useEffect(() => {
    if (loading) return;
    try {
      sessionStorage.setItem(
        HOME_PICKS_STORAGE,
        JSON.stringify({ a: aId, b: bId }),
      );
    } catch {
      /* */
    }
  }, [aId, bId, loading]);

  const canStart = useMemo(() => Boolean(aId && bId), [aId, bId]);

  function select(slot: "A" | "B", id: string) {
    if (slot === "A") setAId(id);
    else setBId(id);
  }

  function assignFromPortrait(id: string) {
    if (aId === id) {
      setAId(null);
      return;
    }
    if (bId === id) {
      setBId(null);
      return;
    }
    if (!aId) {
      setAId(id);
      return;
    }
    if (!bId) {
      setBId(id);
      return;
    }
    setAId(id);
  }

  return { aId, bId, setAId, setBId, canStart, select, assignFromPortrait };
}
