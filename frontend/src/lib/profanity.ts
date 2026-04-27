/**
 * Blocked terms for aliases (mirrors the backend list).
 * Used on the client for instant feedback without a server round-trip.
 */
const PROFANITY: readonly string[] = [
  // Spanish (general)
  "puta", "puto", "putos", "putas", "mierda", "mierdas",
  "culo", "culos", "coño", "pene", "penes", "vagina",
  "perra", "perro", "verga", "vergas", "picha", "pollas", "polla",
  "cabron", "cabrona", "pendejo", "pendeja", "pendejos",
  "idiota", "imbecil", "gilipollas", "marica", "maricon",
  "joder", "hostia", "follar", "chinga", "chingada", "mamada",
  // Colombian / Latin American Spanish
  "gonorrea", "malparido", "malparida", "hijueputa", "hijuepucha",
  "hdp", "guevon", "guevona", "huevon", "cagada",
  "sapo", "mojon", "mojona", "berraco", "pirobos", "pirobo",
  // English
  "fuck", "fucker", "fucking", "shit", "bitch", "bitches",
  "cunt", "cock", "cocks", "dick", "dicks", "pussy",
  "ass", "asses", "asshole", "nigger", "nigga", "fag", "fags",
  "faggot", "whore", "whores", "slut", "sluts",
  "bastard", "motherfucker", "retard",
  // Generic / leetspeak
  "sex", "sexo", "porn", "porno", "xxx", "rape", "nazi", "hitler",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  return PROFANITY.some((word) => lower.includes(word));
}
