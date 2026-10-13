import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { FolienFormular } from '@/components/verwaltung/anzeige/FolienFormular';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';
import { legeFolieAn } from '@/server/actions/anzeige';
import { ladeBildAuswahl } from '@/server/queries/verwaltung/medien';

/** Verwaltung › Anzeige › Neue Folie: Entwurf; Vers- und Hadith-Folien auf Wunsch gleich zur Prüfung. */
export default async function NeueFolie() {
  await verlangeSeitenRecht('anzeige.bearbeiten');
  const [t, tg, bilder] = await Promise.all([
    getTranslations('verwaltung.anzeige'),
    getTranslations('verwaltung.shell'),
    ladeBildAuswahl(),
  ]);
  return (
    <>
      <NextLink
        href="/verwaltung/anzeige"
        className="inline-flex min-h-12 items-center gap-2 self-start font-bold underline underline-offset-4"
      >
        <ArrowLeft aria-hidden className="size-5" />
        {t('zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('neuTitel')} kennung={tg('gruppe.inhalte')} />
      <FolienFormular aktion={legeFolieAn} startwerte={{ art: 'text', wochentage: [] }} modus="neu" bilder={bilder} />
    </>
  );
}
