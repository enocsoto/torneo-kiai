const KEY = "torneo-kiai-oop-learning";
const HOME_SEEN_KEY = "torneo-kiai-oop-home-tour-seen";
const BATTLE_SEEN_KEY = "torneo-kiai-oop-battle-tour-seen";
const HOME_ACTIVE_KEY = "torneo-kiai-oop-home-guide-active";
const BATTLE_CONTINUE_KEY = "torneo-kiai-oop-battle-tour-continue";
/** Luego de pulsar "Listo" en el paso "Ir al combate" o de crear la batalla, no volver a mostrarlo en esta sesión. */
const HOME_READY_CUE_KEY = "torneo-kiai-oop-home-ready-cue-seen";

/** Helper: read/write boolean flags in localStorage ("1" / "0"). */
function lsFlag(storageKey: string) {
  return {
    get(defaultVal = false): boolean {
      if (typeof window === "undefined") return defaultVal;
      try {
        const val = window.localStorage.getItem(storageKey);
        if (val === null) return defaultVal;
        return val === "1";
      } catch {
        return defaultVal;
      }
    },
    set(enabled: boolean): void {
      try {
        window.localStorage.setItem(storageKey, enabled ? "1" : "0");
      } catch {
        /* localStorage blocked */
      }
    },
    mark(): void {
      try {
        window.localStorage.setItem(storageKey, "1");
      } catch {
        /* */
      }
    },
  };
}

const oopFlag = lsFlag(KEY);
const homeTourFlag = lsFlag(HOME_SEEN_KEY);
const battleTourFlag = lsFlag(BATTLE_SEEN_KEY);

function sessionFlag(storageKey: string) {
  return {
    get(): boolean {
      if (typeof window === "undefined") return false;
      try {
        return window.sessionStorage.getItem(storageKey) === "1";
      } catch {
        return false;
      }
    },
    mark(): void {
      try {
        window.sessionStorage.setItem(storageKey, "1");
      } catch {
        /* sessionStorage blocked */
      }
    },
    clear(): void {
      try {
        window.sessionStorage.removeItem(storageKey);
      } catch {
        /* sessionStorage blocked */
      }
    },
    consume(): boolean {
      if (typeof window === "undefined") return false;
      try {
        const active = window.sessionStorage.getItem(storageKey) === "1";
        if (active) window.sessionStorage.removeItem(storageKey);
        return active;
      } catch {
        return false;
      }
    },
  };
}

const homeActiveFlag = sessionFlag(HOME_ACTIVE_KEY);
const battleContinueFlag = sessionFlag(BATTLE_CONTINUE_KEY);
const homeReadyCueFlag = sessionFlag(HOME_READY_CUE_KEY);

/**
 * Whether the OOP guide mode is enabled.
 * With no saved preference (first visit) → defaults to true,
 * because the game is designed to teach OOP.
 */
export function getOopLearning(): boolean {
  return oopFlag.get(true);
}

export function setOopLearning(enabled: boolean): void {
  oopFlag.set(enabled);
}

/** Whether the user already completed or skipped the home page tour. */
export function getHomeTourSeen(): boolean {
  return homeTourFlag.get();
}

/** Mark the home tour as seen so it is not auto-run again. */
export function markHomeTourSeen(): void {
  homeTourFlag.mark();
}

/** Whether the user manually opted into the guided learning flow this session. */
export function getHomeGuideActive(): boolean {
  return homeActiveFlag.get();
}

/** Keep showing contextual guide cues after the user presses "Start the tour". */
export function markHomeGuideActive(): void {
  homeActiveFlag.mark();
}

/** Stop the session-level guided flow after the user explicitly skips it. */
export function clearHomeGuideActive(): void {
  homeActiveFlag.clear();
}

export function getHomeReadyCueSeen(): boolean {
  return homeReadyCueFlag.get();
}

export function markHomeReadyCueSeen(): void {
  homeReadyCueFlag.mark();
}

export function clearHomeReadyCueSeen(): void {
  homeReadyCueFlag.clear();
}

/** Whether the user has seen the auto battle tour at least once. */
export function getBattleTourSeen(): boolean {
  return battleTourFlag.get();
}

/** Mark the battle tour as seen so it is not auto-run again. */
export function markBattleTourSeen(): void {
  battleTourFlag.mark();
}

/** Ask the battle screen to continue the OOP tour after a guided home flow. */
export function requestBattleTourContinuation(): void {
  battleContinueFlag.mark();
}

/** Read and clear the one-shot request to start the battle tour. */
export function consumeBattleTourContinuation(): boolean {
  return battleContinueFlag.consume();
}
