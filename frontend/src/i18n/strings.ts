export type Locale = "es" | "en";

import { stringsCommon } from "./strings-common";
import { stringsNav } from "./strings-nav";
import { stringsHome } from "./strings-home";
import { stringsBattle } from "./strings-battle";
import { stringsRank } from "./strings-rank";
import { stringsHistory } from "./strings-history";
import { stringsSkills } from "./strings-skills";
import { stringsOnline } from "./strings-online";
import { stringsOop } from "./strings-oop";
import { stringsIdentity } from "./strings-identity";
import { stringsSupport } from "./strings-support";
import { stringsAbout } from "./strings-about";

export const strings: Record<Locale, Record<string, string>> = {
  es: {
    ...stringsCommon.es,
    ...stringsNav.es,
    ...stringsHome.es,
    ...stringsBattle.es,
    ...stringsRank.es,
    ...stringsHistory.es,
    ...stringsSkills.es,
    ...stringsOnline.es,
    ...stringsOop.es,
    ...stringsIdentity.es,
    ...stringsSupport.es,
    ...stringsAbout.es,
  },
  en: {
    ...stringsCommon.en,
    ...stringsNav.en,
    ...stringsHome.en,
    ...stringsBattle.en,
    ...stringsRank.en,
    ...stringsHistory.en,
    ...stringsSkills.en,
    ...stringsOnline.en,
    ...stringsOop.en,
    ...stringsIdentity.en,
    ...stringsSupport.en,
    ...stringsAbout.en,
  },
};

export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{([^}]+)\}/g, (_, k: string) => {
    const key = k.trim();
    return String(vars[key] ?? "");
  });
}
