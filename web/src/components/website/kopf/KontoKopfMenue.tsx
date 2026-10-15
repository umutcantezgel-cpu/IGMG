import { House } from 'lucide-react';
import NextLink from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { KontoMenue } from './KontoMenue';

/**
 * Kontoschaltfläche im Kopf der Konto-Seiten (ab 1240 px, Sichtabnahme X-1) mit Kopfzeile, „Mein Bereich“ und Abmelden.
 * Eigene Datei, die nur die Konto-Hülle einbindet: So lädt der Kopf öffentlicher Seiten das JavaScript des Kontomenüs
 * nicht mit (Z-08).
 */
export async function KontoKopfMenue({ initiale, vorname, abmelden }: { initiale: string; vorname: string; abmelden: ReactNode }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('kopf');
  return (
    <KontoMenue initiale={initiale} vorname={vorname} label={t('kontoMenue')}>
      <div className="flex items-center gap-3 border-b border-linie px-3 pt-2 pb-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-display text-20 leading-none text-weiss"
        >
          {initiale}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-16 text-tinte-2">{t('angemeldetAls')}</span>
          <span className="truncate text-18 font-bold text-tinte">{vorname}</span>
        </span>
      </div>
      <ul className="flex flex-col gap-1 pt-2">
        <li>
          <NextLink
            href={pfadFuer('/mein-bereich', sprache)}
            prefetch={false}
            className="flex min-h-12 items-center gap-3 rounded-md px-3 text-18 font-bold text-tinte no-underline transition duration-(--dauer-rueckmeldung) hover:bg-sand hover:text-tinte"
          >
            <House aria-hidden className="size-5 shrink-0" />
            {t('meinBereich')}
          </NextLink>
        </li>
        <li>{abmelden}</li>
      </ul>
    </KontoMenue>
  );
}
