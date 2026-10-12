import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { VerwaltungsKopf } from '@/components/verwaltung/VerwaltungsKopf';
import { EinladungFormular } from '@/components/verwaltung/benutzer/EinladungFormular';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';

/** Verwaltung › Benutzer › Person einladen (C12, K-06). */
export default async function PersonEinladen({ searchParams }: PageProps<'/[locale]/verwaltung/benutzer/einladen'>) {
  await verlangeSeitenRecht('benutzer.einladen');
  const [t, sp] = await Promise.all([getTranslations('verwaltung.benutzer'), searchParams]);
  const tg = await getTranslations('verwaltung.shell');
  return (
    <>
      <NextLink href="/verwaltung/benutzer" className="inline-flex min-h-11 items-center gap-2 self-start font-bold">
        <ArrowLeft aria-hidden className="size-5" />
        {t('formular.zurueck')}
      </NextLink>
      <VerwaltungsKopf titel={t('formular.einladenTitel')} kennung={tg('gruppe.betrieb')} einleitung={t('formular.einladenEinleitung')} />
      <section className="max-w-einleitung rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <EinladungFormular key={typeof sp.neu === 'string' ? sp.neu : 'start'} />
      </section>
    </>
  );
}
