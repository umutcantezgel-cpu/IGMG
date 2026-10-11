import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import NextLink from 'next/link';
import type { ReactNode } from 'react';

/**
 * Rahmen der Anmeldeseiten (K-003, K-009): zentrierte Karte auf der Papier-Fläche der Verwaltung, oben Logo
 * (40 px, nie vergrößert) und Name der Gemeinde mit dem Bereich, unten ein Link zur Website. Die Karte nach
 * LoginDialog.dc.html: weiß, Linie, Radius 12, Schatten S1. Keine Muster hinter Text.
 */
export async function AnmeldeRahmen({ titel, untertitel, children }: { titel: string; untertitel?: string; children: ReactNode }) {
  const t = await getTranslations('verwaltung');
  return (
    <main id="inhalt" className="mx-auto flex min-h-dvh w-full max-w-110 flex-col justify-center px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <Image src="/bilder/logos/logo-igmg-wetzlar.png" alt="" width={40} height={40} className="size-10 rounded-sm" />
        <p className="font-display text-20 font-semibold">
          IGMG Wetzlar{' '}
          <span aria-hidden="true" className="font-normal text-tinte-2">
            ·
          </span>{' '}
          <span className="font-normal text-tinte-2">{t('titel')}</span>
        </p>
      </div>
      <div className="rounded-lg border border-linie bg-weiss p-6 shadow-s1 md:p-8">
        <h1 className="text-display-2">{titel}</h1>
        {untertitel ? <p className="mt-3 text-pretty text-tinte-2">{untertitel}</p> : null}
        <div className="mt-6">{children}</div>
      </div>
      <div className="mt-8 flex justify-center">
        <NextLink href="/" prefetch={false} className="inline-flex min-h-12 items-center font-bold">
          {t('shell.zurWebsite')}
        </NextLink>
      </div>
    </main>
  );
}
