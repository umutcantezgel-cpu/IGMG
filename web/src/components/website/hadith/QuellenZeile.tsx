import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';

/**
 * Quellenzeile der Hadith-Seiten: Herkunft und Lizenz des arabischen Textes, Verweis auf `/quellen#hadith` mit den
 * vollständigen Angaben (Commit, Prüfsummen, offene Rechtsfrage MN-06). Server-Komponente.
 */
export async function QuellenZeile() {
  const t = await getTranslations('hadith.quelle');
  return (
    <p className="flex flex-wrap items-center gap-x-3 border-t border-linie pt-6 text-16 text-tinte-2">
      <span>{t('zeile')}</span>
      <Link href={{ pathname: '/quellen', hash: 'hadith' }} className="inline-flex min-h-12 items-center font-bold">
        {t('link')}
      </Link>
    </p>
  );
}
