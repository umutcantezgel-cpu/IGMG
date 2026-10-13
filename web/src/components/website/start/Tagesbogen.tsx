import { getLocale, getTranslations } from 'next-intl/server';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { tageszeilen } from '@/lib/gebetszeiten/hijri';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import { ladeGebetszeitenFenster } from '@/server/queries/gebetszeiten';
import { ramadanImFenster } from './ramadan-fenster';
import { StartBogen, type StartFastenTexte } from './StartBogen';

const LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/**
 * Tagesbogen (Startseite, großer Moment B-06): die sechs Zeiten des Tages als Weg der Sonne über den Horizont; im
 * Ramadan der Fastenbogen (B-20, Vorführpfad Station 1). Daten wie die PrayerTimesBar aus dem Zwischenspeicher, Rechnung
 * im Browser (K-08); die Datumszeilen je Tag und die Ramadan-Tage des Fensters (Hidschri-Kalender) kommen fertig vom
 * Server (H-L01). Schalter `ramadan_vorschau`: Fastenbogen auf Knopfdruck auch außerhalb des Ramadan (Vorführung).
 * Ohne Zeiten bleibt der Platz leer.
 */
export async function Tagesbogen({ className }: { className?: string }) {
  const sprache = (await getLocale()) as Locale;
  const [t, tl, fenster, vorschau] = await Promise.all([
    getTranslations('start'),
    getTranslations('leiste'),
    ladeGebetszeitenFenster(),
    funktionAn('ramadan_vorschau'),
  ]);
  if (fenster.tage.length === 0) return null;
  const namen = Object.fromEntries(GEBETE.map((g) => [g, tl(g)])) as Record<Gebet, string>;
  const daten = fenster.tage.map((d) => d.datum);
  const ramadan = ramadanImFenster(daten);
  // Texte des Fastenbogens nur, wenn er erscheinen kann (Ramadan im Fenster oder Vorschau): sonst bleibt die Seite leicht
  const fasten = ramadan.length > 0 || vorschau ? await fastenTexte() : undefined;
  return (
    <StartBogen
      className={className}
      tage={fenster.tage}
      referenz={fenster.referenz}
      alleHref={pfadFuer('/gebetszeiten', sprache)}
      ramadanHref={pfadFuer('/ramadan', sprache)}
      ramadan={ramadan}
      vorschau={vorschau}
      fasten={fasten}
      texte={{
        titel: t('bogenTitel'),
        beschreibung: t('bogenBeschreibung'),
        namen,
        listeHeute: tl('listeHeute'),
        alle: tl('alle'),
        locale: LOCALE[sprache],
        tageszeilen: tageszeilen(daten, LOCALE[sprache]),
      }}
    />
  );
}

/** Texte des Fastenbogens: Bogen aus dem Bereich „ramadan“ (wie /ramadan), Vorschau und Link aus `start.fasten`. */
async function fastenTexte(): Promise<StartFastenTexte> {
  const [tr, t] = await Promise.all([getTranslations('ramadan'), getTranslations('start')]);
  return {
    bogen: {
      titel: tr('bogen.titel'),
      beschreibung: tr('bogen.beschreibung'),
      imsak: tr('bogen.imsak'),
      iftar: tr('bogen.iftar'),
      vorImsak: tr.raw('bogen.vorImsak') as string,
      fastet: tr.raw('bogen.fastet') as string,
      nachIftar: tr.raw('bogen.nachIftar') as string,
      label: tr.raw('bogen.label') as string,
    },
    vorschauTitel: t('fasten.vorschauTitel'),
    vorschauHinweis: t('fasten.vorschauHinweis'),
    zeigen: t('fasten.zeigen'),
    zurueck: t('fasten.zurueck'),
    ramadan: t('fasten.ramadan'),
  };
}
