import { getTranslations } from 'next-intl/server';

export const ensureStatic = 'navigation';

export default async function Gebetszeiten() {
  const t = await getTranslations('Start');
  return <main><h1>{t('zeit')}</h1></main>;
}
