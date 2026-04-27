/**
 * Roster, torneo y salas (una sola fuente de verdad; DRY).
 * Orden de desbloqueo = orden en seed (goku…bardock).
 */
export const ROSTER_INITIAL_UNLOCK_COUNT = 4;
export const ROSTER_PARTIDAS_POR_RIVAL_PARA_BONUS = 3;
/** Slugs de guerrero en el mismo orden que `seed.service` insertMany. */
export const WARRIOR_SLUGS_UNLOCK_ORDER: readonly string[] = [
  'goku',
  'vegeta',
  'piccolo',
  'freezer',
  'gohan',
  'celula',
  'trunks',
  'krillin',
  'tenshinhan',
  'android18',
  'broly',
  'majin_buu',
  'beerus',
  'whis',
  'jiren',
  'toppo',
  'dyspo',
  'android17',
  'gogeta',
  'vegetto',
  'janemba',
  'bardock',
  'roshi',
  'yamcha',
  'raditz',
  'nappa',
  'gotenks',
  'videl',
] as const;

export const TOURNAMENT_WINDOW_DAYS = 7;
export const TOP_TOURNAMENT_STANDINGS = 4;

export const ROOM_TTL_MS = 60 * 60 * 1000;
export const ROOM_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
export const ROOM_CODE_LEN = 6;

export const BATTLE_DODGE_CHANCE = 0.35;
export const BATTLE_RECHARGE_KI = 30;
export const BATTLE_GUEST_MAX_PER_HOUR_DEFAULT = 32;
export const BATTLE_GUEST_MAX_PER_HOUR_CAP = 200;
