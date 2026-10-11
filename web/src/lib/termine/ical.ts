import { TZDate } from '@date-fns/tz';
import ical, { ICalCalendarMethod } from 'ical-generator';
import { ZEITZONE, lokalesDatum, type TerminRegel } from './index';

/**
 * iCal-Ausgabe (K-09): je Termin eine .ics-Datei und je Organisation ein Abo-Feed.
 * Zeiten mit TZID=Europe/Berlin und fester VTIMEZONE (MEZ/MESZ seit 1996 unverändert), damit
 * wiederkehrende Termine über den Sommerzeitwechsel ihre Uhrzeit behalten.
 * Die Ausgabe hängt nicht von der Zeitzone des Prozesses ab (Vercel und docker-compose laufen in UTC).
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

/** Kalenderzeitzone als Kopfzeilen; `mitZeitzone` setzt sie vor die Ereignisse. */
const ZEITZONE_KOPF = `${VTIMEZONE_BERLIN}\r\nTIMEZONE-ID:${ZEITZONE}\r\nX-WR-TIMEZONE:${ZEITZONE}\r\n`;

export type IcalTermin = TerminRegel & {
  uid: string;
  titel: string;
  beschreibung?: string;
  ort?: string;
  url?: string;
  ganztaegig?: boolean;
  aktualisiertAm?: Date;
};

/**
 * Zeitpunkt als TZDate in Europe/Berlin. ical-generator liest ein normales Date mit den Gettern des Prozesses
 * (in UTC andere Uhrzeit als in Berlin); ein TZDate liefert immer die Berliner Uhrzeit.
 */
function berlin(zeitpunkt: Date): TZDate {
  return new TZDate(zeitpunkt.getTime(), ZEITZONE);
}

export function erzeugeKalender(name: string, termine: readonly IcalTermin[], domain: string): string {
  // Ohne Kalenderzeitzone: Mit ihr schreibt ical-generator DTSTAMP, CREATED und LAST-MODIFIED in Ortszeit ohne „Z“,
  // RFC 5545 verlangt aber UTC. So bleiben die Stempel reine Zeitpunkte (Date) und werden in UTC ausgegeben.
  // Die VTIMEZONE mit TIMEZONE-ID setzt `mitZeitzone` danach ein.
  const kalender = ical({
    name,
    prodId: { company: 'IGMG Wetzlar', product: 'Webseite', language: 'DE' },
    method: ICalCalendarMethod.PUBLISH,
  });
  for (const t of termine) {
    const ereignis = kalender.createEvent({
      id: `${t.uid}@${domain}`,
      start: berlin(t.beginn),
      end: t.ende ? berlin(t.ende) : undefined,
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
  return mitZeitzone(kalender.toString());
}

/**
 * VTIMEZONE, TIMEZONE-ID und X-WR-TIMEZONE vor das erste Ereignis setzen. Die Stelle ist eine ganze Zeile,
 * damit ein Text mit „BEGIN:VEVENT“ nicht getroffen wird; ohne Ereignis steht die Zeitzone vor END:VCALENDAR.
 */
function mitZeitzone(ics: string): string {
  const erstesEreignis = ics.search(/^BEGIN:VEVENT\r?$/m);
  const stelle = erstesEreignis === -1 ? ics.lastIndexOf('END:VCALENDAR') : erstesEreignis;
  return ics.slice(0, stelle) + ZEITZONE_KOPF + ics.slice(stelle);
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
