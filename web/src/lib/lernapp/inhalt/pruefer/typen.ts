import { ARABISCH } from '../../waechter/kern.mjs';

/**
 * Befunde der automatischen Prüfer (PLAN §6.4, `pnpm lernapp:pruefen`).
 *
 * - `blockierend`: Tor L3 verlangt 0 (Ausgang 1). Schema, Dubletten, Lizenz und Ausschlüsse, Wortschatz, Satzlänge,
 *   Vokalisierung, Kindereignung, Religionswächter, Auszugs-Prüfsummen.
 * - `mensch`: geht an Menschen (`menschlich_klaeren`), blockiert nicht: Inhaltsleitfaden (Tabu-Lexikon, LM-09),
 *   Religionsbezug-Kandidaten. Der Eintrag bleibt bis zur Entscheidung der Redaktion im Status `entwurf`.
 * - `warnung`: Hinweis (z. B. mehrdeutige arabische Tabu-Treffer, Vorgriff innerhalb der Stufe, Abdeckung einer
 *   unvollständigen Stufe).
 *
 * Ausgaben enthalten nie arabische Schrift ({@link ohneArabisch}) und nie die Wörter des Tabu-Lexikons, nur Kategorie-IDs.
 */

export const PRUEFER = [
  'schema',
  'dubletten',
  'lizenz',
  'ausschluss',
  'wortschatz',
  'satzlaenge',
  'lemmabudget',
  'abdeckung',
  'vokalisierung',
  'tabu',
  'kinder',
  'religionsbezug',
  'religion',
  'daten',
  'symbole',
  'audio',
] as const;
export type PrueferName = (typeof PRUEFER)[number];

export type Schwere = 'blockierend' | 'warnung' | 'mensch';

export type Befund = {
  pruefer: PrueferName;
  schwere: Schwere;
  /** Pfad relativ zu `web/inhalte/lernapp/` bzw. zum Repository (Ausschlüsse, Daten) */
  datei: string;
  /** Schlüssel des Eintrags, Ort im Dokument oder Zeile */
  ort?: string;
  text: string;
  /** Kategorie-ID (Tabu-Lexikon, Religionsbezug), nie das gefundene Wort */
  kategorie?: string;
};

/** Arabische Schrift in Ausgaben durch Codepunkte ersetzen (KERN 4.0 §3: Werkzeugausgaben ohne arabische Schrift). */
export function ohneArabisch(text: string): string {
  return [...text].map((z) => (ARABISCH.test(z) ? `U+${z.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}` : z)).join('');
}

/** Befund als eine Zeile `datei: ort: text [kategorie]` (ohne arabische Schrift). */
export function befundZeile(b: Befund): string {
  return ohneArabisch(`${b.datei}${b.ort ? `: ${b.ort}` : ''}: ${b.text}${b.kategorie ? ` [${b.kategorie}]` : ''}`);
}

/** Sammler für Befunde eines Prüfers. */
export class Befunde {
  readonly liste: Befund[] = [];

  constructor(readonly pruefer: PrueferName) {}

  add(schwere: Schwere, datei: string, text: string, ort?: string, kategorie?: string): void {
    this.liste.push({
      pruefer: this.pruefer,
      schwere,
      datei,
      text: ohneArabisch(text),
      ...(ort ? { ort: ohneArabisch(ort) } : {}),
      ...(kategorie ? { kategorie } : {}),
    });
  }

  blockierend(datei: string, text: string, ort?: string, kategorie?: string): void {
    this.add('blockierend', datei, text, ort, kategorie);
  }

  warnung(datei: string, text: string, ort?: string, kategorie?: string): void {
    this.add('warnung', datei, text, ort, kategorie);
  }

  mensch(datei: string, text: string, ort?: string, kategorie?: string): void {
    this.add('mensch', datei, text, ort, kategorie);
  }
}
