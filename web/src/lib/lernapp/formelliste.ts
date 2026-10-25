import leitfaden from '../../../inhalte/lernapp/rahmen/leitfaden.json';
import { type Pruefung, religioesGeprueft, type ReligioeserBaustein } from './freigabe';
import { inhaltHash } from './paket/hash';

/**
 * Liste erlaubter Alltagsformeln als Baustein mit Zwei-Prüfer-Freigabe (KERN 4.0 §2.3 „Formelliste“, LM-09; Stufe C N2,
 * Z-L10). Die Liste steht im Inhaltsleitfaden (`web/inhalte/lernapp/rahmen/leitfaden.json` → `religionsbezug.formeln`):
 * Begriffe in Umschrift bzw. Lateinschrift, kein arabischer Wortlaut.
 *
 * - **Hash** = SHA-256 des kanonischen JSON der Liste (`liste`, Texte in NFC und ohne Rand-Leerraum). Jede Änderung eines
 *   Eintrags setzt beide Freigaben zurück; der Status selbst gehört nicht zum Hash.
 * - **Freigabe** über die Zwei-Prüfer-Oberfläche (Typ `formelliste`, feste Kennung {@link FORMELLISTE_ID}), gezählt wie jede
 *   religiöse Freigabe (`freigabe.ts`: zwei Personen mit `religioese_pruefung`, ohne Administration, zum aktuellen Hash).
 * - **Freigegeben** ist die Liste erst mit beidem: zwei Freigaben zum aktuellen Hash **und** `status: "freigegeben"` im
 *   Leitfaden (der Beschluss, den auch `pnpm lernapp:pruefen` liest). Bis dahin verbirgt der Paketbau jeden Eintrag mit
 *   `religionsbezug`, auch mit zwei eigenen Freigaben (`freigabe.ts` `sprachSichtbarkeit`).
 *
 * Nur auf dem Server (Paketbau, Verwaltung): Das Modul lädt den Leitfaden.
 */

/** Kennung der Formelliste in `lernapp_pruefung.inhaltId` und in der Adresse der Prüfoberfläche (UUID-Form, fest). */
export const FORMELLISTE_ID = '666f726d-656c-4c69-b374-650000000000';
/** Schlüssel in der Prüfoberfläche. */
export const FORMELLISTE_SCHLUESSEL = 'leitfaden.religionsbezug.formeln';

export type FormelEintrag = { id: string; sprache: string; begriff: string } & Record<string, unknown>;
export type Formeln = { status: 'gesperrt' | 'freigegeben'; liste: readonly FormelEintrag[] };

/** Formelliste des Leitfadens; ein unbekannter Status gilt als gesperrt. */
export const FORMELN: Formeln = (() => {
  const f = leitfaden.religionsbezug.formeln as { status: string; liste: FormelEintrag[] };
  return { status: f.status === 'freigegeben' ? 'freigegeben' : 'gesperrt', liste: f.liste };
})();

const normal = (wert: unknown): unknown =>
  typeof wert === 'string'
    ? wert.normalize('NFC').trim()
    : Array.isArray(wert)
      ? wert.map(normal)
      : wert && typeof wert === 'object'
        ? Object.fromEntries(Object.entries(wert).map(([k, v]) => [k, normal(v)]))
        : wert;

/** Inhalts-Hash der Liste (Reihenfolge zählt, Schlüssel sortiert). */
export function formellisteHash(liste: readonly FormelEintrag[]): string {
  return inhaltHash(normal(liste));
}

/** Die Liste als religiöser Baustein (ohne Belege; Verfasser sind KI-Lauf bzw. Redaktion, keine prüfende Person). */
export function formellisteBaustein(f: Formeln = FORMELN): ReligioeserBaustein {
  return { inhaltHash: formellisteHash(f.liste), verfasser: [], belege: [], belegPflicht: false, art: 'formelliste' };
}

/** Freigegeben? Zwei religiöse Freigaben zum aktuellen Hash der Liste und Status „freigegeben“ im Leitfaden. */
export function formellisteFrei(f: Formeln, pruefungen: readonly Pruefung[]): boolean {
  return f.status === 'freigegeben' && religioesGeprueft(formellisteBaustein(f), pruefungen);
}
