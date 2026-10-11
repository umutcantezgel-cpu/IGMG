import { TZDate } from '@date-fns/tz';
import { RRule, rrulestr } from 'rrule';

/**
 * Termine (K-09): Wiederholung über RFC-5545-RRULE mit Ausnahmen, Zeitzone Europe/Berlin samt Sommerzeit.
 * Gespeichert wird der erste Beginn als UTC-Zeitpunkt (K-05) und die Regel OHNE DTSTART.
 * Berechnet wird in „Wanduhrzeit“: Ein Termin um 19:00 Uhr bleibt nach dem Wechsel auf Sommerzeit um 19:00 Uhr.
 */
export const ZEITZONE = 'Europe/Berlin';

export type TerminRegel = {
  beginn: Date;
  ende?: Date | null;
  wiederholung?: string | null;
  /** Ausfallende Tage als lokales Datum JJJJ-MM-TT (Europe/Berlin). */
  ausnahmen?: readonly string[];
};

export type Vorkommen = { beginn: Date; ende: Date | null };

const ERLAUBT = /^(FREQ|INTERVAL|COUNT|UNTIL|BYDAY|BYMONTHDAY|BYMONTH|BYSETPOS|WKST)=/;

/** Prüft eine Regel (für Zod): nur RRULE-Teile ohne DTSTART, bekannte Schlüssel, höchstens wöchentlich bis jährlich oder täglich. */
export function istGueltigeRegel(regel: string): boolean {
  const roh = regel.replace(/^RRULE:/, '').trim();
  if (!roh || roh.length > 300) return false;
  const teile = roh.split(';');
  if (!teile.every((t) => ERLAUBT.test(t))) return false;
  // jeder Schlüssel höchstens einmal (sonst gilt bei rrule der letzte, z. B. „FREQ=DAILY;FREQ=HOURLY“)
  const schluessel = teile.map((t) => t.split('=')[0]);
  if (new Set(schluessel).size !== schluessel.length) return false;
  if (!teile.some((t) => /^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)$/.test(t))) return false;
  try {
    rrulestr(`RRULE:${roh}`);
    return true;
  } catch {
    return false;
  }
}

/** Wanduhr-Teile in Europe/Berlin. */
export function lokaleTeile(zeitpunkt: Date) {
  const z = new TZDate(zeitpunkt.getTime(), ZEITZONE);
  return {
    jahr: z.getFullYear(),
    monat: z.getMonth(),
    tag: z.getDate(),
    stunde: z.getHours(),
    minute: z.getMinutes(),
    sekunde: z.getSeconds(),
    wochentag: z.getDay(),
  };
}

/** Lokales Datum JJJJ-MM-TT (Europe/Berlin). */
export function lokalesDatum(zeitpunkt: Date): string {
  const t = lokaleTeile(zeitpunkt);
  return `${t.jahr}-${String(t.monat + 1).padStart(2, '0')}-${String(t.tag).padStart(2, '0')}`;
}

/** Wanduhrzeit als „schwebendes“ UTC-Datum (rrule rechnet zeitzonenlos). */
function schwebend(zeitpunkt: Date): Date {
  const t = lokaleTeile(zeitpunkt);
  return new Date(Date.UTC(t.jahr, t.monat, t.tag, t.stunde, t.minute, t.sekunde));
}

/** Schwebendes Datum zurück in einen echten Zeitpunkt in Europe/Berlin. */
function ausSchwebend(s: Date): Date {
  return new Date(
    new TZDate(
      s.getUTCFullYear(),
      s.getUTCMonth(),
      s.getUTCDate(),
      s.getUTCHours(),
      s.getUTCMinutes(),
      s.getUTCSeconds(),
      ZEITZONE,
    ).getTime(),
  );
}

/** UNTIL in UTC (…Z) → schwebende Wanduhrzeit Europe/Berlin, damit rrule es wie DTSTART liest. */
function untilSchwebend(roh: string): string {
  return roh.replace(/UNTIL=(\d{8}T\d{6})Z/, (_t, wert: string) => {
    const utc = new Date(
      Date.UTC(+wert.slice(0, 4), +wert.slice(4, 6) - 1, +wert.slice(6, 8), +wert.slice(9, 11), +wert.slice(11, 13), +wert.slice(13, 15)),
    );
    const s = schwebend(utc);
    return `UNTIL=${s.toISOString().replace(/[-:]/g, '').slice(0, 15)}`;
  });
}

function regelObjekt(regel: TerminRegel): RRule | null {
  if (!regel.wiederholung) return null;
  const roh = untilSchwebend(regel.wiederholung.replace(/^RRULE:/, '').trim());
  // UNTIL ohne Zeitzone wird als schwebend interpretiert (rrule-Konvention)
  const r = rrulestr(`RRULE:${roh}`, { dtstart: schwebend(regel.beginn) }) as RRule;
  return r;
}

/**
 * Alle Vorkommen mit Beginn im Zeitraum [von, bis], ohne Ausnahmen, höchstens `max`.
 * Einmalige Termine liefern sich selbst, wenn sie im Zeitraum beginnen oder dann noch laufen.
 */
export function vorkommen(regel: TerminRegel, von: Date, bis: Date, max = 500): Vorkommen[] {
  const dauer = regel.ende ? regel.ende.getTime() - regel.beginn.getTime() : null;
  const ausnahmen = new Set(regel.ausnahmen ?? []);
  const r = regelObjekt(regel);
  if (!r) {
    const ende = regel.ende ?? null;
    const laeuftNoch = ende !== null && ende >= von && regel.beginn <= bis;
    if ((regel.beginn >= von && regel.beginn <= bis) || laeuftNoch) {
      return ausnahmen.has(lokalesDatum(regel.beginn)) ? [] : [{ beginn: regel.beginn, ende }];
    }
    return [];
  }
  // Puffer ±1 Tag in schwebender Zeit, danach exakt filtern
  const tag = 86_400_000;
  const roh = r.between(new Date(schwebend(von).getTime() - tag), new Date(schwebend(bis).getTime() + tag), true);
  const ergebnis: Vorkommen[] = [];
  for (const s of roh) {
    const beginn = ausSchwebend(s);
    if (beginn < von || beginn > bis) continue;
    if (ausnahmen.has(lokalesDatum(beginn))) continue;
    ergebnis.push({ beginn, ende: dauer !== null ? new Date(beginn.getTime() + dauer) : null });
    if (ergebnis.length >= max) break;
  }
  return ergebnis;
}

/** Nächstes Vorkommen ab `ab` (inklusive laufender Termine), sonst null. Sucht höchstens zwei Jahre voraus. */
export function naechstesVorkommen(regel: TerminRegel, ab: Date): Vorkommen | null {
  const dauer = regel.ende ? regel.ende.getTime() - regel.beginn.getTime() : 0;
  const start = new Date(ab.getTime() - dauer);
  const bis = new Date(ab.getTime() + 2 * 365 * 86_400_000);
  const liste = vorkommen(regel, start, bis, 50);
  return liste.find((v) => (v.ende ?? v.beginn) >= ab) ?? null;
}

/** Ob ein Termin wiederkehrend ist und wann er endet (null = ohne Ende). */
export function regelEnde(regel: TerminRegel): Date | null | 'unbegrenzt' {
  const r = regelObjekt(regel);
  if (!r) return regel.ende ?? regel.beginn;
  const o = r.origOptions;
  if (o.until) return ausSchwebend(o.until);
  if (o.count) {
    const alle = r.all((_, i) => i < (o.count ?? 0));
    const letzte = alle.at(-1);
    return letzte ? ausSchwebend(letzte) : null;
  }
  return 'unbegrenzt';
}

export type Wiederholungsart =
  | { art: 'einmalig' }
  | { art: 'woechentlich'; wochentage: number[]; intervall: number }
  | { art: 'monatlich_tag'; tag: number; intervall: number }
  | { art: 'monatlich_wochentag'; position: number; wochentag: number; intervall: number }
  | { art: 'taeglich'; intervall: number }
  | { art: 'jaehrlich'; intervall: number }
  | { art: 'sonstige' };

const WOCHENTAG_INDEX: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

/** Zerlegt eine Regel für die Anzeige („Jeden Samstag“, „Jeden 1. Freitag im Monat“). Wochentag 0 = Sonntag. */
export function wiederholungsart(regel: TerminRegel): Wiederholungsart {
  if (!regel.wiederholung) return { art: 'einmalig' };
  const teile = Object.fromEntries(
    regel.wiederholung
      .replace(/^RRULE:/, '')
      .split(';')
      .map((t) => t.split('=') as [string, string]),
  );
  const intervall = Number(teile.INTERVAL ?? 1);
  const lokal = lokaleTeile(regel.beginn);
  switch (teile.FREQ) {
    case 'DAILY':
      return { art: 'taeglich', intervall };
    case 'WEEKLY': {
      const tage = teile.BYDAY ? teile.BYDAY.split(',').map((d: string) => WOCHENTAG_INDEX[d.slice(-2)] ?? -1) : [lokal.wochentag];
      return tage.every((t: number) => t >= 0) ? { art: 'woechentlich', wochentage: tage, intervall } : { art: 'sonstige' };
    }
    case 'MONTHLY': {
      if (teile.BYDAY) {
        const m = /^([+-]?\d)?([A-Z]{2})$/.exec(teile.BYDAY);
        const pos = m?.[1] ? Number(m[1]) : Number(teile.BYSETPOS ?? NaN);
        const wt = m ? WOCHENTAG_INDEX[m[2]] : undefined;
        if (wt !== undefined && Number.isFinite(pos)) return { art: 'monatlich_wochentag', position: pos, wochentag: wt, intervall };
        return { art: 'sonstige' };
      }
      return { art: 'monatlich_tag', tag: Number(teile.BYMONTHDAY ?? lokal.tag), intervall };
    }
    case 'YEARLY':
      return { art: 'jaehrlich', intervall };
    default:
      return { art: 'sonstige' };
  }
}
