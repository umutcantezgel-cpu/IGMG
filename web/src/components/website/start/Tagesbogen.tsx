import { getLocale, getTranslations } from 'next-intl/server';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { GEBETE, type Gebet } from '@/lib/gebetszeiten/typen';
import { ladeGebetszeitenFenster } from '@/server/queries/gebetszeiten';
import { TagesbogenLive } from './TagesbogenLive';

const LOCALE: Record<Locale, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };

/**
 * Tagesbogen (Startseite, großer Moment B-06): die sechs Zeiten des Tages als Weg der Sonne über den Horizont.
 * Daten wie die PrayerTimesBar aus dem Zwischenspeicher, Rechnung im Browser (K-08); ohne Zeiten bleibt der Platz leer.
 */
export async function Tagesbogen({ className }: { className?: string }) {
  const sprache = (await getLocale()) as Locale;
  const [t, tl] = await Promise.all([getTranslations('start'), getTranslations('leiste')]);
  const fenster = await ladeGebetszeitenFenster();
  if (fenster.tage.length === 0) return null;
  const namen = Object.fromEntries(GEBETE.map((g) => [g, tl(g)])) as Record<Gebet, string>;
  return (
    <TagesbogenLive
      className={className}
      tage={fenster.tage}
      referenz={fenster.referenz}
      alleHref={pfadFuer('/gebetszeiten', sprache)}
      texte={{
        titel: t('bogenTitel'),
        beschreibung: t('bogenBeschreibung'),
        namen,
        listeHeute: tl('listeHeute'),
        alle: tl('alle'),
        locale: LOCALE[sprache],
      }}
    />
  );
}
