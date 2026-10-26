import { normalisiere } from '../../abgleich';
import { zerlegeRichtung } from '../../kurse';
import { ARABISCH } from '../../waechter/kern.mjs';
import type { Inhalte } from './dateien';
import { Befunde } from './typen';

/**
 * Prüfer „Übersetzung“ (Stufe C, Gegenprüfung Z-L01/Z-L14, Befund G1): Eine Übersetzung muss in der Ausgangssprache stehen.
 * Geprüft werden Haupttext und Alternativen jedes Übersetzungseintrags:
 * - **Kopie des Zieltexts:** mindestens {@link MIN_WOERTER} Wörter und in der Vergleichsform gleich dem Zieltext (z. B. der
 *   deutsche Quellsatz als „türkische“ Übersetzung in de-aus-tr);
 * - **falsche Schrift:** in `*-aus-ar` lateinische Buchstaben ohne einen arabischen, in `*-aus-de`/`*-aus-tr` arabische
 *   Buchstaben.
 * Ausgenommen sind Buchstabiersätze (Namen Buchstabe für Buchstabe, z. B. „J – A – N“); Lehnwörter und Namen bleiben unter
 * der Mindestzahl der Wörter, Zahlen haben keine Schrift. Die Schrift-Vorkurse brauchen keine Ausnahme (Bestand 26.10.2026).
 * Für freigegebene Einheiten (Status nicht `entwurf`) ist ein Treffer blockierend, sonst eine Warnung.
 */

/** Mindestzahl der Wörter für „Kopie des Zieltexts“ (kürzere Gleichheit sind meist Namen und Lehnwörter wie „Internet“). */
export const MIN_WOERTER = 3;

const LATEIN = /\p{Script=Latin}/u;

/** Buchstabiersatz: mindestens drei Einzelbuchstaben mit Strich (z. B. „J – A – N“, „A-n-n-a“); „E-Mail“ zählt nicht. */
export const buchstabiert = (text: string): boolean => /(?<!\p{L})\p{L}(?:\s*[-\u2010-\u2014]\s*\p{L}){2,}(?!\p{L})/u.test(text);

export function pruefeUebersetzungen(inhalte: Inhalte): Befunde {
  const b = new Befunde('uebersetzung');
  const ziel = new Map<string, string>();
  for (const { daten: d } of inhalte.sprache)
    for (const x of [...d.lemmata.map((l) => ({ schluessel: l.schluessel, text: l.lemma })), ...d.saetze]) ziel.set(x.schluessel, x.text);

  for (const { pfad, daten: u } of inhalte.uebersetzung) {
    const { ziel: zielSprache, ausgang } = zerlegeRichtung(u.richtung);
    // Kopie nur zwischen Sprachen derselben Schrift (de, tr) vergleichen; mit ar fällt sie als falsche Schrift auf
    const gleicheSchrift = zielSprache !== 'ar' && ausgang !== 'ar';
    const schwere = u.status === 'entwurf' ? 'warnung' : 'blockierend';
    for (const e of u.eintraege) {
      const zieltext = ziel.get(e.bezug);
      if (zieltext !== undefined && buchstabiert(zieltext)) continue;
      const vergleich = gleicheSchrift && zieltext !== undefined ? normalisiere(zieltext, ausgang) : null;
      const kopierbar = vergleich !== null && vergleich.split(' ').filter(Boolean).length >= MIN_WOERTER;
      const ort = `${e.bezug}@${u.richtung}`;
      [e.text, ...(e.alternativen ?? [])].forEach((f, i) => {
        const welche = i === 0 ? 'Übersetzung' : `Alternative ${i}`;
        if (kopierbar && normalisiere(f, ausgang) === vergleich)
          b.add(schwere, pfad, `${welche} gleich dem Zieltext (nicht übersetzt)`, ort);
        if (ausgang === 'ar' ? LATEIN.test(f) && !ARABISCH.test(f) : ARABISCH.test(f))
          b.add(schwere, pfad, `${welche} in falscher Schrift (Ausgangssprache ${ausgang})`, ort);
      });
    }
  }
  return b;
}
