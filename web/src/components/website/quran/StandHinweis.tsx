import { getTranslations } from 'next-intl/server';
import { SUREN_OHNE_QUELLE } from '@/server/queries/quran';

/**
 * Stand-Hinweis der Quran-Seiten (aus dem Stand der Seite, `stand.ts`): Mit importierter Quelle die Quellenzeile mit
 * Verweis, ohne Import ein Satz zum Stand des Textes. Server-Komponente.
 */
export async function StandHinweis({ quelle }: { quelle: { bezeichnung: string; url: string; version: string } | null }) {
  const t = await getTranslations('quranSeite');
  if (!quelle) return <p className="text-16 text-tinte-2">{t('standOhneText', { anzahl: SUREN_OHNE_QUELLE })}</p>;
  const host = quelle.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return (
    <p className="text-16 text-tinte-2">
      <a href={quelle.url} className="font-bold">
        {t('quellenzeile', { bezeichnung: quelle.bezeichnung, host, version: quelle.version })}
      </a>
    </p>
  );
}
