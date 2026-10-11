import { getTranslations } from 'next-intl/server';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';

/** Vorläufige Übersicht (F09) – das Modul „Übersicht“ entsteht in Welle C (C01). */
export default async function Uebersicht() {
  const a = await verlangeSeitenRecht('uebersicht.lesen');
  const t = await getTranslations('verwaltung.uebersicht');
  return (
    <main id="inhalt" className="mx-auto max-w-(--container-inhalt) px-4 py-10 md:px-8">
      <h1 className="text-36">{t('titel')}</h1>
      <p className="mt-3 text-20">{t('willkommen', { name: a.name })}</p>
    </main>
  );
}
