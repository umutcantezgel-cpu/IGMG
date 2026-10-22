import { istKursSlug, RICHTUNGEN, type KursSlug, type RichtungId } from '../kurse';
import type { Ereignis, EreignisVon } from './typen';

/**
 * Tagessummen je Kurs (S-L3 M-1, ADR 0043 Fortschreibung Nr. 16/17, D-L03/D-L04, KERN 4.0 §6): Damit Bestenliste,
 * Gruppenziel und Stand der Lehrkraft keinen Rückschluss auf religiöses Lernen zulassen (Art. 9 DSGVO), leitet der Abgleich
 * XP und Lektionen je Lerntag **und Kurs** ab. Rein, ohne Datenbank; `sync/server.ts` schreibt das Ergebnis nach
 * `lernapp_tag_kurs`, `gruppe/dienst.ts` liest daraus nur die erlaubten Kurse.
 *
 * - `lektion`: Kurs aus `daten.kurs` (Kurs-Slug des Pakets, z. B. `tr-aus-de`, `islam`), nur wenn der Lektionsschlüssel
 *   dazu passt (`<kurs>.…`).
 * - `xp`: Kurs aus dem ersten Teil von `daten.bezug` (Lektionsschlüssel im Paket bzw. `<kurs>.wiederholung`).
 * - Alles andere zählt zum Kurs {@link UNBEKANNT}, der nirgends gezählt wird (nur in der Tagessumme ohne Kurs, die allein
 *   die Lernwoche für Eltern und das Tagesziel nutzen).
 */

/** Kurs ohne sichere Zuordnung: zählt weder in Bestenliste und Gruppenziel noch im Stand der Lehrkraft. */
export const UNBEKANNT = 'unbekannt';
export type TagesKurs = KursSlug | typeof UNBEKANNT;

/** Kurs, zu dem ein Lernereignis zählt. */
export function kursDesEreignisses(e: EreignisVon<'lektion'> | EreignisVon<'xp'>): TagesKurs {
  if (e.art === 'lektion') {
    const kurs = e.daten.kurs;
    return istKursSlug(kurs) && e.daten.lektion.startsWith(`${kurs}.`) ? kurs : UNBEKANNT;
  }
  const kurs = e.daten.bezug?.split('.')[0];
  return istKursSlug(kurs) && e.daten.bezug !== kurs ? kurs : UNBEKANNT;
}

/** Kurse, die für Bestenliste und Gruppenziel zählen: nur die Sprachkurse (D-L04), nie Wissen oder Koran-Arabisch. */
export const GRUPPEN_KURSE: readonly RichtungId[] = RICHTUNGEN;

export function zaehltFuerGruppe(kurs: string): boolean {
  return (GRUPPEN_KURSE as readonly string[]).includes(kurs);
}

export type TagKursSumme = { tag: string; kurs: TagesKurs; xp: number; lektionen: number };

/** Höchstwert der Spalte `lektionen` (smallint). */
const LEKTIONEN_HOECHSTENS = 32_767;

/**
 * XP und Lektionen je Lerntag und Kurs aus den Ereignissen `lektion` und `xp` (andere Arten werden übergangen). Nur Tage aus
 * `tage`, wenn angegeben. Ergebnis sortiert nach Tag und Kurs, ohne leere Zeilen.
 */
export function summenJeKurs(ereignisse: readonly Ereignis[], tage?: ReadonlySet<string>): TagKursSumme[] {
  const je = new Map<string, TagKursSumme>();
  for (const e of ereignisse) {
    if (e.art !== 'lektion' && e.art !== 'xp') continue;
    if (tage && !tage.has(e.tag)) continue;
    const kurs = kursDesEreignisses(e);
    const schluessel = `${e.tag}|${kurs}`;
    const s = je.get(schluessel) ?? { tag: e.tag, kurs, xp: 0, lektionen: 0 };
    if (e.art === 'xp') s.xp += e.daten.menge;
    else s.lektionen = Math.min(s.lektionen + 1, LEKTIONEN_HOECHSTENS);
    je.set(schluessel, s);
  }
  return [...je.values()].sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : a.kurs < b.kurs ? -1 : a.kurs > b.kurs ? 1 : 0));
}
