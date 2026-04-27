import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type MouseEvent as ReactMouseEvent,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import type { AttackUnlockPayload } from "@/components/battle/BattleUnlockReveal";
import type { CinematicPhase } from "@/components/battle/BattleCinematicIntro";
import type { PanelFx } from "@/components/battle/battle-types";
import { api } from "@/lib/api";
import { battleIdFromParams } from "@/lib/battle-route";
import { getOrCreateGuestId } from "@/lib/guest";
import { createBattlesSocket, type Socket } from "@/lib/socket";
import {
  feedbackHit,
  feedbackKO,
  isCriticalDamage,
} from "@/lib/combat-feedback";
import { useI18n } from "@/i18n/I18nContext";
import { useOopLearning } from "@/i18n/OopLearningContext";
import {
  consumeBattleTourContinuation,
  getBattleTourSeen,
  markBattleTourSeen,
} from "@/lib/oop-learning";
import {
  parseDamageOnLine,
  replayWarriorsAtLine,
} from "@/lib/battle-replay-simulate";
import type { Battle, BattleActionType } from "@/lib/types";
import { useBattleKeyboardShortcuts } from "@/hooks/useBattleKeyboardShortcuts";

/** Sonner adds padding, border, and background on the `li`; styling lives in `.victory-toast`. */
const victoryToastSonnerOpts = {
  duration: 7000,
  classNames: {
    toast:
      "!border-0 !bg-transparent !p-0 !shadow-none !backdrop-blur-none rounded-2xl",
  },
};

export type StrikeCallout = {
  key: number;
  from: string;
  to: string;
  attack: string;
};

export interface UseBattleResult {
  id: string | null;
  battle: Battle | null;
  error: string | null;
  pending: boolean;
  throttleCooldown: number;
  attackUnlock: AttackUnlockPayload | null;
  setAttackUnlock: Dispatch<SetStateAction<AttackUnlockPayload | null>>;
  fxA: PanelFx | null;
  fxB: PanelFx | null;
  couchMode: boolean;
  replayPlaying: boolean;
  setReplayPlaying: Dispatch<SetStateAction<boolean>>;
  replayHighlight: number | null;
  setReplayHighlight: Dispatch<SetStateAction<number | null>>;
  battleLogOpen: boolean;
  setBattleLogOpen: Dispatch<SetStateAction<boolean>>;
  arenaShift: { x: number; y: number };
  cinematicPhase: CinematicPhase;
  lungeKeyA: number;
  lungeKeyB: number;
  strikeCallout: StrikeCallout | null;
  act: (type: BattleActionType, attackIndex?: number) => Promise<void>;
  combatActive: boolean;
  mySide: "A" | "B" | null;
  inputLocked: boolean;
  onlineMode: boolean;
  replaySimSnap: ReturnType<typeof replayWarriorsAtLine> | null;
  onArenaMouseMove: (e: ReactMouseEvent<HTMLDivElement>) => void;
  battleTourRun: boolean;
  setBattleTourRun: Dispatch<SetStateAction<boolean>>;
  t: ReturnType<typeof useI18n>["t"];
  oopEnabled: boolean;
}

export function useBattle(
  idParam: string | string[] | undefined,
): UseBattleResult {
  const { t } = useI18n();
  const { enabled: oopEnabled } = useOopLearning();

  const id = battleIdFromParams(idParam);

  const [battle, setBattle] = useState<Battle | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [throttleCooldown, setThrottleCooldown] = useState(0);
  const [attackUnlock, setAttackUnlock] = useState<AttackUnlockPayload | null>(
    null,
  );
  const [battleTourRun, setBattleTourRun] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [fxA, setFxA] = useState<PanelFx | null>(null);
  const [fxB, setFxB] = useState<PanelFx | null>(null);
  const [couchMode, setCouchMode] = useState(false);
  const [replayPlaying, setReplayPlaying] = useState(false);
  const [replayHighlight, setReplayHighlight] = useState<number | null>(null);
  const [battleLogOpen, setBattleLogOpen] = useState(false);
  const [arenaShift, setArenaShift] = useState({ x: 0, y: 0 });
  const [cinematicPhase, setCinematicPhase] = useState<CinematicPhase>("off");
  const [lungeKeyA, setLungeKeyA] = useState(0);
  const [lungeKeyB, setLungeKeyB] = useState(0);
  const [strikeCallout, setStrikeCallout] = useState<StrikeCallout | null>(
    null,
  );

  const throttleIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const battleSocketRef = useRef<Socket | null>(null);
  const reduceMotionRef = useRef(true);
  const cinematicPlayedForId = useRef<string | null>(null);
  const battleId = battle?._id;
  const battleStatus = battle?.status;

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  useEffect(() => {
    if (!battleId) return;
    if (cinematicPlayedForId.current === battleId) return;
    cinematicPlayedForId.current = battleId;
    if (reduceMotionRef.current) return;
    setCinematicPhase("in");
    const t1 = window.setTimeout(() => setCinematicPhase("out"), 2000);
    const t2 = window.setTimeout(() => setCinematicPhase("off"), 2680);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [battleId]);

  useEffect(() => {
    if (!strikeCallout) return;
    const timer = window.setTimeout(() => setStrikeCallout(null), 2400);
    return () => window.clearTimeout(timer);
  }, [strikeCallout]);

  useEffect(() => {
    if (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem("torneo-kiai-local-2p") === "1"
    ) {
      setCouchMode(true);
    }
  }, []);

  useEffect(() => {
    if (battle?.modo === "online") setCouchMode(false);
  }, [battle?.modo]);

  useEffect(() => {
    if (throttleCooldown <= 0) return;
    throttleIntervalRef.current = setInterval(() => {
      setThrottleCooldown((n) => {
        if (n <= 1) {
          if (throttleIntervalRef.current)
            clearInterval(throttleIntervalRef.current);
          setError(null);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => {
      if (throttleIntervalRef.current)
        clearInterval(throttleIntervalRef.current);
    };
  }, [throttleCooldown]);

  useEffect(() => {
    if (!oopEnabled || autoStarted) return;
    if (battleStatus !== "active") return;
    const continueFromHome = consumeBattleTourContinuation();
    if (!continueFromHome && getBattleTourSeen()) return;
    setAutoStarted(true);
    markBattleTourSeen();
    const timer = window.setTimeout(
      () => setBattleTourRun(true),
      continueFromHome ? 2800 : 1800,
    );
    return () => window.clearTimeout(timer);
  }, [oopEnabled, battleStatus, autoStarted]);

  const refresh = useCallback(async () => {
    if (!id) return;
    const b = await api.battle(id);
    setBattle(b);
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : t("battle.errorLoad"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh, t]);

  useEffect(() => {
    if (!battle?._id || battle.modo !== "online" || battle.status !== "active")
      return;
    const socket = createBattlesSocket();
    battleSocketRef.current = socket;
    socket.on("connect", () => socket.emit("watch", battle._id));
    socket.on("battle:update", (updated: Battle) => setBattle(updated));
    socket.on("connect_error", () => {
      const tmr = window.setInterval(() => void refresh(), 4000);
      socket.once("connect", () => clearInterval(tmr));
    });
    return () => {
      socket.disconnect();
      battleSocketRef.current = null;
    };
  }, [battle?._id, battle?.modo, battle?.status, refresh]);

  useEffect(() => {
    if (!replayPlaying || replayHighlight === null || !battle?.log.length)
      return;
    const max = battle.log.length - 1;
    const cur = replayHighlight;
    const tmr = window.setTimeout(() => {
      const next = cur + 1;
      if (next > max) {
        setReplayPlaying(false);
        setReplayHighlight(max);
        if (battle.status === "finished" && battle.winnerSide) {
          const winnerName =
            battle.winnerSide === "A"
              ? battle.warriorA.nombre
              : battle.warriorB.nombre;
          toast.custom(
            () => (
              <div className="victory-toast" role="status" aria-live="polite">
                <div className="victory-toast-shimmer" aria-hidden />
                <div className="victory-toast-icon" aria-hidden>
                  ⚡
                </div>
                <div className="min-w-0">
                  <p className="victory-toast-kicker">
                    {t("battle.victoryToastKicker")}
                  </p>
                  <p className="victory-toast-name">{winnerName}</p>
                  <p className="victory-toast-sub">
                    {t("battle.victoryToastSub")}
                  </p>
                </div>
              </div>
            ),
            victoryToastSonnerOpts,
          );
        }
      } else {
        setReplayHighlight(next);
      }
    }, 620);
    return () => window.clearTimeout(tmr);
  }, [
    t,
    replayPlaying,
    replayHighlight,
    battle?.log.length,
    battle?.status,
    battle?.winnerSide,
    battle?.warriorA.nombre,
    battle?.warriorB.nombre,
  ]);

  const replaySimSnap = useMemo(() => {
    if (!battle || !battleLogOpen || replayHighlight === null) return null;
    if (battle.status !== "finished") return null;
    return replayWarriorsAtLine(battle, replayHighlight);
  }, [battle, battleLogOpen, replayHighlight]);

  useEffect(() => {
    if (!battle || !battleLogOpen || replayHighlight === null) return;
    if (battle.status !== "finished") return;
    const line = battle.log[replayHighlight];
    if (!line) return;
    const fxKey = 10_000 + replayHighlight;
    const d = parseDamageOnLine(line, battle);
    if (d) {
      const crit = isCriticalDamage(d.amount);
      if (d.side === "A") setFxA({ dmg: d.amount, key: fxKey, crit });
      else setFxB({ dmg: d.amount, key: fxKey, crit });
      feedbackHit(crit);
    }
    const atkM = line.match(/^(.+?) \(jugador ([12])\) usa (.+)\.$/u);
    if (atkM) {
      const side = atkM[2] === "1" ? "A" : "B";
      if (side === "A") setLungeKeyA((k) => k + 1);
      else setLungeKeyB((k) => k + 1);
      setStrikeCallout({
        key: fxKey + 1,
        from: side === "A" ? battle.warriorA.nombre : battle.warriorB.nombre,
        to: side === "A" ? battle.warriorB.nombre : battle.warriorA.nombre,
        attack: atkM[3].trim(),
      });
    }
  }, [battle, battleLogOpen, replayHighlight]);

  const act = useCallback(
    async (type: BattleActionType, attackIndex?: number) => {
      if (!id || !battle) return;
      const combatActiveNow =
        battle.status === "active" &&
        battle.warriorA.salud > 0 &&
        battle.warriorB.salud > 0;
      if (!combatActiveNow) return;
      let actionGuestId: string | undefined;
      if (battle.modo === "online") {
        const g = getOrCreateGuestId();
        actionGuestId = g;
        const mine =
          battle.guestId === g
            ? ("A" as const)
            : battle.guestJugador2 === g
              ? ("B" as const)
              : null;
        if (mine && battle.activeSide !== mine) return;
      }
      setPending(true);
      setError(null);
      const prev = battle;
      try {
        const next = await api.battleAction(id, {
          type,
          attackIndex,
          ...(actionGuestId ? { guestId: actionGuestId } : {}),
        });
        const lostA = prev.warriorA.salud - next.warriorA.salud;
        const lostB = prev.warriorB.salud - next.warriorB.salud;
        const maxLost = Math.max(lostA, lostB);
        const crit = maxLost > 0 && isCriticalDamage(maxLost);
        if (maxLost > 0) feedbackHit(crit);
        const base = Date.now();
        if (type === "ATTACK") {
          const attacker = prev.activeSide;
          const atkW = attacker === "A" ? prev.warriorA : prev.warriorB;
          const defW = attacker === "A" ? prev.warriorB : prev.warriorA;
          const an =
            attackIndex !== undefined && atkW.ataques[attackIndex]
              ? atkW.ataques[attackIndex].nombre
              : "—";
          if (attacker === "A") setLungeKeyA((k) => k + 1);
          else setLungeKeyB((k) => k + 1);
          setStrikeCallout({
            key: base,
            from: atkW.nombre,
            to: defW.nombre,
            attack: an,
          });
        }
        if (lostA > 0) setFxA({ dmg: lostA, key: base, crit });
        if (lostB > 0) setFxB({ dmg: lostB, key: base + 1, crit });
        const justFinished =
          prev.status === "active" && next.status === "finished";
        if (justFinished) {
          feedbackKO();
          const winnerName =
            next.winnerSide === "A"
              ? next.warriorA.nombre
              : next.warriorB.nombre;
          toast.custom(
            () => (
              <div className="victory-toast" role="status" aria-live="polite">
                <div className="victory-toast-shimmer" aria-hidden />
                <div className="victory-toast-icon" aria-hidden>
                  ⚡
                </div>
                <div className="min-w-0">
                  <p className="victory-toast-kicker">
                    {t("battle.victoryToastKicker")}
                  </p>
                  <p className="victory-toast-name">{winnerName}</p>
                  <p className="victory-toast-sub">
                    {t("battle.victoryToastSub")}
                  </p>
                </div>
              </div>
            ),
            victoryToastSonnerOpts,
          );
        }
        const { progresoEvento, ...restBattle } = next;
        if (progresoEvento?.aprendioAtaque && progresoEvento.nombreAtaque) {
          const atName = progresoEvento.nombreAtaque;
          const learner = next.warriorA.ataques.some((a) => a.nombre === atName)
            ? next.warriorA
            : next.warriorB.ataques.some((a) => a.nombre === atName)
              ? next.warriorB
              : next.warriorA;
          const atDetails = learner.ataques.find((a) => a.nombre === atName);
          setAttackUnlock({
            attackName: atName,
            attackDamage: atDetails?.daño,
            attackKi: atDetails?.costoEnergia,
            warriorName: learner.nombre,
            warriorSlug: learner.slug,
            warriorId: learner.warriorId,
            warriorImageUrl: learner.imageUrl,
          });
        } else if (
          progresoEvento?.evolucionDesbloqueada &&
          progresoEvento.nombreEvolucion
        ) {
          const evolved =
            progresoEvento.evolucionWarriorId === next.warriorB.warriorId
              ? next.warriorB
              : next.warriorA;
          setAttackUnlock({
            kind: "evolution",
            attackName: progresoEvento.nombreEvolucion,
            warriorName:
              progresoEvento.evolucionWarriorNombre ?? evolved.nombre,
            warriorSlug: progresoEvento.evolucionWarriorSlug ?? evolved.slug,
            warriorId: progresoEvento.evolucionWarriorId ?? evolved.warriorId,
            warriorImageUrl: evolved.imageUrl,
          });
        }
        setBattle(restBattle);
      } catch (e) {
        const msg = e instanceof Error ? e.message : t("battle.errorAction");
        const isThrottle = /throttl|too many/i.test(msg);
        if (isThrottle) {
          setError("__throttle__");
          if (throttleIntervalRef.current)
            clearInterval(throttleIntervalRef.current);
          setThrottleCooldown(5);
        } else {
          setError(msg);
        }
      } finally {
        setPending(false);
      }
    },
    [id, battle, t],
  );

  const combatActive =
    battle !== null &&
    battle.status === "active" &&
    battle.warriorA.salud > 0 &&
    battle.warriorB.salud > 0;

  const onlineMode = battle?.modo === "online";

  const mySide = useMemo<"A" | "B" | null>(() => {
    if (!battle || battle.modo !== "online") return null;
    const g = getOrCreateGuestId();
    if (!g) return null;
    if (battle.guestId === g) return "A";
    if (battle.guestJugador2 === g) return "B";
    return null;
  }, [battle]);

  const inputLocked = Boolean(
    onlineMode && mySide && battle && battle.activeSide !== mySide,
  );

  const onArenaMouseMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    if (reduceMotionRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 16;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 11;
    setArenaShift({ x, y });
  }, []);

  useBattleKeyboardShortcuts(
    combatActive && !inputLocked,
    pending,
    battle,
    act,
  );

  return {
    id,
    battle,
    error,
    pending,
    throttleCooldown,
    attackUnlock,
    setAttackUnlock,
    fxA,
    fxB,
    couchMode,
    replayPlaying,
    setReplayPlaying,
    replayHighlight,
    setReplayHighlight,
    battleLogOpen,
    setBattleLogOpen,
    arenaShift,
    cinematicPhase,
    lungeKeyA,
    lungeKeyB,
    strikeCallout,
    act,
    combatActive,
    mySide,
    inputLocked,
    onlineMode,
    replaySimSnap,
    onArenaMouseMove,
    battleTourRun,
    setBattleTourRun,
    t,
    oopEnabled,
  };
}
