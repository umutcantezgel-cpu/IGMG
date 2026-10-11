import { getTranslations } from 'next-intl/server';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';

/** Vorläufige Übersicht (F09) – Kennzahlen und Listen entstehen in Welle C (C01, Blatt V01). */
export default async function Uebersicht() {
  const a = await verlangeSeitenRecht('uebersicht.lesen');
  const t = await getTranslations('verwaltung.uebersicht');
  return (
    <>
      <h1 className="text-36">{t('titel')}</h1>
      <p className="text-20">{t('willkommen', { name: a.name })}</p>
    </>
  );
}
