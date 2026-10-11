import type { Mehrsprachig } from '../../src/lib/db/schema/typen';

/** Seed-Formate (ADR 0015). Zeiten als Ortszeit Europe/Berlin „JJJJ-MM-TTTHH:MM“. */
export type SeedVeranstaltung = {
  slug: string;
  titel: Mehrsprachig;
  kurztext: Mehrsprachig;
  kategorie: 'gebet' | 'bildung' | 'gemeinde' | 'kultur' | 'jugend' | 'frauen';
  organisation: 'at' | 'kt' | 'gt' | 'kgt' | null;
  zielgruppe?: Mehrsprachig;
  teilnehmerHinweis?: Mehrsprachig;
  ort: Mehrsprachig;
  beginn: string;
  ende: string | null;
  wiederholung: string | null;
  empfohlen: boolean;
  kosten: 'kostenlos' | 'kostenpflichtig';
  beschreibung?: { de: string[]; tr?: string[]; en?: string[] };
  anmeldungAktiv?: boolean;
  plaetze?: number;
  programm?: { zeit: string; text: Mehrsprachig }[];
  hinweise?: Mehrsprachig[];
  schlagwoerter?: Mehrsprachig[];
  veranstalter?: { name: string; funktion?: Mehrsprachig };
  kontakt?: { name?: string; telefon?: string; email?: string };
  quelle: string;
};

export type SeedNachricht = {
  slug: string;
  titel: Mehrsprachig;
  kurztext: Mehrsprachig;
  absaetze: { de: string[]; tr?: string[]; en?: string[] };
  kategorie: 'ankuendigung' | 'gemeinde' | 'veranstaltung' | 'bildung' | 'religioes' | 'soziales' | 'neuigkeiten';
  wichtig: boolean;
  veroeffentlicht: string;
  empfohlen: boolean;
  lesezeit: number;
  quelle: string;
};
