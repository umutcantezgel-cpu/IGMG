import { ArrowLeft, ArrowRight, BookOpen, Volume2 } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import type { PfadEintrag } from '@/components/website/Breadcrumbs';
import type { Ziel } from '@/components/website/navigation';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { SeitenStand } from './stand';

const karte = 'rounded-lg border border-linie bg-weiss';
const knopf =
  'inline-flex min-h-12 items-center gap-2 rounded-md border border-rand bg-weiss px-4 font-bold text-tinte no-underline hover:bg-gruen-50 hover:text-gruen-800';

/**
 * Gemeinsame Ansicht der Quran-Seiten (Design Quran.dc.html, Blatt S13): Surenliste links, Kopfkarte, Verse oder
 * Platzhalter, Blättern. Ohne importierte Quelle steht nur der Platzhalter; Audio, Download, Favorit und Teilen
 * fehlen, weil sie keine Funktion haben (Abweichung).
 */
export async function QuranAnsicht({ stand, uebersicht }: { stand: SeitenStand; uebersicht: boolean }) {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('quranSeite');
  const { nr, liste, quelle, sure } = stand;
  const sprachZiel: Ziel = uebersicht ? '/quran' : { pathname: '/quran/[sure]', params: { sure: String(nr) } };
  const pfad: PfadEintrag[] = uebersicht
    ? [{ label: t('breadcrumb') }]
    : [{ label: t('breadcrumb'), ziel: '/quran' }, { label: stand.name }];
  const versAnzahl = sure ? String(sure.verseAnzahl) : '–';
  const quellenHost = quelle ? quelle.url.replace(/^https?:\/\//, '').replace(/\/$/, '') : '';

  return (
    <Seitenrahmen bereich="islam" seite="quran" sprachZiel={sprachZiel} pfad={pfad}>
      <PageHeader kennung={t('eyebrow')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pt-6 pb-12 md:px-8 md:pt-12 md:pb-24 lg:flex-row lg:items-start">
        <nav aria-labelledby="suren-liste" className={cn(karte, 'flex flex-col gap-3 p-5 lg:w-96 lg:shrink-0')}>
          <h2 id="suren-liste" className="flex items-center gap-2.5 text-24">
            <BookOpen aria-hidden className="size-6 shrink-0 text-gruen-700" />
            {t('liste')}
          </h2>
          <ul className="flex flex-col gap-1">
            {liste.map((eintrag) => {
              const aktiv = eintrag.nr === nr;
              return (
                <li key={eintrag.nr}>
                  <Link
                    href={{ pathname: '/quran/[sure]', params: { sure: String(eintrag.nr) } }}
                    aria-current={aktiv ? 'page' : undefined}
                    className={cn(
                      'flex min-h-12 items-center gap-3 rounded-md border-2 px-3 py-1.5 text-tinte no-underline hover:bg-gruen-50 hover:text-tinte',
                      aktiv ? 'border-gruen-700 bg-gruen-50' : 'border-transparent',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex size-9 shrink-0 items-center justify-center rounded-pill text-16 font-bold',
                        aktiv ? 'bg-gruen-700 text-weiss' : 'bg-sand text-tinte-2',
                      )}
                    >
                      {eintrag.nr}
                    </span>
                    <span lang={eintrag.arabisch ? 'ar' : undefined} className="leading-snug font-bold">
                      {eintrag.name}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <article aria-labelledby="sura-titel" className="flex min-w-0 flex-1 flex-col gap-6">
          <header className={cn(karte, 'flex flex-col gap-4 p-5 md:p-8')}>
            <div className="flex flex-col gap-1">
              <h2 id="sura-titel" lang={stand.arabisch ? 'ar' : undefined} className="text-30 md:text-36">
                {stand.name}
              </h2>
              <p className="text-tinte-2">{t('zaehlung', { anzahl: versAnzahl })}</p>
              {quelle ? (
                <p className="text-16 text-tinte-2">
                  <a href={quelle.url} className="font-bold">
                    {t('quellenzeile', { bezeichnung: quelle.bezeichnung, host: quellenHost, version: quelle.version })}
                  </a>
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled
                className="inline-flex min-h-12 items-center gap-3 rounded-pill bg-sand px-5 font-bold text-tinte-2 disabled:cursor-not-allowed"
              >
                <Volume2 aria-hidden className="size-5" />
                {t('audioFolgt')}
              </button>
            </div>
          </header>

          {sure ? (
            <ol className={cn(karte, 'flex flex-col')}>
              {sure.verse.map((vers, i) => {
                const vermerk = vers.uebersetzung?.[sprache] ?? null;
                return (
                  <li key={vers.nr} className={cn('flex flex-col gap-4 p-5 md:p-7', i > 0 && 'border-t border-linie')}>
                    <span className="inline-flex size-10 items-center justify-center rounded-pill border-2 border-gruen-700 font-bold text-gruen-800">
                      <span className="sr-only">{t('vers')} </span>
                      {vers.nr}
                    </span>
                    <p dir="rtl" lang="ar" className="text-right text-30 leading-[2.1] md:text-36">
                      {vers.textAr}
                    </p>
                    <div className="flex max-w-[68ch] flex-col gap-1">
                      <h3 className="text-16 font-bold text-tinte-2">{t('uebersetzung')}</h3>
                      {vermerk ? (
                        <>
                          <p lang={sprache}>{vermerk.text}</p>
                          <p className="text-16 text-tinte-2">{t('uebersetzungQuelle', { quelle: vermerk.quelle })}</p>
                        </>
                      ) : (
                        <p className="text-tinte-2">{t('uebersetzungPlatzhalter')}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div
              role="status"
              className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-rand bg-weiss px-6 py-12 text-center"
            >
              <BookOpen aria-hidden className="size-8 text-tinte-2" />
              <p className="font-bold">{t('platzhalter')}</p>
              <p className="text-16 text-tinte-2">{stand.name}</p>
            </div>
          )}

          <nav aria-label={t('blaettern')} className="flex flex-wrap items-center justify-between gap-3">
            {stand.vorher !== null ? (
              <Link href={{ pathname: '/quran/[sure]', params: { sure: String(stand.vorher) } }} className={knopf}>
                <ArrowLeft aria-hidden className="size-5" />
                {t('navVorher')}
              </Link>
            ) : (
              <span />
            )}
            {stand.naechste !== null ? (
              <Link href={{ pathname: '/quran/[sure]', params: { sure: String(stand.naechste) } }} className={knopf}>
                {t('navNaechste')}
                <ArrowRight aria-hidden className="size-5" />
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </article>
      </div>
    </Seitenrahmen>
  );
}
