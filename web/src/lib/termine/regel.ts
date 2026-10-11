import { istGueltigeRegel, lokaleTeile } from './index';

/**
 * Wiederholung als Formularstruktur ⇄ RRULE (K-09). Die Verwaltung wählt Art, Intervall, Wochentage und Ende;
 * gespeichert wird die RRULE ohne DTSTART (Beginn = Spalte `beginn`). „eigene“ erlaubt eine geprüfte Roh-Regel.
 */
export const WIEDERHOLUNG_ARTEN = [
  'einmalig',
  'taeglich',
  'woechentlich',
  'monatlich_tag',
  'monatlich_wochentag',
  'jaehrlich',
  'eigene',
] as const;
export type WiederholungArt = (typeof WIEDERHOLUNG_ARTEN)[number];

/** RFC-5545-Kürzel, Montag zuerst (Anzeige); Index wie Date#getDay über WOCHENTAG_NR. */
export const WOCHENTAGE = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const;
export type Wochentag = (typeof WOCHENTAGE)[number];
const WOCHENTAG_NR: Record<Wochentag, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
const NR_WOCHENTAG = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'] as const;

export const ENDE_ARTEN = ['nie', 'datum', 'anzahl'] as const;
export type EndeArt = (typeof ENDE_ARTEN)[number];

export type WiederholungEingabe = {
  art: WiederholungArt;
  intervall: number;
  wochentage: Wochentag[];
  /** 1–4 oder -1 (letzter) für „monatlich_wochentag“ */
  position: number;
  ende: EndeArt;
  /** JJJJ-MM-TT, inklusive */
  endeDatum?: string;
  anzahl?: number;
  /** nur bei „eigene“ */
  roh?: string;
};

/** Baut die RRULE (ohne „RRULE:“) aus der Formularstruktur; `beginn` liefert Wochentag/Monatstag. null = einmalig. */
export function baueRegel(w: WiederholungEingabe, beginn: Date): string | null {
  if (w.art === 'einmalig') return null;
  if (w.art === 'eigene') return (w.roh ?? '').replace(/^RRULE:/, '').trim() || null;
  const lokal = lokaleTeile(beginn);
  const teile: string[] = [];
  switch (w.art) {
    case 'taeglich':
      teile.push('FREQ=DAILY');
      break;
    case 'woechentlich': {
      const tage = w.wochentage.length ? w.wochentage : [NR_WOCHENTAG[lokal.wochentag]];
      const sortiert = WOCHENTAGE.filter((t) => tage.includes(t));
      teile.push('FREQ=WEEKLY', `BYDAY=${sortiert.join(',')}`);
      break;
    }
    case 'monatlich_tag':
      teile.push('FREQ=MONTHLY', `BYMONTHDAY=${lokal.tag}`);
      break;
    case 'monatlich_wochentag':
      teile.push('FREQ=MONTHLY', `BYDAY=${w.position}${NR_WOCHENTAG[lokal.wochentag]}`);
      break;
    case 'jaehrlich':
      teile.push('FREQ=YEARLY');
      break;
  }
  if (w.intervall > 1) teile.splice(1, 0, `INTERVAL=${w.intervall}`);
  // UNTIL schwebend (ohne Z) bis Tagesende Ortszeit – so liest es `vorkommen()` (rrule-Konvention)
  if (w.ende === 'datum' && w.endeDatum) teile.push(`UNTIL=${w.endeDatum.replaceAll('-', '')}T235959`);
  if (w.ende === 'anzahl' && w.anzahl) teile.push(`COUNT=${w.anzahl}`);
  return teile.join(';');
}

/** Zerlegt eine gespeicherte Regel zurück in die Formularstruktur; Unbekanntes → „eigene“ mit Roh-Regel. */
export function zerlegeRegel(regel: string | null, beginn: Date): WiederholungEingabe {
  const leer: WiederholungEingabe = { art: 'einmalig', intervall: 1, wochentage: [], position: 1, ende: 'nie' };
  if (!regel) return leer;
  const roh = regel.replace(/^RRULE:/, '').trim();
  const t = Object.fromEntries(roh.split(';').map((p) => p.split('=') as [string, string]));
  const intervall = Number(t.INTERVAL ?? 1);
  const ende: Pick<WiederholungEingabe, 'ende' | 'endeDatum' | 'anzahl'> = t.UNTIL
    ? { ende: 'datum', endeDatum: `${t.UNTIL.slice(0, 4)}-${t.UNTIL.slice(4, 6)}-${t.UNTIL.slice(6, 8)}` }
    : t.COUNT
      ? { ende: 'anzahl', anzahl: Number(t.COUNT) }
      : { ende: 'nie' };
  const bekannt = new Set(['FREQ', 'INTERVAL', 'BYDAY', 'BYMONTHDAY', 'UNTIL', 'COUNT']);
  const eigene: WiederholungEingabe = { ...leer, art: 'eigene', roh };
  if (Object.keys(t).some((k) => !bekannt.has(k)) || !Number.isInteger(intervall) || intervall < 1) return eigene;
  const lokal = lokaleTeile(beginn);
  const basis = { ...leer, intervall, ...ende };
  switch (t.FREQ) {
    case 'DAILY':
      return t.BYDAY || t.BYMONTHDAY ? eigene : { ...basis, art: 'taeglich' };
    case 'YEARLY':
      return t.BYDAY || t.BYMONTHDAY ? eigene : { ...basis, art: 'jaehrlich' };
    case 'WEEKLY': {
      if (t.BYMONTHDAY) return eigene;
      const tage = (t.BYDAY ?? NR_WOCHENTAG[lokal.wochentag]).split(',');
      if (!tage.every((d: string): d is Wochentag => (WOCHENTAGE as readonly string[]).includes(d))) return eigene;
      return { ...basis, art: 'woechentlich', wochentage: tage as Wochentag[] };
    }
    case 'MONTHLY': {
      if (t.BYMONTHDAY && !t.BYDAY && Number(t.BYMONTHDAY) === lokal.tag) return { ...basis, art: 'monatlich_tag' };
      const m = t.BYDAY && !t.BYMONTHDAY ? /^(-1|[1-4])([A-Z]{2})$/.exec(t.BYDAY) : null;
      if (m && WOCHENTAG_NR[m[2] as Wochentag] === lokal.wochentag) return { ...basis, art: 'monatlich_wochentag', position: Number(m[1]) };
      return eigene;
    }
    default:
      return eigene;
  }
}

/** Prüft die gebaute Regel (inkl. „eigene“) mit denselben Regeln wie beim Speichern. */
export function regelGueltig(regel: string | null): boolean {
  return regel === null || istGueltigeRegel(regel);
}
