import { ArrowLeft } from 'lucide-react';
import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { EinladungFormular } from '@/components/verwaltung/benutzer/EinladungFormular';
import { verlangeSeitenRecht } from '@/lib/rechte/pruefe';

/** Verwaltung › Benutzer › Person einladen (C12, K-06). */
export default async function PersonEinladen({ searchParams }: PageProps<'/[locale]/verwaltung/benutzer/einladen'>) {
  await verlangeSeitenRecht('benutzer.einladen');
  const [t, sp] = await Promise.all([getTranslations('verwaltung.benutzer'), searchParams]);
  return (
    <>
      <NextLink href="/verwaltung/benutzer" className="inline-flex min-h-11 items-center gap-2 self-start font-bold">
        <ArrowLeft aria-hidden className="size-5" />
        {t('formular.zurueck')}
      </NextLink>
      <div className="flex flex-col gap-2">
        <h1 className="text-display-2">{t('formular.einladenTitel')}</h1>
        <p className="max-w-[70ch] text-tinte-2">{t('formular.einladenEinleitung')}</p>
      </div>
      <section className="max-w-3xl rounded-lg border border-linie bg-weiss p-5 md:p-6">
        <EinladungFormular key={typeof sp.neu === 'string' ? sp.neu : 'start'} />
      </section>
    </>
  );
}
