import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n/I18nContext";
import { api } from "@/lib/api";
import { getOrCreateGuestId } from "@/lib/guest";
import type { RosterState, Warrior } from "@/lib/types";

export function useHomeData() {
  const { t } = useI18n();
  const [warriors, setWarriors] = useState<Warrior[]>([]);
  const [allWarriors, setAllWarriors] = useState<Warrior[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Warrior | null>(null);
  const [rosterProgress, setRosterProgress] = useState<RosterState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const g = getOrCreateGuestId();
        const [unlocked, all, progress] = await Promise.all([
          api.warriors(g || undefined),
          g ? api.warriors() : Promise.resolve(null as Warrior[] | null),
          g ? api.rosterState(g) : Promise.resolve(null),
        ]);
        if (!cancelled) {
          setWarriors(unlocked);
          setAllWarriors(all ?? unlocked);
          setRosterProgress(progress);

          if (progress && g) {
            const SLUGS_KEY = "torneo-kiai-unlocked-slugs";
            try {
              const stored: string[] = JSON.parse(
                localStorage.getItem(SLUGS_KEY) ?? "[]",
              );
              const currentSlugs = progress.unlockedSlugs;
              if (stored.length > 0) {
                const freshSlugs = currentSlugs.filter(
                  (s) => !stored.includes(s),
                );
                if (freshSlugs.length > 0) {
                  const newW = (all ?? unlocked).find((w) =>
                    freshSlugs.includes(w.slug),
                  );
                  if (newW && !cancelled) setNewlyUnlocked(newW);
                }
              }
              localStorage.setItem(SLUGS_KEY, JSON.stringify(currentSlugs));
            } catch {
              /* localStorage unavailable */
            }
          }
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : t("home.errorLoad"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const g = getOrCreateGuestId();
      const [data, progress] = await Promise.all([
        api.warriors(g || undefined),
        g ? api.rosterState(g) : Promise.resolve(null),
      ]);
      setWarriors(data);
      setRosterProgress(progress);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("home.errorLoad"));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    warriors,
    allWarriors,
    rosterProgress,
    newlyUnlocked,
    loading,
    error,
    setError,
    reload,
    clearNewlyUnlocked: () => setNewlyUnlocked(null),
  };
}
