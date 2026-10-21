import { STATUS, type Status } from '../freigabe';
import type { StichprobeArt } from '../stichprobe';

/**
 * Kennzahlen der Verwaltungsübersicht (L3-06, PLAN §7.1): Stand je Kurs, Stufe und Einheit und Prüfquoten. Rein, ohne
 * Datenbank – die Abfrage liegt in `server/queries/lernapp/verwaltung.ts`.
 */

export type StatusZaehlung = Record<Status, number> & { gesamt: number };

export function leereZaehlung(): StatusZaehlung {
  return { entwurf: 0, automatisch_geprueft: 0, veroeffentlicht: 0, gesperrt: 0, gesamt: 0 };
}

/** Zählt Stände (unbekannte Werte fallen weg). */
export function zaehleStatus(stati: readonly string[]): StatusZaehlung {
  const z = leereZaehlung();
  for (const s of stati)
    if ((STATUS as readonly string[]).includes(s)) {
      z[s as Status]++;
      z.gesamt++;
    }
  return z;
}

/** Anteil in [0, 1]; ohne Grundgesamtheit 0. */
export function anteil(teil: number, gesamt: number): number {
  if (!(gesamt > 0) || !(teil > 0)) return 0;
  return Math.min(1, teil / gesamt);
}

/** Ganze Prozent (abgerundet, damit 99,6 % nie als „100 %“ erscheint, solange etwas fehlt). */
export function prozent(teil: number, gesamt: number): number {
  return Math.floor(anteil(teil, gesamt) * 100);
}

export type EinheitZeile = { kurs: string; stufe: string; schluessel: string; status: Status; eintraege: StatusZaehlung };
export type StufenStand = { stufe: string; einheiten: StatusZaehlung; eintraege: StatusZaehlung; liste: EinheitZeile[] };
export type KursStand = { kurs: string; einheiten: StatusZaehlung; eintraege: StatusZaehlung; stufen: StufenStand[] };

function addiere(ziel: StatusZaehlung, z: StatusZaehlung) {
  for (const s of STATUS) ziel[s] += z[s];
  ziel.gesamt += z.gesamt;
}

/**
 * Baum Kurs → Stufe → Einheit mit Summen: Einheiten je Status (Spalte `lernapp_einheit.status`) und Einträge (Lemmata,
 * Sätze) je Status. Reihenfolge: Kurse und Stufen wie übergeben (`kurse`, `stufen`), Einheiten nach Schlüssel.
 */
export function standBaum(zeilen: readonly EinheitZeile[], kurse: readonly string[], stufen: readonly string[]): KursStand[] {
  const rang = (liste: readonly string[], w: string) => {
    const i = liste.indexOf(w);
    return i < 0 ? liste.length : i;
  };
  const jeKurs = new Map<string, Map<string, EinheitZeile[]>>();
  for (const z of zeilen) {
    const k = jeKurs.get(z.kurs) ?? new Map<string, EinheitZeile[]>();
    k.set(z.stufe, [...(k.get(z.stufe) ?? []), z]);
    jeKurs.set(z.kurs, k);
  }
  return [...jeKurs.entries()]
    .sort(([a], [b]) => rang(kurse, a) - rang(kurse, b) || (a < b ? -1 : 1))
    .map(([kurs, jeStufe]) => {
      const einheiten = leereZaehlung();
      const eintraege = leereZaehlung();
      const stufenListe = [...jeStufe.entries()]
        .sort(([a], [b]) => rang(stufen, a) - rang(stufen, b) || (a < b ? -1 : 1))
        .map(([stufe, liste]) => {
          const sortiert = [...liste].sort((a, b) => (a.schluessel < b.schluessel ? -1 : a.schluessel > b.schluessel ? 1 : 0));
          const e = zaehleStatus(sortiert.map((x) => x.status));
          const ein = leereZaehlung();
          for (const x of sortiert) addiere(ein, x.eintraege);
          addiere(einheiten, e);
          addiere(eintraege, ein);
          return { stufe, einheiten: e, eintraege: ein, liste: sortiert };
        });
      return { kurs, einheiten, eintraege, stufen: stufenListe };
    });
}

export type StichprobenZeile = { art: StichprobeArt; entscheidung: 'offen' | 'bestanden' | 'nachbessern'; groesse: number; geprueft: number };
export type Pruefquote = {
  stichproben: number;
  offen: number;
  bestanden: number;
  nachbessern: number;
  /** gezogene Einträge insgesamt bzw. davon geprüfte */
  gezogen: number;
  geprueft: number;
  /** ganze Prozent der gezogenen Einträge, die geprüft sind */
  quote: number;
};

/** Prüfquote über Stichproben (eine Sprache, ein Kurs oder alles). */
export function pruefquote(zeilen: readonly StichprobenZeile[]): Pruefquote {
  const q: Pruefquote = { stichproben: zeilen.length, offen: 0, bestanden: 0, nachbessern: 0, gezogen: 0, geprueft: 0, quote: 0 };
  for (const z of zeilen) {
    q[z.entscheidung]++;
    q.gezogen += z.groesse;
    q.geprueft += Math.min(z.geprueft, z.groesse);
  }
  q.quote = prozent(q.geprueft, q.gezogen);
  return q;
}
