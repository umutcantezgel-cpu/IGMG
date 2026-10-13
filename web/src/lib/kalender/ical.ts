import { TZDate } from '@date-fns/tz';
import { erzeugeKalender, type IcalTermin } from '@/lib/termine/ical';
import { ZEITZONE } from '@/lib/termine';
import { tagPlus } from './raster';

/**
 * iCal-Abo der besonderen Tage (AUFTRAG 3.10): ganztägige Termine (DTSTART/DTEND als Datum). Vorläufige Tage tragen
 * den Hinweis in Titel und Beschreibung, damit er auch in Kalender-Apps ohne Beschreibung sichtbar bleibt.
 * Reine Funktion; Texte kommen fertig übersetzt herein.
 */
export type IcalTag = {
  uid: string;
  datum: string;
  tage: number;
  titel: string;
  beschreibung?: string;
  vorlaeufig: boolean;
  url?: string;
};

function mitternacht(datum: string): TZDate {
  const [j, m, t] = datum.split('-').map(Number);
  return new TZDate(j, m - 1, t, 0, 0, 0, ZEITZONE);
}

export function besondereTageIcal(
  name: string,
  tage: readonly IcalTag[],
  domain: string,
  texte: { vorlaeufigTitel: string; vorlaeufigBeschreibung: string },
): string {
  const termine: IcalTermin[] = tage.map((t) => ({
    uid: `besonderer-tag-${t.uid}`,
    titel: t.vorlaeufig ? `${t.titel} (${texte.vorlaeufigTitel})` : t.titel,
    beschreibung: [t.vorlaeufig ? texte.vorlaeufigBeschreibung : null, t.beschreibung ?? null].filter(Boolean).join('\n\n') || undefined,
    url: t.url,
    beginn: mitternacht(t.datum),
    ende: t.tage > 1 ? mitternacht(tagPlus(t.datum, t.tage)) : null,
    ganztaegig: true,
    wiederholung: null,
    ausnahmen: [],
  }));
  return erzeugeKalender(name, termine, domain);
}
