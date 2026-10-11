import { getLocale, getTranslations } from 'next-intl/server';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import { ladeGebetszeitenFenster } from '@/server/queries/gebetszeiten';
import { LeisteLive } from './leiste/LeisteLive';

const LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/** PrayerTimesBar (02.2) – auf allen Seiten außer Gebetszeiten (Laufbuch D-16). Daten gecacht, Rechnung im Browser. */
export async function PrayerTimesBar() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('leiste');
  const fenster = await ladeGebetszeitenFenster();
  const namen = Object.fromEntries(GEBETE.map((g) => [g, t(g)])) as Record<Gebet, string>;
  return (
    <LeisteLive
      tage={fenster.tage}
      referenz={fenster.referenz}
      alleHref={pfadFuer('/gebetszeiten', sprache)}
      texte={{
        label: t('label'),
        ort: t('ort'),
        namen,
        naechstes: t('naechstes'),
        verbleibt: t('verbleibt', { zeit: '{zeit}' }),
        hinweis: fenster.quelle === 'berechnet' && !fenster.bestaetigt ? t('berechnet') : null,
        alle: t('alle'),
        anzeigen: t('anzeigen'),
        ausblenden: t('ausblenden'),
        listeHeute: t('listeHeute'),
        uhrSuffix: sprache === 'de',
        dauer: { std: t('einheitStd'), min: t('einheitMin') },
        locale: LOCALE[sprache],
      }}
    />
  );
}
