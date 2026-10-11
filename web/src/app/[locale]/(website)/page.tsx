import { getTranslations } from 'next-intl/server';

export const ensureStatic = 'navigation';

/** Vorläufige Startseite (P2) – wird im Durchstich (D04) ersetzt. */
export default async function Startseite() {
  const t = await getTranslations('bestand.hero');
  return (
    <main id="inhalt" className="mx-auto max-w-(--container-inhalt) px-4 py-16 md:px-8">
      <h1 className="text-36 md:text-48">{t('welcome')}</h1>
      <p className="mt-4 max-w-(--container-text) text-20 text-tinte-2">{t('subtitle')}</p>
    </main>
  );
}
