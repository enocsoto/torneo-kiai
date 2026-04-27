"use client";

import { useEffect, useState } from "react";
import { pingHealth } from "@/lib/api";

export function useApiOnline(pollMs = 12000): boolean {
  const [ok, setOk] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const alive = await pingHealth();
      if (!cancelled) setOk(alive);
    };

    void run();
    const id = setInterval(run, pollMs);

    const onVis = () => {
      if (document.visibilityState === "visible") void run();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pollMs]);

  return ok;
}
