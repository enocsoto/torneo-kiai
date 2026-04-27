import { getApiBase } from "./api-base";
import type {
  Battle,
  BattleSummary,
  CreateOnlineRoomResult,
  OnlineRoomState,
  ProgresoEvento,
  RosterState,
  TorneoStandings,
  Warrior,
  WarriorSkillConfig,
} from "./types";

const base = getApiBase();

function parseErrorBody(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const msg = o.message;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg.map(String).join(", ");
  if (typeof o.error === "string") return o.error;
  return null;
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string>),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body: unknown = await res.json();
      msg = parseErrorBody(body) ?? msg;
    } catch {
      try {
        msg = await res.text();
      } catch {
        /* keep statusText */
      }
    }
    throw new Error((msg || `HTTP ${res.status}`).trim());
  }
  return res.json() as Promise<T>;
}

export const api = {
  warriors: (guestId?: string | null) =>
    json<Warrior[]>(
      guestId
        ? `/warriors?guestId=${encodeURIComponent(guestId)}`
        : "/warriors",
    ),
  createBattle: (
    warriorAId: string,
    warriorBId: string,
    options?: { guestId?: string | null; player1Progress?: boolean },
  ) =>
    json<Battle>("/battles", {
      method: "POST",
      body: JSON.stringify({
        warriorAId,
        warriorBId,
        ...(options?.guestId ? { guestId: options.guestId } : {}),
        ...(options && "player1Progress" in options
          ? { progresoJugador1: options.player1Progress }
          : {}),
      }),
    }),
  warriorRankings: (limit = 30) =>
    json<{ slug: string; wins: number }[]>(
      `/rankings/warriors?limit=${limit}`,
    ),
  personalWarriorWins: (guestId: string, limit = 30) =>
    json<{ slug: string; wins: number }[]>(
      `/battles/personal-warrior-wins?guestId=${encodeURIComponent(guestId)}&limit=${limit}`,
    ),
  battle: (id: string) => json<Battle>(`/battles/${id}`),
  recentBattles: (limit = 10, skip = 0) =>
    json<BattleSummary[]>(`/battles/recent?limit=${limit}&skip=${skip}`),
  skillConfig: (warriorId: string, guestId: string) =>
    json<WarriorSkillConfig>(
      `/progress/warrior/${encodeURIComponent(warriorId)}?guestId=${encodeURIComponent(guestId)}`,
    ),
  setSkillBonus: (
    warriorId: string,
    body: { guestId: string; claves: string[] },
  ) =>
    json<{ ok: true; selectedClaves: string[] }>(
      `/progress/warrior/${encodeURIComponent(warriorId)}/bonus`,
      { method: "PATCH", body: JSON.stringify(body) },
    ),
  battleAction: (
    id: string,
    body: { type: string; attackIndex?: number; guestId?: string },
  ) =>
    json<Battle & { progresoEvento?: ProgresoEvento }>(
      `/battles/${id}/action`,
      {
        method: "POST",
        body: JSON.stringify(body),
      },
    ),
  createOnlineRoom: (body: { guestId: string; hostWarriorId: string }) =>
    json<CreateOnlineRoomResult>("/rooms/online", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getOnlineRoom: (code: string) =>
    json<OnlineRoomState>(
      `/rooms/online/${encodeURIComponent(code)}`,
    ),
  joinOnlineRoom: (
    code: string,
    body: { joinerGuestId: string; joinerWarriorId: string },
  ) =>
    json<{ battle: Battle; code: string }>(
      `/rooms/online/${encodeURIComponent(code)}/join`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  tournamentStandings: (days = 7) =>
    json<TorneoStandings>(`/tournament/standings?days=${days}`),
  rosterState: (guestId: string) =>
    json<RosterState>(
      `/progress/roster?guestId=${encodeURIComponent(guestId)}`,
    ),
};

export interface PlayerSessionResult {
  guestId: string;
  alias: string;
}

export interface PlayerHintResult {
  hasPin: boolean;
  exists: boolean;
}

export const players = {
  register: (alias: string, pin?: string): Promise<PlayerSessionResult> =>
    json<PlayerSessionResult>("/players/register", {
      method: "POST",
      body: JSON.stringify({ alias, ...(pin ? { pin } : {}) }),
    }),

  login: (alias: string, pin?: string): Promise<PlayerSessionResult> =>
    json<PlayerSessionResult>("/players/login", {
      method: "POST",
      body: JSON.stringify({ alias, ...(pin ? { pin } : {}) }),
    }),

  available: (alias: string): Promise<{ available: boolean }> =>
    json<{ available: boolean }>(
      `/players/available?alias=${encodeURIComponent(alias)}`,
    ),

  hint: (alias: string): Promise<PlayerHintResult> =>
    json<PlayerHintResult>(
      `/players/hint?alias=${encodeURIComponent(alias)}`,
    ),
};

export async function pingHealth(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(`${base}/health`, {
      cache: "no-store",
      signal: ctrl.signal,
    });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}
