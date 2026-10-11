import { getTranslations } from 'next-intl/server';
import { cacheLife, cacheTag } from 'next/cache';
import { Link } from '@/i18n/navigation';

async function ladeTermine(sprache: string) {
  'use cache';
  cacheLife('max');
  cacheTag('veranstaltungen');
  return [{ id: 1, titel: `Termin (${sprache})` }];
}

export const ensureStatic = 'navigation';

export default async function Start({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  const t = await getTranslations('Start');
  const termine = await ladeTermine(locale);
  return (
    <main>
      <h1>{t('titel')}</h1>
      <ul>{termine.map((x) => <li key={x.id}>{x.titel}</li>)}</ul>
      <Link href="/gebetszeiten">{t('zeit')}</Link>
    </main>
  );
}
