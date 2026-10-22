import { istSprache, type Sprache } from './kurse';
import { DATEN_LIZENZEN } from './quellen';

/**
 * Namensnennung je Satz und Eintrag (ADR 0039 Nr. 9, ADR 0045 Nr. 4 und Fortschreibung S7 Nr. 7, KERN 4.0 §1 „Quellenangaben
 * auch offline“): aus `eintraege` eines Einheitenpakets, so wie es auf dem Gerät liegt. Rein und ohne Zod (Client der Seite
 * `/lern-app/<ui>/quellen`); jeder Eintrag wird einzeln auf seine Form geprüft, Ungültiges fällt weg.
 *
 * - Fremde Quellen (Tatoeba, Wiktionary, …) stehen einzeln mit Text, Sprache und Namensnennung aus dem Paket. Fehlt dort der
 *   Link, ergänzt ihn die Adresse aus der Quelle (Tatoeba: Satzseite wie in `web/daten/tatoeba/QUELLE.md`; Wiktionary:
 *   Artikel). Ohne Namensnennung im Paket steht `<quelle> · <Lizenz>`; nennt die Namensnennung die Lizenz nicht (Tatoeba-Form
 *   „Satz #<id> von <benutzer>“ aus S7 Nr. 7, Lizenz nur im Feld `lizenz`), wird ` · <Lizenz>` angehängt.
 * - Eigene Inhalte (`ki:`, `redaktion`, `test:`; wie im Lizenz-Prüfer) stehen unter CC BY-SA 4.0 (L0-E02) und werden nur
 *   gezählt, solange sie keine eigene Namensnennung tragen.
 */

export type Nennung = {
  /** Schlüssel im Paket (Zieltext `<schluessel>`, Übersetzung `<schluessel>@<ausgang>`) */
  schluessel: string;
  text: string;
  sprache: Sprache;
  nennung: string;
  /** Adresse der Quelle als Text, wenn die Namensnennung sie nicht schon enthält */
  adresse?: string;
};

export type EinheitNennungen = { fremd: Nennung[]; eigene: number };

/** Eigene Inhalte der Lern-App (CC BY-SA 4.0); gleiche Regel wie `eigen` in `inhalt/pruefer/lizenz.ts`. */
export const istEigeneQuelle = (quelle: string): boolean =>
  quelle.startsWith('ki:') || quelle === 'redaktion' || quelle.startsWith('test:');

const lizenzName = (lizenz: string): string =>
  Object.hasOwn(DATEN_LIZENZEN, lizenz) ? DATEN_LIZENZEN[lizenz as keyof typeof DATEN_LIZENZEN].name : lizenz;

/** Adresse der Quelle eines Eintrags (Tatoeba-Satz, Wiktionary-Artikel), sonst `undefined`. */
export function quellAdresse(quelle: string): string | undefined {
  const tatoeba = /^tatoeba:(\d+)$/.exec(quelle);
  if (tatoeba) return `https://tatoeba.org/de/sentences/show/${tatoeba[1]}`;
  const wiktionary = /^wiktionary:([a-z]{2,3}):(.+)$/.exec(quelle);
  if (wiktionary) return `https://${wiktionary[1]}.wiktionary.org/wiki/${wiktionary[2]}`;
  return undefined;
}

const istText = (x: unknown): x is string => typeof x === 'string' && x.length > 0;

/** Ob eine Namensnennung ihre Lizenz schon nennt (Kennung, Name oder eine CC-/Unlicense-Angabe). */
const nenntLizenz = (nennung: string, lizenz: string): boolean =>
  nennung.includes(lizenz) || nennung.includes(lizenzName(lizenz)) || /\b(CC[ -]?(BY|0)|Unlicense)/i.test(nennung);

/** Namensnennungen einer Einheit aus `paket.eintraege` (ungeprüfte Form aus dem Vorrat), nach Schlüssel geordnet. */
export function nennungenAus(eintraege: unknown): EinheitNennungen {
  const ergebnis: EinheitNennungen = { fremd: [], eigene: 0 };
  if (typeof eintraege !== 'object' || eintraege === null || Array.isArray(eintraege)) return ergebnis;
  for (const schluessel of Object.keys(eintraege).sort()) {
    const e: unknown = (eintraege as Record<string, unknown>)[schluessel];
    if (typeof e !== 'object' || e === null) continue;
    const { text, sprache, quelle, lizenz, namensnennung } = e as Record<string, unknown>;
    if (!istText(text) || !istSprache(sprache) || !istText(quelle) || !istText(lizenz)) continue;
    const eigene = istText(namensnennung) ? namensnennung : undefined;
    if (!eigene && istEigeneQuelle(quelle)) {
      ergebnis.eigene++;
      continue;
    }
    const nennung = eigene && nenntLizenz(eigene, lizenz) ? eigene : `${eigene ?? quelle} · ${lizenzName(lizenz)}`;
    const adresse = quellAdresse(quelle);
    const mitAdresse = adresse && !nennung.includes(new URL(adresse).hostname) ? adresse : undefined;
    ergebnis.fremd.push({ schluessel, text, sprache, nennung, ...(mitAdresse ? { adresse: mitAdresse } : {}) });
  }
  return ergebnis;
}
