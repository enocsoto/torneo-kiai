import type { Battle, WarriorSnapshot } from "./types";

function cloneForReplay(w: WarriorSnapshot): WarriorSnapshot {
  return {
    ...w,
    ataques: w.ataques.map((a) => ({ ...a })),
  };
}

/**
 * Rebuilds state (health, Ki, dodge flag) from the first `1 + lineIndex` log
 * lines, the same way the server appends them. Log text must match
 * `battles.service` (Spanish, by design).
 */
export function replayWarriorsAtLine(
  battle: Battle,
  lineIndex: number,
): { warriorA: WarriorSnapshot; warriorB: WarriorSnapshot } {
  const a = cloneForReplay(battle.warriorA);
  const b = cloneForReplay(battle.warriorB);
  a.salud = a.saludMax;
  a.ki = a.kiMax;
  a.esquivaPendiente = false;
  b.salud = b.saludMax;
  b.ki = b.kiMax;
  b.esquivaPendiente = false;

  const { log } = battle;
  if (log.length === 0) {
    return { warriorA: a, warriorB: b };
  }
  const upTo = Math.max(0, Math.min(lineIndex, log.length - 1));

  for (let i = 0; i <= upTo; i++) {
    applyLogLineToWarriors(a, b, log[i] ?? "");
  }
  return { warriorA: a, warriorB: b };
}

function sideFromLogPlayerIndex(m: string | undefined): "A" | "B" {
  return m === "1" ? "A" : "B";
}

function wSide(A: WarriorSnapshot, B: WarriorSnapshot, s: "A" | "B") {
  return s === "A" ? A : B;
}

/** Applies one log line to the simulated state. */
function applyLogLineToWarriors(
  a: WarriorSnapshot,
  b: WarriorSnapshot,
  line: string,
): void {
  if (!line) return;

  if (line.includes("Combate iniciado:")) {
    return;
  }

  if (line.match(/^Turno del jugador ([12])\.?$/)) {
    return;
  }

  if (
    /gana!/.test(line) ||
    (line.startsWith("¡") && /gana!/.test(line)) ||
    line.includes("vence") ||
    /Empate/.test(line)
  ) {
    return;
  }

  const atkM = line.match(
    /^(.+?) \(jugador ([12])\) usa (.+)\.$/u,
  );
  if (atkM) {
    const j = sideFromLogPlayerIndex(atkM[2]);
    const atName = atkM[3].trim();
    const actor = wSide(a, b, j);
    const at = actor.ataques.find((x) => x.nombre === atName);
    if (at) {
      actor.ki = Math.max(0, actor.ki - at.costoEnergia);
    }
    return;
  }

  const recM = line.match(
    /^(.+?) \(jugador ([12])\) recarga Ki \((\d+) → (\d+)\)\.$/u,
  );
  if (recM) {
    const j = sideFromLogPlayerIndex(recM[2]);
    const k = Math.min(
      wSide(a, b, j).kiMax,
      Math.max(0, parseInt(recM[4], 10) || 0),
    );
    wSide(a, b, j).ki = k;
    return;
  }

  if (line.includes("se prepara para esquivar")) {
    const prep = line.match(
      /^(.+?) \(jugador ([12])\) se prepara para esquivar el próximo golpe\.$/u,
    );
    if (prep) {
      const j = sideFromLogPlayerIndex(prep[2]);
      wSide(a, b, j).esquivaPendiente = true;
    }
    return;
  }

  const esqM = line.match(/^¡(.+?) esquivó el ataque!$/u);
  if (esqM) {
    const name = esqM[1].trim();
    if (a.nombre === name) a.esquivaPendiente = false;
    if (b.nombre === name) b.esquivaPendiente = false;
    return;
  }

  if (line.match(/.+ falló el esquive\./u)) {
    return;
  }

  const dmgM = line.match(
    /^(.+?) recibió (\d+) de daño\. Salud restante: (\d+)\.$/u,
  );
  if (dmgM) {
    const name = dmgM[1].trim();
    const sal = Math.max(0, parseInt(dmgM[3], 10) || 0);
    if (a.nombre === name) a.salud = sal;
    else if (b.nombre === name) b.salud = sal;
  }
}

/**
 * Which side is active (highlight) after reading through line `i` (inclusive).
 * If line i’s action already closed a turn, line i+1 may be a "Turno…" line →
 * read-ahead is used to align with the current turn.
 */
export function turnSideAtLogIndex(
  log: string[],
  i: number,
): "A" | "B" | null {
  if (i < 0 || !log.length) return "A";
  if (/gana!/.test(log[i] ?? "")) return null;
  if (i + 1 < log.length && /gana!/.test(log[i + 1] ?? "")) {
    return null;
  }
  if (isTurnLine(log[i] ?? "")) {
    return sideFromTurnLine(log[i]!);
  }
  if (i + 1 < log.length && isTurnLine(log[i + 1] ?? "")) {
    return sideFromTurnLine(log[i + 1]!);
  }
  for (let j = i; j >= 0; j--) {
    if (isTurnLine(log[j] ?? "")) {
      return sideFromTurnLine(log[j]!);
    }
  }
  const m0 = (log[0] ?? "").match(/Turno del jugador ([12])\./);
  if (m0) return m0[1] === "1" ? "A" : "B";
  return "A";
}

function isTurnLine(s: string): boolean {
  return /^Turno del jugador [12]\./.test(s);
}

function sideFromTurnLine(s: string): "A" | "B" {
  const m = s.match(/^Turno del jugador ([12])\./);
  if (!m) return "A";
  return m[1] === "1" ? "A" : "B";
}

export function parseDamageOnLine(
  line: string,
  battle: Battle,
): { side: "A" | "B"; amount: number } | null {
  const dmgM = line.match(
    /^(.+?) recibió (\d+) de daño\. Salud restante: (\d+)\./u,
  );
  if (!dmgM) return null;
  const name = dmgM[1].trim();
  const amount = Math.max(0, parseInt(dmgM[2], 10) || 0);
  if (name === battle.warriorA.nombre) return { side: "A", amount };
  if (name === battle.warriorB.nombre) return { side: "B", amount };
  return null;
}
