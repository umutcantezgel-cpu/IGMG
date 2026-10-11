import { TZDate } from '@date-fns/tz';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { ZEITZONE, lokalesDatum, type TerminRegel } from './index';

/**
 * iCal-Ausgabe (K-09): je Termin eine .ics-Datei und je Organisation ein Abo-Feed.
 * Zeiten mit TZID=Europe/Berlin und fester VTIMEZONE (MEZ/MESZ seit 1996 unverändert), damit
 * wiederkehrende Termine über den Sommerzeitwechsel ihre Uhrzeit behalten.
 */
const VTIMEZONE_BERLIN = [
  'BEGIN:VTIMEZONE',
  'TZID:Europe/Berlin',
  'X-LIC-LOCATION:Europe/Berlin',
  'BEGIN:DAYLIGHT',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0200',
  'TZNAME:CEST',
  'DTSTART:19700329T020000',
  'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
  'END:DAYLIGHT',
  'BEGIN:STANDARD',
  'TZOFFSETFROM:+0200',
  'TZOFFSETTO:+0100',
  'TZNAME:CET',
  'DTSTART:19701025T030000',
  'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
  'END:STANDARD',
  'END:VTIMEZONE',
].join('\r\n');

export type IcalTermin = TerminRegel & {
  uid: string;
  titel: string;
  beschreibung?: string;
  ort?: string;
  url?: string;
  ganztaegig?: boolean;
  aktualisiertAm?: Date;
};

export function erzeugeKalender(name: string, termine: readonly IcalTermin[], domain: string): string {
  const kalender = ical({
    name,
    prodId: { company: 'IGMG Wetzlar', product: 'Webseite', language: 'DE' },
    method: ICalCalendarMethod.PUBLISH,
    timezone: { name: ZEITZONE, generator: () => VTIMEZONE_BERLIN },
  });
  for (const t of termine) {
    const ereignis = kalender.createEvent({
      id: `${t.uid}@${domain}`,
      start: t.beginn,
      end: t.ende ?? undefined,
      allDay: t.ganztaegig ?? false,
      timezone: ZEITZONE,
      summary: t.titel,
      description: t.beschreibung,
      location: t.ort,
      url: t.url,
      lastModified: t.aktualisiertAm,
      stamp: t.aktualisiertAm ?? t.beginn,
    });
    if (t.wiederholung) {
      const ausnahmen = (t.ausnahmen ?? []).map((d) => `EXDATE;TZID=${ZEITZONE}:${d.replaceAll('-', '')}T${zeitTeil(t.beginn)}`);
      ereignis.repeating([`RRULE:${untilInUtc(t.wiederholung.replace(/^RRULE:/, ''))}`, ...ausnahmen].join('\r\n'));
    }
  }
  return stempelInUtc(kalender.toString());
}

/**
 * RFC 5545 (3.8.7.2, 3.8.7.3): DTSTAMP und LAST-MODIFIED müssen in UTC stehen. ical-generator schreibt sie
 * in der Kalenderzeitzone (Wanduhrzeit Europe/Berlin) – hier zurück nach UTC mit „Z“.
 */
function stempelInUtc(ics: string): string {
  return ics.replace(
    /^(DTSTAMP|LAST-MODIFIED|CREATED):(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(\r?)$/gm,
    (_t, feld: string, j: string, mo: string, d: string, h: string, mi: string, se: string, cr: string) => {
      const utc = new Date(new TZDate(+j, +mo - 1, +d, +h, +mi, +se, ZEITZONE).getTime());
      return `${feld}:${utc
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '')}${cr}`;
    },
  );
}

/**
 * RFC 5545 (3.3.10): Hat DTSTART eine TZID, muss UNTIL in UTC stehen. Gespeichert wird UNTIL schwebend
 * (Wanduhrzeit Europe/Berlin, `baueRegel`) – für die Ausgabe nach UTC mit „Z“ umrechnen.
 */
function untilInUtc(regel: string): string {
  return regel.replace(
    /UNTIL=(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(?!Z)/,
    (_t, j: string, mo: string, d: string, h: string, mi: string, se: string) => {
      const utc = new Date(new TZDate(+j, +mo - 1, +d, +h, +mi, +se, ZEITZONE).getTime());
      return `UNTIL=${utc
        .toISOString()
        .replace(/[-:]/g, '')
        .replace(/\.\d{3}/, '')}`;
    },
  );
}

/** Uhrzeit-Teil HHMMSS des Beginns in Europe/Berlin (für EXDATE). */
function zeitTeil(beginn: Date): string {
  const f = new Intl.DateTimeFormat('de-DE', {
    timeZone: ZEITZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  return f.format(beginn).replaceAll(':', '');
}

export { lokalesDatum };
