/**
 * Sprachen, Kurse, Richtungen und Stufen der Lern-App (ADR 0037 Nr. 1/7, L3-E04, L3-E08, L3-E11; PLAN §3.1, §3.9).
 * Rein, ohne Abhängigkeiten (auch im Client nutzbar, KERN 4.0 §9). Andere Pakete importieren diese Werte nur von hier; die
 * Enums im Schema (`web/src/lib/db/schema/lernapp.ts`) stimmen damit überein (Unit-Test `lernapp/kurse`).
 */

/** Oberflächensprachen. Getrennt von `routing.locales` der Website (de/tr/en): `ar` kommt nie ins next-intl-Routing. */
export const OBERFLAECHEN = ['de', 'tr', 'ar'] as const;
export type Oberflaeche = (typeof OBERFLAECHEN)[number];
/** Ohne Angabe (`/lern-app`) und für Links aus der englischen Website. */
export const STANDARD_OBERFLAECHE: Oberflaeche = 'de';

/** Sprachen der Inhalte: Ziel- und Ausgangssprachen der Sprachkurse (dieselben drei wie die Oberfläche). */
export const SPRACHEN = OBERFLAECHEN;
export type Sprache = Oberflaeche;

export function istOberflaeche(wert: unknown): wert is Oberflaeche {
  return typeof wert === 'string' && (OBERFLAECHEN as readonly string[]).includes(wert);
}
export const istSprache = istOberflaeche;

/** Schreibrichtung: Arabisch vollständig von rechts nach links (ADR 0037 Nr. 6). */
export function richtung(sprache: Sprache): 'ltr' | 'rtl' {
  return sprache === 'ar' ? 'rtl' : 'ltr';
}

/** Kurse in der Datenbank (`lernapp_kurs.id`): je Zielsprache ein Korpus, dazu Wissen und Koran-Arabisch. */
export const KURSE = ['de', 'tr', 'ar', 'islam', 'koran'] as const;
export type KursId = (typeof KURSE)[number];
export const KURS_ARTEN = ['sprache', 'wissen', 'koran'] as const;
export type KursArt = (typeof KURS_ARTEN)[number];

export function istKurs(wert: unknown): wert is KursId {
  return typeof wert === 'string' && (KURSE as readonly string[]).includes(wert);
}

export function kursArt(kurs: KursId): KursArt {
  if (kurs === 'islam') return 'wissen';
  if (kurs === 'koran') return 'koran';
  return 'sprache';
}

/** Sprache des Inhalts: Wissen nur Deutsch (L3-E01), Koran-Arabisch Arabisch, sonst die Zielsprache. */
export function inhaltSprache(kurs: KursId): Sprache {
  if (kurs === 'islam') return 'de';
  if (kurs === 'koran') return 'ar';
  return kurs;
}

/** Die sechs Richtungen der Sprachkurse: `<ziel>-aus-<ausgang>` (Nutzerentscheidung, AUFTRAG §1). */
export const RICHTUNGEN = ['tr-aus-de', 'ar-aus-de', 'de-aus-tr', 'ar-aus-tr', 'de-aus-ar', 'tr-aus-ar'] as const;
export type RichtungId = (typeof RICHTUNGEN)[number];

export function istRichtung(wert: unknown): wert is RichtungId {
  return typeof wert === 'string' && (RICHTUNGEN as readonly string[]).includes(wert);
}

export function zerlegeRichtung(r: RichtungId): { ziel: Sprache; ausgang: Sprache } {
  const [ziel, , ausgang] = r.split('-') as [Sprache, 'aus', Sprache];
  return { ziel, ausgang };
}

/** Richtung aus Ziel- und Ausgangssprache; gleiche Sprachen ergeben keine Richtung. */
export function richtungVon(ziel: Sprache, ausgang: Sprache): RichtungId | null {
  const id = `${ziel}-aus-${ausgang}`;
  return istRichtung(id) ? id : null;
}

/** Richtungen für eine Ausgangssprache (Standard: gleich der Oberflächensprache, ADR 0037 Nr. 7). */
export function richtungenAus(ausgang: Sprache): RichtungId[] {
  return RICHTUNGEN.filter((r) => zerlegeRichtung(r).ausgang === ausgang);
}

/** Kurse in der Adresse `/lern-app/[ui]/[kurs]`: sechs Richtungen, Wissen, Koran-Arabisch (L3-E11). */
export const KURS_SLUGS = [...RICHTUNGEN, 'islam', 'koran'] as const;
export type KursSlug = (typeof KURS_SLUGS)[number];

export function istKursSlug(wert: unknown): wert is KursSlug {
  return typeof wert === 'string' && (KURS_SLUGS as readonly string[]).includes(wert);
}

/** Kurs in der Datenbank zum Slug der Adresse: Richtung → Zielsprache. */
export function kursVonSlug(slug: KursSlug): KursId {
  return istRichtung(slug) ? zerlegeRichtung(slug).ziel : slug;
}

/**
 * Ist der Kurs in dieser Oberfläche erreichbar? Wissen in jeder Oberfläche (mit Hinweis „auf Deutsch“); Koran-Arabisch
 * nicht in der arabischen Oberfläche, Bedeutungen gibt es auf Deutsch oder Türkisch (ADR 0037 Nr. 7, L3-E07).
 */
export function kursInOberflaeche(slug: KursSlug, ui: Oberflaeche): boolean {
  return !(slug === 'koran' && ui === 'ar');
}

/** Alle statischen Paare `[ui, kurs]` der Lernpfade (3 × 8 minus Koran-Arabisch in `ar`). */
export function kursPfade(): { ui: Oberflaeche; kurs: KursSlug }[] {
  return OBERFLAECHEN.flatMap((ui) => KURS_SLUGS.filter((kurs) => kursInOberflaeche(kurs, ui)).map((kurs) => ({ ui, kurs })));
}

/** Stufen: GER-Niveaus der Sprachkurse (L3-E04), eigene Stufen für Wissen und Koran-Arabisch. */
export const SPRACH_STUFEN = ['a1', 'a2', 'b1', 'b2', 'c1'] as const;
export const EIGENE_STUFEN = ['grund', 'aufbau', 'vertiefung'] as const;
export const STUFEN = [...SPRACH_STUFEN, ...EIGENE_STUFEN] as const;
export type Stufe = (typeof STUFEN)[number];

export function stufenVon(kurs: KursId): readonly Stufe[] {
  return kursArt(kurs) === 'sprache' ? SPRACH_STUFEN : EIGENE_STUFEN;
}

export function istStufe(kurs: KursId, wert: unknown): wert is Stufe {
  return typeof wert === 'string' && (stufenVon(kurs) as readonly string[]).includes(wert);
}

/**
 * Stabile Schlüssel (`ar.a1.e03`, `ar.a1.e03.l02`, `ar.a1.e03.s0042`): Kleinbuchstaben, Ziffern und Bindestrich, durch
 * Punkte getrennt, beginnend mit dem Kurs. Die Feinform (Einheit, Lektion, Satz) legt der Import fest (L1-05, L3-02).
 */
const SCHLUESSEL = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

export function istSchluesselVon(kurs: KursId, schluessel: unknown): schluessel is string {
  return typeof schluessel === 'string' && schluessel.length <= 120 && SCHLUESSEL.test(schluessel) && schluessel.startsWith(`${kurs}.`);
}

export type LernappBezug = { art: 'lernapp'; kurs: KursSlug; einheit?: string; lektion?: string };

/**
 * Prüft den Bezug einer Zuweisung (`aufgabe.bezug`, L3-E05): bekannter Kurs-Slug; die Einheit gehört zum Kurs, die Lektion
 * zur Einheit (Lektion nur mit Einheit). Ergebnis ist der bereinigte Bezug oder null. Ob es Einheit und Lektion gibt und ob
 * sie sichtbar sind, prüft der Aufrufer gegen die Datenbank.
 */
export function pruefeLernappBezug(wert: unknown): LernappBezug | null {
  if (!wert || typeof wert !== 'object') return null;
  const b = wert as Record<string, unknown>;
  if (b.art !== 'lernapp' || !istKursSlug(b.kurs)) return null;
  const kurs = b.kurs;
  const erlaubt = new Set(['art', 'kurs', 'einheit', 'lektion']);
  if (Object.keys(b).some((k) => !erlaubt.has(k))) return null;
  if (b.einheit === undefined && b.lektion === undefined) return { art: 'lernapp', kurs };
  if (!istSchluesselVon(kursVonSlug(kurs), b.einheit)) return null;
  const einheit = b.einheit;
  if (b.lektion === undefined) return { art: 'lernapp', kurs, einheit };
  if (typeof b.lektion !== 'string' || !b.lektion.startsWith(`${einheit}.`) || !istSchluesselVon(kursVonSlug(kurs), b.lektion)) return null;
  return { art: 'lernapp', kurs, einheit, lektion: b.lektion };
}
