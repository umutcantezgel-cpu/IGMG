import { BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { StandHinweis } from '@/components/website/quran/StandHinweis';
import { SurenKacheln } from '@/components/website/quran/SurenKacheln';
import { ladeUebersicht } from './stand';

/**
 * Übersicht /quran (Blatt S13, Einstieg): Seitenkopf, alle Suren als Raster mit Nummer, Name und – nur mit Import –
 * Verszahl, Stand-Hinweis. Ohne Import stehen fünf Suren; der Verstext wird erst auf der Surenseite gezeigt.
 */
export async function QuranUebersicht() {
  const t = await getTranslations('quranSeite');
  const { liste, quelle } = await ladeUebersicht();
  return (
    <Seitenrahmen bereich="islam" seite="quran" sprachZiel="/quran" pfad={[{ label: t('breadcrumb') }]}>
      <PageHeader kennung={t('eyebrow')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 py-abschnitt-klein md:px-8">
        <nav aria-labelledby="suren-liste" className="flex flex-col gap-6">
          <div className="flex max-w-einleitung flex-col gap-3">
            <h2 id="suren-liste" className="flex items-center gap-3 text-display-2">
              <BookOpen aria-hidden className="size-7 shrink-0 text-gruen-700" />
              {t('liste')}
            </h2>
            <p className="text-20 leading-einleitung text-pretty text-tinte-2">{t('listeText')}</p>
          </div>
          {liste.length > 0 ? (
            <SurenKacheln liste={liste} />
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
              <Zustandsgrafik art="leer" />
              <p className="max-w-text text-20 text-tinte-2">{t('keineSuren')}</p>
            </div>
          )}
        </nav>
        <StandHinweis quelle={quelle} />
      </div>
    </Seitenrahmen>
  );
}
