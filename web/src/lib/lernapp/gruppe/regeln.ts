import { addiereTage, wochenbeginn } from '../ereignisse/serie';

/**
 * Reine Regeln für Gruppen, Familien und Bestenliste der Lern-App (L7-02; ADR 0043 Nr. 7/8; KERN 4.0 §5; L3-E02). Ohne
 * Datenbank, unit-testbar; die Abfragen in `dienst.ts` entscheiden nur hierüber.
 *
 * - **Ab 16 im Code:** Kinderkonten (`istKind`) erscheinen nie in einer Bestenliste und sehen keine; mit Lerndatensatz erst
 *   ab dem Tag `sechzehnAm`, ohne bekanntes Datum vorsichtig „unter 16“ (wie `konto/sechzehn.ts`). Konten ohne
 *   Lerndatensatz sind Gemeinde-Konten, die es erst ab 16 gibt.
 * - **Freiwillig und gegenseitig:** in der Liste steht nur, wer selbst zugestimmt hat und mit Einwilligung `lernapp`
 *   abgleicht – und nur diese Personen sehen die Liste (`siehtBestenliste`).
 * - **Ohne Druck:** Wochen-XP, Vorname und Initial, keine Ränge oder Medaillen; gleiche XP ordnen nach dem Namen.
 * - **Gruppenziel:** Summe ohne Namen, erst ab `MINDEST_TEILNEHMENDE` Lernenden mit Einwilligung (DSFA-Entwurf M-L14).
 */

/** Wochenziele des Gruppenziels in XP (Auswahl der Lehrkraft); `null` = kein Gruppenziel. */
export const WOCHENZIELE = [50, 100, 200, 300, 500, 1000] as const;
export type Wochenziel = (typeof WOCHENZIELE)[number];
export const istWochenziel = (n: unknown): n is Wochenziel => (WOCHENZIELE as readonly unknown[]).includes(n);

/** Mindestzahl Lernender mit Einwilligung, ab der die Summe des Gruppenziels erscheint (sonst ließe sie auf Einzelne schließen). */
export const MINDEST_TEILNEHMENDE = 3;

/** Lernwoche Montag bis Sonntag (Lerntage `JJJJ-MM-TT`, wie `lernapp_tag.tag`). */
export type Woche = { von: string; bis: string; tage: string[] };

export function wocheVon(heute: string): Woche {
  const von = wochenbeginn(heute);
  const tage = Array.from({ length: 7 }, (_, i) => addiereTage(von, i));
  return { von, bis: tage[6]!, tage };
}

export type Alterslage = {
  istKind: boolean;
  /** Das Konto gehört zu einem Lerndatensatz (Schülerkonto oder Kinderzugang). */
  hatLerndatensatz: boolean;
  sechzehnAm: string | null;
};

/** Ab 16 (Sperre im Code, nicht im Schalter; ADR 0043 Nr. 8). */
export function abSechzehn(a: Alterslage, heute: string): boolean {
  if (a.istKind) return false;
  if (!a.hatLerndatensatz) return true;
  return a.sechzehnAm !== null && a.sechzehnAm <= heute;
}

/** Vorname und Initial (S-14): „Vorname N.“; ein einzelnes Wort bleibt, wie es ist. */
export function kurzname(anzeigename: string): string {
  const teile = anzeigename.trim().split(/\s+/).filter(Boolean);
  if (!teile.length) return '';
  const vorname = teile[0]!;
  if (teile.length === 1) return vorname;
  const letztes = teile[teile.length - 1]!;
  const initial = [...letztes][0] ?? '';
  return initial ? `${vorname} ${initial.toLocaleUpperCase('de')}.` : vorname;
}

export type Kandidat = {
  benutzerId: string;
  anzeigename: string;
  alter: Alterslage;
  /** eigene Zustimmung zur Bestenliste */
  zustimmung: boolean;
  /** Einwilligung `lernapp` gilt (ohne sie gibt es keinen Stand auf dem Server) */
  einwilligung: boolean;
  wochenXp: number;
};

export type Platz = { benutzerId: string; name: string; xp: number };

/** Steht das Konto in der Bestenliste? Ab 16, eigene Zustimmung und Einwilligung `lernapp`. */
export function erscheint(k: Pick<Kandidat, 'alter' | 'zustimmung' | 'einwilligung'>, heute: string): boolean {
  return abSechzehn(k.alter, heute) && k.zustimmung && k.einwilligung;
}

/**
 * Sieht das Konto Bestenlisten? Gegenseitiger Kreis (DSFA-Entwurf LA-V7, Einwilligungsentwurf EL4): nur, wer selbst in
 * der Liste stehen darf – ab 16, eigene Zustimmung und Einwilligung `lernapp`. Wer nicht zugestimmt hat, bekommt nur das
 * Angebot zur Zustimmung, keine Namen.
 */
export function siehtBestenliste(k: Pick<Kandidat, 'alter' | 'zustimmung' | 'einwilligung'>, heute: string): boolean {
  return erscheint(k, heute);
}

/** Bestenliste: nur, wer erscheinen darf; Wochen-XP absteigend, bei Gleichstand nach Name; doppelte Konten einmal. */
export function bestenliste(kandidaten: readonly Kandidat[], heute: string): Platz[] {
  const gesehen = new Set<string>();
  const liste: Platz[] = [];
  for (const k of kandidaten) {
    if (gesehen.has(k.benutzerId) || !erscheint(k, heute)) continue;
    gesehen.add(k.benutzerId);
    liste.push({ benutzerId: k.benutzerId, name: kurzname(k.anzeigename), xp: Math.max(0, Math.trunc(k.wochenXp)) });
  }
  return liste.sort((a, b) => b.xp - a.xp || a.name.localeCompare(b.name, 'de') || a.benutzerId.localeCompare(b.benutzerId));
}

export type GruppenzielStand =
  { ziel: number; summe: number; erreicht: boolean; anteil: number; zuWenige: false } | { ziel: number; zuWenige: true };

/**
 * Gruppenziel (ADR 0043 Nr. 7): Summe der Wochen-XP gegen das Wochenziel, ohne Namen. `xpJeTeilnehmer` enthält je
 * Lernende/n mit Einwilligung die Wochen-XP (auch 0). Unter `MINDEST_TEILNEHMENDE` nur das Ziel ohne Summe.
 */
export function gruppenziel(ziel: number | null, xpJeTeilnehmer: readonly number[]): GruppenzielStand | null {
  if (ziel === null || !(ziel > 0)) return null;
  if (xpJeTeilnehmer.length < MINDEST_TEILNEHMENDE) return { ziel, zuWenige: true };
  const summe = xpJeTeilnehmer.reduce((s, x) => s + Math.max(0, Math.trunc(x)), 0);
  return { ziel, summe, erreicht: summe >= ziel, anteil: Math.min(1, summe / ziel), zuWenige: false };
}

export type TagStand = { tag: string; xp: number; lektionen: number; pause: boolean };
export type WochenTag = TagStand & { gelernt: boolean };

/** Lernwoche (Eltern, Lehrkraft): je Tag XP und Lektionen; fehlende Tage zählen 0. */
export function lernwoche(woche: Woche, tage: readonly TagStand[]): WochenTag[] {
  const nach = new Map(tage.map((t) => [t.tag, t]));
  return woche.tage.map((tag) => {
    const t = nach.get(tag);
    const xp = Math.max(0, t?.xp ?? 0);
    const lektionen = Math.max(0, t?.lektionen ?? 0);
    return { tag, xp, lektionen, pause: t?.pause ?? false, gelernt: xp > 0 || lektionen > 0 };
  });
}

/**
 * Tagessummen je Kurs (`lernapp_tag_kurs`) zu Tagen zusammenfassen – für den Stand der Lehrkraft, die nur die Kurse der
 * Zuweisungen ihrer Gruppe sieht (D-L03, S-L3 M-1). Pausen gehören zu keinem Kurs und erscheinen dort nicht.
 */
export function tageAusKursen(zeilen: readonly { tag: string; xp: number; lektionen: number }[]): TagStand[] {
  const je = new Map<string, TagStand>();
  for (const z of zeilen) {
    const t = je.get(z.tag) ?? { tag: z.tag, xp: 0, lektionen: 0, pause: false };
    t.xp += Math.max(0, z.xp);
    t.lektionen += Math.max(0, z.lektionen);
    je.set(z.tag, t);
  }
  return [...je.values()];
}

/** Summen einer Lernwoche: XP, Lektionen, Lerntage. */
export function wochenSumme(tage: readonly WochenTag[]): { xp: number; lektionen: number; lerntage: number } {
  return tage.reduce((s, t) => ({ xp: s.xp + t.xp, lektionen: s.lektionen + t.lektionen, lerntage: s.lerntage + (t.gelernt ? 1 : 0) }), {
    xp: 0,
    lektionen: 0,
    lerntage: 0,
  });
}

/**
 * Sehen Eltern die Lernwoche ihres Kindes? Nur bis zum Ende des Übergangs nach dem 16. Geburtstag (30 Tage, D-11); danach
 * entscheidet die oder der Jugendliche selbst – bis eine eigene Freigabe gebaut ist, sehen Eltern dann nichts mehr
 * (Entwurf EL3 „nur wenn ich es erlaube“).
 */
export function elternSehenLernwoche(lage: 'eltern' | 'uebergang' | 'eigene'): boolean {
  return lage !== 'eigene';
}
