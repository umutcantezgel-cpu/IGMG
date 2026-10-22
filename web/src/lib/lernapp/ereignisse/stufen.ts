import { SPRACH_STUFEN } from '../kurse';

/**
 * „Stufe abgeschlossen“ je Sprachkurs (ADR 0043 Nr. 5 „Stufe je Kurs abgeschlossen (A1–C1)“, L4-03) – rein und klein, ohne den
 * Katalog der Abzeichen: Der Lernpfad liest damit aus dem Speicher `lektionen`, welche Stufen dieses Kurses geschafft sind;
 * `abzeichen.ts` nutzt dieselbe Regel für die Abzeichen `stufe-a1` … `stufe-c1` (eines je Stufe, gleich in welchem Kurs).
 *
 * Regel: In einem Sprachkurs sind die Prüfsteine aller Einheiten der Stufe geschafft (Zahl je Stufe nach Rahmenplan). Der
 * Prüfstein zählt nur, wenn sein Lektionsschlüssel `<kurs>.<stufe>.<einheit>.<lektion>` zum Kurs des Ereignisses passt.
 * „Stufe abgeschlossen“ heißt nie „Zertifikat“ (KERN 4.0 §1).
 */

export type SprachStufe = (typeof SPRACH_STUFEN)[number];

/** Einheiten je Sprachstufe laut Rahmenplan (gleich für de, tr, ar; Unit-Test gegen `inhalte/lernapp/rahmen/*.rahmen.json`). */
export const EINHEITEN_JE_STUFE: Readonly<Record<SprachStufe, number>> = { a1: 12, a2: 14, b1: 16, b2: 16, c1: 14 };

/** Zerlegt einen Lektionsschlüssel `<kurs>.<stufe>.<einheit>.<lektion>`; `null` bei anderer Form. */
export function lektionsTeile(lektion: string): { kurs: string; stufe: string; einheit: string } | null {
  const t = lektion.split('.');
  if (t.length < 4) return null;
  const [kurs, stufe, einheit] = t as [string, string, string];
  return { kurs, stufe, einheit };
}

/** Zielsprache eines Sprachkurses (`tr-aus-de` → `tr`), sonst `null`. */
export function zielspracheVon(kurs: string): 'de' | 'tr' | 'ar' | null {
  const m = /^(de|tr|ar)-aus-(?:de|tr|ar)$/.exec(kurs);
  return m ? (m[1] as 'de' | 'tr' | 'ar') : null;
}

const istSprachStufe = (s: string): s is SprachStufe => Object.hasOwn(EINHEITEN_JE_STUFE, s);

/** Geschaffter Prüfstein eines Sprachkurses: Stufe und Einheit, sonst `null` (andere Art, anderer Kurs, keine Sprachstufe). */
export function pruefsteinDerStufe(kurs: string, lektion: string, art: string): { stufe: SprachStufe; einheit: string } | null {
  if (art !== 'pruefstein' || !zielspracheVon(kurs)) return null;
  const t = lektionsTeile(lektion);
  return t && t.kurs === kurs && istSprachStufe(t.stufe) ? { stufe: t.stufe, einheit: t.einheit } : null;
}

/** Zählt geschaffte Prüfsteine je Kurs und Stufe; `zaehle` meldet, ob die Stufe damit (spätestens jetzt) abgeschlossen ist. */
export function stufenZaehler(): (kurs: string, lektion: string, art: string) => SprachStufe | null {
  const einheiten = new Map<string, Set<string>>();
  return (kurs, lektion, art) => {
    const p = pruefsteinDerStufe(kurs, lektion, art);
    if (!p) return null;
    const schluessel = `${kurs}.${p.stufe}`;
    const menge = einheiten.get(schluessel) ?? new Set<string>();
    einheiten.set(schluessel, menge.add(p.einheit));
    return menge.size >= EINHEITEN_JE_STUFE[p.stufe] ? p.stufe : null;
  };
}

/**
 * Abgeschlossene Stufen je Sprachkurs aus geschafften Lektionen (Speicher `lektionen` oder Ereignisse), in der Reihenfolge
 * A1 … C1; Kurse ohne abgeschlossene Stufe fehlen.
 */
export function abgeschlosseneStufen(lektionen: Iterable<{ kurs: string; lektion: string; art: string }>): Map<string, SprachStufe[]> {
  const zaehle = stufenZaehler();
  const fertig = new Map<string, Set<SprachStufe>>();
  for (const l of lektionen) {
    const stufe = zaehle(l.kurs, l.lektion, l.art);
    if (stufe) fertig.set(l.kurs, (fertig.get(l.kurs) ?? new Set()).add(stufe));
  }
  return new Map([...fertig].map(([kurs, s]) => [kurs, SPRACH_STUFEN.filter((x) => s.has(x))]));
}
