import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Buchstabenraster } from '@/components/website/elifbe/Buchstabenraster';
import { elifbeStationen } from '@/components/website/elifbe/stationen';
import { Weg } from '@/components/website/elifbe/Weg';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('elifbe');
  return metadatenFuer({ pfad: '/elifbe', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Elifbe-Einstieg (Erzählansicht): das Raster aller 29 Buchstaben (Morph Buchstabenkarte → Glyphe) und der Weg durch die
 * Stationen nach der Elifbe-Systematik (B-24, Reihenfolge vorläufig bis MN-07). Im DOM zuerst das Raster (am Telefon
 * oben), ab lg steht der Weg links daneben. Vollständig statisch.
 */
export default async function ElifbeSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('elifbe');
  return (
    <Seitenrahmen bereich="bildung" seite="elifbe" sprachZiel="/elifbe" pfad={[{ label: t('pfadLernen'), ziel: '/lernen' }, { label: t('titel') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto grid max-w-(--container-inhalt) items-start gap-abschnitt-klein px-4 py-abschnitt-klein md:px-8 lg:grid-cols-3 lg:gap-12">
        <section aria-labelledby="elifbe-raster" className="flex flex-col gap-6 lg:col-span-2 lg:col-start-2 lg:row-start-1">
          <div className="flex flex-col gap-3">
            <h2 id="elifbe-raster" className="text-display-2">
              {t('raster.titel')}
            </h2>
            <p className="text-18 leading-einleitung text-pretty text-tinte-2">{t('raster.einleitung')}</p>
          </div>
          <Buchstabenraster
            sprache={sprache}
            gross
            label={(b) => t('raster.karte', { name: b.elifbe, nr: b.nr })}
            className="lg:grid-cols-4 xl:grid-cols-5"
          />
          <Link href={{ pathname: '/elifbe/buchstaben', hash: 'formen' }} className="inline-flex min-h-12 items-center gap-2 self-start font-bold">
            {t('raster.alle')}
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </section>
        <section aria-labelledby="elifbe-weg" className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <div className="flex flex-col gap-3">
            <h2 id="elifbe-weg" className="text-display-2">
              {t('weg.titel')}
            </h2>
            <p className="text-18 leading-einleitung text-pretty text-tinte-2">{t('weg.einleitung')}</p>
            <p className="text-16 text-tinte-2">{t('weg.hinweis')}</p>
          </div>
          <Weg stationen={elifbeStationen(t)} kompakt beschriftung={t('weg.titel')} />
        </section>
      </div>
    </Seitenrahmen>
  );
}
