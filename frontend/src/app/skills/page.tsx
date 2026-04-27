"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useI18n } from "@/i18n/I18nContext";
import { showEpicSuccessToast } from "@/lib/epic-toast";
import { api } from "@/lib/api";
import { getOrCreateGuestId } from "@/lib/guest";
import type { Warrior, WarriorSkillConfig } from "@/lib/types";
import { SkillsPanel } from "@/components/skills/SkillsPanel";
import { WarriorPanel } from "@/components/skills/WarriorPanel";

const MAX_BONUS_SLOTS = 3;
const WINS_PER_SLOT = 3;

function swapOrSetSlot(claves: string[], index: number, clave: string): string[] {
  const next = [...claves];
  const j = next.findIndex((c, k) => c === clave && k !== index);
  if (j >= 0) {
    const t = next[index];
    next[index] = clave;
    next[j] = t ?? clave;
    return next;
  }
  next[index] = clave;
  return next;
}

function SkillsPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const warriorParamApplied = useRef(false);
  const [warriors, setWarriors] = useState<Warrior[]>([]);
  const [warriorId, setWarriorId] = useState<string | null>(null);
  const [selectedWarrior, setSelectedWarrior] = useState<Warrior | null>(null);
  const [config, setConfig] = useState<WarriorSkillConfig | null>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const g = getOrCreateGuestId();
        const w = await api.warriors(g ?? undefined);
        if (!cancelled) setWarriors(w);
      } catch (e) {
        if (!cancelled)
          setLoadError(e instanceof Error ? e.message : t("skills.errorLoad"));
      }
    })();
    return () => { cancelled = true; };
  }, [t]);

  useEffect(() => {
    if (warriorParamApplied.current || warriors.length === 0) return;
    warriorParamApplied.current = true;
    const wid = searchParams.get("warrior")?.trim();
    if (!wid) return;
    const w = warriors.find((x) => x._id === wid);
    if (w) {
      setWarriorId(w._id);
      setSelectedWarrior(w);
    }
  }, [warriors, searchParams]);

  const loadConfig = useCallback(
    async (wid: string) => {
      setLoadError(null);
      setConfig(null);
      setPicks([]);
      setLoadingConfig(true);
      const guest = getOrCreateGuestId();
      if (!guest) {
        setLoadError(t("skills.guest"));
        setLoadingConfig(false);
        return;
      }
      try {
        const c = await api.skillConfig(wid, guest);
        setConfig(c);
        setPicks([...c.selectedClaves]);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : t("skills.errorLoad"));
      } finally {
        setLoadingConfig(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (warriorId) void loadConfig(warriorId);
  }, [warriorId, loadConfig]);

  function handleWarriorChange(wid: string) {
    setWarriorId(wid || null);
    setSelectedWarrior(warriors.find((w) => w._id === wid) ?? null);
  }

  function handlePick(index: number, clave: string) {
    setPicks((prev) => {
      const base =
        prev.length === (config?.bonusSlots ?? 0)
          ? prev
          : (config?.selectedClaves ?? []);
      return swapOrSetSlot(
        base.length
          ? [...base]
          : Array.from(
              { length: config?.bonusSlots ?? 0 },
              () => config?.pool[0]?.clave ?? "",
            ),
        index,
        clave,
      );
    });
  }

  async function savePicks() {
    if (!warriorId) return;
    const guest = getOrCreateGuestId();
    if (!guest) { toast.error(t("skills.guest")); return; }
    if (!config || config.bonusSlots === 0) return;
    if (picks.length !== config.bonusSlots) { toast.error(t("skills.errorSave")); return; }
    setSaving(true);
    try {
      await api.setSkillBonus(warriorId, { guestId: guest, claves: picks });
      showEpicSuccessToast({
        kicker: t("toast.saveKicker"),
        title: t("skills.saved"),
      });
      await loadConfig(warriorId);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("skills.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  const earnedSlots = config?.bonusSlots ?? 0;
  const isDirty =
    config !== null &&
    JSON.stringify(picks) !== JSON.stringify(config.selectedClaves);

  const lockedSlots =
    earnedSlots < MAX_BONUS_SLOTS
      ? Array.from({ length: MAX_BONUS_SLOTS - earnedSlots }, (_, i) => {
          const slotIndex = earnedSlots + i;
          const winsNeeded =
            (slotIndex + 1) * WINS_PER_SLOT - (config?.wins ?? 0);
          return { slotIndex, winsNeeded };
        })
      : [];

  const progressWins = config
    ? config.wins - config.bonusSlots * WINS_PER_SLOT
    : 0;
  const progressPct =
    config && config.bonusSlots < MAX_BONUS_SLOTS
      ? Math.min(100, (progressWins / WINS_PER_SLOT) * 100)
      : 100;
  const winsToNextSlot = config
    ? (config.bonusSlots + 1) * WINS_PER_SLOT - config.wins
    : WINS_PER_SLOT;

  return (
    <div className="relative min-h-full overflow-x-clip text-[var(--foreground)]">
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />

      <main id="main-content" className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-5xl">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t("skills.title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{t("skills.subtitle")}</p>
        </div>

        {loadError && !config && (
          <div
            className="mx-auto mb-6 max-w-5xl rounded-xl border border-[var(--status-warn-border)] bg-[var(--status-warn-bg)] px-4 py-3 text-sm text-[var(--status-warn-fg)]"
            role="alert"
          >
            {loadError}
          </div>
        )}

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 md:grid-cols-[300px_1fr] lg:grid-cols-[320px_1fr]">
            <WarriorPanel
              warriors={warriors}
              warriorId={warriorId}
              selectedWarrior={selectedWarrior}
              config={config}
              loadingConfig={loadingConfig}
              winsToNextSlot={winsToNextSlot}
              progressPct={progressPct}
              onWarriorChange={handleWarriorChange}
            />
            <SkillsPanel
              warriorId={warriorId}
              config={config}
              loadingConfig={loadingConfig}
              picks={picks}
              earnedSlots={earnedSlots}
              lockedSlots={lockedSlots}
              progressWins={progressWins}
              saving={saving}
              isDirty={isDirty}
              onPick={handlePick}
              onSave={() => void savePicks()}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function SkillsPageSuspenseFallback() {
  const { t } = useI18n();
  return (
    <div className="relative min-h-full overflow-x-clip text-[var(--foreground)]">
      <div className="page-radial pointer-events-none absolute inset-0" aria-hidden />
      <main className="flex min-h-[50vh] items-center justify-center px-4 py-16">
        <p className="text-sm text-[var(--muted)]">{t("common.loading")}</p>
      </main>
    </div>
  );
}

export default function SkillsPage() {
  return (
    <Suspense fallback={<SkillsPageSuspenseFallback />}>
      <SkillsPageContent />
    </Suspense>
  );
}
