import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import type { SichtbareAusgabe } from '@/lib/quran/ausgaben';
import type { QuranQuelle } from '@/server/queries/quran';

/**
 * Quellenzeile im Kopf der Leseansichten: arabischer Text (Tanzil, CC BY 3.0) mit dem von der Quelle verlangten Link
 * auf tanzil.net und dem Verweis auf /quellen.
 */
export async function Quellenzeile({ quelle }: { quelle: QuranQuelle }) {
  const t = await getTranslations('quranSeite.quelle');
  return (
    <p>
      {t('text', { bezeichnung: quelle.bezeichnung })} ·{' '}
      <a href={quelle.url} className="font-bold">
        {quelle.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
      </a>{' '}
      ·{' '}
      <Link href="/quellen" className="font-bold">
        {t('link')}
      </Link>
    </p>
  );
}

/**
 * Quellen unter dem Text: Tajwid-Markierungen (CC BY 4.0, angepasst) und die gezeigte Übersetzung. Die Zeile der
 * Übersetzung trägt `data-quelle-uebersetzung`, damit der Ausgabewechsel sie nachführt.
 */
export async function QuellenFuss({ ausgabe }: { ausgabe: SichtbareAusgabe | null }) {
  const t = await getTranslations('quranSeite.quelle');
  return (
    <footer className="flex flex-col gap-1 text-16 text-tinte-2">
      <p data-quelle-uebersetzung hidden={!ausgabe}>
        {ausgabe ? t('uebersetzung', { titel: ausgabe.titel, uebersetzer: ausgabe.uebersetzer }) : null}
      </p>
      <p>{t('tajwid')}</p>
    </footer>
  );
}
