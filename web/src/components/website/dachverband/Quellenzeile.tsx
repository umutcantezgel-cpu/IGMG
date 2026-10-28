import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { datumOhneWochentag } from '@/lib/i18n/format';

/**
 * Quellen- und Standzeile für Angaben vom Dachverband (Plan Marktstart, E-044 Nr. 1): „Angaben nach {quelle}, Stand
 * {datum}“ und ein Verweis auf `/quellen#dachverband` mit den vollständigen Angaben. Muster: `hadith/QuellenZeile.tsx`.
 * `stand` ist ein Kalendertag JJJJ-MM-TT (`datumIso`), angezeigt in der Sprache der Seite. Server-Komponente.
 */
export async function Quellenzeile({ quelle, stand }: { quelle: string; stand: string }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('dachverband');
  // Mittag UTC hält den Kalendertag in Europe/Berlin stabil
  const datum = datumOhneWochentag(new Date(`${stand}T12:00:00Z`), sprache);
  return (
    <p className="flex flex-wrap items-center gap-x-3 border-t border-linie pt-6 text-16 text-tinte-2">
      <span>{t('quelleStand', { quelle, datum })}</span>
      <Link href={{ pathname: '/quellen', hash: 'dachverband' }} className="inline-flex min-h-12 items-center font-bold">
        {t('quellenLink')}
      </Link>
    </p>
  );
}
