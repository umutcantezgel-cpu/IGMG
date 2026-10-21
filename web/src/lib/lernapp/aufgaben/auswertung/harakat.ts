import { gleicheAb } from '../../abgleich';
import { gemischteIndizes } from '../../engine/zufall';
import type { HarakatAntwort, HarakatAufgabe } from '../harakat';
import { type Auswertung, kartenMit } from '../hilfen';

/**
 * `harakat` (Nutzlast in `../harakat.ts`): Bewertung im **strengen Modus** des Abgleichs (PLAN §4.1) und die
 * Beschreibung der Optionen zum Vorlesen („Lesen mit Codepunkt-Namen“): je Buchstabe sein Name und die Namen seiner
 * Zeichen (Texte unter `aufgaben.harakat.zeichen.u<Codepunkt>`). Arabische Zeichen stehen hier nur als Codepunkt-Escapes
 * (KERN 4.0 §3).
 */

/** Kombinierende Zeichen der Vokalisierung (Harakat, Schadda, Sukun, Madda, Hamza oben/unten, kleines Alif). */
const KOMBINIEREND = /^[\u064B-\u065F\u0670]$/;

/** Schlüssel eines Zeichens für die Namen: `u` + Codepunkt in vier Hex-Ziffern (z. B. `u0628`). */
export const zeichenSchluessel = (c: string): string => `u${(c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`;

/** Ein Buchstabe mit seinen Zeichen (Schlüssel nach `zeichenSchluessel`). */
export type Zeichen = { buchstabe: string; zeichen: string[] };

/** Wörter eines vokalisierten Texts als Folge von Buchstaben mit ihren Zeichen (NFC, Tatweel und Satzzeichen fallen weg). */
export function zeichenFolge(text: string): Zeichen[][] {
  return text
    .normalize('NFC')
    .split(/\s+/)
    .filter(Boolean)
    .map((wort) => {
      const folge: Zeichen[] = [];
      for (const c of wort) {
        if (KOMBINIEREND.test(c)) folge.at(-1)?.zeichen.push(zeichenSchluessel(c));
        else if (/^[\u0621-\u063A\u0641-\u064A\u0671]$/.test(c)) folge.push({ buchstabe: zeichenSchluessel(c), zeichen: [] });
      }
      return folge;
    })
    .filter((w) => w.length > 0);
}

/**
 * Beschreibung zum Vorlesen: Buchstaben mit ihren Zeichen, Wörter getrennt. Unbekannte Schlüssel erscheinen als
 * Codepunkt (`U+0628`), damit nie ein Zeichen verschwindet.
 */
export function beschreibe(text: string, namen: Readonly<Record<string, string>>, trenner = { zeichen: ' ', buchstabe: ', ', wort: '; ' }) {
  const name = (s: string) => namen[s] ?? `U+${s.slice(1)}`;
  return zeichenFolge(text)
    .map((wort) => wort.map((b) => [name(b.buchstabe), ...b.zeichen.map(name)].join(trenner.zeichen)).join(trenner.buchstabe))
    .join(trenner.wort);
}

/** Anzeigereihenfolge der Optionen. */
export const harakatReihenfolge = (a: Pick<HarakatAufgabe, 'optionen' | 'schluessel'>): number[] =>
  gemischteIndizes(a.optionen.length, a.schluessel);

/** Wahl gegen die richtige Schreibung im strengen Modus; Hinweis „harakat“ bei falscher Vokalisierung. */
export function bewerteHarakat(a: HarakatAufgabe, antwort: HarakatAntwort): Auswertung {
  const richtig = a.optionen[a.richtig]?.text ?? '';
  const gewaehlt = a.optionen[antwort.wahl]?.text ?? '';
  const e = gleicheAb(gewaehlt, richtig, 'ar', { streng: true });
  const urteil = e.urteil === 'richtig' ? 'richtig' : 'falsch';
  return {
    urteil,
    hinweise: urteil === 'richtig' ? [] : e.hinweise.filter((h) => h === 'harakat'),
    loesung: richtig,
    karten: kartenMit(a.karten, urteil),
  };
}
