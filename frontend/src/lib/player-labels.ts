/** The API uses sides A/B; the UI shows player 1 and 2. */
export function playerNumberFromSide(side: "A" | "B"): "1" | "2" {
  return side === "A" ? "1" : "2";
}

type TFn = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Couch mode: player 1 (side A) is “You”, player 2 is “Opponent”.
 * Otherwise labels stay “Player 1 / 2”.
 */
export function sidePanelTitle(side: "A" | "B", couchMode: boolean, t: TFn): string {
  if (!couchMode) {
    return t("battle.panelPlayer", { n: playerNumberFromSide(side) });
  }
  return side === "A" ? t("battle.couchYou") : t("battle.couchOpponent");
}

/** Optional subtitle under the panel title (couch mode only). */
export function sidePanelSubtitle(side: "A" | "B", couchMode: boolean, t: TFn): string | null {
  if (!couchMode) return null;
  return t("battle.panelPlayer", { n: playerNumberFromSide(side) });
}
