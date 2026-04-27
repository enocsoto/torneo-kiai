import { useEffect } from "react";
import type { Battle, BattleActionType } from "@/lib/types";

export function useBattleKeyboardShortcuts(
  combatActive: boolean,
  pending: boolean,
  battle: Battle | null,
  act: (type: BattleActionType, attackIndex?: number) => void,
): void {
  useEffect(() => {
    if (!combatActive || pending || !battle) return;
    const b = battle;

    function onKey(e: KeyboardEvent) {
      const el = e.target;
      if (
        el instanceof HTMLElement &&
        (el.closest("input, textarea, select, [contenteditable=true]") ||
          el.isContentEditable)
      ) {
        return;
      }

      const side = b.activeSide;
      const fighter = side === "A" ? b.warriorA : b.warriorB;

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        void act("RECHARGE");
        return;
      }
      if (e.key === "d" || e.key === "D") {
        e.preventDefault();
        void act("DODGE");
        return;
      }

      const n = e.key.charCodeAt(0) - 49;
      if (n >= 0 && n <= 8 && e.key >= "1" && e.key <= "9") {
        if (n < fighter.ataques.length) {
          const at = fighter.ataques[n];
          const canAfford =
            at.costoEnergia === 0 || fighter.ki >= at.costoEnergia;
          if (canAfford) {
            e.preventDefault();
            void act("ATTACK", n);
          }
        }
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [combatActive, pending, battle, act]);
}
