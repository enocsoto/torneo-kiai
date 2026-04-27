/**
 * Nombres de pantalla (español latino, referencia doblaje mexicano clásico y DBS).
 * - Cell: se usa "Cell" (como en créditos del doblaje), no "Celula" / "Célula" (España o trad literales).
 * - Bills: nombre usado en Dragon Ball Super (latino) para el Dios de la destrucción; la API/ROM suelen decir "Beerus"/"Bills".
 * Fuente general: Doblaje Wiki, transmisiones Oficiales en Latinoamérica.
 */
export const WARRIOR_NOMBRE_DISPLAY_BY_SLUG: Readonly<Record<string, string>> =
  {
    goku: 'Son Gokú',
    vegeta: 'Vegeta',
    piccolo: 'Piccolo',
    freezer: 'Freezer',
    gohan: 'Son Gohan',
    celula: 'Cell',
    trunks: 'Trunks',
    krillin: 'Krilin',
    tenshinhan: 'Tenshinhan',
    android18: 'Androide 18',
    broly: 'Broly',
    majin_buu: 'Majin Buu',
    beerus: 'Bills',
    whis: 'Whis',
    jiren: 'Jiren',
    toppo: 'Toppo',
    dyspo: 'Dyspo',
    android17: 'Androide 17',
    gogeta: 'Gogeta',
    vegetto: 'Vegito',
    janemba: 'Janemba',
    bardock: 'Bardock',
    roshi: 'Maestro Roshi',
    yamcha: 'Yamcha',
    raditz: 'Raditz',
    nappa: 'Nappa',
    gotenks: 'Gotenks',
    videl: 'Videl',
  };
