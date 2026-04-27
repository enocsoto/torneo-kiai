export type Attack = {
  _id: string;
  clave?: string;
  nombre: string;
  daño: number;
  costoEnergia: number;
};

export type Evolution = {
  _id: string;
  clave?: string;
  nombre: string;
  multiplicadorDaño: number;
  multiplicadorDefensa: number;
};

export type Warrior = {
  _id: string;
  slug: string;
  nombre: string;
  imageUrl?: string;
  saludBase: number;
  kiBase: number;
  defensa: number;
  estado: string;
  ataques: Attack[];
  evolucionActiva?: Evolution | null;
  /** Only when GET /warriors is called without guestId (full list). With guestId the API returns only unlocked warriors. */
  rosterLocked?: boolean;
};

export type AttackSnapshot = {
  nombre: string;
  daño: number;
  costoEnergia: number;
};

export type WarriorSnapshot = {
  warriorId: string;
  slug: string;
  nombre: string;
  imageUrl?: string;
  salud: number;
  saludMax: number;
  ki: number;
  kiMax: number;
  defensa: number;
  estado: string;
  ataques: AttackSnapshot[];
  esquivaPendiente: boolean;
};

export type ProgresoEvento = {
  aprendioAtaque: boolean;
  nombreAtaque?: string;
  evolucionDesbloqueada?: boolean;
  nombreEvolucion?: string;
  evolucionWarriorId?: string;
  evolucionWarriorSlug?: string;
  evolucionWarriorNombre?: string;
};

export type HabilidadPoolEntry = {
  clave: string;
  nombre: string;
  daño: number;
  costoEnergia: number;
};

export type WarriorSkillConfig = {
  guerreroNombre: string;
  wins: number;
  bonusSlots: number;
  pool: HabilidadPoolEntry[];
  selectedClaves: string[];
};

export type Battle = {
  _id: string;
  warriorA: WarriorSnapshot;
  warriorB: WarriorSnapshot;
  activeSide: "A" | "B";
  status: "active" | "finished";
  winnerSide?: "A" | "B";
  log: string[];
  conProgresoJ1?: boolean;
  conProgresoJ2?: boolean;
  guestJugador2?: string;
  modo?: "local" | "couch" | "online";
  roomCode?: string;
  /** Guest for player 1 (same as host guest id). */
  guestId?: string;
  /** Only on POST /battles/:id/action when unlocking a new attack. */
  progresoEvento?: ProgresoEvento;
};

export type RosterState = {
  unlockedCount: number;
  totalInOrder: number;
  unlockedSlugs: string[];
  partidasBySlug: Record<string, number>;
  requisitoPartidas: number;
  faltanParaDesbloqueo: { slug: string; partidas: number; falta: number }[];
  puedeDesbloquear: boolean;
  siguienteSlug: string | null;
};

export type OnlineRoomState = {
  code: string;
  status: string;
  hasBattle: boolean;
  battleId: string | null;
};

export type CreateOnlineRoomResult = {
  code: string;
  shareUrl: string;
  expiresAt: string;
};

export type TorneoStandings = {
  ventanaDias: number;
  desde: string;
  top: { pos: number; guestId: string; displayId: string; victorias: number }[];
  leyenda: string;
};

export type BattleSummary = {
  id: string;
  status: "active" | "finished";
  winnerSide: "A" | "B" | null;
  jugador1?: string;
  jugador2?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BattleActionType = "ATTACK" | "RECHARGE" | "DODGE";
